'use server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { provisionChannelOffers } from '@/src/lib/beds24';

// One-time per-apartment setup: assigns a free Beds24 offer slot to each connected OTA channel
// and enables channel routing on it. Idempotent — see provisionChannelOffers() in beds24.ts.
export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    const { apartmentId } = await req.json();
    if (!apartmentId) return NextResponse.json({ error: 'apartmentId fehlt' }, { status: 400 });

    const apt = await prisma.apartment.findUnique({ where: { id: apartmentId }, select: { hotelId: true } });
    if (!apt) return NextResponse.json({ error: 'Apartment nicht gefunden' }, { status: 404 });
    if (session.hotelId !== null && apt.hotelId !== session.hotelId) return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });

    const result = await provisionChannelOffers(apt.hotelId, apartmentId);
    if (!result.ok) {
      return NextResponse.json({ error: 'Manche Offer-Slots sind bereits belegt', conflicts: result.conflicts }, { status: 409 });
    }
    return NextResponse.json({ ok: true, assigned: result.assigned });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message || 'Fehler beim Einrichten' }, { status: 500 });
  }
}
