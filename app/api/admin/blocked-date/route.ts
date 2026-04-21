'use server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';

async function checkAccess(id: number, hotelId: number | null) {
  if (hotelId === null) return true;
  const r = await prisma.blockedRange.findUnique({ where: { id }, include: { apartment: { select: { hotelId: true } } } });
  return r?.apartment?.hotelId === hotelId;
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    const { apartmentId, startDate, endDate, type, note } = await req.json();
    if (!apartmentId || !startDate || !endDate) return NextResponse.json({ error: 'Pflichtfelder fehlen' }, { status: 400 });
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return NextResponse.json({ error: 'Enddatum muss nach Startdatum liegen' }, { status: 400 });
    if (session.hotelId !== null) {
      const apt = await prisma.apartment.findUnique({ where: { id: apartmentId }, select: { hotelId: true } });
      if (!apt || apt.hotelId !== session.hotelId) return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
    }
    await prisma.blockedRange.create({ data: { apartmentId, startDate: start, endDate: end, type: type || 'manual', note: note || '' } });
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
    await prisma.blockedRange.update({ where: { id }, data: { startDate: start, endDate: end, type, note: note || '' } });
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
    await prisma.blockedRange.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 });
  }
}
