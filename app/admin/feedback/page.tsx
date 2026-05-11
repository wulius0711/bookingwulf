import { prisma } from '@/src/lib/prisma';
import { cookies } from 'next/headers';
import { decrypt } from '@/src/lib/session';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import DeleteFeedbackButton from './DeleteFeedbackButton';
import ScreenshotPreview from './ScreenshotPreview';

export const dynamic = 'force-dynamic';

export default async function FeedbackPage() {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get('admin_session')?.value);
  if (!session || session.role !== 'super_admin') redirect('/admin');

  const items = await prisma.adminFeedback.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  async function deleteFeedback(id: number) {
    'use server';
    const s = await decrypt((await cookies()).get('admin_session')?.value);
    if (!s || s.role !== 'super_admin') return;
    await prisma.adminFeedback.delete({ where: { id } });
    revalidatePath('/admin/feedback');
  }

  return (
    <main className="admin-page w-md">
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
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  {item.hotelName && (
                    <span style={{ fontSize: 12, fontWeight: 600, background: 'var(--surface-2)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 6 }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>
                    {new Date(item.createdAt).toLocaleString('de-AT', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <DeleteFeedbackButton action={deleteFeedback.bind(null, item.id)} />
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {item.message}
              </p>
              {item.screenshot && <ScreenshotPreview src={item.screenshot} />}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
