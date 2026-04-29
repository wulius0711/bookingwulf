import { Resend } from 'resend';

let resendInstance: Resend | null = null;

export function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendInstance) resendInstance = new Resend(process.env.RESEND_API_KEY);
  return resendInstance;
}

export function getFromEmail(): string {
  return process.env.BOOKING_FROM_EMAIL || process.env.MAIL_FROM || 'booking@example.com';
}

type EmailTemplateOptions = {
  hotelName: string;
  accentColor?: string;
  title: string;
  preheader?: string;
  body: string;
  footer?: string;
  autoReplyText?: string;
};

export function buildEmailHtml(opts: EmailTemplateOptions): string {
  const accent = opts.accentColor || '#111827';
  const footer = opts.footer || '';

  const autoReply = opts.autoReplyText ?? 'Diese E-Mail wurde automatisch versendet. Bitte antworten Sie nicht direkt auf diese Nachricht.';

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${opts.title}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1a1a1a;-webkit-font-smoothing:antialiased;">
${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${opts.preheader}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

<!-- Header -->
<tr><td style="background:${accent};padding:28px 32px;">
<h1 style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">${opts.hotelName}</h1>
</td></tr>

<!-- Body -->
<tr><td style="padding:32px;">
<h2 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#111827;letter-spacing:-0.02em;">${opts.title}</h2>
${opts.body}
</td></tr>

<!-- Footer -->
<tr><td style="padding:20px 32px;background:#fafafa;border-top:1px solid #eee;">
${footer}
<p style="margin:8px 0 0;font-size:12px;color:#9ca3af;line-height:1.5;">
${autoReply}
</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

type PriceRow = { label: string; amount: string; bold?: boolean };

export function buildPriceTable(rows: PriceRow[], totalLabel: string, totalAmount: string, accent: string = '#111827'): string {
  const rowsHtml = rows.map(r => `
    <tr>
      <td style="padding:8px 0;font-size:14px;color:#374151;${r.bold ? 'font-weight:600;' : ''}">${r.label}</td>
      <td style="padding:8px 0;text-align:right;font-size:14px;color:#111827;${r.bold ? 'font-weight:600;' : ''}">${r.amount}</td>
    </tr>
  `).join('');

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;">
      ${rowsHtml}
      <tr>
        <td colspan="2" style="padding:0;"><div style="height:1px;background:#e5e7eb;margin:4px 0;"></div></td>
      </tr>
      <tr>
        <td style="padding:12px 0;font-size:16px;font-weight:700;color:${accent};">${totalLabel}</td>
        <td style="padding:12px 0;text-align:right;font-size:18px;font-weight:700;color:${accent};">${totalAmount}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:0;text-align:right;font-size:11px;color:#9ca3af;">inkl. MwSt.</td>
      </tr>
    </table>
  `;
}

export function buildInfoBlock(label: string, value: string): string {
  return `
    <div style="margin-bottom:14px;">
      <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">${label}</div>
      <div style="font-size:15px;color:#111827;line-height:1.5;">${value}</div>
    </div>
  `;
}

export function buildDivider(): string {
  return '<div style="height:1px;background:#e5e7eb;margin:20px 0;"></div>';
}

export function eur(n: number): string {
  return `\u20AC\u00A0${n.toFixed(2).replace('.', ',')}`;
}
