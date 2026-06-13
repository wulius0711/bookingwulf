import { NextResponse } from 'next/server';
import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await verifySession();
  const { id: idStr } = await params;
  const id = Number(idStr);

  const item = await prisma.hotelExtra.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (session.hotelId !== null && item.hotelId !== session.hotelId)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();

  await prisma.hotelExtra.update({
    where: { id },
    data: {
      ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
    },
  });

  return NextResponse.json({ ok: true });
}
