import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getResend, getFromEmail, buildEmailHtml } from '@/src/lib/email';

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

  for (const hs of hotelsWithFeature) {
    const reminderDays = hs.preArrivalReminderDays ?? 3;
    const targetDate = new Date();
    targetDate.setHours(0, 0, 0, 0);
    targetDate.setDate(targetDate.getDate() + reminderDays);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const requests = await prisma.request.findMany({
      where: {
        hotelId: hs.hotelId,
        status: 'booked',
        checkinToken: { not: null },
        checkinCompletedAt: null,
        checkinReminderSentAt: null,
        arrival: { gte: targetDate, lt: nextDay },
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        arrival: true,
        departure: true,
        checkinToken: true,
        hotel: { select: { name: true, accentColor: true } },
      },
    });

    for (const r of requests) {
      if (!r.email || !r.checkinToken) continue;
      const hotelName = r.hotel?.name || 'Hotel';
      const checkinUrl = `${base}/checkin/${r.checkinToken}`;
      const arrivalDate = new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(r.arrival);

      try {
        const resend = getResend();
        if (resend) {
          await resend.emails.send({
            from: getFromEmail(),
            to: r.email,
            subject: `Online Check-in — ${hotelName}`,
            html: buildEmailHtml({
              hotelName,
              accentColor: r.hotel?.accentColor || undefined,
              title: 'Online Check-in',
              autoReplyText: 'Diese E-Mail wurde automatisch versendet.',
              body: `
                <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
                  Hallo ${r.firstname || r.lastname},<br/><br/>
                  Ihr Aufenthalt in <strong>${hotelName}</strong> beginnt am <strong>${arrivalDate}</strong>.
                  Bitte füllen Sie vorab das Online Check-in Formular aus — das spart Zeit bei der Ankunft.
                </p>
                <div style="margin-top:24px;">
                  <a href="${checkinUrl}" style="display:inline-block;padding:13px 28px;background:${r.hotel?.accentColor || '#111827'};color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;">
                    Jetzt einchecken →
                  </a>
                </div>
              `,
              footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchung #${r.id}</p>`,
            }),
          });

          await prisma.request.update({
            where: { id: r.id },
            data: { checkinReminderSentAt: new Date() },
          });
          sent++;
        }
      } catch (e) {
        console.error(`[pre-arrival-reminder] Error for request ${r.id}:`, e);
      }
    }
  }

  console.log(`[pre-arrival-reminder] Sent ${sent} reminder(s).`);
  return NextResponse.json({ ok: true, sent });
}
