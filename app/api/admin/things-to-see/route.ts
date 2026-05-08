import { NextResponse } from 'next/server';
import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';

async function getHotelId(session: Awaited<ReturnType<typeof verifySession>>, body?: { hotelId?: number }) {
  if (session.hotelId !== null) return session.hotelId;
  const id = Number(body?.hotelId ?? 0);
  if (!id) throw new Error('hotelId required');
  return id;
}

export async function GET(req: Request) {
  const session = await verifySession();
  const { searchParams } = new URL(req.url);
  const hotelId = session.hotelId ?? Number(searchParams.get('hotelId') ?? 0);

  const items = await prisma.thingsToSee.findMany({
    where: { hotelId },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await verifySession();
  const body = await req.json();
  const hotelId = await getHotelId(session, body);

  const item = await prisma.thingsToSee.create({
    data: {
      hotelId,
      category: body.category ?? 'attraction',
      title: String(body.title ?? '').trim(),
      description: body.description?.trim() || null,
      address: body.address?.trim() || null,
      mapsUrl: body.mapsUrl?.trim() || null,
      imageUrl: body.imageUrl?.trim() || null,
      placeId: body.placeId?.trim() || null,
      sortOrder: body.sortOrder ?? 0,
      apartmentId: body.apartmentId ? Number(body.apartmentId) : null,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
