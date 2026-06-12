import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { writeAuditLog } from '@/src/lib/audit';
import { redirect } from 'next/navigation';
import NewPriceSeasonForm from './NewPriceSeasonForm';

type PageProps = { searchParams: Promise<{ start?: string; end?: string }> };

export default async function NewPriceSeasonPage({ searchParams }: PageProps) {
  const session = await verifySession();
  const { start, end } = await searchParams;

  const apartments = await prisma.apartment.findMany({
    where: {
      isActive: true,
      ...(session.hotelId !== null ? { hotelId: session.hotelId } : {}),
    },
    select: { id: true, name: true, basePrice: true },
    orderBy: { name: 'asc' },
  });

  async function createSeason(formData: FormData) {
    'use server';

    const session = await verifySession();
    const apartmentIds = formData.getAll('apartmentId').map(Number).filter(Boolean);
    const name = String(formData.get('name') || '').trim();
    const startDate = new Date(String(formData.get('startDate')));
    const endDate = new Date(String(formData.get('endDate')));
    const minStay = Number(formData.get('minStay') || 1);
    const priceMode = String(formData.get('priceMode') || 'absolute');
    const priceValue = Number(formData.get('priceValue'));

    if (!apartmentIds.length || !priceValue) throw new Error('Fehlende Daten');
    if (endDate <= startDate) throw new Error('Enddatum muss nach Startdatum liegen');

    const apts = await prisma.apartment.findMany({
      where: { id: { in: apartmentIds } },
      select: { id: true, hotelId: true, name: true, basePrice: true },
    });

    for (const apt of apts) {
      if (session.hotelId !== null && apt.hotelId !== session.hotelId) throw new Error('Zugriff verweigert.');
    }

    const records: { apartmentId: number; name: string | null; startDate: Date; endDate: Date; pricePerNight: number; minStay: number }[] = [];
    for (const apt of apts) {
      let pricePerNight: number;
      if (priceMode === 'percent') {
        if (!apt.basePrice) continue;
        pricePerNight = apt.basePrice * (1 + priceValue / 100);
      } else {
        pricePerNight = priceValue;
      }
      records.push({ apartmentId: apt.id, name: name || null, startDate, endDate, pricePerNight, minStay });
    }

    if (records.length === 0) throw new Error('Keine Apartments mit Basispreis ausgewählt.');

    await prisma.priceSeason.createMany({ data: records });

    for (const apt of apts) {
      const record = records.find((r) => r.apartmentId === apt.id);
      if (!record) continue;
      await writeAuditLog(apt.hotelId, {}, {
        price_season_created: `${name || 'Saison'} | ${apt.name} | ${startDate.toISOString().slice(0, 10)}–${endDate.toISOString().slice(0, 10)} | €${record.pricePerNight.toFixed(2)}/Nacht`,
      });
    }

    redirect('/admin/price-seasons');
  }

  return (
    <main className="admin-page" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 560, display: 'grid', gap: 24 }}>

        <div>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Neuer Preiszeitraum</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>Saisonalen Preis für ein oder mehrere Apartments festlegen.</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ background: 'var(--surface-2)', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Details</h2>
          </div>
          <div style={{ padding: '20px' }}>
            <NewPriceSeasonForm
              apartments={apartments}
              action={createSeason}
              defaultStart={start}
              defaultEnd={end}
            />
          </div>
        </div>

      </div>
    </main>
  );
}
