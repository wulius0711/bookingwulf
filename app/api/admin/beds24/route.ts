import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { setupWithInviteCode } from '@/src/lib/beds24';
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

    const { inviteCode } = await req.json();
    if (!inviteCode?.trim())
      return NextResponse.json({ error: 'Invite Code erforderlich.' }, { status: 400 });

    const { refreshToken } = await setupWithInviteCode(inviteCode.trim());

    await prisma.beds24Config.upsert({
      where: { hotelId: session.hotelId! },
      create: { hotelId: session.hotelId!, refreshToken },
      update: { refreshToken },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Fehler beim Verbinden.';
    return NextResponse.json({ error: msg }, { status: 400 });
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
