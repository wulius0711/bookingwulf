import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Nur für Super-Admins.' }, { status: 403 });
    }

    const { hotelId } = await req.json();
    if (!hotelId) return NextResponse.json({ error: 'hotelId fehlt.' }, { status: 400 });

    await prisma.hotel.update({
      where: { id: Number(hotelId) },
      data: {
        subscriptionStatus: 'trialing',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Zurücksetzen.' }, { status: 500 });
  }
}
