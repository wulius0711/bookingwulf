import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';
import { createHmac } from 'crypto';

export const dynamic = 'force-dynamic';

export default async function HungrywulfPage() {
  const session = await verifySession();
  if (!session.hotelId) redirect('/admin');

  const hotel = await prisma.hotel.findUnique({
    where: { id: session.hotelId },
    select: { hungrywulfEnabled: true, hungrywulfRestaurantId: true, hungrywulfSecret: true },
  });

  if (!hotel?.hungrywulfEnabled || !hotel.hungrywulfRestaurantId || !hotel.hungrywulfSecret) {
    redirect('/admin');
  }

  const hungrywulfUrl = process.env.HUNGRYWULF_URL;
  if (!hungrywulfUrl) redirect('/admin');

  const ts = Date.now().toString();
  const sig = createHmac('sha256', hotel.hungrywulfSecret)
    .update(`autologin:${hotel.hungrywulfRestaurantId}:${ts}`)
    .digest('hex');

  const url = `${hungrywulfUrl}/api/autologin?rid=${hotel.hungrywulfRestaurantId}&ts=${ts}&sig=${sig}`;

  redirect(url);
}
