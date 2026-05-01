import { prisma } from '@/src/lib/prisma';
import { NextResponse } from 'next/server';
import { rateLimit, rateLimitResponse } from '@/src/lib/rate-limit';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export const dynamic = 'force-dynamic';

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(`avail-quick:${ip}`, 60, 60_000).ok) return rateLimitResponse();

  try {
    const { searchParams } = new URL(req.url);
    const hotelSlug = searchParams.get('hotel');
    const arrivalRaw = searchParams.get('arrival');
    const departureRaw = searchParams.get('departure');

    if (!hotelSlug || !arrivalRaw || !departureRaw) {
      return NextResponse.json(
        { success: false, message: 'Missing parameters' },
        { status: 400, headers: corsHeaders },
      );
    }

    const arrival = normalizeDate(new Date(arrivalRaw));
    const departure = normalizeDate(new Date(departureRaw));

    if (isNaN(arrival.getTime()) || isNaN(departure.getTime()) || departure <= arrival) {
      return NextResponse.json(
        { success: false, message: 'Invalid dates' },
        { status: 400, headers: corsHeaders },
      );
    }

    const hotel = await prisma.hotel.findUnique({
      where: { slug: hotelSlug },
      select: { id: true },
    });

    if (!hotel) {
      return NextResponse.json(
        { success: false, message: 'Hotel not found' },
        { status: 404, headers: corsHeaders },
      );
    }

    const apartments = await prisma.apartment.findMany({
      where: { hotelId: hotel.id, isActive: true },
      select: {
        id: true,
        blockedRanges: { select: { startDate: true, endDate: true } },
      },
    });

    const confirmedBookings = await prisma.request.findMany({
      where: {
        hotelId: hotel.id,
        status: 'booked',
        arrival: { lt: departure },
        departure: { gt: arrival },
      },
      select: { selectedApartmentIds: true },
    });

    const bookedIds = new Set<number>();
    for (const b of confirmedBookings) {
      for (const id of b.selectedApartmentIds.split(',').map(Number).filter(Boolean)) {
        bookedIds.add(id);
      }
    }

    let availableCount = 0;
    for (const apt of apartments) {
      if (bookedIds.has(apt.id)) continue;
      const blocked = apt.blockedRanges.some(
        (r) => arrival < r.endDate && departure > r.startDate,
      );
      if (!blocked) availableCount++;
    }

    return NextResponse.json(
      { success: true, available: availableCount > 0, availableCount, total: apartments.length },
      { headers: { ...corsHeaders, 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('availability-quick error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500, headers: corsHeaders },
    );
  }
}
