import { NextResponse } from 'next/server';
import { stripe, getPlanFromPriceId } from '@/src/lib/stripe';
import { prisma } from '@/src/lib/prisma';
import { getResend, getFromEmail, buildEmailHtml } from '@/src/lib/email';
import { PLANS, PlanKey } from '@/src/lib/plans';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or secret.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const hotelId = Number(session.metadata?.hotelId);
        const subscriptionId = session.subscription as string;
        if (!hotelId || !subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId);

        const hotel = await prisma.hotel.update({
          where: { id: hotelId },
          data: { stripeSubscriptionId: subscriptionId, plan, subscriptionStatus: subscription.status },
          select: { name: true, email: true },
        });

        // Send subscription confirmation email
        if (hotel.email && subscription.status === 'active') {
          try {
            const resend = getResend();
            const planInfo = PLANS[plan as PlanKey] ?? PLANS.starter;
            if (resend) {
              await resend.emails.send({
                from: getFromEmail(),
                to: hotel.email,
                subject: `Abonnement bestätigt — bookingwulf ${planInfo.name}`,
                html: buildEmailHtml({
                  hotelName: 'bookingwulf',
                  title: 'Abonnement bestätigt',
                  body: `
                    <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
                      Hallo,<br/><br/>
                      vielen Dank für Ihr Abonnement! Ihr <strong>${planInfo.name}-Plan</strong> für <strong>${hotel.name}</strong> ist jetzt aktiv.
                    </p>
                    <div style="padding:16px 20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;margin-bottom:20px;">
                      <div style="font-size:13px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Ihr Plan</div>
                      <div style="font-size:18px;font-weight:700;color:#111;">${planInfo.name} — \u20AC ${planInfo.priceMonthly}/Monat</div>
                    </div>
                    <ul style="font-size:14px;color:#374151;line-height:1.8;margin:0 0 20px;padding-left:20px;">
                      ${planInfo.features.map(f => '<li>' + f + '</li>').join('')}
                    </ul>
                    <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0;">
                      Sie können Ihren Plan jederzeit im Bereich &bdquo;Abonnement&ldquo; verwalten. Bei Fragen erreichen Sie uns unter <strong>office@wulius.at</strong>.
                    </p>
                  `,
                }),
              });
            }
          } catch (e) {
            console.error('Subscription confirmation mail error:', e);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const hotelId = Number(subscription.metadata?.hotelId);
        if (!hotelId) break;

        const priceId = subscription.items.data[0]?.price.id;
        const plan = getPlanFromPriceId(priceId);

        await prisma.hotel.update({
          where: { id: hotelId },
          data: { plan, subscriptionStatus: subscription.status },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const hotelId = Number(subscription.metadata?.hotelId);
        if (!hotelId) break;

        await prisma.hotel.update({
          where: { id: hotelId },
          data: { subscriptionStatus: 'cancelled', plan: 'starter' },
        });
        await prisma.hotelSettings.updateMany({
          where: { hotelId },
          data: {
            accentColor: null, backgroundColor: null, cardBackground: null,
            textColor: null, mutedTextColor: null, borderColor: null,
            cardRadius: null, buttonRadius: null,
          },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        if (!customerId) break;

        await prisma.hotel.updateMany({
          where: { stripeCustomerId: customerId },
          data: { subscriptionStatus: 'past_due' },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }
}
