import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { billedApartmentsSchema } from '@/src/lib/schemas';
import { syncApartmentQuantity } from '@/src/lib/stripe-sync';

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session.hotelId) return NextResponse.json({ error: 'Hotel fehlt.' }, { status: 400 });

    const parsed = billedApartmentsSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Ungültige Eingabe.' }, { status: 400 });

    await prisma.hotel.update({
      where: { id: session.hotelId },
      data: { billedApartments: parsed.data.billedApartments },
    });

    await syncApartmentQuantity(session.hotelId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Fehler beim Aktualisieren.' }, { status: 500 });
  }
}
