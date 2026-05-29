import { NextResponse } from 'next/server';
import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';

export async function POST(req: Request) {
  const session = await verifySession();
  if (session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { hotelId, isTest } = await req.json();
  if (typeof hotelId !== 'number' || typeof isTest !== 'boolean') {
    return NextResponse.json({ error: 'Ungültige Parameter' }, { status: 400 });
  }

  await prisma.hotel.update({ where: { id: hotelId }, data: { isTest } });
  return NextResponse.json({ ok: true });
}
