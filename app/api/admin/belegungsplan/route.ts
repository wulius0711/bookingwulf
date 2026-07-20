import { verifySession } from '@/src/lib/session';
import { prisma } from '@/src/lib/prisma';

export const dynamic = 'force-dynamic';

function toIso(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export async function GET(request: Request) {
  try {
    const session = await verifySession();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') ?? '';
    const to = searchParams.get('to') ?? '';

    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return Response.json({ error: 'Invalid date range' }, { status: 400 });
    }

    const hotelId = session.hotelId;
    const rangeStart = new Date(from + 'T00:00:00.000Z');
    const rangeEnd = new Date(to + 'T23:59:59.999Z');

    const [apartments, requests, blocked] = await Promise.all([
      prisma.apartment.findMany({
        where: hotelId ? { hotelId } : {},
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
      prisma.request.findMany({
        where: {
          ...(hotelId ? { hotelId } : {}),
          status: { in: ['booked', 'confirmed'] },
          arrival: { lte: rangeEnd },
          departure: { gte: rangeStart },
        },
        select: {
          id: true, firstname: true, lastname: true,
          arrival: true, departure: true, selectedApartmentIds: true, status: true,
        },
      }),
      prisma.blockedRange.findMany({
        where: {
          // Apartment-spezifische Sperrzeiten hängen an apartment.hotelId, hotelweite (apartmentId: null) direkt an hotelId
          ...(hotelId ? { OR: [{ apartment: { hotelId } }, { apartmentId: null, hotelId }] } : {}),
          startDate: { lte: rangeEnd },
          endDate: { gt: rangeStart },
        },
        select: { id: true, apartmentId: true, startDate: true, endDate: true, note: true, type: true },
      }),
    ]);

    // beds24_sync blocks carry the Beds24 booking id at the end of their note (e.g. "[Airbnb] 12345")
    // — look those Requests up so the UI can link to the full booking instead of just the note text.
    const beds24Ids = blocked
      .filter((b) => b.type === 'beds24_sync')
      .map((b) => b.note?.match(/(\d+)\s*$/)?.[1])
      .filter((id): id is string => !!id);
    const beds24Requests = beds24Ids.length
      ? await prisma.request.findMany({
          where: { beds24BookingId: { in: beds24Ids } },
          select: { id: true, beds24BookingId: true, firstname: true, lastname: true },
        })
      : [];
    const requestByBeds24Id = new Map(beds24Requests.map((r) => [r.beds24BookingId, r]));

    const entries = apartments.map((apt) => {
      const bookings = requests
        .filter((r) => r.selectedApartmentIds.split(',').map(Number).includes(apt.id))
        .map((r) => ({
          id: r.id,
          kind: 'booking' as const,
          startDate: toIso(r.arrival),
          endDate: toIso(r.departure),
          label: [r.firstname, r.lastname].filter(Boolean).join(' '),
          requestId: r.id,
        }));

      const blocks = blocked
        .filter((b) => b.apartmentId === apt.id || b.apartmentId === null)
        .map((b) => {
          const beds24Id = b.type === 'beds24_sync' ? b.note?.match(/(\d+)\s*$/)?.[1] : undefined;
          const request = beds24Id ? requestByBeds24Id.get(beds24Id) : undefined;
          return {
            id: b.id,
            kind: 'blocked' as const,
            startDate: toIso(b.startDate),
            endDate: toIso(b.endDate),
            note: b.note,
            type: b.type,
            requestId: request?.id,
            guestLabel: request ? [request.firstname, request.lastname].filter(Boolean).join(' ') : undefined,
          };
        });

      return { id: apt.id, name: apt.name, bookings, blocks };
    });

    return Response.json({ apartments: entries });
  } catch (err) {
    console.error('[belegungsplan]', err);
    return Response.json({ error: 'Fehler' }, { status: 500 });
  }
}
