import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { createVoucherTemplate, updateVoucherTemplate, toggleVoucherTemplate, cancelVoucher } from './actions';
import DeleteTemplateButton from './DeleteTemplateButton';

export const dynamic = 'force-dynamic';

const eur = (n: number | { toNumber: () => number }) =>
  new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(
    typeof n === 'number' ? n : n.toNumber()
  );

const TYPE_LABELS: Record<string, string> = {
  value: 'Wertgutschein',
  nights: 'Übernachtungsgutschein',
  service: 'Leistungsgutschein',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#fef9c3',
  active: '#dcfce7',
  redeemed: '#dbeafe',
  expired: '#f3f4f6',
  cancelled: '#fee2e2',
};
const STATUS_TEXT: Record<string, string> = {
  pending: '#713f12',
  active: '#166534',
  redeemed: '#1e40af',
  expired: '#6b7280',
  cancelled: '#991b1b',
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'Ausstehend',
  active: 'Aktiv',
  redeemed: 'Eingelöst',
  expired: 'Abgelaufen',
  cancelled: 'Storniert',
};

const label: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#4b5563', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 };
const input: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#fff', color: '#111' };
const select: React.CSSProperties = { ...input };

export default async function VouchersPage() {
  const session = await verifySession();
  if (!session.hotelId) return <main className="admin-page"><p>Kein Hotel ausgewählt.</p></main>;

  const [templates, vouchers, hotel] = await Promise.all([
    prisma.voucherTemplate.findMany({ where: { hotelId: session.hotelId }, orderBy: { createdAt: 'desc' } }),
    prisma.voucher.findMany({ where: { hotelId: session.hotelId }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.hotel.findUnique({ where: { id: session.hotelId }, select: { slug: true, name: true } }),
  ]);

  const shopUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/gutschein/${hotel?.slug}`;

  return (
    <main className="admin-page" style={{ background: 'var(--page-bg)', minHeight: '100vh', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <style>{`
        .vc-btn-secondary {
          padding: 6px 12px; border: 1px solid #e5e7eb; border-radius: 6px;
          background: #f9fafb; font-size: 12px; cursor: pointer; font-family: inherit;
          transition: background 0.12s, border-color 0.12s;
        }
        .vc-btn-secondary:hover { background: #f3f4f6; border-color: #d1d5db; }
        .vc-btn-danger {
          padding: 6px 12px; border: 1px solid #fecaca; border-radius: 6px;
          background: #fff; color: #dc2626; font-size: 12px; cursor: pointer; font-family: inherit;
          transition: background 0.12s;
        }
        .vc-btn-danger:hover { background: #fef2f2; }
        .vc-btn-danger-sm {
          padding: 4px 10px; border: 1px solid #fecaca; border-radius: 6px;
          background: #fff; color: #dc2626; font-size: 11px; cursor: pointer; font-family: inherit;
          transition: background 0.12s;
        }
        .vc-btn-danger-sm:hover { background: #fef2f2; }
      `}</style>

      <div style={{ maxWidth: 960, display: 'grid', gap: 32 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.03em', color: '#0f172a' }}>Gutscheine</h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: '#667085' }}>Gutschein-Vorlagen anlegen und verkaufte Gutscheine verwalten.</p>
          </div>
          {hotel && (
            <a href={shopUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Shop ansehen →
            </a>
          )}
        </div>

        {/* Neue Vorlage */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Neue Vorlage</h2>
          <form action={createVoucherTemplate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={label}>Name *</label>
                <input name="name" required placeholder="z.B. Wellnessgutschein" style={input} />
              </div>
              <div>
                <label style={label}>Typ</label>
                <select name="type" style={select}>
                  <option value="value">Wertgutschein</option>
                  <option value="nights">Übernachtungsgutschein</option>
                  <option value="service">Leistungsgutschein</option>
                </select>
              </div>
              <div>
                <label style={label}>Nennwert (€) *</label>
                <input name="value" type="number" min="1" step="0.01" required placeholder="100.00" style={input} />
              </div>
              <div>
                <label style={label}>Verkaufspreis (€) *</label>
                <input name="price" type="number" min="1" step="0.01" required placeholder="100.00" style={input} />
              </div>
              <div>
                <label style={label}>Gültig (Tage)</label>
                <input name="validDays" type="number" min="30" defaultValue="365" style={input} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Beschreibung</label>
              <input name="description" placeholder="Kurze Beschreibung für den Gast" style={input} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary">Vorlage erstellen</button>
            </div>
          </form>
        </div>

        {/* Vorlagen-Liste */}
        {templates.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Vorlagen ({templates.length})</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {templates.map((t) => (
                <div key={t.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, opacity: t.isActive ? 1 : 0.55 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                        {TYPE_LABELS[t.type]} · Nennwert {eur(t.value)} · Verkauf {eur(t.price)} · {t.validDays} Tage gültig
                      </div>
                      {t.description && <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>{t.description}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <form action={toggleVoucherTemplate.bind(null, t.id, !t.isActive)}>
                        <button type="submit" className="vc-btn-secondary">
                          {t.isActive ? 'Deaktivieren' : 'Aktivieren'}
                        </button>
                      </form>
                      <DeleteTemplateButton id={t.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verkaufte Gutscheine */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Verkaufte Gutscheine ({vouchers.length})</h2>
          {vouchers.length === 0 ? (
            <p style={{ fontSize: 14, color: '#9ca3af' }}>Noch keine Gutscheine verkauft.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                    {['Code', 'Von', 'Für', 'Wert', 'Bezahlt', 'Status', 'Gültig bis', ''].map((h) => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((v) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700 }}>{v.code}</td>
                      <td style={{ padding: '10px 12px' }}>{v.senderName || v.senderEmail}</td>
                      <td style={{ padding: '10px 12px' }}>{v.recipientName || v.recipientEmail || '—'}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{eur(v.value)}</td>
                      <td style={{ padding: '10px 12px' }}>{eur(v.pricePaid)}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: STATUS_COLORS[v.status] || '#f3f4f6', color: STATUS_TEXT[v.status] || '#374151' }}>
                          {STATUS_LABELS[v.status] || v.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#6b7280' }}>
                        {new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(v.expiresAt))}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {v.status === 'active' && (
                          <form action={cancelVoucher.bind(null, v.id)}>
                            <button type="submit" className="vc-btn-danger-sm">Stornieren</button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
