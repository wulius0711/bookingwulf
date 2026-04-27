import nodemailer from 'nodemailer';

export function getOutreachTransport() {
  const user = process.env.ZOHO_SMTP_USER;
  const pass = process.env.ZOHO_SMTP_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: 'smtp.zoho.eu',
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

export function buildOutreachEmail(betrieb: string, inhaber?: string | null): {
  subject: string;
  html: string;
  text: string;
} {
  const anrede = inhaber ? `Guten Tag ${inhaber},` : `Guten Tag,`;

  const text = `${anrede}

ich bin Wolfgang von bookingwulf – einem Buchungs-Widget speziell für kleine Hotels, Pensionen und Ferienwohnungen im deutschsprachigen Raum.

Das Widget lässt sich in wenigen Minuten auf der Website von ${betrieb} einbinden und ermöglicht Ihren Gästen direkte Online-Buchungen – ganz ohne Provision an Buchungsplattformen wie Booking.com.

Was bookingwulf bietet:
• Direktbuchungen ohne Vermittlungsgebühren
• Einfache Integration per Code-Schnipsel
• Automatische Bestätigungs-E-Mails an Gäste
• Kalender & Verfügbarkeitsverwaltung
• 14 Tage kostenlos testen – ohne Kreditkarte

Darf ich Ihnen kurz zeigen, wie das für ${betrieb} aussehen würde?

Freundliche Grüße
Wolfgang Heis

––
bookingwulf
www.bookingwulf.com
support@bookingwulf.com`;

  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a1a1a;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
<tr><td style="background:#111827;padding:24px 32px;">
  <span style="font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.02em;">bookingwulf</span>
</td></tr>
<tr><td style="padding:32px;font-size:15px;line-height:1.7;color:#374151;">
  <p style="margin:0 0 16px;">${anrede}</p>
  <p style="margin:0 0 16px;">ich bin Wolfgang von <strong>bookingwulf</strong> – einem Buchungs-Widget speziell für kleine Hotels, Pensionen und Ferienwohnungen im deutschsprachigen Raum.</p>
  <p style="margin:0 0 16px;">Das Widget lässt sich in wenigen Minuten auf der Website von <strong>${betrieb}</strong> einbinden und ermöglicht Ihren Gästen direkte Online-Buchungen – ganz ohne Provision an Buchungsplattformen wie Booking.com.</p>
  <p style="margin:0 0 8px;font-weight:600;">Was bookingwulf bietet:</p>
  <ul style="margin:0 0 20px;padding-left:20px;">
    <li style="margin-bottom:6px;">Direktbuchungen ohne Vermittlungsgebühren</li>
    <li style="margin-bottom:6px;">Einfache Integration per Code-Schnipsel</li>
    <li style="margin-bottom:6px;">Automatische Bestätigungs-E-Mails an Gäste</li>
    <li style="margin-bottom:6px;">Kalender &amp; Verfügbarkeitsverwaltung</li>
    <li style="margin-bottom:6px;"><strong>14 Tage kostenlos testen</strong> – ohne Kreditkarte</li>
  </ul>
  <p style="margin:0 0 24px;">Darf ich Ihnen kurz zeigen, wie das für <strong>${betrieb}</strong> aussehen würde?</p>
  <a href="https://www.bookingwulf.com" style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">bookingwulf ansehen →</a>
  <p style="margin:24px 0 0;color:#374151;">Freundliche Grüße<br/><strong>Wolfgang Heis</strong></p>
</td></tr>
<tr><td style="padding:20px 32px;background:#fafafa;border-top:1px solid #eee;font-size:12px;color:#9ca3af;">
  bookingwulf &nbsp;·&nbsp; <a href="https://www.bookingwulf.com" style="color:#9ca3af;">www.bookingwulf.com</a> &nbsp;·&nbsp; support@bookingwulf.com
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  return {
    subject: `Mehr Direktbuchungen für ${betrieb} – ohne Provision | bookingwulf`,
    html,
    text,
  };
}
