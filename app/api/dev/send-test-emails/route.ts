import { NextResponse } from 'next/server';
import { getResend, getFromEmail, buildEmailHtml } from '@/src/lib/email';

const LOGIN_URL = 'https://www.bookingwulf.com/admin/login';
const HOTEL_NAME = 'MSQ Vienna';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resend = getResend();
  if (!resend) return NextResponse.json({ error: 'No Resend key' }, { status: 500 });

  const to = 'werbesan@gmail.com';

  await resend.emails.send({
    from: getFromEmail(),
    to,
    subject: `[TEST] Danke für deinen bookingwulf-Test!`,
    html: buildEmailHtml({
      hotelName: 'bookingwulf',
      title: 'Danke für deinen Test!',
      body: `
        <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
          Hallo ${HOTEL_NAME},<br/><br/>
          vielen Dank, dass du bookingwulf getestet hast! Wir hoffen, du konntest dir einen guten Eindruck verschaffen.
        </p>
        <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
          Dein Feedback ist uns sehr wichtig — was hat funktioniert, was könnte besser sein? Schreib uns an <a href="mailto:support@bookingwulf.com" style="color:#374151;">support@bookingwulf.com</a>.
        </p>
        <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
          Wir würden uns freuen, dich als echten Kunden zu haben. Meld dich jederzeit, wenn du Fragen hast.
        </p>
        <p style="margin:0 0 12px;">
          <a href="${LOGIN_URL}" style="display:inline-block;padding:12px 28px;background:#111827;color:#fff;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;">
            Jetzt einloggen und Paket wählen →
          </a>
        </p>
      `,
    }),
  });

  await resend.emails.send({
    from: getFromEmail(),
    to,
    subject: `[TEST] Wie war dein bookingwulf-Test? Wir freuen uns auf dein Feedback!`,
    html: buildEmailHtml({
      hotelName: 'bookingwulf',
      title: 'Wie war dein Test?',
      body: `
        <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
          Hallo ${HOTEL_NAME},<br/><br/>
          nochmals vielen Dank für deinen Test! Falls du bookingwulf produktiv einsetzen möchtest, freuen wir uns sehr darauf, dich als Kunden zu haben.
        </p>
        <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:0 0 24px;">
          Nur zur Info: Dein Testkonto wird in 7 Tagen automatisch gelöscht. Falls du weitermachen möchtest, wähl einfach ein Paket.
        </p>
        <p style="margin:0 0 12px;">
          <a href="${LOGIN_URL}" style="display:inline-block;padding:12px 28px;background:#111827;color:#fff;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;">
            Jetzt einloggen und Paket wählen →
          </a>
        </p>
      `,
    }),
  });

  const deleteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/delete-account?token=DEMOTOKEN`;

  await resend.emails.send({
    from: getFromEmail(),
    to,
    subject: `[TEST] Deine bookingwulf-Testphase ist abgelaufen`,
    html: buildEmailHtml({
      hotelName: 'bookingwulf',
      title: 'Deine Testphase ist abgelaufen',
      body: `
        <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
          Hallo,<br/><br/>
          die kostenlose Testphase für <strong>${HOTEL_NAME}</strong> ist abgelaufen. Wir würden uns freuen, dich weiterhin dabei zu haben!
        </p>
        <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
          Melde dich an und wähle ein Paket — alle deine Daten sind noch vorhanden. So nimmst du Anfragen und Buchungen direkt über deine Website entgegen, ganz ohne Provision.
        </p>
        <p style="margin:0 0 12px;">
          <a href="${LOGIN_URL}" style="display:inline-block;padding:12px 28px;background:#111827;color:#fff;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;">
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

  await resend.emails.send({
    from: getFromEmail(),
    to,
    subject: `[TEST] Letzte Erinnerung — dein bookingwulf-Konto wird in 7 Tagen gelöscht`,
    html: buildEmailHtml({
      hotelName: 'bookingwulf',
      title: 'Letzte Erinnerung',
      body: `
        <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
          Hallo ${HOTEL_NAME},<br/><br/>
          schön, dass du bookingwulf ausprobiert hast — alle deine Daten sind noch da.
        </p>
        <div style="padding:14px 18px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;margin-bottom:24px;font-size:14px;color:#9a3412;line-height:1.6;">
          ⚠️ In <strong>7 Tagen</strong> wird dein Konto unwiderruflich gelöscht, wenn du nichts unternimmst.
        </div>
        <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
          Die Lösung ist einfach: Melde dich an und wähle ein Paket. So läuft die Buchung direkt über deine Website — ohne Provision für externe Plattformen.
        </p>
        <p style="margin:0 0 12px;">
          <a href="${LOGIN_URL}" style="display:inline-block;padding:12px 28px;background:#111827;color:#fff;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;">
            Jetzt einloggen und Paket wählen →
          </a>
        </p>
        <p style="font-size:13px;color:#9ca3af;line-height:1.6;margin:20px 0 0;">
          Du möchtest das Konto sofort löschen? <a href="${deleteUrl}" style="color:#6b7280;">Konto und alle Daten jetzt löschen</a>.
        </p>
      `,
    }),
  });

  return NextResponse.json({ ok: true });
}
