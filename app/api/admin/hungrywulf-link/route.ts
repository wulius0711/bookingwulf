import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await verifySession();

  const hotelId = session.hotelId;
  if (!hotelId) return NextResponse.json({ error: 'No hotel' }, { status: 400 });

  const hotel = await prisma.hotel.findUnique({
    where: { id: hotelId },
    select: { hungrywulfEnabled: true, hungrywulfRestaurantId: true, hungrywulfSecret: true },
  });

  if (!hotel?.hungrywulfEnabled || !hotel.hungrywulfRestaurantId || !hotel.hungrywulfSecret) {
    return NextResponse.json({ error: 'hungrywulf not enabled' }, { status: 403 });
  }

  const ts = Date.now().toString();
  const sig = createHmac('sha256', hotel.hungrywulfSecret)
    .update(`autologin:${hotel.hungrywulfRestaurantId}:${ts}`)
    .digest('hex');

  const hungrywulfUrl = process.env.HUNGRYWULF_URL;
  if (!hungrywulfUrl) return NextResponse.json({ error: 'HUNGRYWULF_URL not configured' }, { status: 500 });

  const url = `${hungrywulfUrl}/api/autologin?rid=${hotel.hungrywulfRestaurantId}&ts=${ts}&sig=${sig}`;
  return NextResponse.json({ url });
}
