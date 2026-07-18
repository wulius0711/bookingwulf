import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { hasPlanAccess } from '@/src/lib/plan-gates';
import { buildHousekeeping, DEFAULT_CHECKLIST_ITEMS } from '@/src/lib/housekeeping';

const STATUSES = ['clean', 'dirty', 'repair'] as const;

async function getHotelAndCheckPlan(session: Awaited<ReturnType<typeof verifySession>>) {
  if (!session.hotelId) return null;
  const hotel = await prisma.hotel.findUnique({ where: { id: session.hotelId }, select: { id: true, plan: true } });
  if (!hotel || !hasPlanAccess(hotel.plan ?? 'starter', 'pro')) return null;
  return hotel;
}

export async function GET() {
  try {
    const session = await verifySession();
    const hotel = await getHotelAndCheckPlan(session);
    if (!hotel) return NextResponse.json({ error: 'Nicht verfügbar.' }, { status: 403 });

    const apartments = await buildHousekeeping(hotel.id);
    return NextResponse.json({ apartments });
  } catch (err) {
    console.error('[housekeeping]', err);
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await verifySession();
    const hotel = await getHotelAndCheckPlan(session);
    if (!hotel) return NextResponse.json({ error: 'Nicht verfügbar.' }, { status: 403 });

    const body = await req.json();
    const apartmentId = Number(body.apartmentId);
    if (!apartmentId) return NextResponse.json({ error: 'apartmentId erforderlich.' }, { status: 400 });

    const apartment = await prisma.apartment.findFirst({
      where: { id: apartmentId, hotelId: hotel.id },
      select: { housekeepingChecklistItems: true, housekeepingChecklistState: true, housekeepingStatus: true },
    });
    if (!apartment) return NextResponse.json({ error: 'Apartment nicht gefunden.' }, { status: 404 });

    const items = Array.isArray(apartment.housekeepingChecklistItems)
      ? (apartment.housekeepingChecklistItems as unknown[]).map(String)
      : DEFAULT_CHECKLIST_ITEMS;

    const data: Record<string, unknown> = {};

    if (body.note !== undefined) {
      data.housekeepingNote = String(body.note).trim() || null;
    }

    let checklistState = (apartment.housekeepingChecklistState ?? {}) as Record<string, boolean>;

    if (body.checklistItem !== undefined) {
      const item = String(body.checklistItem);
      if (!items.includes(item)) return NextResponse.json({ error: 'Unbekannter Checklisten-Punkt.' }, { status: 400 });
      checklistState = { ...checklistState, [item]: Boolean(body.checklistDone) };
      data.housekeepingChecklistState = checklistState;
      const allDone = items.every((i) => checklistState[i]);
      if (allDone) {
        // Alle Punkte abgehakt → Status automatisch auf "clean"
        data.housekeepingStatus = 'clean';
        data.housekeepingUpdatedAt = new Date();
      } else if (apartment.housekeepingStatus === 'clean') {
        // Häkchen wieder entfernt, während Status "clean" war → zurück auf "dirty"
        data.housekeepingStatus = 'dirty';
        data.housekeepingUpdatedAt = new Date();
      }
    }

    if (body.status !== undefined) {
      if (!STATUSES.includes(body.status)) return NextResponse.json({ error: 'Ungültiger Status.' }, { status: 400 });
      data.housekeepingStatus = body.status;
      data.housekeepingUpdatedAt = new Date();
      // Neuer Reinigungszyklus beginnt → Checkliste zurücksetzen
      if (body.status === 'dirty') {
        data.housekeepingChecklistState = Object.fromEntries(items.map((i) => [i, false]));
      }
    }

    const updated = await prisma.apartment.update({
      where: { id: apartmentId },
      data,
      select: {
        id: true,
        housekeepingStatus: true,
        housekeepingNote: true,
        housekeepingUpdatedAt: true,
        housekeepingChecklistState: true,
      },
    });

    return NextResponse.json({ ok: true, apartment: updated });
  } catch (err) {
    console.error('[housekeeping]', err);
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 });
  }
}
