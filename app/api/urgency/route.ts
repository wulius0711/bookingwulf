import { prisma } from '@/src/lib/prisma';
import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('hotel');
    const year = parseInt(searchParams.get('year') || '');
    const month = parseInt(searchParams.get('month') || ''); // 0-based

    if (!slug || isNaN(year) || isNaN(month)) {
      return NextResponse.json({ success: false }, { status: 400, headers: corsHeaders });
    }

    const hotel = await prisma.hotel.findUnique({ where: { slug }, select: { id: true } });
    if (!hotel) return NextResponse.json({ success: false }, { status: 404, headers: corsHeaders });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0); // last day of month

    // Start counting from today if we're in the current month
    const rangeStart = monthStart < today ? today : monthStart;

    if (rangeStart > monthEnd) {
      // Entire month is in the past
      return NextResponse.json({ success: true, freeNights: 0, totalNights: 0, bookedNights: 0 }, { headers: corsHeaders });
    }

    // Build set of all nights in range [rangeStart, monthEnd]
    const allNights = new Set<string>();
    const d = new Date(rangeStart);
    while (d <= monthEnd) {
      allNights.add(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
    const totalNights = allNights.size;

    // Collect booked nights from confirmed/pending bookings
    const bookings = await prisma.request.findMany({
      where: {
        hotelId: hotel.id,
        status: { in: ['booked', 'new', 'answered'] },
        arrival: { lte: monthEnd },
        departure: { gt: rangeStart },
      },
      select: { arrival: true, departure: true },
    });

    const bookedSet = new Set<string>();
    for (const b of bookings) {
      const cur = new Date(b.arrival);
      cur.setHours(0, 0, 0, 0);
      const dep = new Date(b.departure);
      dep.setHours(0, 0, 0, 0);
      while (cur < dep) {
        const ds = cur.toISOString().slice(0, 10);
        if (allNights.has(ds)) bookedSet.add(ds);
        cur.setDate(cur.getDate() + 1);
      }
    }

    // Collect blocked nights
    const blocked = await prisma.blockedRange.findMany({
      where: {
        hotelId: hotel.id,
        startDate: { lte: monthEnd },
        endDate: { gt: rangeStart },
      },
      select: { startDate: true, endDate: true },
    });

    for (const bl of blocked) {
      const cur = new Date(bl.startDate);
      cur.setHours(0, 0, 0, 0);
      const end = new Date(bl.endDate);
      end.setHours(0, 0, 0, 0);
      while (cur < end) {
        const ds = cur.toISOString().slice(0, 10);
        if (allNights.has(ds)) bookedSet.add(ds);
        cur.setDate(cur.getDate() + 1);
      }
    }

    const bookedNights = bookedSet.size;
    const freeNights = totalNights - bookedNights;

    return NextResponse.json(
      { success: true, freeNights, totalNights, bookedNights },
      { headers: { ...corsHeaders, 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    console.error('urgency GET error:', err);
    return NextResponse.json({ success: false }, { status: 500, headers: corsHeaders });
  }
}
