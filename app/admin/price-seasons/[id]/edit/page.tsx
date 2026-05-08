import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { writeAuditLog } from '@/src/lib/audit';
import { redirect, notFound } from 'next/navigation';

type PageProps = { params: Promise<{ id: string }> };

const inp: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  fontSize: 14,
  background: '#f9fafb',
  color: '#111',
  boxSizing: 'border-box',
};

const lbl: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: '#4b5563',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: 4,
  display: 'block',
};

const fld: React.CSSProperties = { display: 'grid', gap: 4 };

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  overflow: 'hidden',
};

const cardHead: React.CSSProperties = {
  background: '#fafafa',
  padding: '14px 20px',
  borderBottom: '1px solid #f3f4f6',
};

const cardBody: React.CSSProperties = { padding: '20px', display: 'grid', gap: 16 };

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

  return (
    <main className="admin-page" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 640, display: 'grid', gap: 24 }}>

        <div>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: '-0.02em', color: '#0f172a' }}>Preiszeitraum bearbeiten</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#667085' }}>Saison, Zeitraum und Preis anpassen.</p>
        </div>

        <form action={updateSeason} style={{ display: 'grid', gap: 20 }}>
          <div style={card}>
            <div style={cardHead}>
              <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Preiszeitraum</h2>
            </div>
            <div style={cardBody}>

              <div style={fld}>
                <label style={lbl}>Name / Bezeichnung</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={season.name ?? ''}
                  placeholder="z. B. Hochsaison, Weihnachten …"
                  required
                  style={inp}
                />
              </div>

              <div style={fld}>
                <label style={lbl}>Apartment</label>
                <select name="apartmentId" required defaultValue={season.apartmentId} style={inp}>
                  {apartments.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fld}>
                  <label style={lbl}>Von</label>
                  <input type="date" name="startDate" required defaultValue={fmt(season.startDate)} style={inp} />
                </div>
                <div style={fld}>
                  <label style={lbl}>Bis</label>
                  <input type="date" name="endDate" required defaultValue={fmt(season.endDate)} style={inp} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={fld}>
                  <label style={lbl}>Preis pro Nacht (€)</label>
                  <input type="number" step="0.01" name="pricePerNight" defaultValue={season.pricePerNight} required style={inp} />
                </div>
                <div style={fld}>
                  <label style={lbl}>Mindestaufenthalt (Nächte)</label>
                  <input type="number" name="minStay" defaultValue={season.minStay} min={1} style={inp} />
                </div>
              </div>

            </div>
          </div>

          <div className="admin-form-actions">
            <a href="/admin/price-seasons" className="btn-cancel">Abbrechen</a>
            <button type="submit" className="btn-primary">Speichern</button>
          </div>
        </form>

      </div>
    </main>
  );
}
