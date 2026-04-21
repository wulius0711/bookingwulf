import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { testConnection } from '@/src/lib/beds24';
import { hasPlanAccess } from '@/src/lib/plan-gates';

async function getHotelAndCheckPlan(session: Awaited<ReturnType<typeof verifySession>>) {
  if (!session.hotelId) return null;
  const hotel = await prisma.hotel.findUnique({
    where: { id: session.hotelId },
    select: { plan: true, beds24Config: { select: { id: true, isEnabled: true } } },
  });
  if (!hotel || !hasPlanAccess(hotel.plan ?? 'starter', 'pro')) return null;
  return hotel;
}

export async function GET() {
  try {
    const session = await verifySession();
    const hotel = await getHotelAndCheckPlan(session);
    if (!hotel) return NextResponse.json({ error: 'Nicht verfügbar.' }, { status: 403 });
    if (!hotel.beds24Config) return NextResponse.json({ connected: false, isEnabled: false });
    return NextResponse.json({ connected: true, isEnabled: hotel.beds24Config.isEnabled });
  } catch {
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    const hotel = await getHotelAndCheckPlan(session);
    if (!hotel) return NextResponse.json({ error: 'Nicht verfügbar.' }, { status: 403 });

    const { propKey, accountKey } = await req.json();
    if (!propKey?.trim() || !accountKey?.trim())
      return NextResponse.json({ error: 'propKey und accountKey erforderlich.' }, { status: 400 });

    const result = await testConnection(propKey.trim(), accountKey.trim());
    if (!result.ok)
      return NextResponse.json({ error: `Verbindung fehlgeschlagen: ${result.info}` }, { status: 400 });

    await prisma.beds24Config.upsert({
      where: { hotelId: session.hotelId! },
      create: { hotelId: session.hotelId!, propKey: propKey.trim(), accountKey: accountKey.trim() },
      update: { propKey: propKey.trim(), accountKey: accountKey.trim() },
    });

    return NextResponse.json({ ok: true, info: result.info });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Speichern.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await verifySession();
    if (!session.hotelId) return NextResponse.json({ error: 'Kein Hotel.' }, { status: 400 });
    const { isEnabled } = await req.json();
    await prisma.beds24Config.update({
      where: { hotelId: session.hotelId },
      data: { isEnabled: Boolean(isEnabled) },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await verifySession();
    if (!session.hotelId) return NextResponse.json({ error: 'Kein Hotel.' }, { status: 400 });
    await prisma.beds24Config.deleteMany({ where: { hotelId: session.hotelId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Fehler.' }, { status: 500 });
  }
}
