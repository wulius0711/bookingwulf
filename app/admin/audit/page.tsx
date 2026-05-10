import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const FIELD_LABELS: Record<string, string> = {
  bookingTermsUrl: 'Buchungsbedingungen-URL',
  privacyPolicyUrl: 'Datenschutz-URL',
  enableInstantBooking: 'Verbindliche Buchung',
  price_season_created: 'Preissaison erstellt',
  price_season_deleted: 'Preissaison gelöscht',
  price_season_name: 'Saison: Name',
  price_season_start: 'Saison: Start',
  price_season_end: 'Saison: Ende',
  price_season_price: 'Saison: Preis/Nacht',
  price_season_minstay: 'Saison: Mindestaufenthalt',
};

function fmt(d: Date) {
  return new Intl.DateTimeFormat('de-AT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(d));
}

export default async function AuditPage() {
  const session = await verifySession();
  if (session.role !== 'super_admin') redirect('/admin');

  const logs = await prisma.auditLog.findMany({
    orderBy: { changedAt: 'desc' },
    take: 500,
    include: { hotel: { select: { name: true } } },
  });

  const th: React.CSSProperties = { padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' };
  const td: React.CSSProperties = { padding: '9px 12px', fontSize: 13, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', verticalAlign: 'top' };
  const tdMuted: React.CSSProperties = { ...td, color: 'var(--text-secondary)' };

  return (
    <main className="admin-page" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <h1 style={{ margin: '0 0 4px' }}>Audit-Log</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 24px' }}>Änderungen an haftungsrelevanten Feldern. Letzte 500 Einträge.</p>

      {logs.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Noch keine Einträge vorhanden.</p>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Zeitpunkt</th>
                <th style={th}>Hotel</th>
                <th style={th}>Feld</th>
                <th style={th}>Vorher</th>
                <th style={th}>Nachher</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ background: 'var(--surface)' }}>
                  <td style={tdMuted}>{fmt(log.changedAt)}</td>
                  <td style={td}>{log.hotel.name}</td>
                  <td style={td}>{FIELD_LABELS[log.field] ?? log.field}</td>
                  <td style={{ ...td, color: log.oldValue ? 'var(--status-cancelled-text)' : 'var(--text-disabled)', fontFamily: 'monospace', fontSize: 12 }}>{log.oldValue ?? '–'}</td>
                  <td style={{ ...td, color: log.newValue ? 'var(--status-booked-text)' : 'var(--text-disabled)', fontFamily: 'monospace', fontSize: 12 }}>{log.newValue ?? '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
