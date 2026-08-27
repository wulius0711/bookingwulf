'use server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { pushChannelPriceSync } from '@/src/lib/beds24';
import { isSupportedChannel } from '@/src/lib/beds24Channels';

async function checkAccess(id: number, hotelId: number | null) {
  if (hotelId === null) return true;
  const r = await prisma.channelPriceRange.findUnique({ where: { id }, include: { apartment: { select: { hotelId: true } } } });
  return r?.apartment.hotelId === hotelId;
}

// Unlike Sperrzeiten, overlapping channel prices have no sane "which one wins" merge — reject
// loudly instead of silently picking one.
async function hasOverlap(apartmentId: number, channel: string, start: Date, end: Date, excludeId?: number) {
  const overlap = await prisma.channelPriceRange.findFirst({
    where: { apartmentId, channel, startDate: { lt: end }, endDate: { gt: start }, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  return !!overlap;
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    const { apartmentId, channel, startDate, endDate, pricePerNight, name } = await req.json();
    if (!apartmentId || !channel || !startDate || !endDate || pricePerNight == null) {
      return NextResponse.json({ error: 'Pflichtfelder fehlen' }, { status: 400 });
    }
    if (!isSupportedChannel(channel)) return NextResponse.json({ error: 'Unbekannter Kanal' }, { status: 400 });
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return NextResponse.json({ error: 'Enddatum muss nach Startdatum liegen' }, { status: 400 });

    const apt = await prisma.apartment.findUnique({ where: { id: apartmentId }, select: { hotelId: true } });
    if (!apt) return NextResponse.json({ error: 'Apartment nicht gefunden' }, { status: 404 });
    if (session.hotelId !== null && apt.hotelId !== session.hotelId) return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });

    if (await hasOverlap(apartmentId, channel, start, end)) {
      return NextResponse.json({ error: 'Für diesen Kanal existiert bereits ein Preiszeitraum, der sich überschneidet' }, { status: 409 });
    }

    const range = await prisma.channelPriceRange.create({
      data: { apartmentId, channel, startDate: start, endDate: end, pricePerNight: Number(pricePerNight), name: name || null },
    });
    const syncError = await pushChannelPriceSync(apt.hotelId, apartmentId, channel, start, end);
    if (syncError) await prisma.channelPriceRange.update({ where: { id: range.id }, data: { beds24SyncError: syncError } });
    return NextResponse.json({ ok: true, id: range.id, beds24SyncError: syncError });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await verifySession();
    const { id, startDate, endDate, pricePerNight, name } = await req.json();
    if (!id || !startDate || !endDate || pricePerNight == null) return NextResponse.json({ error: 'Pflichtfelder fehlen' }, { status: 400 });
    if (!await checkAccess(id, session.hotelId)) return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return NextResponse.json({ error: 'Enddatum muss nach Startdatum liegen' }, { status: 400 });

    const existing = await prisma.channelPriceRange.findUnique({
      where: { id },
      select: { apartmentId: true, channel: true, startDate: true, endDate: true, apartment: { select: { hotelId: true } } },
    });
    if (!existing) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });

    if (await hasOverlap(existing.apartmentId, existing.channel, start, end, id)) {
      return NextResponse.json({ error: 'Für diesen Kanal existiert bereits ein Preiszeitraum, der sich überschneidet' }, { status: 409 });
    }

    await prisma.channelPriceRange.update({ where: { id }, data: { startDate: start, endDate: end, pricePerNight: Number(pricePerNight), name: name || null } });
    const windowStart = existing.startDate < start ? existing.startDate : start;
    const windowEnd = existing.endDate > end ? existing.endDate : end;
    const syncError = await pushChannelPriceSync(existing.apartment.hotelId, existing.apartmentId, existing.channel, windowStart, windowEnd);
    await prisma.channelPriceRange.update({ where: { id }, data: { beds24SyncError: syncError } });
    return NextResponse.json({ ok: true, beds24SyncError: syncError });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await verifySession();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID fehlt' }, { status: 400 });
    if (!await checkAccess(id, session.hotelId)) return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
    const existing = await prisma.channelPriceRange.findUnique({
      where: { id },
      select: { apartmentId: true, channel: true, startDate: true, endDate: true, apartment: { select: { hotelId: true } } },
    });
    if (!existing) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 });
    await prisma.channelPriceRange.delete({ where: { id } });
    // Row is gone — nowhere left to persist a failure, return it so the UI can warn immediately.
    const syncError = await pushChannelPriceSync(existing.apartment.hotelId, existing.apartmentId, existing.channel, existing.startDate, existing.endDate);
    return NextResponse.json({ ok: true, beds24SyncError: syncError });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 });
  }
}
