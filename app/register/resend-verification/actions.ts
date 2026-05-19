'use server';

import { prisma } from '@/src/lib/prisma';
import { getResend, getFromEmail, buildEmailHtml } from '@/src/lib/email';
import { rateLimit } from '@/src/lib/rate-limit';
import { headers } from 'next/headers';
import { randomBytes } from 'crypto';

export type ResendState = { success: boolean; message: string } | undefined;

export async function resendVerification(
  _state: ResendState,
  formData: FormData,
): Promise<ResendState> {
  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
  const { ok } = await rateLimit(`resend-verify:${ip}`, 3, 60 * 60 * 1000);
  if (!ok) {
    return { success: false, message: 'Zu viele Versuche. Bitte warten Sie eine Stunde.' };
  }

  const email = formData.get('email')?.toString().trim().toLowerCase() ?? '';
  if (!email) return { success: false, message: 'Bitte E-Mail-Adresse eingeben.' };

  // Generic response for security — don't reveal whether email exists
  const genericSuccess: ResendState = {
    success: true,
    message: 'Falls ein unverifiziertes Konto existiert, wurde eine neue Bestätigungs-E-Mail gesendet.',
  };

  const user = await prisma.adminUser.findUnique({
    where: { email },
    select: { id: true, isEmailVerified: true },
  });

  if (!user || user.isEmailVerified) return genericSuccess;

  const resend = getResend();
  if (!resend) return { success: false, message: 'E-Mail-Versand ist momentan nicht verfügbar.' };

  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://bookingwulf.com';
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  try {
    await resend.emails.send({
      from: getFromEmail(),
      to: email,
      subject: 'bookingwulf — Neuer Bestätigungslink',
      html: buildEmailHtml({
        hotelName: 'bookingwulf',
        title: 'E-Mail-Adresse bestätigen',
        body: `
          <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
            Hallo,<br/><br/>
            hier ist Ihr neuer Bestätigungslink für bookingwulf.
          </p>
          <p style="margin:0 0 28px;">
            <a href="${verifyUrl}" style="display:inline-block;padding:12px 28px;background:#111827;color:#fff;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;">
              E-Mail bestätigen
            </a>
          </p>
          <p style="font-size:13px;color:#9ca3af;line-height:1.5;margin:0;">
            Dieser Link ist 24 Stunden gültig.
          </p>
        `,
      }),
    });
  } catch {
    return { success: false, message: 'E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es erneut.' };
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { emailVerifyToken: token, emailVerifyTokenExpiresAt: expires },
  });

  return genericSuccess;
}
