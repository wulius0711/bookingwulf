import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import ZimmerplanClient from './ZimmerplanClient';
import { buildZimmerplan } from '@/src/lib/zimmerplan';
import { hasPlanAccess } from '@/src/lib/plan-gates';

export const dynamic = 'force-dynamic';

export default async function ZimmerplanPage() {
  const session = await verifySession();

  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [cards, hotelData] = await Promise.all([
    buildZimmerplan(session.hotelId, todayIso),
    session.hotelId
      ? prisma.hotel.findUnique({ where: { id: session.hotelId }, select: { plan: true } })
      : null,
  ]);

  const hasPro = session.hotelId === null || hasPlanAccess(hotelData?.plan ?? 'starter', 'pro');

  return <ZimmerplanClient initialDate={todayIso} initialCards={cards} hasPro={hasPro} />;
}
