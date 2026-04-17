import { prisma } from '@/src/lib/prisma';
import { NextResponse } from 'next/server';
import { hasPlanAccess } from '@/src/lib/plan-gates';
import type { PlanKey } from '@/src/lib/plans';

function withCors(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelSlug = searchParams.get('hotel');

    if (!hotelSlug) {
      return withCors(
        NextResponse.json(
          { success: false, message: 'Missing hotel slug' },
          { status: 400 },
        ),
      );
    }

    const hotel = await prisma.hotel.findUnique({
      where: { slug: hotelSlug },
      select: {
        id: true,
        name: true,
        plan: true,
      },
    });

    if (!hotel) {
      return withCors(
        NextResponse.json(
          { success: false, message: 'Hotel not found' },
          { status: 404 },
        ),
      );
    }

    const settings = await prisma.hotelSettings.findUnique({
      where: { hotelId: hotel.id },
    });

    const canUseExtras = hasPlanAccess((hotel.plan as PlanKey) ?? 'starter', 'pro');
    const extras = await prisma.hotelExtra.findMany({
      where: {
        hotelId: hotel.id,
        isActive: true,
        // Starter plans only get insurance, Pro+ gets everything
        ...(!canUseExtras ? { type: 'insurance' } : {}),
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { key: true, name: true, type: true, billingType: true, price: true, linkUrl: true },
    });

    return withCors(
      NextResponse.json({
        success: true,
        hotel,
        settings,
        extras,
      }),
    );
  } catch (error) {
    console.error('hotel-settings GET error:', error);

    return withCors(
      NextResponse.json(
        { success: false, message: 'Server error' },
        { status: 500 },
      ),
    );
  }
}
