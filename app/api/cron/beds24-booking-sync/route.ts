// Reconciliation safety net for the Beds24 booking webhook — pulls bookings directly from the
// Beds24 API and re-processes them, catching anything the webhook missed (URL misconfigured,
// Beds24 auto-disabled it after failures, a transient error, etc). processBeds24Booking() is
// idempotent (upsert by beds24BookingId / date range), so re-syncing already-synced bookings is safe.
import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { fetchBookingsInRange, processBeds24Booking } from '@/src/lib/beds24';

const LOOKAHEAD_DAYS = 120;

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let configs;
  try {
    configs = await prisma.beds24Config.findMany({ where: { isEnabled: true }, select: { hotelId: true } });
  } catch (e) {
    console.error('[beds24-booking-sync] Fehler beim Laden der Configs, überspringe diesen Lauf', e);
    return NextResponse.json({ ok: false, synced: 0 });
  }

  const today = new Date();
  const checkInFrom = today.toISOString().slice(0, 10);
  const checkInTo = new Date(today.getTime() + LOOKAHEAD_DAYS * 86_400_000).toISOString().slice(0, 10);

  let synced = 0;
  for (const cfg of configs) {
    try {
      const bookings = await fetchBookingsInRange(cfg.hotelId, checkInFrom, checkInTo);
      for (const booking of bookings) {
        await processBeds24Booking(booking, cfg.hotelId);
        synced++;
      }
    } catch (e) {
      console.error('[beds24-booking-sync] Fehler für Hotel', cfg.hotelId, e);
    }
  }

  await prisma.cronJobHeartbeat.upsert({
    where: { jobName: 'beds24-booking-sync' },
    update: { lastSuccessAt: new Date() },
    create: { jobName: 'beds24-booking-sync', lastSuccessAt: new Date() },
  });

  return NextResponse.json({ ok: true, synced });
}
