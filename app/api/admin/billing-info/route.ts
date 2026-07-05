import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { effectiveApartmentCount } from '@/src/lib/stripe-sync';

export async function GET() {
  try {
    const session = await verifySession();
    if (!session.hotelId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const hotel = await prisma.hotel.findUnique({
      where: { id: session.hotelId },
      select: {
        id: true, name: true, plan: true, subscriptionStatus: true, stripeCustomerId: true, trialEndsAt: true,
        billedApartments: true,
        _count: { select: { apartments: true } },
      },
    });

    return NextResponse.json({
      hotel: hotel && {
        ...hotel,
        actualApartmentCount: hotel._count.apartments,
        apartmentCount: effectiveApartmentCount(hotel._count.apartments, hotel.billedApartments),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
