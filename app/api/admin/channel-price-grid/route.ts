import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';

// Returns, for a given channel and date range, each apartment's daily price map —
// used by the Zimmerplan "Preise"-Ansicht (PriceGridView.tsx) to render a rate calendar.
export async function GET(req: NextRequest) {
  try {
    const session = await verifySession();
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const channel = searchParams.get('channel');
    if (!from || !to || !channel) return NextResponse.json({ error: 'Pflichtparameter fehlen' }, { status: 400 });

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const apartments = await prisma.apartment.findMany({
      where: session.hotelId !== null ? { hotelId: session.hotelId, isActive: true } : { isActive: true },
      select: { id: true, name: true },
      orderBy: { sortOrder: 'asc' },
    });

    const ranges = await prisma.channelPriceRange.findMany({
      where: {
        apartmentId: { in: apartments.map((a) => a.id) },
        channel,
        startDate: { lt: toDate },
        endDate: { gt: fromDate },
      },
      select: { apartmentId: true, startDate: true, endDate: true, pricePerNight: true },
    });

    const rangesByApartment = new Map<number, typeof ranges>();
    for (const r of ranges) {
      const list = rangesByApartment.get(r.apartmentId) ?? [];
      list.push(r);
      rangesByApartment.set(r.apartmentId, list);
    }

    const result = apartments.map((apt) => {
      const prices: Record<string, number> = {};
      for (const r of rangesByApartment.get(apt.id) ?? []) {
        const start = r.startDate > fromDate ? r.startDate : fromDate;
        const end = r.endDate < toDate ? r.endDate : toDate;
        for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
          prices[d.toISOString().slice(0, 10)] = r.pricePerNight;
        }
      }
      return { id: apt.id, name: apt.name, prices };
    });

    return NextResponse.json({ apartments: result });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
  }
}
