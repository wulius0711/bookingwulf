import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import UserList, { type UserRow } from './UserList';

export const dynamic = 'force-dynamic';

async function deleteUser(formData: FormData) {
  'use server';

  const session = await verifySession();
  if (session.role !== 'super_admin') return;

  const id = Number(formData.get('id'));
  if (!id || id === session.userId) return;

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

  await prisma.adminUser.update({ where: { id }, data: { isActive: !currentActive } });
  redirect('/admin/users');
}

async function revokeSessionsInline(formData: FormData) {
  'use server';

  const session = await verifySession();
  if (session.role !== 'super_admin') return;

  const id = Number(formData.get('id'));
  if (!id || id === session.userId) return;

  await prisma.adminUser.update({ where: { id }, data: { sessionVersion: { increment: 1 } } });
  redirect('/admin/users');
}

export default async function UsersPage() {
  const session = await verifySession();
  if (session.role !== 'super_admin') redirect('/admin');

  const raw = await prisma.adminUser.findMany({
    include: { hotel: { select: { name: true, slug: true } } },
    orderBy: [{ role: 'asc' }, { email: 'asc' }],
  });

  const users: UserRow[] = raw.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    hotelName: u.hotel?.name ?? null,
    hotelSlug: u.hotel?.slug ?? null,
  }));

  return (
    <main className="admin-page" style={{ maxWidth: 960 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, gap: 16 }}>
        <div>
          <h1 className="page-title">Benutzer</h1>
          <p className="page-subtitle">Admin-Zugänge verwalten</p>
        </div>
        <Link href="/admin/users/new" className="ui-btn ui-btn-primary ui-btn-md">
          Neuer Benutzer
        </Link>
      </div>

      {users.length === 0 ? (
        <p>Keine Benutzer vorhanden.</p>
      ) : (
        <UserList
          users={users}
          currentUserId={session.userId}
          onToggle={toggleActive}
          onRevokeSessions={revokeSessionsInline}
          onDelete={deleteUser}
        />
      )}
    </main>
  );
}
