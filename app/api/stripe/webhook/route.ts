import { NextResponse } from 'next/server';
import { stripe, getPlanFromPriceId } from '@/src/lib/stripe';
import { prisma } from '@/src/lib/prisma';
import { getResend, getFromEmail, buildEmailHtml } from '@/src/lib/email';
import { generateVoucherPdf } from '@/src/lib/voucherPdf';
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

        // Voucher payment (new: voucherIds, legacy: voucherId)
        if (session.metadata?.voucherIds || session.metadata?.voucherId) {
          const ids = session.metadata.voucherIds
            ? session.metadata.voucherIds.split(',').map(Number)
            : [Number(session.metadata.voucherId)];

          const vouchers = await prisma.$transaction(
            ids.map(id => prisma.voucher.update({
              where: { id },
              data: { status: 'active' },
              include: { template: { select: { name: true, description: true } } },
            }))
          );

          const hotel = await prisma.hotel.findUnique({
            where: { id: hotelId },
            select: { name: true, accentColor: true },
          });

          try {
            const resend = getResend();
            if (resend && hotel && vouchers.length > 0) {
              const accent = hotel.accentColor || '#111827';
              const fmt = (d: Date) => new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));
              const first = vouchers[0];

              const codeBlocks = vouchers.map(v => `
                <div style="padding:20px 24px;background:#f9fafb;border:2px dashed #d1d5db;border-radius:14px;text-align:center;margin-bottom:12px;">
                  <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px;">Gutschein-Code</div>
                  <div style="font-size:26px;font-weight:800;letter-spacing:0.12em;color:#0f172a;font-family:monospace;">${v.code}</div>
                  <div style="margin-top:10px;font-size:13px;color:#6b7280;">Gültig bis: <strong>${fmt(v.expiresAt)}</strong></div>
                </div>
              `).join('');

              const messageBlock = first.message
                ? `<div style="padding:14px 18px;background:#f0f9ff;border-left:3px solid ${accent};border-radius:0 8px 8px 0;margin-bottom:20px;font-size:14px;color:#374151;font-style:italic;">"${first.message}"</div>`
                : '';

              const senderHtml = `
                <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
                  Vielen Dank für Ihren Kauf! Nachfolgend finden Sie ${vouchers.length === 1 ? 'Ihren Gutschein' : 'Ihre Gutscheine'}.
                </p>
                ${codeBlocks}
                ${messageBlock}
                <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:0;">
                  Bitte nennen Sie ${vouchers.length === 1 ? 'diesen Code' : 'die Codes'} bei der Buchung oder bei der Rezeption von <strong>${hotel.name}</strong>.
                </p>
              `;
              const pdfAttachments = await Promise.all(vouchers.map(async (v) => {
                const pdf = await generateVoucherPdf({
                  hotelName: hotel.name,
                  accentColor: accent,
                  templateName: v.template?.name ?? v.code,
                  description: v.template?.description,
                  code: v.code,
                  type: v.type,
                  value: Number(v.value),
                  expiresAt: v.expiresAt,
                  recipientName: v.recipientName,
                  senderName: v.senderName,
                  message: v.message,
                });
                const filename = vouchers.length === 1
                  ? `Gutschein-${hotel.name.replace(/\s+/g, '-')}.pdf`
                  : `Gutschein-${v.code}.pdf`;
                return { filename, content: pdf.toString('base64') };
              }));

              await resend.emails.send({
                from: getFromEmail(),
                to: first.senderEmail,
                subject: `${vouchers.length === 1 ? 'Ihr Gutschein' : `Ihre ${vouchers.length} Gutscheine`} — ${hotel.name}`,
                html: buildEmailHtml({ hotelName: hotel.name, title: 'Gutschein bestätigt', body: senderHtml }),
                attachments: pdfAttachments,
              });

              if (first.recipientEmail && first.recipientEmail !== first.senderEmail) {
                const greeting = first.recipientName ? `Hallo ${first.recipientName},<br/><br/>` : '';
                const recipientHtml = `
                  <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
                    ${greeting}<strong>${first.senderName || 'Jemand'}</strong> hat Ihnen ${vouchers.length === 1 ? 'einen Gutschein' : `${vouchers.length} Gutscheine`} von <strong>${hotel.name}</strong> geschenkt!
                  </p>
                  ${codeBlocks}
                  ${messageBlock}
                  <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:0;">
                    Bitte nennen Sie ${vouchers.length === 1 ? 'diesen Code' : 'die Codes'} bei der Buchung oder bei der Rezeption.
                  </p>
                `;
                await resend.emails.send({
                  from: getFromEmail(),
                  to: first.recipientEmail,
                  subject: `Sie haben ${vouchers.length === 1 ? 'einen Gutschein' : `${vouchers.length} Gutscheine`} erhalten — ${hotel.name}`,
                  html: buildEmailHtml({ hotelName: hotel.name, title: 'Gutschein erhalten', body: recipientHtml }),
                  attachments: pdfAttachments,
                });
              }
            }
          } catch (e) {
            console.error('Voucher email error:', e);
          }
          break;
        }

        // Subscription payment
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
                      Sie können Ihren Plan jederzeit im Bereich &bdquo;Abonnement&ldquo; verwalten. Bei Fragen erreichen Sie uns unter <strong>support@bookingwulf.com</strong>.
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
