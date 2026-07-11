// Fallback poll for Beds24 guest messages — safety net in case a webhook message event is missed
import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { fetchBeds24Messages, saveIncomingBeds24Message } from '@/src/lib/beds24';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  const configs = await prisma.beds24Config.findMany({
    where: { isEnabled: true },
    select: { hotelId: true, refreshToken: true },
  });

  let synced = 0;
  for (const cfg of configs) {
    const requests = await prisma.request.findMany({
      where: { hotelId: cfg.hotelId, status: { not: 'cancelled' }, beds24BookingId: { not: null }, departure: { gte: cutoff } },
      select: { beds24BookingId: true },
    });

    for (const r of requests) {
      if (!r.beds24BookingId) continue;
      try {
        const messages = await fetchBeds24Messages(cfg.refreshToken, r.beds24BookingId);
        for (const msg of messages) {
          if (await saveIncomingBeds24Message(r.beds24BookingId, msg)) synced++;
        }
      } catch (e) {
        console.error('[beds24-messages-sync] Fehler für Buchung', r.beds24BookingId, e);
      }
    }
  }

  return NextResponse.json({ ok: true, synced });
}
