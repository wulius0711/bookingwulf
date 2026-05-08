import { NextResponse } from 'next/server';
import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';

type Params = { params: Promise<{ id: string }> };

async function getItem(id: number, session: Awaited<ReturnType<typeof verifySession>>) {
  const item = await prisma.thingsToSee.findUnique({ where: { id } });
  if (!item) return null;
  if (session.hotelId !== null && item.hotelId !== session.hotelId) return null;
  return item;
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await verifySession();
  const { id: idStr } = await params;
  const id = Number(idStr);
  const item = await getItem(id, session);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();

  const updated = await prisma.thingsToSee.update({
    where: { id },
    data: {
      ...(body.category !== undefined && { category: body.category }),
      ...(body.title !== undefined && { title: String(body.title).trim() }),
      ...(body.description !== undefined && { description: body.description?.trim() || null }),
      ...(body.address !== undefined && { address: body.address?.trim() || null }),
      ...(body.mapsUrl !== undefined && { mapsUrl: body.mapsUrl?.trim() || null }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl?.trim() || null }),
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
      ...(body.apartmentId !== undefined && { apartmentId: body.apartmentId ? Number(body.apartmentId) : null }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await verifySession();
  const { id: idStr } = await params;
  const id = Number(idStr);
  const item = await getItem(id, session);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.thingsToSee.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
