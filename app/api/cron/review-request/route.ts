import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getResend, getFromEmail, buildEmailHtml } from '@/src/lib/email';
import { hasPlanAccess } from '@/src/lib/plan-gates';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hotelsWithFeature = await prisma.hotelSettings.findMany({
    where: { reviewRequestEnabled: true },
    select: {
      hotelId: true,
      reviewRequestDays: true,
      reviewRequestLink: true,
      hotel: { select: { plan: true } },
    },
  });

  let sent = 0;

  for (const hs of hotelsWithFeature) {
    if (!hasPlanAccess(hs.hotel?.plan ?? 'starter', 'pro')) continue;
    if (!hs.reviewRequestLink) continue;

    const days = hs.reviewRequestDays ?? 2;
    const targetDate = new Date();
    targetDate.setHours(0, 0, 0, 0);
    targetDate.setDate(targetDate.getDate() - days);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const requests = await prisma.request.findMany({
      where: {
        hotelId: hs.hotelId,
        status: { in: ['booked', 'confirmed'] },
        reviewRequestSentAt: null,
        departure: { gte: targetDate, lt: nextDay },
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
      const reviewUrl = hs.reviewRequestLink;

      try {
        const resend = getResend();
        if (resend) {
          await resend.emails.send({
            from: getFromEmail(),
            to: r.email,
            subject: `Wie war dein Aufenthalt? — ${hotelName}`,
            html: buildEmailHtml({
              hotelName,
              accentColor: r.hotel?.accentColor || undefined,
              title: 'Danke für deinen Besuch!',
              autoReplyText: 'Diese E-Mail wurde automatisch versendet.',
              body: `
                <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 16px;">
                  Hallo ${r.firstname || r.lastname},<br/><br/>
                  wir hoffen, es hat dir bei uns gefallen! Wenn du einen Moment Zeit hast,
                  würden wir uns sehr über eine kurze Bewertung freuen — das hilft uns sehr
                  und anderen Gästen bei ihrer Entscheidung.
                </p>
                <div style="margin-top:24px;">
                  <a href="${reviewUrl}" style="display:inline-block;padding:13px 28px;background:${r.hotel?.accentColor || '#111827'};color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;">
                    Jetzt bewerten →
                  </a>
                </div>
                <p style="font-size:13px;color:#9ca3af;margin:20px 0 0;">
                  Es dauert nur eine Minute — vielen Dank!
                </p>
              `,
              footer: `<p style="margin:0;font-size:12px;color:#6b7280;">Buchung #${r.id}</p>`,
            }),
          });

          await prisma.request.update({
            where: { id: r.id },
            data: { reviewRequestSentAt: new Date() },
          });
          sent++;
        }
      } catch (e) {
        console.error(`[review-request] Error for request ${r.id}:`, e);
      }
    }
  }

  console.log(`[review-request] Sent ${sent} review request(s).`);
  return NextResponse.json({ ok: true, sent });
}
