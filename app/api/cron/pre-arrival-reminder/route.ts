import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getResend, getFromEmail, buildEmailHtml } from '@/src/lib/email';
import { resolveLang, getEmailTranslations, dateLocale } from '@/src/lib/email-i18n';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}`;

  // Find all hotels with pre-arrival enabled
  const hotelsWithFeature = await prisma.hotelSettings.findMany({
    where: { preArrivalEnabled: true },
    select: { hotelId: true, preArrivalReminderDays: true },
  });

  let sent = 0;
  const sentIds: number[] = [];

  if (hotelsWithFeature.length > 0) {
    // Each hotel picks its own reminder offset (preArrivalReminderDays), so the target arrival
    // window differs per hotel — encoded as one OR'd findMany instead of a query per hotel.
    const dateWindows = hotelsWithFeature.map((hs) => {
      const reminderDays = hs.preArrivalReminderDays ?? 3;
      const targetDate = new Date();
      targetDate.setHours(0, 0, 0, 0);
      targetDate.setDate(targetDate.getDate() + reminderDays);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      return { hotelId: hs.hotelId, arrival: { gte: targetDate, lt: nextDay } };
    });

    const requests = await prisma.request.findMany({
      where: {
        status: 'booked',
        checkinToken: { not: null },
        checkinCompletedAt: null,
        checkinReminderSentAt: null,
        OR: dateWindows,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        arrival: true,
        departure: true,
        checkinToken: true,
        language: true,
        hotel: { select: { name: true, accentColor: true } },
      },
    });

    for (const r of requests) {
      if (!r.email || !r.checkinToken) continue;
      const hotelName = r.hotel?.name || 'Hotel';
      const checkinUrl = `${base}/checkin/${r.checkinToken}`;
      const lang = resolveLang(r.language);
      const T = getEmailTranslations(lang);
      const arrivalDate = new Intl.DateTimeFormat(dateLocale[lang], { day: '2-digit', month: '2-digit', year: 'numeric' }).format(r.arrival);

      try {
        const resend = getResend();
        if (resend) {
          await resend.emails.send({
            from: getFromEmail(),
            to: r.email,
            subject: T.preArrivalSubject(hotelName),
            html: buildEmailHtml({
              hotelName,
              accentColor: r.hotel?.accentColor || undefined,
              title: T.preArrivalTitle,
              autoReplyText: T.autoReply,
              body: `
                <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
                  ${T.greeting(r.firstname || r.lastname)}<br/><br/>
                  ${T.preArrivalBody(hotelName, arrivalDate)}
                </p>
                <div style="margin-top:24px;">
                  <a href="${checkinUrl}" style="display:inline-block;padding:13px 28px;background:${r.hotel?.accentColor || '#111827'};color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;">
                    ${T.preArrivalButton}
                  </a>
                </div>
              `,
              footer: `<p style="margin:0;font-size:12px;color:#6b7280;">${T.preArrivalFooter(r.id)}</p>`,
            }),
          });

          sentIds.push(r.id);
          sent++;
        }
      } catch (e) {
        console.error(`[pre-arrival-reminder] Error for request ${r.id}:`, e);
      }
    }
  }

  if (sentIds.length > 0) {
    await prisma.request.updateMany({
      where: { id: { in: sentIds } },
      data: { checkinReminderSentAt: new Date() },
    });
  }

  console.log(`[pre-arrival-reminder] Sent ${sent} reminder(s).`);
  return NextResponse.json({ ok: true, sent });
}
