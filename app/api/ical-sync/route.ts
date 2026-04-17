import { NextResponse } from 'next/server';
import { syncIcalFeed, syncAllFeeds } from '@/src/lib/ical-sync';
import { verifySession } from '@/src/lib/session';

// Sync a single feed (manual trigger from admin)
export async function POST(req: Request) {
  try {
    const session = await verifySession();
    const { feedId } = await req.json();

    if (!feedId) return NextResponse.json({ error: 'feedId required' }, { status: 400 });

    const result = await syncIcalFeed(Number(feedId));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// Sync all feeds (called by cron or external trigger)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  // Simple secret to protect the cron endpoint
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await syncAllFeeds();
  return NextResponse.json(result);
}
