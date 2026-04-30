import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { hotelId } = await req.json();
  if (!hotelId) return NextResponse.json({ error: 'hotelId required' }, { status: 400 });

  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
  if (!hotel) return NextResponse.json({ error: 'Hotel not found' }, { status: 404 });

  const eventwulfUrl = process.env.EVENTWULF_URL;
  const provisioningSecret = process.env.EVENTWULF_PROVISIONING_SECRET;
  if (!eventwulfUrl || !provisioningSecret) {
    return NextResponse.json({ error: 'EVENTWULF_URL or EVENTWULF_PROVISIONING_SECRET not configured' }, { status: 500 });
  }

  const res = await fetch(`${eventwulfUrl}/api/provision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provisioningSecret}`,
    },
    body: JSON.stringify({
      name: hotel.name,
      email: `hotel-${hotel.id}@bookingwulf.com`,
      bookingAppUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Provisioning failed: ${text}` }, { status: 502 });
  }

  const { orgId, bookingAppKey } = await res.json();

  await prisma.hotel.update({
    where: { id: hotelId },
    data: { eventwulfEnabled: true, eventwulfOrgId: orgId, eventwulfSecret: bookingAppKey },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await verifySession();
  if (session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { hotelId } = await req.json();
  if (!hotelId) return NextResponse.json({ error: 'hotelId required' }, { status: 400 });

  await prisma.hotel.update({ where: { id: hotelId }, data: { eventwulfEnabled: false } });
  return NextResponse.json({ ok: true });
}
