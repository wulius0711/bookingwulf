import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getPaypalAccessToken, capturePaypalOrder } from '@/src/lib/paypal';
import { getResend, getFromEmail, buildEmailHtml, buildInfoBlock } from '@/src/lib/email';
import { getEmailTranslations, type Lang } from '@/src/lib/email-i18n';

function fmtDate(d: Date, locale = 'de-AT'): string {
  return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

// Map email-i18n dateLocale strings (e.g. 'de-AT') to Intl locale strings
const LANG_TO_LOCALE: Record<Lang, string> = {
  de: 'de-AT',
  en: 'en-GB',
  it: 'it-IT',
  fr: 'fr-FR',
  nl: 'nl-NL',
  ru: 'ru-RU',
  pl: 'pl-PL',
  cs: 'cs-CZ',
  es: 'es-ES',
};

const VALID_LANGS = new Set<Lang>(['de', 'en', 'it', 'fr', 'nl', 'ru', 'pl', 'cs', 'es']);

function toLang(s: string): Lang {
  return VALID_LANGS.has(s as Lang) ? (s as Lang) : 'de';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const requestId = Number(searchParams.get('requestId'));
  const token = searchParams.get('token'); // PayPal order ID
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://bookingwulf.com';

  if (!requestId || !token) {
    return NextResponse.redirect(`${base}/booking-confirmed?status=error`);
  }

  try {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        hotel: {
          select: {
            id: true, name: true, email: true, accentColor: true,
            settings: { select: { paypalClientId: true, paypalClientSecret: true } },
          },
        },
      },
    });

    if (!request || request.status !== 'pending_paypal') {
      return NextResponse.redirect(`${base}/booking-confirmed?status=error`);
    }

    const { paypalClientId, paypalClientSecret } = request.hotel?.settings ?? {};
    if (!paypalClientId || !paypalClientSecret) {
      return NextResponse.redirect(`${base}/booking-confirmed?status=error`);
    }

    const accessToken = await getPaypalAccessToken(paypalClientId, paypalClientSecret);
    const { status, captureId } = await capturePaypalOrder(accessToken, token);

    if (status !== 'COMPLETED') {
      return NextResponse.redirect(`${base}/booking-confirmed?status=error`);
    }

    // Parse selected apartment IDs
    const apartmentIds = request.selectedApartmentIds
      .split(',').map(s => s.trim()).filter(Boolean).map(Number).filter(n => n > 0);

    // Update request to booked, save capture ID
    await prisma.request.update({
      where: { id: requestId },
      data: { status: 'booked', paypalOrderId: captureId },
    });

    // Block dates
    if (apartmentIds.length > 0) {
      await prisma.blockedRange.createMany({
        data: apartmentIds.map((apartmentId) => ({
          apartmentId,
          startDate: request.arrival,
          endDate: request.departure,
          type: 'booking',
          note: `Buchung #${request.id} — ${request.firstname ?? ''} ${request.lastname} (PayPal)`,
        })),
      });
    }

    // Send emails
    try {
      const resend = getResend();
      if (resend && request.hotel) {
        const hotel = request.hotel;
        const accent = hotel.accentColor || '#111827';
        const receiverEmail = hotel.email || process.env.BOOKING_RECEIVER_EMAIL!;
        const lang = toLang(request.language);
        const i18n = getEmailTranslations(lang);
        const locale = LANG_TO_LOCALE[lang];

        // Hotel notification
        await resend.emails.send({
          from: getFromEmail(),
          to: receiverEmail,
          subject: `PayPal-Zahlung eingegangen — Buchung #${request.id} — ${fmtDate(request.arrival)} bis ${fmtDate(request.departure)}`,
          html: buildEmailHtml({
            hotelName: hotel.name,
            accentColor: accent,
            title: 'PayPal-Zahlung bestätigt',
            preheader: `${request.firstname ?? ''} ${request.lastname} — ${fmtDate(request.arrival)}–${fmtDate(request.departure)}`,
            body: `
              ${buildInfoBlock('Status', '&#x2705; Zahlung via PayPal eingegangen')}
              ${buildInfoBlock('Zeitraum', `${fmtDate(request.arrival)} — ${fmtDate(request.departure)} (${request.nights} Nächte)`)}
              ${buildInfoBlock('Gäste', `${request.adults} Erwachsene${request.children ? `, ${request.children} Kinder` : ''}`)}
              ${buildInfoBlock('Gast', `${request.firstname ?? ''} ${request.lastname} · ${request.email}`)}
              ${buildInfoBlock('PayPal Capture ID', captureId)}
            `,
            footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchungs-ID: #${request.id}</p>`,
          }),
        });

        // Guest confirmation
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
      console.error('[PayPal capture] email error:', emailErr);
    }

    return NextResponse.redirect(`${base}/booking-confirmed?status=success&id=${requestId}`);
  } catch (err) {
    console.error('[PayPal capture] error:', err);
    return NextResponse.redirect(`${base}/booking-confirmed?status=error`);
  }
}
