import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { hasPlanAccess } from '@/src/lib/plan-gates';
import { settingsPresetSchema } from '@/src/lib/schemas';

const MAX_PRESETS = 3;

async function getHotelId(session: Awaited<ReturnType<typeof verifySession>>, bodyHotelId?: number) {
  const hotelId = session.hotelId ?? bodyHotelId;
  if (!hotelId) return null;
  if (session.hotelId !== null && session.hotelId !== hotelId) return null;
  return hotelId;
}

// GET: list presets
export async function GET(req: Request) {
  try {
    const session = await verifySession();
    const { searchParams } = new URL(req.url);
    const hotelId = await getHotelId(session, Number(searchParams.get('hotelId') || 0) || undefined);
    if (!hotelId) return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 403 });

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId }, select: { plan: true } });
    if (!hotel || (!hasPlanAccess(hotel.plan ?? 'starter', 'pro') && session.hotelId !== null)) {
      return NextResponse.json({ presets: [] });
    }

    const presets = await prisma.hotelSettingsPreset.findMany({
      where: { hotelId },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, accentColor: true, backgroundColor: true, cardBackground: true, textColor: true, mutedTextColor: true, borderColor: true, cardRadius: true, buttonRadius: true },
    });

    return NextResponse.json({ presets });
  } catch {
    return NextResponse.json({ error: 'Serverfehler.' }, { status: 500 });
  }
}

// POST: save preset
export async function POST(req: Request) {
  try {
    const session = await verifySession();
    const parsed = settingsPresetSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Ungültige Eingabe.' }, { status: 400 });
    const body = parsed.data;
    const hotelId = await getHotelId(session, body.hotelId);
    if (!hotelId) return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 403 });

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId }, select: { plan: true } });
    if (!hotel || (!hasPlanAccess(hotel.plan ?? 'starter', 'pro') && session.hotelId !== null)) {
      return NextResponse.json({ error: 'Ab Pro Plan verfügbar.' }, { status: 403 });
    }

    const count = await prisma.hotelSettingsPreset.count({ where: { hotelId } });
    if (count >= MAX_PRESETS) {
      return NextResponse.json({ error: `Maximal ${MAX_PRESETS} Presets erlaubt.` }, { status: 400 });
    }

    const name = (body.name ?? '').trim() || 'Preset';
    const preset = await prisma.hotelSettingsPreset.create({
      data: {
        hotelId,
        name,
        accentColor: body.accentColor ?? null,
        backgroundColor: body.backgroundColor ?? null,
        cardBackground: body.cardBackground ?? null,
        textColor: body.textColor ?? null,
        mutedTextColor: body.mutedTextColor ?? null,
        borderColor: body.borderColor ?? null,
        cardRadius: body.cardRadius ?? null,
        buttonRadius: body.buttonRadius ?? null,
      },
    });

    return NextResponse.json({ preset });
  } catch {
    return NextResponse.json({ error: 'Serverfehler.' }, { status: 500 });
  }
}

// DELETE: delete preset
export async function DELETE(req: Request) {
  try {
    const session = await verifySession();
    const { searchParams } = new URL(req.url);
    const presetId = Number(searchParams.get('id') || 0);
    if (!presetId) return NextResponse.json({ error: 'ID fehlt.' }, { status: 400 });

    const preset = await prisma.hotelSettingsPreset.findUnique({ where: { id: presetId }, select: { hotelId: true } });
    if (!preset) return NextResponse.json({ error: 'Nicht gefunden.' }, { status: 404 });

    const hotelId = await getHotelId(session, preset.hotelId);
    if (!hotelId || hotelId !== preset.hotelId) return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 403 });

    await prisma.hotelSettingsPreset.delete({ where: { id: presetId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Serverfehler.' }, { status: 500 });
  }
}
