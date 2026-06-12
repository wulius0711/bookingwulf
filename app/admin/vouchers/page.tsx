import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { createVoucherTemplate, cancelVoucher } from './actions';
import { Button, EmptyState } from '../components/ui';
import CollapsibleCard from '../components/CollapsibleCard';
import TemplateCard from './TemplateCard';

export const dynamic = 'force-dynamic';

const eur = (n: number | { toNumber: () => number }) =>
  new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(
    typeof n === 'number' ? n : n.toNumber()
  );

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
    <main className="admin-page" style={{ maxWidth: 960, background: 'var(--page-bg)', minHeight: '100vh', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ display: 'grid', gap: 32 }}>

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

        {/* Vorlagen-Liste */}
        {templates.length > 0 && (
          <CollapsibleCard title={`Vorlagen (${templates.length})`} defaultOpen>
            <div style={{ display: 'grid', gap: 12, padding: 16 }}>
              {templates.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={{ ...t, value: Number(t.value), price: Number(t.price) }}
                />
              ))}
            </div>
          </CollapsibleCard>
        )}

        {/* Neue Vorlage */}
        <CollapsibleCard title="Neue Vorlage" defaultOpen={false}>
          <div style={{ padding: '16px 24px 24px' }}>
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
                    <span className="ui-select-chevron"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
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
        </CollapsibleCard>

        {/* Verkaufte Gutscheine */}
        <CollapsibleCard title={`Verkaufte Gutscheine (${vouchers.length})`} defaultOpen={false}>
          <div style={{ padding: '0 0 8px' }}>
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
        </CollapsibleCard>

      </div>
    </main>
  );
}
