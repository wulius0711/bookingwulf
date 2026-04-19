import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { getNukiLocks } from '@/src/lib/nuki';
import { hasPlanAccess } from '@/src/lib/plan-gates';

async function getHotelAndCheckPlan(session: Awaited<ReturnType<typeof verifySession>>) {
  if (!session.hotelId) return null;
  const hotel = await prisma.hotel.findUnique({
    where: { id: session.hotelId },
    select: { plan: true, nukiConfig: { select: { id: true, apiToken: true } } },
  });
  if (!hotel || !hasPlanAccess(hotel.plan ?? 'starter', 'pro')) return null;
  return hotel;
}

export async function GET() {
  try {
    const session = await verifySession();
    const hotel = await getHotelAndCheckPlan(session);
    if (!hotel) return NextResponse.json({ error: 'Nicht verfügbar.' }, { status: 403 });

    if (!hotel.nukiConfig) return NextResponse.json({ connected: false, locks: [] });

    try {
      const locks = await getNukiLocks(hotel.nukiConfig.apiToken);
      return NextResponse.json({ connected: true, locks });
    } catch {
      return NextResponse.json({ connected: true, locks: [], error: 'Verbindung fehlgeschlagen.' });
    }
  } catch {
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    const hotel = await getHotelAndCheckPlan(session);
    if (!hotel) return NextResponse.json({ error: 'Nicht verfügbar.' }, { status: 403 });

    const { apiToken } = await req.json();
    if (!apiToken?.trim()) return NextResponse.json({ error: 'Token fehlt.' }, { status: 400 });

    try {
      await getNukiLocks(apiToken.trim());
    } catch {
      return NextResponse.json({ error: 'Ungültiger API-Token — Verbindung fehlgeschlagen.' }, { status: 400 });
    }

    await prisma.nukiConfig.upsert({
      where: { hotelId: session.hotelId! },
      create: { hotelId: session.hotelId!, apiToken: apiToken.trim() },
      update: { apiToken: apiToken.trim() },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await verifySession();
    if (!session.hotelId) return NextResponse.json({ error: 'Kein Hotel.' }, { status: 400 });
    await prisma.nukiConfig.deleteMany({ where: { hotelId: session.hotelId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 });
  }
}
