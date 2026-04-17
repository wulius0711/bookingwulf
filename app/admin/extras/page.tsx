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

const TYPE_LABELS: Record<string, string> = {
  extra: 'Zusatzleistung',
  insurance: 'Versicherung',
};

const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#4b5563', letterSpacing: '0.05em', textTransform: 'uppercase' };
const inputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box' as const, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff', color: '#111' };

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
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gap: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.03em', color: '#0f172a' }}>Zusatzleistungen</h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: '#667085' }}>
              Extras und Versicherungsoptionen pro Hotel konfigurieren.
            </p>
          </div>

          {isSuperAdmin && (
            <form method="GET" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select name="hotel" defaultValue={String(selectedId)} style={{ padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff', color: '#111' }}>
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
                {selectedHotel.name} — {extras.length} {extras.length === 1 ? 'Eintrag' : 'Einträge'}
              </h2>
            </div>

            {extras.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 16 }}>Noch keine Zusatzleistungen angelegt.</p>
                <p style={{ fontSize: 13, color: '#9ca3af' }}>Nutze das Formular unten, um eine neue Zusatzleistung hinzuzufügen.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    {['Name', 'Typ', 'Abrechnung', 'Preis', 'Link', 'Status', ''].map((h) => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {extras.map((extra) => (
                    <tr key={extra.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500, color: '#111827' }}>{extra.name}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                          background: extra.type === 'insurance' ? '#fef3c7' : '#f0f9ff',
                          color: extra.type === 'insurance' ? '#92400e' : '#0369a1',
                        }}>
                          {TYPE_LABELS[extra.type] ?? extra.type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#374151' }}>{BILLING_LABELS[extra.billingType] ?? extra.billingType}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111827' }}>{'\u20AC'} {Number(extra.price).toFixed(2)}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 12 }}>
                        {extra.linkUrl ? (
                          <a href={extra.linkUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>Link</a>
                        ) : '—'}
                      </td>
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
                            <button type="submit" style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #fecaca', background: '#fff', fontSize: 12, cursor: 'pointer', color: '#dc2626' }}>
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

        {/* Add new form */}
        {selectedId && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600, color: '#111827', letterSpacing: '-0.02em' }}>Neue Zusatzleistung anlegen</h2>

            <form action={createExtra} style={{ display: 'grid', gap: 16 }}>
              <input type="hidden" name="hotelId" value={selectedId} />

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr 80px', gap: 12, alignItems: 'end' }}>
                <div style={{ display: 'grid', gap: 6 }}>
                  <label style={labelStyle}>Name *</label>
                  <input name="name" required placeholder="z. B. Frühstück" style={inputStyle} />
                </div>

                <div style={{ display: 'grid', gap: 6 }}>
                  <label style={labelStyle}>Typ</label>
                  <select name="type" style={inputStyle}>
                    <option value="extra">Zusatzleistung</option>
                    <option value="insurance">Versicherung</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gap: 6 }}>
                  <label style={labelStyle}>Abrechnung *</label>
                  <select name="billingType" required style={inputStyle}>
                    <option value="per_stay">pro Aufenthalt</option>
                    <option value="per_night">pro Nacht</option>
                    <option value="per_person_per_night">pro Person / Nacht</option>
                    <option value="per_person_per_stay">pro Person / Aufenthalt</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gap: 6 }}>
                  <label style={labelStyle}>Preis ({'\u20AC'}) *</label>
                  <input name="price" type="number" min="0" step="0.01" required placeholder="0.00" style={inputStyle} />
                </div>

                <div style={{ display: 'grid', gap: 6 }}>
                  <label style={labelStyle}>Nr.</label>
                  <input name="sortOrder" type="number" min="0" defaultValue={0} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                <label style={labelStyle}>Link-URL (optional, z. B. für Versicherungsdetails)</label>
                <input name="linkUrl" type="url" placeholder="https://..." style={inputStyle} />
              </div>

              <div>
                <button type="submit" style={{ padding: '11px 20px', borderRadius: 999, background: '#111', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Anlegen
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </main>
  );
}
