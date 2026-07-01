import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export const dynamic = 'force-dynamic';

const THRESHOLDS_MIN: Record<string, number> = {
  'daily-backup': 25 * 60,
  'ical-sync': 35,
};

export async function GET() {
  const heartbeats = await prisma.cronJobHeartbeat.findMany({
    where: { jobName: { in: Object.keys(THRESHOLDS_MIN) } },
  });
  const byName = new Map(heartbeats.map((h) => [h.jobName, h.lastSuccessAt]));

  const jobs = Object.entries(THRESHOLDS_MIN).map(([jobName, thresholdMinutes]) => {
    const lastSuccessAt = byName.get(jobName) ?? null;
    const ageMinutes = lastSuccessAt ? (Date.now() - lastSuccessAt.getTime()) / 60_000 : Infinity;
    return { jobName, lastSuccessAt, thresholdMinutes, healthy: ageMinutes <= thresholdMinutes };
  });

  const ok = jobs.every((j) => j.healthy);
  return NextResponse.json({ ok, jobs }, { status: ok ? 200 : 500 });
}
