import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import ZimmerplanClient from './ZimmerplanClient';
import { buildZimmerplan } from '@/src/lib/zimmerplan';

export const dynamic = 'force-dynamic';

export default async function ZimmerplanPage() {
  const session = await verifySession();

  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const cards = await buildZimmerplan(session.hotelId, todayIso);

  return <ZimmerplanClient initialDate={todayIso} initialCards={cards} />;
}
