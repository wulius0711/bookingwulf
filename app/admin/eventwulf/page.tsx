import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';
import { redirect } from 'next/navigation';
import { createHmac } from 'crypto';

export const dynamic = 'force-dynamic';

export default async function EventwulfPage() {
  const session = await verifySession();
  if (!session.hotelId) redirect('/admin');

  const hotel = await prisma.hotel.findUnique({
    where: { id: session.hotelId },
    select: { eventwulfEnabled: true, eventwulfOrgId: true, eventwulfSecret: true },
  });

  if (!hotel?.eventwulfEnabled || !hotel.eventwulfOrgId || !hotel.eventwulfSecret) {
    redirect('/admin');
  }

  const eventwulfUrl = process.env.EVENTWULF_URL;
  if (!eventwulfUrl) redirect('/admin');

  const ts = Date.now().toString();
  const sig = createHmac('sha256', hotel.eventwulfSecret)
    .update(`autologin:${hotel.eventwulfOrgId}:${ts}`)
    .digest('hex');

  const url = `${eventwulfUrl}/api/autologin?orgId=${hotel.eventwulfOrgId}&ts=${ts}&sig=${sig}`;

  redirect(url);
}
