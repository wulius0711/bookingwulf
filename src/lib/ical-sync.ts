import ICAL from 'ical.js';
import { prisma } from './prisma';

type ParsedEvent = {
  summary: string;
  startDate: Date;
  endDate: Date;
};

export function parseIcal(icsText: string): ParsedEvent[] {
  const jcal = ICAL.parse(icsText);
  const comp = new ICAL.Component(jcal);
  const events = comp.getAllSubcomponents('vevent');

  const parsed: ParsedEvent[] = [];

  for (const vevent of events) {
    const event = new ICAL.Event(vevent);
    const start = event.startDate?.toJSDate();
    const end = event.endDate?.toJSDate();

    if (!start || !end) continue;
    // Skip past events (older than 1 day)
    if (end < new Date(Date.now() - 86400000)) continue;

    parsed.push({
      summary: event.summary || 'Blocked',
      startDate: start,
      endDate: end,
    });
  }

  return parsed;
}

export async function syncIcalFeed(feedId: number): Promise<{ synced: number; error?: string }> {
  const feed = await prisma.icalFeed.findUnique({
    where: { id: feedId },
    include: { apartment: { select: { hotelId: true } } },
  });

  if (!feed) return { synced: 0, error: 'Feed not found' };

  try {
    const res = await fetch(feed.url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const icsText = await res.text();
    const events = parseIcal(icsText);

    // Delete old ical_sync blocked ranges for this apartment+feed
    await prisma.blockedRange.deleteMany({
      where: {
        apartmentId: feed.apartmentId,
        type: 'ical_sync',
        note: { startsWith: `[${feed.name}]` },
      },
    });

    // Create new blocked ranges
    if (events.length > 0) {
      await prisma.blockedRange.createMany({
        data: events.map((e) => ({
          hotelId: feed.apartment.hotelId,
          apartmentId: feed.apartmentId,
          startDate: e.startDate,
          endDate: e.endDate,
          type: 'ical_sync',
          note: `[${feed.name}] ${e.summary}`,
        })),
      });
    }

    await prisma.icalFeed.update({
      where: { id: feedId },
      data: { lastSyncAt: new Date(), lastError: null },
    });

    return { synced: events.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.icalFeed.update({
      where: { id: feedId },
      data: { lastError: message },
    });
    return { synced: 0, error: message };
  }
}

const BATCH_SIZE = 10;

export async function syncAllFeeds(): Promise<{ total: number; errors: number }> {
  const feeds = await prisma.icalFeed.findMany({ select: { id: true } });
  let errors = 0;

  for (let i = 0; i < feeds.length; i += BATCH_SIZE) {
    const batch = feeds.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(batch.map((f) => syncIcalFeed(f.id)));
    for (const r of results) {
      if (r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error)) errors++;
    }
  }

  return { total: feeds.length, errors };
}
