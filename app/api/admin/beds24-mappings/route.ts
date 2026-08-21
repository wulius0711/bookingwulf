import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { pushOccupancySync } from '@/src/lib/beds24';

export async function GET() {
  try {
    const session = await verifySession();
    if (!session.hotelId) return NextResponse.json({ error: 'Kein Hotel.' }, { status: 400 });
    const mappings = await prisma.beds24ApartmentMapping.findMany({
      where: { apartment: { hotelId: session.hotelId } },
      select: { apartmentId: true, beds24RoomId: true },
    });
    return NextResponse.json({ mappings });
  } catch {
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session.hotelId) return NextResponse.json({ error: 'Kein Hotel.' }, { status: 400 });
    const { apartmentId, beds24RoomId } = await req.json();
    if (!apartmentId || !beds24RoomId?.trim())
      return NextResponse.json({ error: 'apartmentId und beds24RoomId erforderlich.' }, { status: 400 });

    const apt = await prisma.apartment.findUnique({
      where: { id: Number(apartmentId) },
      select: { hotelId: true, maxAdults: true, maxChildren: true },
    });
    if (!apt || apt.hotelId !== session.hotelId)
      return NextResponse.json({ error: 'Apartment nicht gefunden.' }, { status: 404 });

    await prisma.beds24ApartmentMapping.upsert({
      where: { apartmentId: Number(apartmentId) },
      create: { apartmentId: Number(apartmentId), beds24RoomId: beds24RoomId.trim() },
      update: { beds24RoomId: beds24RoomId.trim() },
    });

    // Push the apartment's current occupancy immediately on (re-)connect — otherwise it would
    // only reach Beds24 the next time someone happens to re-save the apartment's capacity fields.
    const occupancySyncError = await pushOccupancySync(apt.hotelId, Number(apartmentId), apt.maxAdults, apt.maxChildren);
    await prisma.apartment.update({
      where: { id: Number(apartmentId) },
      data: { beds24SyncError: occupancySyncError },
    });

    return NextResponse.json({ ok: true, beds24SyncError: occupancySyncError });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await verifySession();
    if (!session.hotelId) return NextResponse.json({ error: 'Kein Hotel.' }, { status: 400 });
    const { apartmentId } = await req.json();
    await prisma.beds24ApartmentMapping.deleteMany({ where: { apartmentId: Number(apartmentId) } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 });
  }
}
