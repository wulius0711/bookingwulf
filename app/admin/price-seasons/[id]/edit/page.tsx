import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { writeAuditLog } from '@/src/lib/audit';
import { redirect, notFound } from 'next/navigation';

type PageProps = { params: Promise<{ id: string }> };

export default async function EditPriceSeasonPage({ params }: PageProps) {
  const session = await verifySession();
  const { id } = await params;
  const seasonId = Number(id);

  const season = await prisma.priceSeason.findUnique({
    where: { id: seasonId },
    include: { apartment: { select: { id: true, name: true, hotelId: true } } },
  });

  if (!season) notFound();
  if (session.hotelId !== null && season.apartment?.hotelId !== session.hotelId) notFound();

  const apartments = await prisma.apartment.findMany({
    where: {
      isActive: true,
      ...(session.hotelId !== null ? { hotelId: session.hotelId } : {}),
    },
    orderBy: { name: 'asc' },
  });

  async function updateSeason(formData: FormData) {
    'use server';

    const session = await verifySession();
    const name = String(formData.get('name') || '').trim();
    const apartmentId = Number(formData.get('apartmentId'));
    const startDate = new Date(String(formData.get('startDate')));
    const endDate = new Date(String(formData.get('endDate')));
    const pricePerNight = Number(formData.get('pricePerNight'));
    const minStay = Number(formData.get('minStay') || 1);

    if (!apartmentId || !pricePerNight) throw new Error('Fehlende Daten');
    if (endDate <= startDate) throw new Error('Enddatum muss nach Startdatum liegen');

    const apt = await prisma.apartment.findUnique({ where: { id: apartmentId }, select: { hotelId: true } });
    if (session.hotelId !== null && (!apt || apt.hotelId !== session.hotelId)) throw new Error('Zugriff verweigert.');

    const prev = await prisma.priceSeason.findUnique({ where: { id: seasonId }, select: { name: true, startDate: true, endDate: true, pricePerNight: true, minStay: true } });

    await prisma.priceSeason.update({
      where: { id: seasonId },
      data: { name: name || null, apartmentId, startDate, endDate, pricePerNight, minStay },
    });

    if (apt && prev) {
      await writeAuditLog(apt.hotelId,
        { price_season_name: prev.name, price_season_start: prev.startDate.toISOString().slice(0, 10), price_season_end: prev.endDate.toISOString().slice(0, 10), price_season_price: String(prev.pricePerNight), price_season_minstay: String(prev.minStay) },
        { price_season_name: name || null, price_season_start: startDate.toISOString().slice(0, 10), price_season_end: endDate.toISOString().slice(0, 10), price_season_price: String(pricePerNight), price_season_minstay: String(minStay) },
      );
    }

    redirect('/admin/price-seasons');
  }

  const fmt = (d: Date) => new Date(d).toISOString().slice(0, 10);

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontSize: 14,
    background: '#ffffff',
    color: '#111',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 700,
    color: '#4b5563',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: 4,
    display: 'block',
  };

  const fieldWrap: React.CSSProperties = { display: 'grid', gap: 4 };

  return (
    <main style={{ padding: 40, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', maxWidth: 520 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 24 }}>Preiszeitraum bearbeiten</h1>

      <form action={updateSeason} style={{ display: 'grid', gap: 16 }}>
        <div style={fieldWrap}>
          <label style={labelStyle}>Name / Bezeichnung</label>
          <input
            type="text"
            name="name"
            defaultValue={season.name ?? ''}
            placeholder="z. B. Hochsaison, Weihnachten …"
            required
            style={fieldStyle}
          />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Apartment</label>
          <select name="apartmentId" required defaultValue={season.apartmentId} style={fieldStyle}>
            {apartments.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Von</label>
          <input type="date" name="startDate" required defaultValue={fmt(season.startDate)} style={fieldStyle} />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Bis</label>
          <input type="date" name="endDate" required defaultValue={fmt(season.endDate)} style={fieldStyle} />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Preis pro Nacht (€)</label>
          <input
            type="number"
            step="0.01"
            name="pricePerNight"
            defaultValue={season.pricePerNight}
            required
            style={fieldStyle}
          />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Mindestaufenthalt (Nächte)</label>
          <input
            type="number"
            name="minStay"
            defaultValue={season.minStay}
            min={1}
            style={fieldStyle}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            type="submit"
            style={{ flex: 1, padding: '12px', background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}
          >
            Speichern
          </button>
          <a
            href="/admin/price-seasons"
            style={{ padding: '12px 20px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}
          >
            Abbrechen
          </a>
        </div>
      </form>
    </main>
  );
}
