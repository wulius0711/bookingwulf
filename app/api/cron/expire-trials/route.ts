import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getResend, getFromEmail, buildEmailHtml } from '@/src/lib/email';
import { randomBytes } from 'crypto';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://bookingwulf.com';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const day3ago = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const day7ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const day14ago = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const resend = getResend();
  let email1Sent = 0;
  let email2Sent = 0;
  let deleted = 0;

  // Step 1: Mark expired trialing hotels as inactive (covers users who never logged in)
  await prisma.hotel.updateMany({
    where: { subscriptionStatus: 'trialing', trialEndsAt: { lt: now } },
    data: { subscriptionStatus: 'inactive' },
  });

  // Step 2: Email 1 — day 3 after trial end
  const email1Hotels = await prisma.hotel.findMany({
    where: {
      subscriptionStatus: 'inactive',
      trialEndsAt: { not: null, lt: day3ago },
      trialEmail1SentAt: null,
      email: { not: null },
    },
    select: { id: true, name: true, email: true, isTest: true },
  });

  for (const hotel of email1Hotels) {
    const token = randomBytes(32).toString('hex');
    const tokenExpires = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000);
    const deleteUrl = `${BASE_URL}/delete-account?token=${token}`;
    const loginUrl = `${BASE_URL}/admin/login`;

    try {
      await resend?.emails.send({
        from: getFromEmail(),
        to: hotel.email!,
        subject: hotel.isTest
          ? 'Danke für deinen bookingwulf-Test!'
          : 'Deine bookingwulf-Testphase ist abgelaufen',
        html: buildEmailHtml({
          hotelName: 'bookingwulf',
          title: hotel.isTest ? 'Danke für deinen Test!' : 'Deine Testphase ist abgelaufen',
          body: hotel.isTest ? `
            <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
              Hallo ${hotel.name},<br/><br/>
              vielen Dank, dass du bookingwulf getestet hast! Wir hoffen, du konntest dir einen guten Eindruck verschaffen.
            </p>
            <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
              Dein Feedback ist uns sehr wichtig — was hat funktioniert, was könnte besser sein? Schreib uns an <a href="mailto:support@bookingwulf.com" style="color:#374151;">support@bookingwulf.com</a>.
            </p>
            <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
              Wir würden uns freuen, dich als echten Kunden zu haben. Meld dich jederzeit, wenn du Fragen hast.
            </p>
            <p style="margin:0 0 12px;">
              <a href="${loginUrl}" style="display:inline-block;padding:12px 28px;background:#111827;color:#fff;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;">
                Jetzt einloggen und Paket wählen →
              </a>
            </p>
          ` : `
            <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
              Hallo,<br/><br/>
              die kostenlose Testphase für <strong>${hotel.name}</strong> ist abgelaufen. Wir würden uns freuen, dich weiterhin dabei zu haben!
            </p>
            <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
              Melde dich an und wähle ein Paket — alle deine Daten sind noch vorhanden. So nimmst du Anfragen und Buchungen direkt über deine Website entgegen, ganz ohne Provision.
            </p>
            <p style="margin:0 0 12px;">
              <a href="${loginUrl}" style="display:inline-block;padding:12px 28px;background:#111827;color:#fff;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;">
                Jetzt einloggen →
              </a>
            </p>
            <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:20px 0 0;">
              In 4 Tagen senden wir dir eine letzte Erinnerung. Danach wird dein Konto nach weiteren 7 Tagen automatisch gelöscht, falls du nichts unternimmst.<br/>
              Möchtest du dein Konto lieber löschen lassen? <a href="${deleteUrl}" style="color:#6b7280;">Konto und alle Daten löschen</a>.
            </p>
          `,
        }),
      });

      await prisma.hotel.update({
        where: { id: hotel.id },
        data: { trialEmail1SentAt: now, deletionToken: token, deletionTokenExpiresAt: tokenExpires },
      });
      email1Sent++;
    } catch (e) {
      console.error(`expire-trials: email1 failed for hotel ${hotel.id}`, e);
    }
  }

  // Step 3: Email 2 — day 7 after trial end (final warning)
  const email2Hotels = await prisma.hotel.findMany({
    where: {
      subscriptionStatus: 'inactive',
      trialEndsAt: { not: null, lt: day7ago },
      trialEmail1SentAt: { not: null },
      trialEmail2SentAt: null,
      email: { not: null },
    },
    select: { id: true, name: true, email: true, isTest: true, deletionToken: true },
  });

  for (const hotel of email2Hotels) {
    const deleteUrl = hotel.deletionToken
      ? `${BASE_URL}/delete-account?token=${hotel.deletionToken}`
      : null;
    const loginUrl = `${BASE_URL}/admin/login`;

    try {
      await resend?.emails.send({
        from: getFromEmail(),
        to: hotel.email!,
        subject: hotel.isTest
          ? 'Wie war dein bookingwulf-Test? Wir freuen uns auf dein Feedback!'
          : 'Letzte Erinnerung — dein bookingwulf-Konto wird in 7 Tagen gelöscht',
        html: buildEmailHtml({
          hotelName: 'bookingwulf',
          title: hotel.isTest ? 'Wie war dein Test?' : 'Letzte Erinnerung',
          body: hotel.isTest ? `
            <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
              Hallo ${hotel.name},<br/><br/>
              nochmals vielen Dank für deinen Test! Falls du bookingwulf produktiv einsetzen möchtest, freuen wir uns sehr darauf, dich als Kunden zu haben.
            </p>
            <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:0 0 24px;">
              Nur zur Info: Dein Testkonto wird in 7 Tagen automatisch gelöscht. Falls du weitermachen möchtest, wähl einfach ein Paket.
            </p>
            <p style="margin:0 0 12px;">
              <a href="${loginUrl}" style="display:inline-block;padding:12px 28px;background:#111827;color:#fff;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;">
                Jetzt einloggen und Paket wählen →
              </a>
            </p>
          ` : `
            <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
              Hallo ${hotel.name},<br/><br/>
              schön, dass du bookingwulf ausprobiert hast — alle deine Daten sind noch da.
            </p>
            <div style="padding:14px 18px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;margin-bottom:24px;font-size:14px;color:#9a3412;line-height:1.6;">
              ⚠️ In <strong>7 Tagen</strong> wird dein Konto unwiderruflich gelöscht, wenn du nichts unternimmst.
            </div>
            <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
              Die Lösung ist einfach: Melde dich an und wähle ein Paket. So läuft die Buchung direkt über deine Website — ohne Provision für externe Plattformen.
            </p>
            <p style="margin:0 0 12px;">
              <a href="${loginUrl}" style="display:inline-block;padding:12px 28px;background:#111827;color:#fff;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;">
                Jetzt einloggen und Paket wählen →
              </a>
            </p>
            ${deleteUrl ? `
            <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:20px 0 0;">
              Du möchtest das Konto sofort löschen? <a href="${deleteUrl}" style="color:#6b7280;">Konto und alle Daten jetzt löschen</a>.
            </p>` : ''}
          `,
        }),
      });

      await prisma.hotel.update({
        where: { id: hotel.id },
        data: { trialEmail2SentAt: now },
      });
      email2Sent++;
    } catch (e) {
      console.error(`expire-trials: email2 failed for hotel ${hotel.id}`, e);
    }
  }

  // Step 4: Auto-delete — day 14, only if both warning emails were sent
  const toDelete = await prisma.hotel.findMany({
    where: {
      subscriptionStatus: 'inactive',
      trialEndsAt: { not: null, lt: day14ago },
      trialEmail1SentAt: { not: null },
      trialEmail2SentAt: { not: null },
    },
    select: { id: true },
  });

  for (const hotel of toDelete) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.adminUser.deleteMany({ where: { hotelId: hotel.id } });
        await tx.hotel.delete({ where: { id: hotel.id } });
      });
      deleted++;
    } catch (e) {
      console.error(`expire-trials: auto-delete failed for hotel ${hotel.id}`, e);
    }
  }

  // Step 5: Cancel abandoned pending_paypal / pending_stripe records older than 48 h
  const cutoff48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const { count: paymentsExpired } = await prisma.request.updateMany({
    where: {
      status: { in: ['pending_paypal', 'pending_stripe'] },
      createdAt: { lt: cutoff48h },
    },
    data: { status: 'cancelled' },
  });

  return NextResponse.json({ ok: true, email1Sent, email2Sent, deleted, paymentsExpired });
}
