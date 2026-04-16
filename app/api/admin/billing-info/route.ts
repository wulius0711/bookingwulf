import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';

export async function GET() {
  try {
    const session = await verifySession();
    if (!session.hotelId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const hotel = await prisma.hotel.findUnique({
      where: { id: session.hotelId },
      select: { id: true, name: true, plan: true, subscriptionStatus: true, stripeCustomerId: true, trialEndsAt: true },
    });

    return NextResponse.json({ hotel });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
