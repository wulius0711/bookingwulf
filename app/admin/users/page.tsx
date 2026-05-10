import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ConfirmDeleteForm from '../components/ConfirmDeleteForm';

export const dynamic = 'force-dynamic';

async function deleteUser(formData: FormData) {
  'use server';

  const session = await verifySession();
  if (session.role !== 'super_admin') return;

  const id = Number(formData.get('id'));
  if (!id || id === session.userId) return; // darf sich nicht selbst löschen

  await prisma.adminUser.delete({ where: { id } });
  redirect('/admin/users');
}

async function toggleActive(formData: FormData) {
  'use server';

  const session = await verifySession();
  if (session.role !== 'super_admin') return;

  const id = Number(formData.get('id'));
  const currentActive = formData.get('isActive') === 'true';
  if (!id || id === session.userId) return;

  await prisma.adminUser.update({
    where: { id },
    data: { isActive: !currentActive },
  });
  redirect('/admin/users');
}

export default async function UsersPage() {
  const session = await verifySession();
  if (session.role !== 'super_admin') redirect('/admin');

  const users = await prisma.adminUser.findMany({
    include: { hotel: { select: { name: true, slug: true } } },
    orderBy: [{ role: 'asc' }, { email: 'asc' }],
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
          <h1 className="page-title">Benutzer</h1>
          <p className="page-subtitle">
            Admin-Zugänge verwalten
          </p>
        </div>
        <Link href="/admin/users/new" className="btn-primary">
          Neuer Benutzer
        </Link>
      </div>

      {users.length === 0 ? (
        <p>Keine Benutzer vorhanden.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {users.map((u) => (
            <div
              key={u.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '16px 20px',
                background: 'var(--surface)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
                opacity: u.isActive ? 1 : 0.55,
              }}
            >
              <div style={{ display: 'grid', gap: 4 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
                  {u.email}
                  {u.id === session.userId && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        color: '#888',
                        fontWeight: 400,
                      }}
                    >
                      (du)
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: '2px 10px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      background: u.role === 'super_admin' ? '#111' : '#e8f0fe',
                      color: u.role === 'super_admin' ? '#fff' : '#1a56db',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {u.role === 'super_admin' ? 'Super Admin' : 'Hotel Admin'}
                  </span>

                  {u.hotel && (
                    <span style={{ fontSize: 13, color: '#555' }}>
                      {u.hotel.name}
                    </span>
                  )}

                  {!u.isActive && (
                    <span
                      style={{
                        padding: '2px 10px',
                        borderRadius: 8,
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
              </div>

              {u.id !== session.userId && (
                <div style={{ display: 'flex', gap: 8 }}>
                  {u.role === 'hotel_admin' && (
                    <a
                      href={`/admin/users/${u.id}`}
                      style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}
                    >
                      Hotels
                    </a>
                  )}
                  <form action={toggleActive}>
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="isActive" value={String(u.isActive)} />
                    <button
                      type="submit"
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      {u.isActive ? 'Deaktivieren' : 'Aktivieren'}
                    </button>
                  </form>

                  <ConfirmDeleteForm action={deleteUser} id={u.id} message={`Benutzer „${u.email}" wirklich löschen?`}>
                    <button
                      type="submit"
                      style={{
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: '1px solid #fca5a5',
                        background: 'var(--surface)',
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      Löschen
                    </button>
                  </ConfirmDeleteForm>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
