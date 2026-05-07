import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { stripe } from '@/src/lib/stripe';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: Request) {
  try {
    const { hotelSlug, templateId, senderName, senderEmail, recipientName, recipientEmail, message } = await req.json();

    if (!hotelSlug || !templateId || !senderName || !senderEmail) {
      return NextResponse.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
    }

    const hotel = await prisma.hotel.findUnique({
      where: { slug: hotelSlug },
      select: { id: true, name: true, settings: { select: { stripeEnabled: true, stripeSecretKey: true } } },
    });
    if (!hotel) return NextResponse.json({ error: 'Hotel nicht gefunden.' }, { status: 404 });

    const template = await prisma.voucherTemplate.findFirst({
      where: { id: templateId, hotelId: hotel.id, isActive: true },
    });
    if (!template) return NextResponse.json({ error: 'Gutschein-Vorlage nicht gefunden.' }, { status: 404 });

    const code = generateCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + template.validDays);

    const voucher = await prisma.voucher.create({
      data: {
        hotelId: hotel.id,
        templateId: template.id,
        code,
        type: template.type,
        value: template.value,
        pricePaid: template.price,
        senderName,
        senderEmail,
        recipientName: recipientName || null,
        recipientEmail: recipientEmail || null,
        message: message || null,
        status: 'pending',
        expiresAt,
      },
    });

    const base = process.env.NEXT_PUBLIC_BASE_URL || '';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: Math.round(Number(template.price) * 100),
            product_data: {
              name: `Gutschein: ${template.name} — ${hotel.name}`,
              description: template.description || undefined,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: senderEmail,
      metadata: { voucherId: String(voucher.id), hotelId: String(hotel.id) },
      success_url: `${base}/gutschein/${hotelSlug}/bestaetigung?code=${code}`,
      cancel_url: `${base}/gutschein/${hotelSlug}`,
    });

    await prisma.voucher.update({
      where: { id: voucher.id },
      data: { stripePaymentIntentId: session.payment_intent as string | null ?? session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('[vouchers/purchase]', e);
    return NextResponse.json({ error: 'Interner Fehler.' }, { status: 500 });
  }
}
