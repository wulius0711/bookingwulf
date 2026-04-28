import { cookies } from 'next/headers';
import { decrypt } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';
import { deleteChatLog, deleteAllTestLogs } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Chat-Auswertung — bookingwulf Admin' };

const CATEGORY_LABELS: Record<string, string> = {
  buchungen:  'Buchungen & Anfragen',
  kalender:   'Kalender',
  apartments: 'Apartments',
  preise:     'Preise & Saisonen',
  widget:     'Widget-Einbindung',
  emails:     'E-Mails',
  nuki:       'Nuki / Zugang',
  beds24:     'Beds24',
  abonnement: 'Abonnement',
  analytics:  'Analytics',
  extras:     'Zusatzleistungen',
  sperrzeiten:'Sperrzeiten',
  sonstiges:  'Sonstiges',
};

const CATEGORY_COLORS: Record<string, string> = {
  buchungen:  '#6366f1',
  kalender:   '#0ea5e9',
  apartments: '#10b981',
  preise:     '#f59e0b',
  widget:     '#8b5cf6',
  emails:     '#ec4899',
  nuki:       '#14b8a6',
  beds24:     '#f97316',
  abonnement: '#64748b',
  analytics:  '#3b82f6',
  extras:     '#84cc16',
  sperrzeiten:'#ef4444',
  sonstiges:  '#9ca3af',
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

  const [logs, realCount, testCount, categoryCounts, weekCount] = await Promise.all([
    prisma.supportChatLog.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      take: 100,
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
    prisma.supportChatLog.count({
      where: {
        isSuperAdmin: false,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  const maxCategoryCount = categoryCounts[0]?._count.category ?? 1;
  const topCategory = categoryCounts[0]?.category;

  return (
    <main className="admin-page" style={{ maxWidth: 900 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>Chat-Auswertung</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Fragen von Nutzern an den KI-Assistenten</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {includeTests && testCount > 0 && (
            <form action={deleteAllTestLogs}>
              <button type="submit" style={{ fontSize: 12, fontWeight: 600, padding: '7px 12px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', cursor: 'pointer' }}>
                Alle Tests löschen
              </button>
            </form>
          )}
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
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Echte Fragen gesamt', value: realCount, sub: null, color: '#6366f1' },
          { label: 'Diese Woche', value: weekCount, sub: 'letzte 7 Tage', color: '#10b981' },
          { label: 'Top-Thema', value: topCategory ? (CATEGORY_LABELS[topCategory] ?? topCategory) : '—', sub: topCategory ? `${categoryCounts[0]._count.category}×` : null, color: '#f59e0b', small: true },
        ].map((s) => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px 20px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: s.small ? 18 : 30, fontWeight: 800, color: '#111', lineHeight: 1.1 }}>{s.value}</div>
            {s.sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Category bars */}
      {categoryCounts.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '20px 24px', marginBottom: 28 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 16px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Themen-Verteilung</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {categoryCounts.map((c) => {
              const pct = Math.round((c._count.category / maxCategoryCount) * 100);
              const color = CATEGORY_COLORS[c.category] ?? '#9ca3af';
              return (
                <div key={c.category} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 28px', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {CATEGORY_LABELS[c.category] ?? c.category}
                  </span>
                  <div style={{ height: 8, borderRadius: 99, background: '#f3f4f6', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 0.3s ease' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textAlign: 'right' }}>{c._count.category}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Log entries */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Letzte Fragen {includeTests && <span style={{ fontWeight: 400, color: '#9ca3af', textTransform: 'none', letterSpacing: 0 }}>(inkl. Tests)</span>}
        </h2>
        {logs.length === 0 ? (
          <p style={{ fontSize: 14, color: '#6b7280' }}>Keine Einträge.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {logs.map((log) => {
              const color = CATEGORY_COLORS[log.category] ?? '#9ca3af';
              return (
                <div
                  key={log.id}
                  style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderLeft: `3px solid ${log.isSuperAdmin ? '#fbbf24' : color}`,
                    borderRadius: 12,
                    padding: '14px 16px',
                    opacity: log.isSuperAdmin ? 0.75 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{
                        background: color + '18', color, borderRadius: 6,
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', whiteSpace: 'nowrap',
                      }}>
                        {CATEGORY_LABELS[log.category] ?? log.category}
                      </span>
                      {log.isSuperAdmin && (
                        <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: 6, fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>
                          Test
                        </span>
                      )}
                      {log.hotel && (
                        <span style={{ fontSize: 12, color: '#6b7280', background: '#f9fafb', borderRadius: 6, padding: '2px 8px', border: '1px solid #e5e7eb' }}>
                          {log.hotel.name}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>
                        {new Date(log.createdAt).toLocaleString('de-AT', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <form action={deleteChatLog}>
                        <input type="hidden" name="id" value={log.id} />
                        <button
                          type="submit"
                          title="Eintrag löschen"
                          className="chat-log-delete-btn"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', lineHeight: 1 }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </form>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: '0 0 8px', lineHeight: 1.5 }}>
                    {log.question}
                  </p>
                  <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.6, borderTop: '1px solid #f3f4f6', paddingTop: 8 }}>
                    {log.answer}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
