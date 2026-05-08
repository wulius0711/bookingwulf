import { NextResponse } from 'next/server';
import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';

export async function POST(req: Request) {
  const session = await verifySession();
  const body = await req.json();
  const hotelId = session.hotelId ?? Number(body.hotelId ?? 0);
  if (!hotelId) return NextResponse.json({ error: 'hotelId required' }, { status: 400 });
  if (!body.imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 });

  const image = await prisma.checkinImage.create({
    data: {
      hotelId,
      apartmentId: body.apartmentId ? Number(body.apartmentId) : null,
      imageUrl: String(body.imageUrl),
      caption: body.caption?.trim() || null,
      sortOrder: body.sortOrder ?? 0,
    },
  });

  return NextResponse.json(image, { status: 201 });
}
