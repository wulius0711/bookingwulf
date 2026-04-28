import { cookies } from 'next/headers';
import { decrypt } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Chat-Auswertung — bookingwulf Admin' };

const CATEGORY_LABELS: Record<string, string> = {
  buchungen: 'Buchungen & Anfragen',
  kalender: 'Kalender',
  apartments: 'Apartments',
  preise: 'Preise & Saisonen',
  widget: 'Widget-Einbindung',
  emails: 'E-Mails',
  nuki: 'Nuki / Zugang',
  beds24: 'Beds24',
  abonnement: 'Abonnement',
  analytics: 'Analytics',
  extras: 'Zusatzleistungen',
  sperrzeiten: 'Sperrzeiten',
  sonstiges: 'Sonstiges',
};

export default async function ChatAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ showTests?: string }>;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  const session = await decrypt(token);
  if (!session || session.role !== 'super_admin') redirect('/admin');

  const { showTests } = await searchParams;
  const includeTests = showTests === '1';
  const filter = includeTests ? {} : { isSuperAdmin: false };

  const [logs, realCount, testCount, categoryCounts] = await Promise.all([
    prisma.supportChatLog.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { hotel: { select: { name: true } } },
    }),
    prisma.supportChatLog.count({ where: { isSuperAdmin: false } }),
    prisma.supportChatLog.count({ where: { isSuperAdmin: true } }),
    prisma.supportChatLog.groupBy({
      by: ['category'],
      where: { isSuperAdmin: false },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
    }),
  ]);

  return (
    <main className="admin-page">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 4px' }}>Chat-Auswertung</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>
            {realCount} echte Fragen · {testCount} Test-Einträge (Super-Admin)
          </p>
        </div>
        <a
          href={includeTests ? '/admin/chat-analytics' : '/admin/chat-analytics?showTests=1'}
          style={{
            fontSize: 13, fontWeight: 600, padding: '7px 14px',
            borderRadius: 8, border: '1px solid #e5e7eb',
            background: includeTests ? '#111' : '#fff',
            color: includeTests ? '#fff' : '#374151',
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}
        >
          {includeTests ? 'Tests ausblenden' : 'Tests einblenden'}
        </a>
      </div>

      {/* Category breakdown — always based on real user questions */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', color: '#111' }}>Häufige Themen (echte Nutzer)</h2>
        {categoryCounts.length === 0 ? (
          <p style={{ fontSize: 14, color: '#6b7280' }}>Noch keine Nutzerfragen.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categoryCounts.map((c) => (
              <div
                key={c.category}
                style={{
                  background: '#f3f4f6', borderRadius: 8, padding: '8px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>
                  {CATEGORY_LABELS[c.category] ?? c.category}
                </span>
                <span style={{
                  background: '#111', color: '#fff', borderRadius: 99,
                  fontSize: 11, fontWeight: 700, padding: '1px 7px',
                }}>
                  {c._count.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent questions */}
      <section>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', color: '#111' }}>
          Letzte Fragen {includeTests && <span style={{ fontWeight: 400, color: '#6b7280', fontSize: 13 }}>(inkl. Tests)</span>}
        </h2>
        {logs.length === 0 ? (
          <p style={{ fontSize: 14, color: '#6b7280' }}>Keine Einträge.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {logs.map((log) => (
              <div
                key={log.id}
                style={{
                  background: log.isSuperAdmin ? '#fafafa' : '#fff',
                  border: `1px solid ${log.isSuperAdmin ? '#e5e7eb' : '#e5e7eb'}`,
                  borderRadius: 12,
                  padding: '14px 16px',
                  opacity: log.isSuperAdmin ? 0.7 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      background: '#f3f4f6', borderRadius: 6, padding: '2px 8px',
                      fontSize: 11, fontWeight: 600, color: '#374151',
                    }}>
                      {CATEGORY_LABELS[log.category] ?? log.category}
                    </span>
                    {log.isSuperAdmin && (
                      <span style={{
                        background: '#fef3c7', color: '#92400e', borderRadius: 6,
                        fontSize: 11, fontWeight: 600, padding: '2px 8px',
                      }}>
                        Test
                      </span>
                    )}
                    {log.hotel && (
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{log.hotel.name}</span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>
                    {new Date(log.createdAt).toLocaleString('de-AT', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '0 0 6px' }}>
                  {log.question}
                </p>
                <p style={{ fontSize: 13, color: '#374151', margin: 0, lineHeight: 1.6 }}>
                  {log.answer}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
