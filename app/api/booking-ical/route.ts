import { prisma } from '@/src/lib/prisma';
import { verifyBookingToken } from '@/src/lib/booking-token';

function escapeIcal(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function icalDate(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id') || 0);
  const token = searchParams.get('token') || '';

  if (!id) return new Response('Missing id', { status: 400 });

  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      hotel: { select: { name: true } },
    },
  });

  if (!request) return new Response('Not found', { status: 404 });

  if (!verifyBookingToken(id, request.createdAt, token)) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (request.status !== 'booked') {
    return new Response('Booking not confirmed', { status: 403 });
  }

  const hotelName = request.hotel?.name || 'Hotel';
  const guestName = [request.firstname, request.lastname].filter(Boolean).join(' ') || 'Gast';

  const apartmentIds = request.selectedApartmentIds
    .split(',').map(Number).filter(Boolean);

  const apartments = apartmentIds.length > 0
    ? await prisma.apartment.findMany({
        where: { id: { in: apartmentIds } },
        select: { name: true },
      })
    : [];

  const aptNames = apartments.map((a) => a.name).join(', ');
  const nights = request.nights;
  const guests = `${request.adults} Erwachsene${request.children ? `, ${request.children} Kinder` : ''}`;

  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//bookingwulf//booking//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:booking-${id}@bookingwulf`,
    `DTSTAMP:${now}`,
    `DTSTART;VALUE=DATE:${icalDate(request.arrival)}`,
    `DTEND;VALUE=DATE:${icalDate(request.departure)}`,
    `SUMMARY:${escapeIcal(`Aufenthalt – ${hotelName}`)}`,
    `DESCRIPTION:${escapeIcal(`Buchung #${id}\\n${guestName}\\n${nights} Nächte · ${guests}${aptNames ? `\\n${aptNames}` : ''}`)}`,
    `LOCATION:${escapeIcal(hotelName)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return new Response(lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="buchung-${id}.ics"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
