import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getResend, getFromEmail, buildEmailHtml } from '@/src/lib/email';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hotelsWithFeature = await prisma.hotelSettings.findMany({
    where: { checkoutReminderEnabled: true },
    select: { hotelId: true, checkoutTime: true, checkoutReminderText: true },
  });

  let sent = 0;

  for (const hs of hotelsWithFeature) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const requests = await prisma.request.findMany({
      where: {
        hotelId: hs.hotelId,
        status: { in: ['booked', 'confirmed'] },
        checkoutReminderSentAt: null,
        departure: { gte: today, lt: tomorrow },
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        departure: true,
        hotel: { select: { name: true, accentColor: true } },
      },
    });

    for (const r of requests) {
      if (!r.email) continue;
      const hotelName = r.hotel?.name || 'Hotel';
      const checkoutTime = hs.checkoutTime || '10:00 Uhr';
      const departureDate = new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(r.departure);

      const instructionsBlock = hs.checkoutReminderText
        ? `<p style="font-size:14px;color:#374151;line-height:1.7;margin:16px 0 0;background:#f8fafc;border-radius:10px;padding:14px 16px;">${hs.checkoutReminderText.replace(/\n/g, '<br/>')}</p>`
        : '';

      try {
        const resend = getResend();
        if (resend) {
          await resend.emails.send({
            from: getFromEmail(),
            to: r.email,
            subject: `Erinnerung Check-out heute — ${hotelName}`,
            html: buildEmailHtml({
              hotelName,
              accentColor: r.hotel?.accentColor || undefined,
              title: 'Auf Wiedersehen!',
              autoReplyText: 'Diese E-Mail wurde automatisch versendet.',
              body: `
                <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 12px;">
                  Hallo ${r.firstname || r.lastname},<br/><br/>
                  wir hoffen, du hattest einen schönen Aufenthalt in <strong>${hotelName}</strong>.
                  Heute ist dein Abreisetag — bitte hinterlasse das Zimmer bis <strong>${checkoutTime}</strong>.
                </p>
                ${instructionsBlock}
              `,
              footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchung #${r.id} · Abreise ${departureDate}</p>`,
            }),
          });

          await prisma.request.update({
            where: { id: r.id },
            data: { checkoutReminderSentAt: new Date() },
          });
          sent++;
        }
      } catch (e) {
        console.error(`[checkout-reminder] Error for request ${r.id}:`, e);
      }
    }
  }

  console.log(`[checkout-reminder] Sent ${sent} reminder(s).`);
  return NextResponse.json({ ok: true, sent });
}
