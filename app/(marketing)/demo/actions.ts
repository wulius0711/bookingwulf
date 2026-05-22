'use server';

import { getResend } from '@/src/lib/email';

export type DemoState = { success: true; error?: never } | { success?: never; error: string } | undefined;

export async function requestDemo(_prev: DemoState, formData: FormData): Promise<DemoState> {
  const name    = (formData.get('name')    as string | null)?.trim() ?? '';
  const hotel   = (formData.get('hotel')   as string | null)?.trim() ?? '';
  const email   = (formData.get('email')   as string | null)?.trim() ?? '';
  const phone   = (formData.get('phone')   as string | null)?.trim() ?? '';
  const message = (formData.get('message') as string | null)?.trim() ?? '';

  if (!name || !hotel || !email) return { error: 'Bitte alle Pflichtfelder ausfüllen.' };

  const resend = getResend();
  if (!resend) return { error: 'E-Mail-Versand nicht konfiguriert.' };

  const body = `
Name: ${name}
Betrieb: ${hotel}
E-Mail: ${email}
Telefon: ${phone || '—'}

Nachricht:
${message || '—'}
  `.trim();

  const { error } = await resend.emails.send({
    from: 'bookingwulf <noreply@bookingwulf.com>',
    to: 'support@bookingwulf.com',
    subject: `Demo-Anfrage: ${hotel}`,
    text: body,
    replyTo: email,
  });

  if (error) return { error: 'Senden fehlgeschlagen. Bitte versuche es später erneut.' };
  return { success: true };
}
