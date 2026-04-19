import { prisma } from '@/src/lib/prisma';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const CORS = { 'Access-Control-Allow-Origin': '*' };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const hotel = searchParams.get('hotel');
  const apartmentId = Number(searchParams.get('apartmentId'));

  if (!hotel || !apartmentId) {
    return Response.json({ error: 'Missing params' }, { status: 400, headers: CORS });
  }

  const hotelRecord = await prisma.hotel.findFirst({ where: { slug: hotel }, select: { id: true } });
  if (!hotelRecord) return Response.json({ error: 'Not found' }, { status: 404, headers: CORS });

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 4, 0); // 4 months ahead

  const [bookings, blocked] = await Promise.all([
    prisma.request.findMany({
      where: {
        hotelId: hotelRecord.id,
        status: 'booked',
        arrival: { lte: to },
        departure: { gte: from },
      },
      select: { arrival: true, departure: true, selectedApartmentIds: true },
    }),
    prisma.blockedRange.findMany({
      where: {
        hotelId: hotelRecord.id,
        startDate: { lte: to },
        endDate: { gte: from },
        OR: [{ apartmentId }, { apartmentId: null }],
      },
      select: { startDate: true, endDate: true },
    }),
  ]);

  const ranges: { from: string; to: string }[] = [];

  for (const b of bookings) {
    const ids = b.selectedApartmentIds.split(',').map(Number);
    if (ids.includes(apartmentId)) {
      ranges.push({ from: b.arrival.toISOString().slice(0, 10), to: b.departure.toISOString().slice(0, 10) });
    }
  }

  for (const b of blocked) {
    ranges.push({ from: b.startDate.toISOString().slice(0, 10), to: b.endDate.toISOString().slice(0, 10) });
  }

  return Response.json({ ranges }, { headers: CORS });
}
