// Beds24 inbound webhook — receives booking notifications from Airbnb/Booking.com via Beds24
// Webhook URL: https://your-domain.com/api/beds24-webhook?token=<BEDS24_WEBHOOK_SECRET>
// Configure under: Beds24 → Settings → Properties → Access → Booking Webhook

import { timingSafeEqual, randomUUID } from 'crypto';
import { prisma } from '@/src/lib/prisma';
import { fetchBeds24BookingDetails } from '@/src/lib/beds24';
import type { Beds24WebhookBooking } from '@/src/lib/beds24';

export async function POST(req: Request) {
  const secret = process.env.BEDS24_WEBHOOK_SECRET;
  const token = new URL(req.url).searchParams.get('token') ?? '';
  const authorized =
    !!secret &&
    token.length === secret.length &&
    timingSafeEqual(Buffer.from(token), Buffer.from(secret));
  if (!authorized) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Beds24 v2 booking webhook sends an array of booking objects
  const bookings: Beds24WebhookBooking[] = Array.isArray(body) ? body : [body as Beds24WebhookBooking];

  for (const booking of bookings) {
    const roomId = String(booking.roomId ?? '');
    const arrival = booking.arrival;
    const departure = booking.departure;
    const status = booking.status ?? '1';

    if (!roomId || !arrival || !departure) {
      console.warn('[Beds24 webhook] skipping booking — missing roomId/arrival/departure', booking);
      continue;
    }

    // Cancelled bookings (status "3") → remove BlockedRange + cancel Request
    if (status === '3') {
      await prisma.blockedRange.deleteMany({
        where: {
          type: 'beds24_sync',
          startDate: new Date(arrival),
          endDate: new Date(departure),
          apartment: { beds24Mapping: { beds24RoomId: roomId } },
        },
      });

      const beds24Id = booking.id ? String(booking.id) : null;
      if (beds24Id) {
        await prisma.request.updateMany({
          where: { beds24BookingId: beds24Id },
          data: { status: 'cancelled' },
        });
      }

      console.log('[Beds24 webhook] removed block + cancelled request for booking', booking.id, roomId);
      continue;
    }

    // Find the apartment mapped to this Beds24 room
    const mapping = await prisma.beds24ApartmentMapping.findFirst({
      where: { beds24RoomId: roomId },
      select: { apartmentId: true, apartment: { select: { hotelId: true } } },
    });

    if (!mapping) {
      console.warn('[Beds24 webhook] no apartment mapping found for roomId', roomId);
      continue;
    }

    // Upsert BlockedRange to prevent double-bookings
    await prisma.blockedRange.upsert({
      where: {
        id: await findExistingBlockId(mapping.apartmentId, arrival, departure) ?? 0,
      },
      update: {
        endDate: new Date(departure),
        note: `Beds24 sync — booking ${booking.id ?? roomId}`,
      },
      create: {
        apartmentId: mapping.apartmentId,
        hotelId: mapping.apartment?.hotelId ?? null,
        startDate: new Date(arrival),
        endDate: new Date(departure),
        type: 'beds24_sync',
        note: `Beds24 sync — booking ${booking.id ?? roomId}`,
      },
    });

    // Upsert Request record so the booking appears in CSV export and admin overview
    const beds24Id = booking.id ? String(booking.id) : null;
    if (beds24Id) {
      const arrivalDate = new Date(arrival);
      const departureDate = new Date(departure);
      const nights = Math.round((departureDate.getTime() - arrivalDate.getTime()) / 86_400_000);

      await prisma.request.upsert({
        where: { beds24BookingId: beds24Id },
        update: {
          arrival: arrivalDate,
          departure: departureDate,
          nights,
          adults: booking.numAdult ?? 1,
          children: booking.numChild ?? 0,
          firstname: booking.firstName ?? '',
          lastname: booking.lastName || '—',
          email: booking.email ?? '',
          country: booking.guestCountry ?? '',
          status: 'booked',
        },
        create: {
          beds24BookingId: beds24Id,
          hotelId: mapping.apartment?.hotelId ?? null,
          arrival: arrivalDate,
          departure: departureDate,
          nights,
          adults: booking.numAdult ?? 1,
          children: booking.numChild ?? 0,
          selectedApartmentIds: JSON.stringify([mapping.apartmentId]),
          salutation: '',
          firstname: booking.firstName ?? '',
          lastname: booking.lastName || '—',
          email: booking.email ?? '',
          country: booking.guestCountry ?? '',
          status: 'booked',
          language: 'de',
          checkinToken: randomUUID(),
        },
      });

      // Fetch pricing from Beds24 API and store in pricingJson
      if (mapping.apartment?.hotelId) {
        const beds24Config = await prisma.beds24Config.findUnique({
          where: { hotelId: mapping.apartment.hotelId },
          select: { refreshToken: true, isEnabled: true },
        });
        if (beds24Config?.isEnabled && beds24Config.refreshToken) {
          const aptName = await prisma.apartment.findUnique({
            where: { id: mapping.apartmentId },
            select: { name: true },
          });
          const pricing = await fetchBeds24BookingDetails(
            beds24Config.refreshToken,
            beds24Id,
            aptName?.name ?? 'Zimmer',
          );
          if (pricing) {
            await prisma.request.update({
              where: { beds24BookingId: beds24Id },
              data: { pricingJson: pricing },
            });
          }
        }
      }
    }

    console.log('[Beds24 webhook] blocked', arrival, '→', departure, 'for apartment', mapping.apartmentId);
  }

  return Response.json({ ok: true });
}

async function findExistingBlockId(
  apartmentId: number,
  arrival: string,
  departure: string,
): Promise<number | null> {
  const existing = await prisma.blockedRange.findFirst({
    where: {
      apartmentId,
      startDate: new Date(arrival),
      endDate: new Date(departure),
      type: 'beds24_sync',
    },
    select: { id: true },
  });
  return existing?.id ?? null;
}
