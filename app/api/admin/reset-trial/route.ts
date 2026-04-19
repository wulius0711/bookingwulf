import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { resetTrialSchema } from '@/src/lib/schemas';

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Nur für Super-Admins.' }, { status: 403 });
    }

    const parsed = resetTrialSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Ungültige Eingabe.' }, { status: 400 });
    const { hotelId } = parsed.data;

    await prisma.hotel.update({
      where: { id: hotelId },
      data: {
        subscriptionStatus: 'trialing',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Zurücksetzen.' }, { status: 500 });
  }
}
