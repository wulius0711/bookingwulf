import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getPaypalAccessToken, capturePaypalOrder } from '@/src/lib/paypal';
import { getResend, getFromEmail, buildEmailHtml, buildInfoBlock } from '@/src/lib/email';
import { getEmailTranslations, type Lang } from '@/src/lib/email-i18n';
import { log } from '@/src/lib/logger';

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
            emailTemplates: { where: { type: 'booking_guest' } },
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
      log('payment.failed', { method: 'paypal', requestId, hotelId: request.hotel?.id, reason: status });
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
    log('payment.confirmed', { method: 'paypal', requestId, hotelId: request.hotel?.id });

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
        const hotelMailResult = await resend.emails.send({
          from: getFromEmail(),
          to: receiverEmail,
          subject: `Neue Buchung #${request.id} — PayPal-Zahlung bestätigt — ${fmtDate(request.arrival)} bis ${fmtDate(request.departure)}`,
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
        if (hotelMailResult.error) {
          log('email.error', { template: 'paypal_hotel', requestId, error: JSON.stringify(hotelMailResult.error) });
        }

        // Guest confirmation
        const guestTpl = hotel.emailTemplates?.[0];
        const fill = (s: string) => s
          .replaceAll('{{guestName}}', request.firstname ?? '')
          .replaceAll('{{guestLastName}}', request.lastname)
          .replaceAll('{{hotelName}}', hotel.name)
          .replaceAll('{{arrival}}', fmtDate(request.arrival, locale))
          .replaceAll('{{departure}}', fmtDate(request.departure, locale))
          .replaceAll('{{nights}}', String(request.nights))
          .replaceAll('{{bookingId}}', String(request.id));

        const guestSubject = guestTpl ? fill(guestTpl.subject) : i18n.bookingSubject(hotel.name);
        const guestGreeting = guestTpl?.greeting ? fill(guestTpl.greeting) : i18n.greeting(request.firstname ?? '');
        const guestBodyText = guestTpl?.body ? fill(guestTpl.body) : `${i18n.bookingBody} ${lang === 'de' ? 'Ihre Zahlung via PayPal wurde erfolgreich verarbeitet.' : 'Your PayPal payment has been successfully processed.'}`;
        const guestSignoff = guestTpl?.signoff ? fill(guestTpl.signoff) : i18n.signoff;

        const guestMailResult = await resend.emails.send({
          from: getFromEmail(),
          to: request.email,
          subject: guestSubject,
          html: buildEmailHtml({
            hotelName: hotel.name,
            accentColor: accent,
            title: i18n.bookingTitle,
            preheader: `${fmtDate(request.arrival, locale)} – ${fmtDate(request.departure, locale)}`,
            body: `
              <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
                ${guestGreeting}<br/><br/>
                <span style="white-space:pre-wrap;">${guestBodyText.replace(/\n/g, '<br/>')}</span>
              </p>
              ${buildInfoBlock(i18n.period, `${fmtDate(request.arrival, locale)} — ${fmtDate(request.departure, locale)} (${i18n.nights(request.nights)})`)}
              ${buildInfoBlock(i18n.guests, i18n.adults(request.adults) + (request.children ? i18n.children(request.children) : ''))}
              <p style="font-size:15px;color:#374151;line-height:1.6;margin:24px 0 0;">${guestSignoff},<br/><strong>${hotel.name}</strong></p>
            `,
            footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchungs-ID: #${request.id}</p>`,
          }),
        });
        if (guestMailResult.error) {
          log('email.error', { template: 'paypal_guest', requestId, error: JSON.stringify(guestMailResult.error) });
        }
      }
    } catch (emailErr) {
      console.error('[PayPal capture] email error:', emailErr);
      log('email.error', { template: 'paypal_confirmation', requestId, error: emailErr instanceof Error ? emailErr.message : String(emailErr) });
    }

    log('email.sent', { template: 'paypal_confirmation', requestId });
    return NextResponse.redirect(`${base}/booking-confirmed?status=success&id=${requestId}`);
  } catch (err) {
    console.error('[PayPal capture] error:', err);
    log('booking.error', { route: 'paypal/capture', error: err instanceof Error ? err.message : String(err) });
    return NextResponse.redirect(`${base}/booking-confirmed?status=error`);
  }
}
