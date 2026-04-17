import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import DeleteHotelButton from './DeleteHotelButton';

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
    <main style={{ padding: 40, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', maxWidth: 900 }}>
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
          <h1 style={{ margin: 0, fontSize: 28, color: '#111' }}>Hotels</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#666' }}>
            Hotels anlegen und verwalten
          </p>
        </div>
        <Link
          href="/admin/hotels/new"
          style={{
            textDecoration: 'none',
            padding: '10px 18px',
            background: '#111',
            color: '#fff',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
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
                border: '1px solid #e5e7eb',
                borderRadius: 14,
                padding: '18px 20px',
                background: '#fff',
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
                    background: h.accentColor || '#e5e7eb',
                    flexShrink: 0,
                    border: '1px solid rgba(0,0,0,0.08)',
                  }}
                />
                <div style={{ display: 'grid', gap: 3 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#111' }}>
                    {h.name}
                    {!h.isActive && (
                      <span
                        style={{
                          marginLeft: 8,
                          padding: '2px 8px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          background: '#fef2f2',
                          color: '#b91c1c',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Inaktiv
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: '#888' }}>
                    /{h.slug}
                    {h.email && <span style={{ marginLeft: 12 }}>{h.email}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#aaa' }}>
                    {h._count.apartments} Apartments · {h._count.requests} Anfragen
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <Link
                  href={`/admin/hotels/${h.id}`}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 999,
                    border: '1px solid #d1d5db',
                    background: '#fff',
                    color: '#111',
                    textDecoration: 'none',
                    fontSize: 13,
                  }}
                >
                  Bearbeiten
                </Link>

                <form action={toggleHotelActive}>
                  <input type="hidden" name="id" value={h.id} />
                  <input type="hidden" name="isActive" value={String(h.isActive)} />
                  <button
                    type="submit"
                    style={{
                      padding: '8px 14px',
                      borderRadius: 999,
                      border: '1px solid #d1d5db',
                      background: '#fff',
                      color: '#555',
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    {h.isActive ? 'Deaktivieren' : 'Aktivieren'}
                  </button>
                </form>

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
