import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';

// POST: enable hungrywulf for a hotel (provisions account if not yet done)
export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { hotelId } = await req.json();
  if (!hotelId) return NextResponse.json({ error: 'hotelId required' }, { status: 400 });

  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
  if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });

  const hungrywulfUrl = process.env.HUNGRYWULF_URL;
  const provisioningSecret = process.env.HUNGRYWULF_PROVISIONING_SECRET;
  if (!hungrywulfUrl || !provisioningSecret) {
    return NextResponse.json({ error: 'HUNGRYWULF_URL or HUNGRYWULF_PROVISIONING_SECRET not configured' }, { status: 500 });
  }

  const res = await fetch(`${hungrywulfUrl}/api/provision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provisioningSecret}`,
    },
    body: JSON.stringify({
      name: hotel.name,
      email: hotel.email ?? `hotel-${hotel.id}@bookingwulf.com`,
      bookingAppUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Provisioning failed: ${text}` }, { status: 502 });
  }

  const { restaurantId, bookingAppKey } = await res.json();

  await prisma.hotel.update({
    where: { id: hotelId },
    data: { hungrywulfEnabled: true, hungrywulfRestaurantId: restaurantId, hungrywulfSecret: bookingAppKey },
  });

  return NextResponse.json({ ok: true });
}

// DELETE: disable hungrywulf for a hotel
export async function DELETE(req: NextRequest) {
  const session = await verifySession();
  if (session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { hotelId } = await req.json();
  if (!hotelId) return NextResponse.json({ error: 'hotelId required' }, { status: 400 });

  await prisma.hotel.update({ where: { id: hotelId }, data: { hungrywulfEnabled: false } });
  return NextResponse.json({ ok: true });
}
