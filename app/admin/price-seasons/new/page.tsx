import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { writeAuditLog } from '@/src/lib/audit';
import { redirect } from 'next/navigation';

export default async function NewPriceSeasonPage() {
  const session = await verifySession();

  const apartments = await prisma.apartment.findMany({
    where: {
      isActive: true,
      ...(session.hotelId !== null ? { hotelId: session.hotelId } : {}),
    },
    orderBy: { name: 'asc' },
  });

  async function createSeason(formData: FormData) {
    'use server';

    const session = await verifySession();
    const apartmentId = Number(formData.get('apartmentId'));
    const name = String(formData.get('name') || '').trim();
    const startDate = new Date(String(formData.get('startDate')));
    const endDate = new Date(String(formData.get('endDate')));
    const pricePerNight = Number(formData.get('pricePerNight'));
    const minStay = Number(formData.get('minStay') || 1);

    if (!apartmentId || !pricePerNight) throw new Error('Fehlende Daten');
    if (endDate <= startDate) throw new Error('Enddatum muss nach Startdatum liegen');

    const apt = await prisma.apartment.findUnique({ where: { id: apartmentId }, select: { hotelId: true, name: true } });
    if (session.hotelId !== null && (!apt || apt.hotelId !== session.hotelId)) throw new Error('Zugriff verweigert.');

    await prisma.priceSeason.create({
      data: { apartmentId, name: name || null, startDate, endDate, pricePerNight, minStay },
    });

    if (apt) {
      await writeAuditLog(apt.hotelId, {}, {
        price_season_created: `${name || 'Saison'} | ${apt.name} | ${startDate.toISOString().slice(0, 10)}–${endDate.toISOString().slice(0, 10)} | €${pricePerNight}/Nacht`,
      });
    }

    redirect('/admin/price-seasons');
  }

  const label: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#4b5563', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 4 };
  const input: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, background: '#f9fafb', color: '#111', boxSizing: 'border-box' };
  const field: React.CSSProperties = { display: 'grid', gap: 4 };

  return (
    <main className="admin-page" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', display: 'grid', gap: 24 }}>

        <div>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: '-0.02em', color: '#0f172a' }}>Neuer Preiszeitraum</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#667085' }}>Saisonalen Preis für ein Apartment festlegen.</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ background: '#fafafa', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#111827' }}>Details</h2>
          </div>
          <div style={{ padding: '20px', display: 'grid', gap: 16 }}>
            <form action={createSeason} style={{ display: 'grid', gap: 16 }}>
              <div style={field}>
                <label style={label}>Name / Bezeichnung</label>
                <input type="text" name="name" placeholder="z. B. Hochsaison, Weihnachten …" required style={input} />
              </div>
              <div style={field}>
                <label style={label}>Apartment</label>
                <select name="apartmentId" required style={input}>
                  <option value="">Apartment wählen</option>
                  {apartments.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={field}>
                  <label style={label}>Von</label>
                  <input type="date" name="startDate" required style={input} />
                </div>
                <div style={field}>
                  <label style={label}>Bis</label>
                  <input type="date" name="endDate" required style={input} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={field}>
                  <label style={label}>Preis pro Nacht (€)</label>
                  <input type="number" step="0.01" name="pricePerNight" placeholder="0.00" required style={input} />
                </div>
                <div style={field}>
                  <label style={label}>Mindestaufenthalt (Nächte)</label>
                  <input type="number" name="minStay" defaultValue={1} min={1} style={input} />
                </div>
              </div>
              <div style={{ paddingTop: 4 }}>
                <button type="submit" style={{ padding: '11px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </main>
  );
}
