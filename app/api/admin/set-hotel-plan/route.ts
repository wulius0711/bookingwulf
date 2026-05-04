import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { PLANS } from '@/src/lib/plans';
import { z } from 'zod';

const schema = z.object({
  hotelId: z.number().int().positive(),
  plan: z.string().min(1).max(50),
});

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (session.role !== 'super_admin') {
      return NextResponse.json({ error: 'Nur für Super-Admins.' }, { status: 403 });
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Ungültige Eingabe.' }, { status: 400 });
    const { hotelId, plan } = parsed.data;

    if (!(plan in PLANS)) return NextResponse.json({ error: 'Ungültiger Plan.' }, { status: 400 });

    await prisma.hotel.update({
      where: { id: hotelId },
      data: { plan },
    });

    return NextResponse.json({ ok: true, plan });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Setzen des Plans.' }, { status: 500 });
  }
}
