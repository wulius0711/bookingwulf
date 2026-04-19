import { prisma } from './prisma';

type ApartmentStatus =
  | { kind: 'frei' }
  | { kind: 'belegt'; guestName: string; arrival: string; departure: string; requestId: number; checkoutToday: boolean }
  | { kind: 'blockiert'; note?: string | null };

function toIso(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

export async function buildZimmerplan(hotelId: number | null, dateIso: string) {
  const dayStart = new Date(dateIso + 'T00:00:00.000Z');
  const dayEnd = new Date(dateIso + 'T23:59:59.999Z');

  const [apartments, requests, blocked] = await Promise.all([
    prisma.apartment.findMany({
      where: hotelId ? { hotelId } : {},
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.request.findMany({
      where: {
        ...(hotelId ? { hotelId } : {}),
        status: 'booked',
        arrival: { lte: dayEnd },
        departure: { gte: dayStart },
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        arrival: true,
        departure: true,
        selectedApartmentIds: true,
      },
    }),
    prisma.blockedRange.findMany({
      where: {
        ...(hotelId ? { hotelId } : {}),
        startDate: { lte: dayEnd },
        endDate: { gt: dayStart },
      },
      select: { apartmentId: true, note: true, endDate: true },
    }),
  ]);

  return apartments.map((apt) => {
    const booking = requests.find((r) => {
      const ids = r.selectedApartmentIds.split(',').map(Number);
      return ids.includes(apt.id);
    });

    if (booking) {
      const deptIso = toIso(booking.departure);
      return {
        id: apt.id,
        name: apt.name,
        status: {
          kind: 'belegt' as const,
          guestName: [booking.firstname, booking.lastname].filter(Boolean).join(' '),
          arrival: toIso(booking.arrival),
          departure: deptIso,
          requestId: booking.id,
          checkoutToday: deptIso === dateIso,
        },
      };
    }

    const block = blocked.find((b) => b.apartmentId === apt.id || b.apartmentId === null);
    if (block) {
      return { id: apt.id, name: apt.name, status: { kind: 'blockiert' as const, note: block.note, endDate: toIso(block.endDate) } };
    }

    return { id: apt.id, name: apt.name, status: { kind: 'frei' as const } };
  });
}
