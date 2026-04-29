import { NextResponse } from 'next/server';
import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';

export async function POST(req: Request) {
  let session: Awaited<ReturnType<typeof verifySession>>;
  try {
    session = await verifySession();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { message, page } = await req.json();
  if (!message || typeof message !== 'string' || message.trim().length < 2) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  let hotelName: string | null = null;
  if (session.hotelId) {
    const hotel = await prisma.hotel.findUnique({ where: { id: session.hotelId }, select: { name: true } });
    hotelName = hotel?.name ?? null;
  }

  await prisma.adminFeedback.create({
    data: {
      hotelId: session.hotelId ?? null,
      hotelName,
      userEmail: session.email ?? null,
      message: message.trim(),
      page: typeof page === 'string' ? page : null,
    },
  });

  return NextResponse.json({ ok: true });
}
