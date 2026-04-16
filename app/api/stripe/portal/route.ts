import { NextResponse } from 'next/server';
import { stripe } from '@/src/lib/stripe';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    const { hotelId: bodyHotelId } = await req.json();

    const hotelId = session.hotelId ?? Number(bodyHotelId);
    if (!hotelId) return NextResponse.json({ error: 'Hotel fehlt.' }, { status: 400 });
    if (session.hotelId !== null && session.hotelId !== hotelId) {
      return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 403 });
    }

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId }, select: { stripeCustomerId: true } });
    if (!hotel?.stripeCustomerId) {
      return NextResponse.json({ error: 'Kein Stripe-Kunde gefunden.' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: hotel.stripeCustomerId,
      return_url: `${appUrl}/admin/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: 'Fehler beim Öffnen des Kundenportals.' }, { status: 500 });
  }
}
