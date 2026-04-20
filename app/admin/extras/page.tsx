import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { hasPlanAccess } from '@/src/lib/plan-gates';
import type { PlanKey } from '@/src/lib/plans';
import { createExtra, updateExtra, toggleExtra, deleteExtra } from './actions';
import ExtraRow from './ExtraRow';

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

  let hotelPlan: PlanKey = 'starter';
  if (!isSuperAdmin && selectedId) {
    const h = await prisma.hotel.findUnique({ where: { id: selectedId }, select: { plan: true } });
    hotelPlan = (h?.plan as PlanKey) ?? 'starter';
  }
  const canUseExtras = isSuperAdmin || hasPlanAccess(hotelPlan, 'pro');

  return (
    <main className="admin-page" style={{ background: '#f5f5f7', minHeight: '100vh', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
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

        {!canUseExtras && (
          <div style={{ padding: '14px 18px', background: '#fffbeb', border: '1px solid #fef08a', borderRadius: 12, fontSize: 14, color: '#92400e', lineHeight: 1.5 }}>
            <strong>Hinweis:</strong> Im Starter-Plan werden nur Versicherungsoptionen im Widget angezeigt. Für reguläre Zusatzleistungen ist ein Upgrade auf den <strong>Pro-Plan</strong> erforderlich.
          </div>
        )}

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
              <div className="table-scroll">
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
                    <ExtraRow
                      key={extra.id}
                      extra={{ ...extra, price: Number(extra.price) }}
                      updateAction={updateExtra}
                      toggleAction={async (formData: FormData) => {
                        'use server';
                        const id = Number(formData.get('id'));
                        const isActive = formData.get('isActive') === 'true';
                        await toggleExtra(id, isActive);
                      }}
                      deleteAction={async (formData: FormData) => {
                        'use server';
                        const id = Number(formData.get('id'));
                        await deleteExtra(id);
                      }}
                    />
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
        )}

        {/* Add new form */}
        {selectedId && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 600, color: '#111827', letterSpacing: '-0.02em' }}>Neue Zusatzleistung anlegen</h2>

            <form action={createExtra} style={{ display: 'grid', gap: 16 }}>
              <input type="hidden" name="hotelId" value={selectedId} />

              <div className="extras-form-grid">
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
                <button type="submit" style={{ padding: '11px 20px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
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
