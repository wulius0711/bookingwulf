import { prisma } from '@/src/lib/prisma';
import { cookies } from 'next/headers';
import { decrypt } from '@/src/lib/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function FeedbackPage() {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get('admin_session')?.value);
  if (!session || session.role !== 'super_admin') redirect('/admin');

  const items = await prisma.adminFeedback.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <main className="admin-page" style={{ maxWidth: 800 }}>
      <h1 style={{ margin: 0 }}>Feedback</h1>
      <p className="page-subtitle" style={{ marginBottom: 28 }}>
        Eingegangene Rückmeldungen von Nutzern
      </p>

      {items.length === 0 ? (
        <p style={{ fontSize: 14, color: '#6b7280' }}>Noch kein Feedback eingegangen.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: '14px 18px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {item.hotelName && (
                    <span style={{ fontSize: 12, fontWeight: 600, background: '#f3f4f6', color: '#374151', padding: '2px 8px', borderRadius: 6 }}>
                      {item.hotelName}
                    </span>
                  )}
                  {item.userEmail && (
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{item.userEmail}</span>
                  )}
                  {item.page && (
                    <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>{item.page}</span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>
                  {new Date(item.createdAt).toLocaleString('de-AT', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: '#111', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {item.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
