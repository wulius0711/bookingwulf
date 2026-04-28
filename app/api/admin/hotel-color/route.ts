import { NextResponse } from 'next/server';
import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await verifySession();
    const url = new URL(req.url);
    const paramHotelId = url.searchParams.get('hotelId');

    // super_admin can pass hotelId explicitly; others use session
    let hotelId = session.hotelId;
    if (session.role === 'super_admin' && paramHotelId) {
      hotelId = Number(paramHotelId);
    }

    if (!hotelId) return NextResponse.json({ color: null });

    const settings = await prisma.hotelSettings.findUnique({
      where: { hotelId },
      select: { accentColor: true },
    });

    return NextResponse.json({ color: settings?.accentColor ?? null });
  } catch {
    return NextResponse.json({ color: null });
  }
}
