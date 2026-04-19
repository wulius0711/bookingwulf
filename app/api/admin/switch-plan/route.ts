import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { PLANS, PlanKey } from '@/src/lib/plans';
import { switchPlanSchema } from '@/src/lib/schemas';

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session.hotelId) return NextResponse.json({ error: 'Hotel fehlt.' }, { status: 400 });

    const parsed = switchPlanSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Ungültige Eingabe.' }, { status: 400 });
    const { plan } = parsed.data;
    if (!(plan in PLANS)) return NextResponse.json({ error: 'Ungültiger Plan.' }, { status: 400 });

    const hotel = await prisma.hotel.findUnique({
      where: { id: session.hotelId },
      select: { subscriptionStatus: true },
    });

    if (hotel?.subscriptionStatus !== 'trialing') {
      return NextResponse.json({ error: 'Planwechsel nur während der Testphase möglich.' }, { status: 403 });
    }

    await prisma.hotel.update({
      where: { id: session.hotelId },
      data: { plan: plan as PlanKey },
    });

    if (plan === 'starter') {
      await prisma.hotelSettings.updateMany({
        where: { hotelId: session.hotelId },
        data: {
          accentColor: null, backgroundColor: null, cardBackground: null,
          textColor: null, mutedTextColor: null, borderColor: null,
          cardRadius: null, buttonRadius: null,
        },
      });
    }

    return NextResponse.json({ ok: true, plan });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Planwechsel.' }, { status: 500 });
  }
}
