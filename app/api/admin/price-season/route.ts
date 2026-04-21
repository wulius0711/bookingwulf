'use server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    const { apartmentId, name, startDate, endDate, pricePerNight, minStay } = await req.json();

    if (!apartmentId || !pricePerNight || !startDate || !endDate) return NextResponse.json({ error: 'Pflichtfelder fehlen' }, { status: 400 });

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return NextResponse.json({ error: 'Enddatum muss nach Startdatum liegen' }, { status: 400 });

    if (session.hotelId !== null) {
      const apt = await prisma.apartment.findUnique({ where: { id: apartmentId }, select: { hotelId: true } });
      if (!apt || apt.hotelId !== session.hotelId) return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
    }

    await prisma.priceSeason.create({ data: { apartmentId, name: name || null, startDate: start, endDate: end, pricePerNight: Number(pricePerNight), minStay: Number(minStay) || 1 } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 });
  }
}
