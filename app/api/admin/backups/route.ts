import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';
import { verifySession } from '@/src/lib/session';

export async function GET(req: NextRequest) {
  const session = await verifySession().catch(() => null);
  if (!session || session.hotelId !== null) {
    return new Response('Unauthorized', { status: 401 });
  }

  const date = req.nextUrl.searchParams.get('date');

  const { blobs } = await list({ prefix: 'backups/' });

  if (!date) {
    return NextResponse.json(
      blobs
        .map((b) => ({
          date: b.pathname.replace('backups/', '').replace('.json', ''),
          sizeKb: Math.round(b.size / 1024),
          uploadedAt: b.uploadedAt,
        }))
        .sort((a, b) => b.date.localeCompare(a.date)),
    );
  }

  const blob = blobs.find((b) => b.pathname === `backups/${date}.json`);
  if (!blob) return new Response('Backup nicht gefunden', { status: 404 });

  const res = await fetch(blob.url, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });
  if (!res.ok) return new Response('Download fehlgeschlagen', { status: 502 });

  const body = await res.text();
  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="backup-${date}.json"`,
    },
  });
}
