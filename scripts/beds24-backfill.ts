// One-off backfill: imports existing Beds24 bookings (7 days back, 12 months ahead) that
// predate the webhook connection and would otherwise never sync. Not a recurring job — the
// live webhook handles everything going forward.
//
// Usage:
//   npx tsx scripts/beds24-backfill.ts <hotelId>              → dry run, prints raw sample only
//   npx tsx scripts/beds24-backfill.ts <hotelId> --write       → actually imports

import { prisma } from '../src/lib/prisma';
import { fetchBookingsInRange, processBeds24Booking } from '../src/lib/beds24';

const hotelId = Number(process.argv[2]);
const write = process.argv.includes('--write');

if (!hotelId) {
  console.error('Usage: npx tsx scripts/beds24-backfill.ts <hotelId> [--write]');
  process.exit(1);
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function main() {
  const from = new Date();
  from.setDate(from.getDate() - 7);
  const to = new Date();
  to.setFullYear(to.getFullYear() + 1);

  const checkInFrom = isoDate(from);
  const checkInTo = isoDate(to);
  console.log(`Hotel ${hotelId} — Zeitraum ${checkInFrom} bis ${checkInTo} (${write ? 'WRITE' : 'DRY RUN'})`);

  const bookings = await fetchBookingsInRange(hotelId, checkInFrom, checkInTo);
  console.log(`${bookings.length} Buchungen von Beds24 erhalten.`);

  if (!write) {
    console.log('--- Dry run: erste 2 Rohdatensätze zur Struktur-Prüfung ---');
    console.log(JSON.stringify(bookings.slice(0, 2), null, 2));
    console.log('Kein DB-Schreibzugriff. Mit --write erneut ausführen, wenn die Feldstruktur passt.');
    return;
  }

  const tally: Record<string, number> = {};
  for (const booking of bookings) {
    const result = await processBeds24Booking(booking, hotelId);
    tally[result] = (tally[result] ?? 0) + 1;
  }
  console.log('Ergebnis:', tally);
}

main().catch(console.error).finally(() => prisma.$disconnect());
