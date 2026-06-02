import { NextResponse } from 'next/server';
import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';
import { autoTranslateFields } from '@/src/lib/translate';

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

  const titleChanged = body.title !== undefined;
  const descChanged = body.description !== undefined;
  let titleEn, titleIt, descriptionEn, descriptionIt;

  if (titleChanged || descChanged) {
    const fields: Record<string, string> = {};
    if (titleChanged && body.title) fields.title = String(body.title).trim();
    if (descChanged && body.description) fields.description = body.description.trim();
    if (Object.keys(fields).length) {
      const tr = await autoTranslateFields(fields);
      if (titleChanged) { titleEn = tr.en?.title ?? null; titleIt = tr.it?.title ?? null; }
      if (descChanged) { descriptionEn = tr.en?.description ?? null; descriptionIt = tr.it?.description ?? null; }
    }
  }

  const updated = await prisma.thingsToSee.update({
    where: { id },
    data: {
      ...(body.category !== undefined && { category: body.category }),
      ...(titleChanged && { title: String(body.title).trim(), titleEn, titleIt }),
      ...(descChanged && { description: body.description?.trim() || null, descriptionEn, descriptionIt }),
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
