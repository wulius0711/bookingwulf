// One-off backfill: Request.channel defaults to "direct" on the new column. For Beds24-synced
// requests, the real channel (Airbnb/Booking.com/...) isn't reliably reconstructable from the
// BlockedRange note — that note can get overwritten/deleted once a booking's slot is reused — so
// this asks the Beds24 API directly for each affected hotel's bookings and matches by beds24BookingId.
//
// Usage:
//   npx tsx scripts/backfill-request-channel.ts              → dry run, prints planned updates
//   npx tsx scripts/backfill-request-channel.ts --write       → actually updates

import { prisma } from '../src/lib/prisma';
import { fetchBookingsInRange } from '../src/lib/beds24';

const write = process.argv.includes('--write');

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function main() {
  const requests = await prisma.request.findMany({
    where: { beds24BookingId: { not: null }, hotelId: { not: null } },
    select: { id: true, hotelId: true, beds24BookingId: true, firstname: true, lastname: true, arrival: true, channel: true },
  });
  console.log(`${requests.length} Beds24-Requests gefunden (${write ? 'WRITE' : 'DRY RUN'}).`);

  const byHotel = new Map<number, typeof requests>();
  for (const r of requests) {
    const list = byHotel.get(r.hotelId!) ?? [];
    list.push(r);
    byHotel.set(r.hotelId!, list);
  }

  let matched = 0;
  let changed = 0;
  for (const [hotelId, hotelRequests] of byHotel) {
    const arrivals = hotelRequests.map((r) => r.arrival.getTime());
    const from = new Date(Math.min(...arrivals));
    from.setDate(from.getDate() - 2);
    const to = new Date(Math.max(...arrivals));
    to.setDate(to.getDate() + 2);

    let bookings;
    try {
      bookings = await fetchBookingsInRange(hotelId, isoDate(from), isoDate(to));
    } catch (err) {
      console.error(`Hotel ${hotelId}: Beds24-Abruf fehlgeschlagen — ${(err as Error).message}`);
      continue;
    }
    const apiSourceById = new Map(bookings.map((b) => [String(b.id), b.apiSource]));

    for (const r of hotelRequests) {
      const apiSource = apiSourceById.get(r.beds24BookingId!);
      const channel = apiSource || 'direct';
      if (!apiSourceById.has(r.beds24BookingId!)) continue;
      matched++;
      if (channel !== r.channel) {
        changed++;
        console.log(`  #${r.id} ${r.firstname ?? ''} ${r.lastname} (Hotel ${hotelId}): ${r.channel} → ${channel}`);
        if (write) {
          await prisma.request.update({ where: { id: r.id }, data: { channel } });
        }
      }
    }
  }
  console.log(`${matched} von ${requests.length} bei Beds24 gefunden, ${changed} Channel-Änderungen.${write ? '' : ' Mit --write erneut ausführen zum Schreiben.'}`);
}

main().finally(() => prisma.$disconnect()).then(() => process.exit(0));
