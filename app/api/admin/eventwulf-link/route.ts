import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';

export async function GET() {
  const session = await verifySession();

  const hotelId = session.hotelId;
  if (!hotelId) return NextResponse.json({ error: 'No hotel' }, { status: 400 });

  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    select: { eventwulfEnabled: true, eventwulfOrgId: true, eventwulfSecret: true },
  });

  if (!hotel?.eventwulfEnabled || !hotel.eventwulfOrgId || !hotel.eventwulfSecret) {
    return NextResponse.json({ error: 'eventwulf not enabled' }, { status: 403 });
  }

  const ts = Date.now().toString();
  const sig = createHmac('sha256', hotel.eventwulfSecret)
    .update(`autologin:${hotel.eventwulfOrgId}:${ts}`)
    .digest('hex');

  const eventwulfUrl = process.env.EVENTWULF_URL;
  if (!eventwulfUrl) return NextResponse.json({ error: 'EVENTWULF_URL not configured' }, { status: 500 });

  const url = `${eventwulfUrl}/api/autologin?orgId=${hotel.eventwulfOrgId}&ts=${ts}&sig=${sig}`;
  return NextResponse.json({ url });
}
