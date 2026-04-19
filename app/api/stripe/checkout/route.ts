import { NextResponse } from 'next/server';
import { stripe, getPriceId } from '@/src/lib/stripe';
import { PLANS, PlanKey } from '@/src/lib/plans';
import { prisma } from '@/src/lib/prisma';
import { verifySession } from '@/src/lib/session';
import { checkoutSchema } from '@/src/lib/schemas';

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    const parsed = checkoutSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Ungültige Eingabe.' }, { status: 400 });
    const { plan, hotelId: bodyHotelId, interval } = parsed.data;

    const hotelId = session.hotelId ?? bodyHotelId;
    if (!hotelId) return NextResponse.json({ error: 'Hotel fehlt.' }, { status: 400 });
    if (session.hotelId !== null && session.hotelId !== hotelId) {
      return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 403 });
    }

    const planKey = (plan as PlanKey) in PLANS ? (plan as PlanKey) : 'starter';
    const billingInterval = interval;
    const priceId = getPriceId(planKey, billingInterval);

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId }, select: { id: true, name: true, email: true, stripeCustomerId: true } });
    if (!hotel) return NextResponse.json({ error: 'Hotel nicht gefunden.' }, { status: 404 });

    let customerId = hotel.stripeCustomerId;
    if (customerId) {
      // Verify the customer exists in this Stripe environment (live vs test)
      try {
        await stripe.customers.retrieve(customerId);
      } catch {
        customerId = null;
        await prisma.hotel.update({ where: { id: hotelId }, data: { stripeCustomerId: null } });
      }
    }
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: hotel.name,
        email: hotel.email ?? undefined,
        metadata: { hotelId: String(hotelId) },
      });
      customerId = customer.id;
      await prisma.hotel.update({ where: { id: hotelId }, data: { stripeCustomerId: customerId } });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/admin/billing?success=1&hotelId=${hotelId}`,
      cancel_url: `${appUrl}/admin/billing?cancelled=1&hotelId=${hotelId}`,
      metadata: { hotelId: String(hotelId), plan: planKey },
      subscription_data: { metadata: { hotelId: String(hotelId), plan: planKey } },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Checkout-Fehler: ${msg}` }, { status: 500 });
  }
}
