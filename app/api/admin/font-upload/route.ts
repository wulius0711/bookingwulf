import { NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';
import { hasAdvancedTypography } from '@/src/lib/plan-gates';

async function getSessionAndHotel() {
  const session = await verifySession();
  const hotel = await prisma.hotel.findUnique({
    where: { id: session.hotelId! },
    select: { id: true, plan: true },
  });
  return { session, hotel };
}

export async function POST(req: Request) {
  let session: Awaited<ReturnType<typeof verifySession>>;
  try {
    session = await verifySession();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!session.hotelId) return NextResponse.json({ error: 'no_hotel' }, { status: 400 });

  const hotel = await prisma.hotel.findUnique({
    where: { id: session.hotelId },
    select: { id: true, plan: true },
  });
  if (!hotel) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const isSuperAdmin = session.role === 'super_admin';
  if (!isSuperAdmin && !hasAdvancedTypography(hotel.plan)) {
    return NextResponse.json({ error: 'plan_required' }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get('file') as File | null;
  const field = form.get('field') as string | null;

  if (!file || !['headline', 'body'].includes(field ?? '')) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  // Max 5 MB
  if (file.size > 5_000_000) {
    return NextResponse.json({ error: 'too_large' }, { status: 413 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!['woff', 'woff2', 'ttf', 'otf'].includes(ext ?? '')) {
    return NextResponse.json({ error: 'invalid_type' }, { status: 400 });
  }

  // Delete existing blob if present
  const existing = await prisma.hotelSettings.findUnique({ where: { hotelId: hotel.id } });
  const existingUrl = field === 'headline' ? existing?.headlineFontUrl : existing?.bodyFontUrl;
  if (existingUrl) {
    try { await del(existingUrl); } catch { /* ignore */ }
  }

  const blob = await put(`fonts/${hotel.id}/${field}-${Date.now()}.${ext}`, file, {
    access: 'public',
    contentType: file.type || 'font/woff2',
  });

  const dbField = field === 'headline' ? 'headlineFontUrl' : 'bodyFontUrl';
  await prisma.hotelSettings.upsert({
    where: { hotelId: hotel.id },
    create: { hotelId: hotel.id, [dbField]: blob.url },
    update: { [dbField]: blob.url },
  });

  return NextResponse.json({ url: blob.url, name: file.name });
}

export async function DELETE(req: Request) {
  let session: Awaited<ReturnType<typeof verifySession>>;
  try {
    session = await verifySession();
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!session.hotelId) return NextResponse.json({ error: 'no_hotel' }, { status: 400 });

  const hotel = await prisma.hotel.findUnique({
    where: { id: session.hotelId },
    select: { id: true, plan: true },
  });
  if (!hotel) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const isSuperAdmin = session.role === 'super_admin';
  if (!isSuperAdmin && !hasAdvancedTypography(hotel.plan)) {
    return NextResponse.json({ error: 'plan_required' }, { status: 403 });
  }

  const { field } = await req.json();
  if (!['headline', 'body'].includes(field ?? '')) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const existing = await prisma.hotelSettings.findUnique({ where: { hotelId: hotel.id } });
  const existingUrl = field === 'headline' ? existing?.headlineFontUrl : existing?.bodyFontUrl;
  if (existingUrl) {
    try { await del(existingUrl); } catch { /* ignore */ }
  }

  const dbField = field === 'headline' ? 'headlineFontUrl' : 'bodyFontUrl';
  await prisma.hotelSettings.upsert({
    where: { hotelId: hotel.id },
    create: { hotelId: hotel.id },
    update: { [dbField]: null },
  });

  return NextResponse.json({ ok: true });
}
