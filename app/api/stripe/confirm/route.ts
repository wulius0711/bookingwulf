import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { retrievePaymentIntent } from '@/src/lib/stripe-server';
import { getResend, getFromEmail, buildEmailHtml, buildInfoBlock } from '@/src/lib/email';
import { getEmailTranslations, type Lang } from '@/src/lib/email-i18n';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

const LANG_TO_LOCALE: Record<Lang, string> = {
  de: 'de-AT', en: 'en-GB', it: 'it-IT', fr: 'fr-FR',
  nl: 'nl-NL', ru: 'ru-RU', pl: 'pl-PL', cs: 'cs-CZ', es: 'es-ES',
};
const VALID_LANGS = new Set<Lang>(['de', 'en', 'it', 'fr', 'nl', 'ru', 'pl', 'cs', 'es']);
function toLang(s: string): Lang { return VALID_LANGS.has(s as Lang) ? (s as Lang) : 'de'; }
function fmtDate(d: Date, locale = 'de-AT') {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

export async function POST(req: NextRequest) {
  try {
    const { requestId, paymentIntentId } = await req.json();

    if (!requestId || !paymentIntentId) {
      return NextResponse.json({ success: false, message: 'Fehlende Parameter.' }, { status: 400, headers: corsHeaders });
    }

    const request = await prisma.request.findUnique({
      where: { id: Number(requestId) },
      include: {
        hotel: {
          select: {
            id: true, name: true, email: true, accentColor: true,
            settings: { select: { stripeSecretKey: true } },
          },
        },
      },
    });

    if (!request || request.status !== 'pending_stripe') {
      return NextResponse.json({ success: false, message: 'Buchung nicht gefunden.' }, { status: 404, headers: corsHeaders });
    }

    const secretKey = request.hotel?.settings?.stripeSecretKey;
    if (!secretKey) {
      return NextResponse.json({ success: false, message: 'Stripe nicht konfiguriert.' }, { status: 500, headers: corsHeaders });
    }

    const pi = await retrievePaymentIntent(secretKey, paymentIntentId);
    if (pi.status !== 'succeeded') {
      return NextResponse.json({ success: false, message: 'Zahlung noch nicht abgeschlossen.' }, { status: 402, headers: corsHeaders });
    }

    // Confirm booking
    await prisma.request.update({
      where: { id: request.id },
      data: { status: 'booked', paypalOrderId: paymentIntentId },
    });

    // Block dates
    const apartmentIds = request.selectedApartmentIds
      .split(',').map(s => s.trim()).filter(Boolean).map(Number).filter(n => n > 0);
    if (apartmentIds.length > 0) {
      await prisma.blockedRange.createMany({
        data: apartmentIds.map(apartmentId => ({
          apartmentId,
          startDate: request.arrival,
          endDate: request.departure,
          type: 'booking',
          note: `Buchung #${request.id} — ${request.firstname ?? ''} ${request.lastname} (Stripe)`,
        })),
      });
    }

    // Emails
    try {
      const resend = getResend();
      if (resend && request.hotel) {
        const hotel = request.hotel;
        const accent = hotel.accentColor || '#111827';
        const receiverEmail = hotel.email || process.env.BOOKING_RECEIVER_EMAIL!;
        const lang = toLang(request.language);
        const i18n = getEmailTranslations(lang);
        const locale = LANG_TO_LOCALE[lang];

        await resend.emails.send({
          from: getFromEmail(),
          to: receiverEmail,
          subject: `Stripe-Zahlung eingegangen — Buchung #${request.id} — ${fmtDate(request.arrival)} bis ${fmtDate(request.departure)}`,
          html: buildEmailHtml({
            hotelName: hotel.name,
            accentColor: accent,
            title: 'Stripe-Zahlung bestätigt',
            preheader: `${request.firstname ?? ''} ${request.lastname} — ${fmtDate(request.arrival)}–${fmtDate(request.departure)}`,
            body: `
              ${buildInfoBlock('Status', '✅ Zahlung via Stripe eingegangen')}
              ${buildInfoBlock('Zeitraum', `${fmtDate(request.arrival)} — ${fmtDate(request.departure)} (${request.nights} Nächte)`)}
              ${buildInfoBlock('Gäste', `${request.adults} Erwachsene${request.children ? `, ${request.children} Kinder` : ''}`)}
              ${buildInfoBlock('Gast', `${request.firstname ?? ''} ${request.lastname} · ${request.email}`)}
              ${buildInfoBlock('Stripe Payment Intent', paymentIntentId)}
            `,
            footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchungs-ID: #${request.id}</p>`,
          }),
        });

        await resend.emails.send({
          from: getFromEmail(),
          to: request.email,
          subject: i18n.bookingSubject(hotel.name),
          html: buildEmailHtml({
            hotelName: hotel.name,
            accentColor: accent,
            title: i18n.bookingTitle,
            preheader: `${fmtDate(request.arrival, locale)} – ${fmtDate(request.departure, locale)}`,
            body: `
              <p style="font-size:15px;color:#374151;margin:0 0 16px;">${i18n.greeting(request.firstname ?? '')}</p>
              ${buildInfoBlock(i18n.period, `${fmtDate(request.arrival, locale)} — ${fmtDate(request.departure, locale)} (${i18n.nights(request.nights)})`)}
              ${buildInfoBlock(i18n.guests, i18n.adults(request.adults) + (request.children ? i18n.children(request.children) : ''))}
            `,
            footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchungs-ID: #${request.id}</p>`,
          }),
        });
      }
    } catch (emailErr) {
      console.error('[Stripe confirm] email error:', emailErr);
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (err) {
    console.error('[Stripe confirm] error:', err);
    return NextResponse.json({ success: false, message: 'Serverfehler.' }, { status: 500, headers: corsHeaders });
  }
}
