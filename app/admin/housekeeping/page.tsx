import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { redirect } from 'next/navigation';
import { hasPlanAccess } from '@/src/lib/plan-gates';
import { buildHousekeeping } from '@/src/lib/housekeeping';
import HousekeepingClient from './HousekeepingClient';

export const dynamic = 'force-dynamic';

export default async function HousekeepingPage() {
  const session = await verifySession();
  if (!session.hotelId) redirect('/admin');

  const hotel = await prisma.hotel.findUnique({ where: { id: session.hotelId }, select: { plan: true } });
  if (!hotel || !hasPlanAccess(hotel.plan ?? 'starter', 'pro')) redirect('/admin/billing');

  const apartments = await buildHousekeeping(session.hotelId);

  return <HousekeepingClient initialApartments={apartments} />;
}
