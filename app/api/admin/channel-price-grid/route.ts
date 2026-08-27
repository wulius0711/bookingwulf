import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';

// Returns, for a given channel and date range, each apartment's daily price map —
// used by the Zimmerplan "Preise"-Ansicht (PriceGridView.tsx) to render an editable rate
// calendar. Each priced day carries its range id + full range bounds so a click can open the
// exact ChannelPriceRange for editing without a second round-trip.
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
      select: { id: true, apartmentId: true, startDate: true, endDate: true, pricePerNight: true, name: true, beds24SyncError: true },
    });

    const rangesByApartment = new Map<number, typeof ranges>();
    for (const r of ranges) {
      const list = rangesByApartment.get(r.apartmentId) ?? [];
      list.push(r);
      rangesByApartment.set(r.apartmentId, list);
    }

    const result = apartments.map((apt) => {
      const days: Record<string, { rangeId: number; price: number }> = {};
      const rangeById: Record<number, { id: number; startDate: string; endDate: string; pricePerNight: number; name: string | null; beds24SyncError: string | null }> = {};
      for (const r of rangesByApartment.get(apt.id) ?? []) {
        rangeById[r.id] = {
          id: r.id,
          startDate: r.startDate.toISOString().slice(0, 10),
          endDate: r.endDate.toISOString().slice(0, 10),
          pricePerNight: r.pricePerNight,
          name: r.name,
          beds24SyncError: r.beds24SyncError,
        };
        const start = r.startDate > fromDate ? r.startDate : fromDate;
        const end = r.endDate < toDate ? r.endDate : toDate;
        for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
          days[d.toISOString().slice(0, 10)] = { rangeId: r.id, price: r.pricePerNight };
        }
      }
      return { id: apt.id, name: apt.name, days, ranges: rangeById };
    });

    return NextResponse.json({ apartments: result });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
  }
}
