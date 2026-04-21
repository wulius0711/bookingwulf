'use server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    const { apartmentId, arrival, departure, adults, children, salutation, firstname, lastname, email, status, message } = await req.json();

    if (!apartmentId || !arrival || !departure || !lastname || !email) return NextResponse.json({ error: 'Pflichtfelder fehlen' }, { status: 400 });

    const arr = new Date(arrival);
    const dep = new Date(departure);
    if (dep <= arr) return NextResponse.json({ error: 'Abreise muss nach Anreise liegen' }, { status: 400 });

    if (session.hotelId !== null) {
      const apt = await prisma.apartment.findUnique({ where: { id: apartmentId }, select: { hotelId: true } });
      if (!apt || apt.hotelId !== session.hotelId) return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
    }

    const nights = Math.round((dep.getTime() - arr.getTime()) / 86400000);

    await prisma.request.create({
      data: {
        hotelId: session.hotelId,
        arrival: arr,
        departure: dep,
        nights,
        adults: Number(adults) || 2,
        children: Number(children) || 0,
        selectedApartmentIds: String(apartmentId),
        salutation: salutation || 'Herr',
        firstname: firstname || null,
        lastname,
        email,
        country: 'AT',
        message: message || null,
        status: status || 'booked',
      },
    });

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
    if (session.hotelId !== null) {
      const r = await prisma.request.findUnique({ where: { id }, select: { hotelId: true } });
      if (!r || r.hotelId !== session.hotelId) return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
    }
    await prisma.request.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 });
  }
}
