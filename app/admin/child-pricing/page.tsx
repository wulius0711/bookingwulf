import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { createChildPriceRange, updateChildPriceRange, deleteChildPriceRange } from './actions';
import ConfirmDeleteForm from '../components/ConfirmDeleteForm';

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
      <style>{`
        .child-range-row { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 12px 16px; border-bottom: 1px solid #f9fafb; }
        .child-range-label { flex: 1 1 120px; color: #374151; font-size: 14px; }
        .child-range-meta { display: flex; gap: 16px; flex-wrap: wrap; }
        .child-range-meta span { font-size: 13px; color: #6b7280; white-space: nowrap; }
        .child-range-meta strong { color: #111827; }
        .child-form-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 80px; gap: 12px; align-items: end; }
        @media (max-width: 640px) {
          .child-form-grid { grid-template-columns: 1fr 1fr; }
          .child-form-label-field { grid-column: 1 / -1; }
          .child-form-submit { grid-column: 1 / -1; }
        }
      `}</style>
      <div style={{ maxWidth: 720, display: 'grid', gap: 24 }}>

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
              <div>
                {ranges.map(r => (
                  <div key={r.id} className="child-range-row">
                    <div className="child-range-label">
                      {r.label || <span style={{ color: '#9ca3af' }}>—</span>}
                    </div>
                    <div className="child-range-meta">
                      <span>{r.minAge}–{r.maxAge} Jahre</span>
                      <span style={{ fontWeight: 600, color: Number(r.pricePerNight) === 0 ? '#16a34a' : '#111827' }}>
                        {Number(r.pricePerNight) === 0 ? 'Gratis' : `€ ${Number(r.pricePerNight).toFixed(2)} / Nacht`}
                      </span>
                    </div>
                    <ConfirmDeleteForm action={deleteChildPriceRange} id={r.id} message={`Altersgruppe „${r.label || r.minAge + '–' + r.maxAge + ' Jahre'}" wirklich löschen?`} style={{ marginLeft: 'auto' }}>
                      <button type="submit" style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #fecaca', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#dc2626', whiteSpace: 'nowrap' }}>
                        Löschen
                      </button>
                    </ConfirmDeleteForm>
                  </div>
                ))}
              </div>
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

              <div className="child-form-grid">
                <div className="child-form-label-field">
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

              <div className="child-form-submit">
                <button type="submit" className="btn-shine" style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
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
