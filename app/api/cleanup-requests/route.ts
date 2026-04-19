import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 3);

  const { count } = await prisma.request.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  console.log(`[cleanup-requests] Deleted ${count} requests older than 3 years.`);
  return NextResponse.json({ ok: true, deleted: count });
}
