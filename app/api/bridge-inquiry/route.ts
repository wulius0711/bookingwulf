import { NextResponse } from 'next/server';
import { getResend } from '@/src/lib/email';

export async function POST(req: Request) {
  try {
    const { name, email, switchDate } = await req.json();
    if (!name || !email) return NextResponse.json({ ok: false }, { status: 400 });

    const resend = getResend();
    if (resend) {
      await resend.emails.send({
        from: 'bookingwulf <noreply@bookingwulf.com>',
        to: 'support@bookingwulf.com',
        subject: `Bridge-Anfrage: ${name}`,
        text: `Name: ${name}\nE-Mail: ${email}\nWechsel ab: ${switchDate || '—'}`,
        replyTo: email,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
