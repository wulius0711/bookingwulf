import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { createChildPriceRange, updateChildPriceRange, deleteChildPriceRange } from './actions';

export const dynamic = 'force-dynamic';

const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 8,
  fontSize: 14,
  color: '#111',
  width: '100%',
  boxSizing: 'border-box',
  background: '#fff',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: '#4b5563',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 4,
};

export default async function ChildPricingPage() {
  const session = await verifySession();
  const hotelId = session.hotelId ?? undefined;

  const ranges = hotelId
    ? await prisma.childPriceRange.findMany({
        where: { hotelId },
        orderBy: [{ sortOrder: 'asc' }, { minAge: 'asc' }],
      })
    : [];

  const hotel = hotelId
    ? await prisma.hotel.findUnique({ where: { id: hotelId }, select: { name: true } })
    : null;

  return (
    <main className="admin-page" style={{ background: 'var(--page-bg)', minHeight: '100vh', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: 24 }}>

        <div>
          <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.03em', color: '#0f172a' }}>Kinderpreise</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: '#667085' }}>
            Preise pro Kind und Nacht nach Altersgruppe — ohne Saisonbindung.
          </p>
        </div>

        {/* Existing ranges */}
        {hotel && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#111827' }}>
                {hotel.name} — {ranges.length} {ranges.length === 1 ? 'Altersgruppe' : 'Altersgruppen'}
              </h2>
            </div>

            {ranges.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', color: '#6b7280', fontSize: 14 }}>
                Noch keine Altersgruppen definiert. Kinder sind standardmäßig kostenlos.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    {['Bezeichnung', 'Alter von', 'Alter bis', 'Preis / Nacht', ''].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ranges.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                      <td style={{ padding: '12px 16px', color: '#374151' }}>{r.label || <span style={{ color: '#9ca3af' }}>—</span>}</td>
                      <td style={{ padding: '12px 16px', color: '#374151' }}>{r.minAge} Jahre</td>
                      <td style={{ padding: '12px 16px', color: '#374151' }}>{r.maxAge} Jahre</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: Number(r.pricePerNight) === 0 ? '#16a34a' : '#111827' }}>
                        {Number(r.pricePerNight) === 0 ? 'Gratis' : `€ ${Number(r.pricePerNight).toFixed(2)}`}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <form action={deleteChildPriceRange}>
                          <input type="hidden" name="id" value={r.id} />
                          <button type="submit" style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #fecaca', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#dc2626' }}>
                            Löschen
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Add form */}
        {hotelId && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600, color: '#111827', letterSpacing: '-0.02em' }}>Altersgruppe hinzufügen</h2>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
              <strong>Beispiel:</strong> Kinder von 0–6 Jahren → Gratis (Preis: 0), Kinder von 7–16 Jahren → € 15 / Nacht.<br />
              Kinder deren Alter keiner Gruppe entspricht, sind ebenfalls kostenlos.
            </div>

            <form action={createChildPriceRange} style={{ display: 'grid', gap: 16 }}>
              <input type="hidden" name="hotelId" value={hotelId} />

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', gap: 12, alignItems: 'end' }}>
                <div>
                  <label style={labelStyle}>Bezeichnung <span style={{ fontWeight: 400, textTransform: 'none', color: '#9ca3af' }}>(optional)</span></label>
                  <input name="label" placeholder="z. B. Kleinkind, Kind" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Alter von *</label>
                  <input name="minAge" type="number" min="0" max="17" required placeholder="0" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Alter bis *</label>
                  <input name="maxAge" type="number" min="0" max="17" required placeholder="6" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Preis / Nacht *</label>
                  <input name="pricePerNight" type="number" min="0" step="0.01" required placeholder="0.00" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Nr.</label>
                  <input name="sortOrder" type="number" min="0" defaultValue={0} style={inputStyle} />
                </div>
              </div>

              <div>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Hinzufügen
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </main>
  );
}
