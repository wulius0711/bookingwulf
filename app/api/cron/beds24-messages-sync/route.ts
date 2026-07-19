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

  let configs;
  try {
    configs = await prisma.beds24Config.findMany({
      where: { isEnabled: true },
      select: { hotelId: true },
    });
  } catch (e) {
    console.error('[beds24-messages-sync] Fehler beim Laden der Configs, überspringe diesen Lauf', e);
    return NextResponse.json({ ok: false, synced: 0 });
  }

  let synced = 0;
  for (const cfg of configs) {
    let requests;
    try {
      requests = await prisma.request.findMany({
        where: { hotelId: cfg.hotelId, status: { not: 'cancelled' }, beds24BookingId: { not: null }, departure: { gte: cutoff } },
        select: { beds24BookingId: true },
      });
    } catch (e) {
      console.error('[beds24-messages-sync] Fehler beim Laden der Requests für Hotel', cfg.hotelId, e);
      continue;
    }

    for (const r of requests) {
      if (!r.beds24BookingId) continue;
      try {
        const messages = await fetchBeds24Messages(cfg.hotelId, r.beds24BookingId);
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
