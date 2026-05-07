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
    const { hotelSlug, items, senderName, senderEmail, recipientName, recipientEmail, message } = await req.json();

    if (!hotelSlug || !Array.isArray(items) || items.length === 0 || !senderName || !senderEmail) {
      return NextResponse.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
    }

    const hotel = await prisma.hotel.findUnique({
      where: { slug: hotelSlug },
      select: { id: true, name: true, settings: { select: { stripeEnabled: true, stripeSecretKey: true } } },
    });
    if (!hotel) return NextResponse.json({ error: 'Hotel nicht gefunden.' }, { status: 404 });

    // Validate all templates belong to this hotel
    const templateIds: number[] = items.map((i: { templateId: number }) => i.templateId);
    const templates = await prisma.voucherTemplate.findMany({
      where: { id: { in: templateIds }, hotelId: hotel.id, isActive: true },
    });
    if (templates.length !== new Set(templateIds).size) {
      return NextResponse.json({ error: 'Ungültige Gutschein-Vorlage.' }, { status: 400 });
    }
    const templateMap = new Map(templates.map(t => [t.id, t]));

    // Create all vouchers upfront with status 'pending'
    const vouchers = [];
    for (const item of items as { templateId: number; quantity: number }[]) {
      const template = templateMap.get(item.templateId)!;
      const quantity = Math.max(1, Math.min(10, Math.floor(item.quantity)));
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + template.validDays);

      for (let q = 0; q < quantity; q++) {
        const voucher = await prisma.voucher.create({
          data: {
            hotelId: hotel.id,
            templateId: template.id,
            code: generateCode(),
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
        vouchers.push({ voucher, template });
      }
    }

    // Build Stripe line items (one per template type, with quantity)
    const lineItems = (items as { templateId: number; quantity: number }[]).map(item => {
      const template = templateMap.get(item.templateId)!;
      return {
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(Number(template.price) * 100),
          product_data: {
            name: `Gutschein: ${template.name} — ${hotel.name}`,
            description: template.description || undefined,
          },
        },
        quantity: Math.max(1, Math.min(10, Math.floor(item.quantity))),
      };
    });

    const voucherIds = vouchers.map(v => v.voucher.id).join(',');
    const codes = vouchers.map(v => v.voucher.code).join(',');
    const base = process.env.NEXT_PUBLIC_BASE_URL || '';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: senderEmail,
      metadata: { voucherIds, hotelId: String(hotel.id) },
      success_url: `${base}/gutschein/${hotelSlug}/bestaetigung?codes=${encodeURIComponent(codes)}`,
      cancel_url: `${base}/gutschein/${hotelSlug}`,
    });

    // Store session reference on all vouchers
    await prisma.voucher.updateMany({
      where: { id: { in: vouchers.map(v => v.voucher.id) } },
      data: { stripePaymentIntentId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('[vouchers/purchase]', e);
    return NextResponse.json({ error: 'Interner Fehler.' }, { status: 500 });
  }
}
