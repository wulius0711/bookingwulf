import { NextResponse } from 'next/server';
import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';

type Params = { params: Promise<{ id: string }> };

async function getImage(id: number, session: Awaited<ReturnType<typeof verifySession>>) {
  const image = await prisma.checkinImage.findUnique({ where: { id } });
  if (!image) return null;
  if (session.hotelId !== null && image.hotelId !== session.hotelId) return null;
  return image;
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await verifySession();
  const { id: idStr } = await params;
  const image = await getImage(Number(idStr), session);
  if (!image) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.checkinImage.update({
    where: { id: image.id },
    data: {
      ...(body.caption !== undefined && { caption: body.caption?.trim() || null }),
      ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await verifySession();
  const { id: idStr } = await params;
  const image = await getImage(Number(idStr), session);
  if (!image) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.checkinImage.delete({ where: { id: image.id } });
  return NextResponse.json({ ok: true });
}
