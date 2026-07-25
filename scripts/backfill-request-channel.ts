// One-off backfill: Request.channel defaults to "direct" on the new column, but Beds24-synced
// requests actually know their OTA via the paired BlockedRange note ("[Airbnb] 12345") — this
// matches that note back to the Request via beds24BookingId and fills in the real channel.
//
// Usage:
//   npx tsx scripts/backfill-request-channel.ts              → dry run, prints planned updates
//   npx tsx scripts/backfill-request-channel.ts --write       → actually updates

import { prisma } from '../src/lib/prisma';

const write = process.argv.includes('--write');

async function main() {
  const requests = await prisma.request.findMany({
    where: { beds24BookingId: { not: null }, channel: 'direct' },
    select: { id: true, beds24BookingId: true, firstname: true, lastname: true },
  });
  console.log(`${requests.length} Beds24-Requests ohne erkannten Channel (${write ? 'WRITE' : 'DRY RUN'}).`);

  const blocks = await prisma.blockedRange.findMany({
    where: { type: 'beds24_sync', note: { not: null } },
    select: { note: true },
  });
  const platformByBeds24Id = new Map<string, string>();
  for (const b of blocks) {
    const m = b.note?.match(/^\[(.+?)\]\s*(\d+)\s*$/);
    if (m) platformByBeds24Id.set(m[2], m[1]);
  }

  let matched = 0;
  for (const r of requests) {
    const platform = r.beds24BookingId ? platformByBeds24Id.get(r.beds24BookingId) : undefined;
    if (!platform) continue;
    matched++;
    console.log(`  #${r.id} ${r.firstname ?? ''} ${r.lastname} → ${platform}`);
    if (write) {
      await prisma.request.update({ where: { id: r.id }, data: { channel: platform } });
    }
  }
  console.log(`${matched} von ${requests.length} zugeordnet.${write ? '' : ' Mit --write erneut ausführen zum Schreiben.'}`);
}

main().finally(() => prisma.$disconnect()).then(() => process.exit(0));
