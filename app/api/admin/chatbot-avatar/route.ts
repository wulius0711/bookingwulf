import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session.hotelId) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Keine Datei' }, { status: 400 });

  const blob = await put(`chatbot-avatar/${session.hotelId}-${file.name}`, file, {
    access: 'public',
    addRandomSuffix: true,
  });

  await prisma.hotel.update({
    where: { id: session.hotelId },
    data: { chatbotAvatar: blob.url },
  });

  return NextResponse.json({ url: blob.url });
}
