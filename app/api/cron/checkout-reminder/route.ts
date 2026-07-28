import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getResend, getFromEmail, buildEmailHtml } from '@/src/lib/email';
import { resolveLang, getEmailTranslations, dateLocale } from '@/src/lib/email-i18n';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hotelsWithFeature = await prisma.hotelSettings.findMany({
    where: { checkoutReminderEnabled: true },
    select: { hotelId: true, checkoutTime: true, checkoutReminderText: true, checkoutReminderSubject: true, checkoutReminderBody: true },
  });

  let sent = 0;
  const sentIds: number[] = [];

  if (hotelsWithFeature.length > 0) {
    // Same departure window for every hotel — one batched findMany instead of one per hotel.
    // Per-hotel settings (checkoutTime, custom text) are looked up per request below.
    const settingsByHotel = new Map(hotelsWithFeature.map((hs) => [hs.hotelId, hs]));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const requests = await prisma.request.findMany({
      where: {
        hotelId: { in: hotelsWithFeature.map((hs) => hs.hotelId) },
        status: { in: ['booked', 'confirmed'] },
        checkoutReminderSentAt: null,
        departure: { gte: today, lt: tomorrow },
      },
      select: {
        id: true,
        hotelId: true,
        firstname: true,
        lastname: true,
        email: true,
        departure: true,
        language: true,
        hotel: { select: { name: true, accentColor: true } },
      },
    });

    for (const r of requests) {
      if (!r.email || r.hotelId === null) continue;
      const hs = settingsByHotel.get(r.hotelId)!;
      const hotelName = r.hotel?.name || 'Hotel';
      const lang = resolveLang(r.language);
      const T = getEmailTranslations(lang);
      const checkoutTime = hs.checkoutTime || (lang === 'de' ? '10:00 Uhr' : '10:00');
      const departureDate = new Intl.DateTimeFormat(dateLocale[lang], { day: '2-digit', month: '2-digit', year: 'numeric' }).format(r.departure);

      const subject = (hs.checkoutReminderSubject || T.checkoutSubjectDefault)
        .replace('{{hotelName}}', hotelName);
      const bodyText = (hs.checkoutReminderBody || T.checkoutBodyDefault)
        .replace('{{checkoutTime}}', checkoutTime)
        .replace('{{hotelName}}', hotelName);

      const instructionsBlock = hs.checkoutReminderText
        ? `<p style="font-size:14px;color:#374151;line-height:1.7;margin:16px 0 0;background:#f8fafc;border-radius:10px;padding:14px 16px;">${hs.checkoutReminderText.replace(/\n/g, '<br/>')}</p>`
        : '';

      try {
        const resend = getResend();
        if (resend) {
          await resend.emails.send({
            from: getFromEmail(),
            to: r.email,
            subject,
            html: buildEmailHtml({
              hotelName,
              accentColor: r.hotel?.accentColor || undefined,
              title: T.checkoutTitle,
              autoReplyText: T.autoReply,
              body: `
                <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 12px;">
                  ${T.greeting(r.firstname || r.lastname)}<br/><br/>
                  ${bodyText.replace(/\n/g, '<br/>')}
                </p>
                ${instructionsBlock}
              `,
              footer: `<p style="margin:0;font-size:12px;color:#6b7280;">${T.checkoutFooter(r.id, departureDate)}</p>`,
            }),
          });

          sentIds.push(r.id);
          sent++;
        }
      } catch (e) {
        console.error(`[checkout-reminder] Error for request ${r.id}:`, e);
      }
    }
  }

  if (sentIds.length > 0) {
    await prisma.request.updateMany({
      where: { id: { in: sentIds } },
      data: { checkoutReminderSentAt: new Date() },
    });
  }

  console.log(`[checkout-reminder] Sent ${sent} reminder(s).`);
  return NextResponse.json({ ok: true, sent });
}
