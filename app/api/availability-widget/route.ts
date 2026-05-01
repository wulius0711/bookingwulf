import { prisma } from '@/src/lib/prisma';
import { NextResponse } from 'next/server';
import { rateLimit, rateLimitResponse } from '@/src/lib/rate-limit';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: cors });
}

export const dynamic = 'force-dynamic';

function toIso(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(`avail-widget:${ip}`, 30, 60_000).ok) return rateLimitResponse();

  try {
    const { searchParams } = new URL(req.url);
    const hotelSlug = searchParams.get('hotel');
    if (!hotelSlug) {
      return NextResponse.json({ success: false, message: 'Missing hotel' }, { status: 400, headers: cors });
    }

    const months = Math.min(12, Math.max(1, parseInt(searchParams.get('months') || '3', 10) || 3));

    const hotel = await prisma.hotel.findUnique({
      where: { slug: hotelSlug },
      select: { id: true, name: true },
    });

    if (!hotel) {
      return NextResponse.json({ success: false, message: 'Hotel not found' }, { status: 404, headers: cors });
    }

    const from = new Date();
    from.setUTCHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setUTCMonth(to.getUTCMonth() + months);

    const [apartments, bookings, blockedRanges] = await Promise.all([
      prisma.apartment.findMany({
        where: { hotelId: hotel.id, isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.request.findMany({
        where: {
          hotelId: hotel.id,
          status: 'booked',
          arrival: { lt: to },
          departure: { gt: from },
        },
        select: { arrival: true, departure: true, selectedApartmentIds: true },
      }),
      prisma.blockedRange.findMany({
        where: {
          hotelId: hotel.id,
          startDate: { lt: to },
          endDate: { gt: from },
        },
        select: { apartmentId: true, startDate: true, endDate: true },
      }),
    ]);

    const result = apartments.map((apt) => {
      const ranges: { start: string; end: string; type: 'booked' | 'blocked' }[] = [];

      for (const b of bookings) {
        const ids = b.selectedApartmentIds.split(',').map(Number).filter(Boolean);
        if (ids.includes(apt.id)) {
          ranges.push({ start: toIso(b.arrival), end: toIso(b.departure), type: 'booked' });
        }
      }

      for (const br of blockedRanges) {
        if (br.apartmentId === apt.id || br.apartmentId === null) {
          ranges.push({ start: toIso(br.startDate), end: toIso(br.endDate), type: 'blocked' });
        }
      }

      return { id: apt.id, name: apt.name, ranges };
    });

    return NextResponse.json(
      { success: true, apartments: result, from: toIso(from), to: toIso(to) },
      { headers: { ...cors, 'Cache-Control': 'no-store' } },
    );
  } catch (e) {
    console.error('availability-widget error:', e);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500, headers: cors });
  }
}
