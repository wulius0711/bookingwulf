'use server';

import { prisma } from '@/src/lib/prisma';
import { getResend, getFromEmail, buildEmailHtml } from '@/src/lib/email';
import { rateLimit } from '@/src/lib/rate-limit';
import { randomBytes } from 'crypto';
import { headers } from 'next/headers';

export type ForgotState = { error: string } | { success: true } | undefined;

export async function requestPasswordReset(_state: ForgotState, formData: FormData): Promise<ForgotState> {
  const email = formData.get('email')?.toString().trim().toLowerCase();
  if (!email) return { error: 'E-Mail ist erforderlich.' };

  const { ok } = await rateLimit(`forgot:${email}`, 3, 15 * 60 * 1000);
  if (!ok) return { success: true }; // Silently succeed to prevent enumeration

  // Always return success to prevent email enumeration
  const user = await prisma.adminUser.findUnique({ where: { email } });

  if (user && user.isActive) {
    const token = randomBytes(32).toString('hex');
    const resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { resetToken: token, resetExpiresAt },
    });

    const headerStore = await headers();
    const host = headerStore.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const resetUrl = `${protocol}://${host}/admin/reset-password?token=${token}`;

    try {
      const resend = getResend();
      if (resend) {
        await resend.emails.send({
          from: getFromEmail(),
          to: email,
          subject: 'Passwort zurücksetzen',
          html: buildEmailHtml({
            hotelName: 'bookingwulf',
            title: 'Passwort zurücksetzen',
            body: `
              <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
                Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.
                Klicken Sie auf den folgenden Link, um ein neues Passwort zu vergeben:
              </p>
              <p style="margin:0 0 24px;">
                <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:#111827;color:#fff;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">
                  Passwort zurücksetzen
                </a>
              </p>
              <p style="font-size:13px;color:#6b7280;line-height:1.5;">
                Dieser Link ist 1 Stunde gültig. Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.
              </p>
            `,
          }),
        });
      }
    } catch (e) {
      console.error('Password reset mail error:', e);
    }
  }

  return { success: true };
}
