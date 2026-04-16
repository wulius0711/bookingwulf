import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { redirect } from 'next/navigation';
import NewUserForm from './new-user-form';

export default async function NewUserPage() {
  const session = await verifySession();
  if (session.role !== 'super_admin') redirect('/admin');

  const hotels = await prisma.hotel.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  });

  return <NewUserForm hotels={hotels} />;
}
