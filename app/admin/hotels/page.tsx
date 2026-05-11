import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import DeleteHotelButton from './DeleteHotelButton';
import { Button } from '../components/ui';

export const dynamic = 'force-dynamic';

async function toggleHotelActive(formData: FormData) {
  'use server';

  const session = await verifySession();
  if (session.role !== 'super_admin') return;

  const id = Number(formData.get('id'));
  const current = formData.get('isActive') === 'true';
  if (!id) return;

  await prisma.hotel.update({ where: { id }, data: { isActive: !current } });
  redirect('/admin/hotels');
}

async function resetTrial(formData: FormData) {
  'use server';

  const session = await verifySession();
  if (session.role !== 'super_admin') return;

  const id = Number(formData.get('id'));
  if (!id) return;

  await prisma.hotel.update({
    where: { id },
    data: {
      subscriptionStatus: 'trialing',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });
  redirect('/admin/hotels');
}

async function deleteHotel(formData: FormData) {
  'use server';

  const session = await verifySession();
  if (session.role !== 'super_admin') return;

  const id = Number(formData.get('id'));
  if (!id) return;

  // Delete admin users first (onDelete: SetNull won't remove them)
  await prisma.adminUser.deleteMany({ where: { hotelId: id } });
  await prisma.hotel.delete({ where: { id } });
  redirect('/admin/hotels');
}

export default async function HotelsPage() {
  const session = await verifySession();
  if (session.role !== 'super_admin') redirect('/admin');

  const hotels = await prisma.hotel.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { apartments: true, requests: true } },
    },
  });

  return (
    <main className="admin-page" style={{ maxWidth: 960 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 28,
          gap: 16,
        }}
      >
        <div>
          <h1 className="page-title">Hotels</h1>
          <p className="page-subtitle">Hotels anlegen und verwalten</p>
        </div>
        <Link href="/admin/hotels/new" className="ui-btn ui-btn-primary ui-btn-md" style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
          Neues Hotel
        </Link>
      </div>

      {hotels.length === 0 ? (
        <p>Noch keine Hotels vorhanden.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {hotels.map((h) => (
            <div
              key={h.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '18px 20px',
                background: 'var(--surface)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
                opacity: h.isActive ? 1 : 0.55,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: h.accentColor || 'var(--border)',
                    flexShrink: 0,
                    border: '1px solid rgba(0,0,0,0.08)',
                  }}
                />
                <div style={{ display: 'grid', gap: 3 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
                    {h.name}
                    {!h.isActive && (
                      <span
                        style={{
                          marginLeft: 8,
                          padding: '2px 8px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          background: 'var(--status-cancelled-bg)',
                          color: 'var(--status-cancelled-text)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Inaktiv
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    /{h.slug}
                    {h.email && <span style={{ marginLeft: 12 }}>{h.email}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-disabled)' }}>
                    {h._count.apartments} Apartments · {h._count.requests} Anfragen
                    {' · '}
                    <span style={{
                      padding: '1px 6px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 600,
                      background: h.subscriptionStatus === 'active' ? 'var(--status-booked-bg)' : h.subscriptionStatus === 'trialing' ? 'var(--status-new-bg)' : 'var(--status-cancelled-bg)',
                      color: h.subscriptionStatus === 'active' ? 'var(--status-booked-text)' : h.subscriptionStatus === 'trialing' ? 'var(--status-new-text)' : 'var(--status-cancelled-text)',
                    }}>
                      {h.subscriptionStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Link href={`/admin/hotels/${h.id}`} className="ui-btn ui-btn-secondary ui-btn-sm" style={{ textDecoration: 'none' }}>
                  Bearbeiten
                </Link>

                <form action={toggleHotelActive}>
                  <input type="hidden" name="id" value={h.id} />
                  <input type="hidden" name="isActive" value={String(h.isActive)} />
                  <Button variant="secondary" size="sm" type="submit">
                    {h.isActive ? 'Deaktivieren' : 'Aktivieren'}
                  </Button>
                </form>

                {h.subscriptionStatus !== 'trialing' && h.subscriptionStatus !== 'active' && (
                  <form action={resetTrial}>
                    <input type="hidden" name="id" value={h.id} />
                    <Button variant="secondary" size="sm" type="submit">Trial zurücksetzen</Button>
                  </form>
                )}

                <DeleteHotelButton
                  hotelId={h.id}
                  hotelName={h.name}
                  action={deleteHotel}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
