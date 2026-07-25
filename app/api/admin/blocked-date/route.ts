'use server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { syncBlockedRangeAvailability } from '@/src/lib/beds24';

async function checkAccess(id: number, hotelId: number | null) {
  if (hotelId === null) return true;
  const r = await prisma.blockedRange.findUnique({ where: { id }, include: { apartment: { select: { hotelId: true } } } });
  if (!r) return false;
  // Hotelweite Sperrzeiten (apartmentId: null) haben keine Apartment-Relation, hotelId steht direkt am Datensatz
  return r.apartment?.hotelId === hotelId || (r.apartmentId === null && r.hotelId === hotelId);
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    const { apartmentId, startDate, endDate, type, note } = await req.json();
    if (!apartmentId || !startDate || !endDate) return NextResponse.json({ error: 'Pflichtfelder fehlen' }, { status: 400 });
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return NextResponse.json({ error: 'Enddatum muss nach Startdatum liegen' }, { status: 400 });
    const apt = await prisma.apartment.findUnique({ where: { id: apartmentId }, select: { hotelId: true } });
    if (!apt) return NextResponse.json({ error: 'Apartment nicht gefunden' }, { status: 404 });
    if (session.hotelId !== null && apt.hotelId !== session.hotelId) return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
    const range = await prisma.blockedRange.create({ data: { apartmentId, startDate: start, endDate: end, type: type || 'manual', note: note || '' } });
    try {
      await syncBlockedRangeAvailability(apt.hotelId, apartmentId, start, end);
    } catch (err) {
      await prisma.blockedRange.update({ where: { id: range.id }, data: { beds24SyncError: (err as Error).message } });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await verifySession();
    const { id, startDate, endDate, type, note } = await req.json();
    if (!id || !startDate || !endDate) return NextResponse.json({ error: 'Pflichtfelder fehlen' }, { status: 400 });
    if (!await checkAccess(id, session.hotelId)) return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return NextResponse.json({ error: 'Enddatum muss nach Startdatum liegen' }, { status: 400 });
    const existing = await prisma.blockedRange.findUnique({
      where: { id },
      select: { apartmentId: true, startDate: true, endDate: true, apartment: { select: { hotelId: true } } },
    });
    await prisma.blockedRange.update({ where: { id }, data: { startDate: start, endDate: end, type, note: note || '' } });
    if (existing?.apartmentId && existing.apartment) {
      const windowStart = existing.startDate < start ? existing.startDate : start;
      const windowEnd = existing.endDate > end ? existing.endDate : end;
      try {
        await syncBlockedRangeAvailability(existing.apartment.hotelId, existing.apartmentId, windowStart, windowEnd);
        await prisma.blockedRange.update({ where: { id }, data: { beds24SyncError: null } });
      } catch (err) {
        await prisma.blockedRange.update({ where: { id }, data: { beds24SyncError: (err as Error).message } });
      }
    }
    return NextResponse.json({ ok: true });
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
    const existing = await prisma.blockedRange.findUnique({
      where: { id },
      select: { apartmentId: true, startDate: true, endDate: true, apartment: { select: { hotelId: true } } },
    });
    await prisma.blockedRange.delete({ where: { id } });
    if (existing?.apartmentId && existing.apartment) {
      try {
        await syncBlockedRangeAvailability(existing.apartment.hotelId, existing.apartmentId, existing.startDate, existing.endDate);
      } catch (err) {
        console.error('[Beds24] Sperrzeit-Sync nach Löschen fehlgeschlagen:', err);
      }
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 });
  }
}
