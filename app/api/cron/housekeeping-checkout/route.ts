import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { DEFAULT_CHECKLIST_ITEMS } from '@/src/lib/housekeeping';

// Setzt den Housekeeping-Status auf "dirty" für alle Apartments, deren Buchung heute abreist.
// Überschreibt bewusst nur Apartments, die aktuell "clean" sind — ein manuell gesetztes
// "repair" bleibt unangetastet.
export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const requests = await prisma.request.findMany({
    where: {
      status: { in: ['booked', 'confirmed'] },
      departure: { gte: today, lt: tomorrow },
    },
    select: { selectedApartmentIds: true },
  });

  const apartmentIds = [
    ...new Set(
      requests.flatMap((r) => r.selectedApartmentIds.split(',').map(Number).filter(Boolean)),
    ),
  ];

  if (apartmentIds.length === 0) {
    return NextResponse.json({ ok: true, updated: 0 });
  }

  const apartments = await prisma.apartment.findMany({
    where: { id: { in: apartmentIds }, housekeepingStatus: 'clean' },
    select: { id: true, housekeepingChecklistItems: true },
  });

  let updated = 0;
  for (const apt of apartments) {
    const items = Array.isArray(apt.housekeepingChecklistItems)
      ? (apt.housekeepingChecklistItems as unknown[]).map(String)
      : DEFAULT_CHECKLIST_ITEMS;

    await prisma.apartment.update({
      where: { id: apt.id },
      data: {
        housekeepingStatus: 'dirty',
        housekeepingUpdatedAt: new Date(),
        housekeepingChecklistState: Object.fromEntries(items.map((i) => [i, false])),
      },
    });
    updated++;
  }

  console.log(`[housekeeping-checkout] Set ${updated} apartment(s) to dirty.`);
  return NextResponse.json({ ok: true, updated });
}
