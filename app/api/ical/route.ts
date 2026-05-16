import { prisma } from '@/src/lib/prisma';

function formatIcalDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeIcal(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

import { rateLimit, rateLimitResponse } from '@/src/lib/rate-limit';

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!(await rateLimit(`ical:${ip}`, 20, 60_000)).ok) return rateLimitResponse();

  const { searchParams } = new URL(req.url);
  const apartmentId = Number(searchParams.get('apartment') || 0);
  const hotelSlug = searchParams.get('hotel') || '';

  if (!apartmentId || !hotelSlug) {
    return new Response('Missing apartment or hotel parameter', { status: 400 });
  }

  const apartment = await prisma.apartment.findFirst({
    where: { id: apartmentId, hotel: { slug: hotelSlug } },
    select: { id: true, name: true, hotelId: true, hotel: { select: { name: true } } },
  });

  if (!apartment) {
    return new Response('Apartment not found', { status: 404 });
  }

  // Get blocked ranges
  const blockedRanges = await prisma.blockedRange.findMany({
    where: {
      OR: [
        { apartmentId: apartment.id },
        { hotelId: apartment.hotelId, apartmentId: null },
      ],
    },
    select: { startDate: true, endDate: true, note: true, type: true },
  });

  // Get confirmed bookings
  const requests = await prisma.request.findMany({
    where: {
      hotelId: apartment.hotelId,
      status: { in: ['new', 'booked'] },
      selectedApartmentIds: { contains: String(apartment.id) },
    },
    select: { id: true, arrival: true, departure: true, firstname: true, lastname: true, status: true },
  });

  const now = formatIcalDate(new Date());
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//bookingwulf//NONSGML v1.0//EN',
    `X-WR-CALNAME:${escapeIcal(apartment.name)} — ${escapeIcal(apartment.hotel.name)}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  // Blocked ranges as events
  for (const range of blockedRanges) {
    const summary = range.note || (range.type === 'ical_sync' ? 'Blocked (Sync)' : 'Blocked');
    ics.push(
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${range.startDate.toISOString().slice(0, 10).replace(/-/g, '')}`,
      `DTEND;VALUE=DATE:${range.endDate.toISOString().slice(0, 10).replace(/-/g, '')}`,
      `DTSTAMP:${now}`,
      `UID:blocked-${range.startDate.getTime()}-${apartment.id}@bookingwulf`,
      `SUMMARY:${escapeIcal(summary)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    );
  }

  // Bookings as events
  for (const req of requests) {
    const name = [req.firstname, req.lastname].filter(Boolean).join(' ') || 'Gast';
    const summary = req.status === 'booked' ? `Buchung: ${name}` : `Anfrage: ${name}`;
    ics.push(
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${req.arrival.toISOString().slice(0, 10).replace(/-/g, '')}`,
      `DTEND;VALUE=DATE:${req.departure.toISOString().slice(0, 10).replace(/-/g, '')}`,
      `DTSTAMP:${now}`,
      `UID:booking-${req.id}@bookingwulf`,
      `SUMMARY:${escapeIcal(summary)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    );
  }

  ics.push('END:VCALENDAR');

  return new Response(ics.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${apartment.name}.ics"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
