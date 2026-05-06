import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getResend, getFromEmail, buildEmailHtml } from '@/src/lib/email';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}`;

  const hotelsWithFeature = await prisma.hotelSettings.findMany({
    where: { checkinEmailEnabled: true },
    select: { hotelId: true, checkinEmailDays: true },
  });

  let sent = 0;

  for (const hs of hotelsWithFeature) {
    const days = hs.checkinEmailDays ?? 3;
    const targetDate = new Date();
    targetDate.setHours(0, 0, 0, 0);
    targetDate.setDate(targetDate.getDate() + days);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const requests = await prisma.request.findMany({
      where: {
        hotelId: hs.hotelId,
        status: 'booked',
        email: { not: undefined },
        checkinEmailSentAt: null,
        arrival: { gte: targetDate, lt: nextDay },
      },
      include: {
        hotel: {
          select: {
            name: true,
            accentColor: true,
            emailTemplates: { where: { type: 'checkin_guest' } },
          },
        },
      },
    });

    for (const r of requests) {
      if (!r.email) continue;

      const template = r.hotel?.emailTemplates?.[0];
      const hotelName = r.hotel?.name ?? '';
      const accent = r.hotel?.accentColor ?? '#111827';
      const guestName = r.firstname || r.lastname;
      const fmt = (d: Date) => new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));
      const portalUrl = r.checkinToken ? `${base}/gast/${r.checkinToken}` : '';

      function fill(str: string) {
        return str
          .replace(/\{\{guestName\}\}/g, guestName)
          .replace(/\{\{guestLastName\}\}/g, r.lastname)
          .replace(/\{\{hotelName\}\}/g, hotelName)
          .replace(/\{\{arrival\}\}/g, fmt(r.arrival))
          .replace(/\{\{departure\}\}/g, fmt(r.departure))
          .replace(/\{\{nights\}\}/g, String(r.nights))
          .replace(/\{\{bookingId\}\}/g, String(r.id))
          .replace(/\{\{nukiCode\}\}/g, r.nukiCode ?? '')
          .replace(/\{\{portalUrl\}\}/g, portalUrl);
      }

      const subject = fill(template?.subject ?? `Ihre Check-in Infos — ${hotelName}`);
      const greeting = fill(template?.greeting ?? `Hallo ${guestName},`);
      const bodyText = fill(template?.body ?? '');
      const signoff = fill(template?.signoff ?? 'Mit freundlichen Grüßen');

      const bodyHtml = `
        <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 20px;">${greeting}</p>
        <p style="font-size:15px;color:#374151;line-height:1.8;margin:0 0 20px;white-space:pre-wrap;">${bodyText.replace(/\n/g, '<br/>')}</p>
        <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 4px;">${signoff},</p>
        <p style="font-size:15px;font-weight:700;color:#111827;margin:0 0 24px;">${hotelName}</p>
        ${portalUrl ? `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;text-align:center;"><p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Ihre Gästemappe</p><a href="${portalUrl}" style="font-size:14px;font-weight:700;color:${accent};text-decoration:none;word-break:break-all;">${portalUrl}</a></div>` : ''}
      `;

      try {
        const resend = getResend();
        if (resend) {
          await resend.emails.send({
            from: getFromEmail(),
            to: r.email,
            subject,
            html: buildEmailHtml({ hotelName, accentColor: accent, title: subject, preheader: `Check-in Infos für Ihren Aufenthalt vom ${fmt(r.arrival)}`, body: bodyHtml, autoReplyText: '' }),
          });
          await prisma.request.update({ where: { id: r.id }, data: { checkinEmailSentAt: new Date() } });
          sent++;
        }
      } catch (e) {
        console.error(`[checkin-email] Error for request ${r.id}:`, e);
      }
    }
  }

  console.log(`[checkin-email] Sent ${sent} email(s).`);
  return NextResponse.json({ ok: true, sent });
}
