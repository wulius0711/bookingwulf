import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { createVoucherTemplate, toggleVoucherTemplate, cancelVoucher } from './actions';
import DeleteTemplateButton from './DeleteTemplateButton';
import { Button, EmptyState } from '../components/ui';

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
  pending: 'var(--status-pending-bg)',
  active: 'var(--status-booked-bg)',
  redeemed: 'var(--status-new-bg)',
  expired: 'var(--bg-surface-raised)',
  cancelled: 'var(--status-cancelled-bg)',
};
const STATUS_TEXT: Record<string, string> = {
  pending: 'var(--status-pending-text)',
  active: 'var(--status-booked-text)',
  redeemed: 'var(--status-new-text)',
  expired: 'var(--text-secondary)',
  cancelled: 'var(--status-cancelled-text)',
};
const STATUS_LABELS: Record<string, string> = {
  pending: 'Ausstehend',
  active: 'Aktiv',
  redeemed: 'Eingelöst',
  expired: 'Abgelaufen',
  cancelled: 'Storniert',
};

const labelSt: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 };

export default async function VouchersPage() {
  const session = await verifySession();
  if (!session.hotelId) return <main className="admin-page"><p>Kein Hotel ausgewählt.</p></main>;

  const [templates, vouchers, hotel] = await Promise.all([
    prisma.voucherTemplate.findMany({ where: { hotelId: session.hotelId }, orderBy: { createdAt: 'desc' } }),
    prisma.voucher.findMany({ where: { hotelId: session.hotelId }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.hotel.findUnique({ where: { id: session.hotelId }, select: { slug: true, name: true } }),
  ]);

  const shopUrl = `/gutschein/${hotel?.slug}`;

  return (
    <main className="admin-page" style={{ background: 'var(--page-bg)', minHeight: '100vh', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 960, display: 'grid', gap: 32 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>Gutscheine</h1>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>Gutschein-Vorlagen anlegen und verkaufte Gutscheine verwalten.</p>
          </div>
          {hotel && (
            <a href={shopUrl} target="_blank" rel="noopener noreferrer" className="ui-btn ui-btn-primary ui-btn-md">
              Shop ansehen →
            </a>
          )}
        </div>

        {/* Neue Vorlage */}
        <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Neue Vorlage</h2>
          <form action={createVoucherTemplate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelSt}>Name *</label>
                <input name="name" required placeholder="z.B. Wellnessgutschein" className="ui-input" />
              </div>
              <div>
                <label style={labelSt}>Typ</label>
                <div className="ui-select-wrapper">
                  <select name="type" className="ui-select-control">
                    <option value="value">Wertgutschein</option>
                    <option value="nights">Übernachtungsgutschein</option>
                    <option value="service">Leistungsgutschein</option>
                  </select>
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ pointerEvents: 'none' }}><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>
              <div>
                <label style={labelSt}>Nennwert (€) *</label>
                <input name="value" type="number" min="1" step="0.01" required placeholder="100.00" className="ui-input" />
              </div>
              <div>
                <label style={labelSt}>Verkaufspreis (€) *</label>
                <input name="price" type="number" min="1" step="0.01" required placeholder="100.00" className="ui-input" />
              </div>
              <div>
                <label style={labelSt}>Gültig (Tage)</label>
                <input name="validDays" type="number" min="30" defaultValue="365" className="ui-input" />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelSt}>Beschreibung</label>
              <input name="description" placeholder="Kurze Beschreibung für den Gast" className="ui-input" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="primary" type="submit">Vorlage erstellen</Button>
            </div>
          </form>
        </div>

        {/* Vorlagen-Liste */}
        {templates.length > 0 && (
          <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Vorlagen ({templates.length})</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              {templates.map((t) => (
                <div key={t.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, opacity: t.isActive ? 1 : 0.55 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {TYPE_LABELS[t.type]} · Nennwert {eur(t.value)} · Verkauf {eur(t.price)} · {t.validDays} Tage gültig
                      </div>
                      {t.description && <div style={{ fontSize: 13, color: 'var(--text-disabled)', marginTop: 2 }}>{t.description}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <form action={toggleVoucherTemplate.bind(null, t.id, !t.isActive)}>
                        <Button variant="secondary" size="sm" type="submit">
                          {t.isActive ? 'Deaktivieren' : 'Aktivieren'}
                        </Button>
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
        <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, border: '1px solid var(--border)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>Verkaufte Gutscheine ({vouchers.length})</h2>
          {vouchers.length === 0 ? (
            <EmptyState title="Noch keine Gutscheine verkauft." />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    {['Code', 'Von', 'Für', 'Wert', 'Bezahlt', 'Status', 'Gültig bis', ''].map((h) => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((v) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 700 }}>{v.code}</td>
                      <td style={{ padding: '10px 12px' }}>{v.senderName || v.senderEmail}</td>
                      <td style={{ padding: '10px 12px' }}>{v.recipientName || v.recipientEmail || '—'}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600 }}>{eur(v.value)}</td>
                      <td style={{ padding: '10px 12px' }}>{eur(v.pricePaid)}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: STATUS_COLORS[v.status] || 'var(--bg-surface-raised)', color: STATUS_TEXT[v.status] || 'var(--text-secondary)' }}>
                          {STATUS_LABELS[v.status] || v.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                        {new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(v.expiresAt))}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {v.status === 'active' && (
                          <form action={cancelVoucher.bind(null, v.id)}>
                            <Button variant="danger" size="sm" type="submit">Stornieren</Button>
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
