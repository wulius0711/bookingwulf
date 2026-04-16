import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { createExtra, toggleExtra, deleteExtra } from './actions';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ hotel?: string }>;
type PageProps = { searchParams: SearchParams };

const BILLING_LABELS: Record<string, string> = {
  per_night: 'pro Nacht',
  per_person_per_night: 'pro Person / Nacht',
  per_stay: 'pro Aufenthalt',
  per_person_per_stay: 'pro Person / Aufenthalt',
};

export default async function ExtrasPage({ searchParams }: PageProps) {
  const session = await verifySession();
  const isSuperAdmin = session.hotelId === null;
  const { hotel } = await searchParams;

  const hotels = isSuperAdmin
    ? await prisma.hotel.findMany({ where: { isActive: true }, orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true } })
    : await prisma.hotel.findMany({ where: { id: session.hotelId!, isActive: true }, select: { id: true, name: true, slug: true } });

  const selectedId = isSuperAdmin
    ? hotel && !Number.isNaN(Number(hotel)) ? Number(hotel) : hotels[0]?.id
    : session.hotelId!;

  const extras = selectedId
    ? await prisma.hotelExtra.findMany({ where: { hotelId: selectedId }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] })
    : [];

  const selectedHotel = hotels.find((h) => h.id === selectedId);

  return (
    <main style={{ padding: 32, background: '#f5f5f7', minHeight: '100vh', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gap: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.03em', color: '#0f172a' }}>Zusatzleistungen</h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: '#667085' }}>
              Konfigurierbare Extras pro Hotel — Preise und Abrechnungsart frei einstellbar.
            </p>
          </div>

          {isSuperAdmin && (
            <form method="GET" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select name="hotel" defaultValue={String(selectedId)} style={{ padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff' }}>
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
              <button type="submit" style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #d1d5db', background: '#fff', fontSize: 14, cursor: 'pointer' }}>
                Laden
              </button>
            </form>
          )}
        </div>

        {/* Existing extras */}
        {selectedHotel && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111827' }}>
                {selectedHotel.name} — {extras.length} Extra{extras.length !== 1 ? 's' : ''}
              </h2>
            </div>

            {extras.length === 0 ? (
              <p style={{ margin: 0, padding: '24px 20px', fontSize: 14, color: '#9ca3af' }}>
                Noch keine Extras angelegt.
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    {['Name', 'Key', 'Abrechnung', 'Preis', 'Status', ''].map((h) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {extras.map((extra) => (
                    <tr key={extra.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500, color: '#111827' }}>{extra.name}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280', fontFamily: 'monospace', fontSize: 13 }}>{extra.key}</td>
                      <td style={{ padding: '12px 16px', color: '#374151' }}>{BILLING_LABELS[extra.billingType] ?? extra.billingType}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>€ {Number(extra.price).toFixed(2)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: extra.isActive ? '#dcfce7' : '#f3f4f6', color: extra.isActive ? '#16a34a' : '#6b7280' }}>
                          {extra.isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <form action={async () => { 'use server'; await toggleExtra(extra.id, !extra.isActive); }}>
                            <button type="submit" style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#374151' }}>
                              {extra.isActive ? 'Deaktivieren' : 'Aktivieren'}
                            </button>
                          </form>
                          <form action={async () => { 'use server'; await deleteExtra(extra.id); }}>
                            <button type="submit" style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #fecaca', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#dc2626' }}
                              onClick={undefined}
                            >
                              Löschen
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Add new extra form */}
        {selectedId && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600, color: '#111827', letterSpacing: '-0.02em' }}>Neues Extra anlegen</h2>

            <form action={createExtra} style={{ display: 'grid', gap: 16 }}>
              <input type="hidden" name="hotelId" value={selectedId} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Name *</label>
                  <input name="name" required placeholder="z. B. Hund" style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff', color: '#111' }} />
                </div>

                <div style={{ display: 'grid', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Key *</label>
                  <input name="key" required placeholder="z. B. dog" style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff', color: '#111', fontFamily: 'monospace' }} />
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>Kleinbuchstaben, keine Leerzeichen</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: 16 }}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Abrechnung *</label>
                  <select name="billingType" required style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff', color: '#111' }}>
                    <option value="per_stay">pro Aufenthalt</option>
                    <option value="per_night">pro Nacht</option>
                    <option value="per_person_per_night">pro Person / Nacht</option>
                    <option value="per_person_per_stay">pro Person / Aufenthalt</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Preis (€) *</label>
                  <input name="price" type="number" min="0" step="0.01" required placeholder="0.00" style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff', color: '#111' }} />
                </div>

                <div style={{ display: 'grid', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Reihenfolge</label>
                  <input name="sortOrder" type="number" min="0" defaultValue={0} style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff', color: '#111' }} />
                </div>
              </div>

              <div>
                <button type="submit" style={{ padding: '11px 20px', borderRadius: 999, background: '#111', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Extra anlegen
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </main>
  );
}
