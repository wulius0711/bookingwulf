import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getResend, getFromEmail, buildEmailHtml, buildInfoBlock } from '@/src/lib/email';
import { log } from '@/src/lib/logger';

const fmt = (d: Date) => new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const pending = await prisma.request.findMany({
    where: {
      status: { in: ['pending_paypal', 'pending_stripe'] },
      createdAt: { lt: thirtyMinutesAgo },
      paymentReminderSentAt: null,
    },
    include: {
      hotel: { select: { id: true, name: true, email: true, accentColor: true } },
    },
  });

  const resend = getResend();
  let sent = 0;
  const sentIds: number[] = [];

  for (const request of pending) {
    if (!resend || !request.hotel?.email) continue;

    const base = process.env.NEXT_PUBLIC_BASE_URL || 'https://bookingwulf.com';
    const method = request.status === 'pending_paypal' ? 'PayPal' : 'Kreditkarte (Stripe)';
    const accent = request.hotel.accentColor || '#111827';

    try {
      await resend.emails.send({
        from: getFromEmail(),
        to: request.hotel.email,
        subject: `Zahlung ausstehend — Buchung #${request.id} von ${request.firstname ?? ''} ${request.lastname}`,
        html: buildEmailHtml({
          hotelName: request.hotel.name,
          accentColor: accent,
          title: 'Zahlung nicht abgeschlossen',
          preheader: `${request.firstname ?? ''} ${request.lastname} — ${fmt(request.arrival)}–${fmt(request.departure)}`,
          body: `
            <p style="font-size:15px;color:#374151;margin:0 0 16px;">
              Ein Gast hat den Buchungsvorgang begonnen, aber die Zahlung nicht abgeschlossen.
            </p>
            ${buildInfoBlock('Gast', `${request.firstname ?? ''} ${request.lastname} · ${request.email}`)}
            ${buildInfoBlock('Zeitraum', `${fmt(request.arrival)} — ${fmt(request.departure)} (${request.nights} Nächte)`)}
            ${buildInfoBlock('Zahlungsart', method)}
            ${buildInfoBlock('Buchungs-ID', `#${request.id}`)}
            <p style="font-size:14px;color:#374151;margin:16px 0 0;">
              Sie können die Buchung im Admin <a href="${base}/admin/requests/${request.id}" style="color:${accent};">direkt aufrufen</a>, den Gast kontaktieren und manuell bestätigen oder stornieren.
            </p>
          `,
        }),
      });

      sentIds.push(request.id);
      log('payment.reminder_sent', { requestId: request.id, hotelId: request.hotel.id, method });
      sent++;
    } catch (err) {
      log('payment.reminder_error', { requestId: request.id, error: err instanceof Error ? err.message : String(err) });
    }
  }

  if (sentIds.length > 0) {
    await prisma.request.updateMany({
      where: { id: { in: sentIds } },
      data: { paymentReminderSentAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true, sent });
}
