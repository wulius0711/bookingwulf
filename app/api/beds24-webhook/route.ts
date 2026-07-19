// Beds24 inbound webhook — receives booking notifications from Airbnb/Booking.com via Beds24
// Webhook URL (per hotel, shown in Admin → Beds24 Channel Manager): /api/beds24-webhook?token=<per-hotel secret>
// Configure under: Beds24 → Unterkünfte → Zugang → Buchung Webhook

import { prisma } from '@/src/lib/prisma';
import { processBeds24Booking, saveIncomingBeds24Message } from '@/src/lib/beds24';
import type { Beds24WebhookBooking, Beds24Message } from '@/src/lib/beds24';

export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get('token') ?? '';
  const config = token ? await prisma.beds24Config.findUnique({ where: { webhookSecret: token }, select: { hotelId: true } }) : null;
  if (!config) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const authorizedHotelId = config.hotelId;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Beds24 v2 booking webhook sends an array of booking objects — message events are
  // detected defensively since the exact Beds24 payload shape for messages isn't publicly documented
  const items: (Beds24WebhookBooking & Beds24Message)[] = Array.isArray(body) ? body : [body as Beds24WebhookBooking & Beds24Message];

  for (const booking of items) {
    const looksLikeMessage = (booking.message || booking.text) && !booking.roomId && !booking.arrival && !booking.departure;
    if (looksLikeMessage) {
      const bookingId = booking.bookingId ?? booking.id;
      if (bookingId) {
        await saveIncomingBeds24Message(String(bookingId), booking);
      } else {
        console.warn('[Beds24 webhook] message event ohne bookingId, übersprungen', booking);
      }
      continue;
    }

    const result = await processBeds24Booking(booking, authorizedHotelId);
    console.log('[Beds24 webhook]', result, 'roomId', booking.roomId, 'booking', booking.id);
  }

  return Response.json({ ok: true });
}
