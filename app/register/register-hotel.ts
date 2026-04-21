'use server';

import { prisma } from '@/src/lib/prisma';
import { hashPassword } from '@/src/lib/password';
import { PLANS, PlanKey } from '@/src/lib/plans';
import { getResend, getFromEmail, buildEmailHtml } from '@/src/lib/email';
import { redirect } from 'next/navigation';
import { randomBytes } from 'crypto';

export type RegisterState = { error: string } | undefined;

export async function registerHotel(
  _state: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  // Honeypot: bots fill this, humans don't
  const honeypot = formData.get('website')?.toString() ?? '';
  if (honeypot) return undefined; // silently ignore

  const hotelName = formData.get('hotelName')?.toString().trim() ?? '';
  const slug = formData.get('slug')?.toString().trim().toLowerCase().replace(/\s+/g, '-') ?? '';
  const email = formData.get('email')?.toString().trim().toLowerCase() ?? '';
  const password = formData.get('password')?.toString() ?? '';
  const confirm = formData.get('confirm')?.toString() ?? '';
  const plan = (formData.get('plan')?.toString() ?? 'starter') as PlanKey;

  if (!hotelName || !slug || !email || !password || !confirm) {
    return { error: 'Alle Felder sind erforderlich.' };
  }
  if (password.length < 8) return { error: 'Passwort muss mindestens 8 Zeichen lang sein.' };
  if (password !== confirm) return { error: 'Passwörter stimmen nicht überein.' };
  if (!(plan in PLANS)) return { error: 'Ungültiger Plan.' };

  const slugConflict = await prisma.hotel.findUnique({ where: { slug } });
  if (slugConflict) return { error: `Der Slug „${slug}" ist bereits vergeben.` };

  const emailConflict = await prisma.adminUser.findUnique({ where: { email } });
  if (emailConflict) return { error: 'Diese E-Mail wird bereits verwendet.' };

  const passwordHash = await hashPassword(password);
  const verifyToken = randomBytes(32).toString('hex');
  const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await prisma.hotel.create({
    data: {
      name: hotelName,
      slug,
      email,
      plan,
      subscriptionStatus: 'trialing',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      adminUsers: {
        create: {
          email,
          passwordHash,
          role: 'hotel_admin',
          isActive: true,
          isEmailVerified: false,
          emailVerifyToken: verifyToken,
          emailVerifyTokenExpiresAt: verifyExpires,
        },
      },
    },
  });

  // Send verification email
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://bookingwulf.com';
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${verifyToken}`;

  try {
    const resend = getResend();
    if (resend) {
      await resend.emails.send({
        from: getFromEmail(),
        to: email,
        subject: 'bookingwulf — Bitte bestätigen Sie Ihre E-Mail-Adresse',
        html: buildEmailHtml({
          hotelName: 'bookingwulf',
          title: 'E-Mail-Adresse bestätigen',
          body: `
            <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
              Hallo,<br/><br/>
              vielen Dank für Ihre Registrierung bei bookingwulf! Bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr Konto zu aktivieren.
            </p>
            <p style="margin:0 0 28px;">
              <a href="${verifyUrl}" style="display:inline-block;padding:12px 28px;background:#111827;color:#fff;border-radius:8px;font-size:15px;font-weight:600;text-decoration:none;">
                E-Mail bestätigen
              </a>
            </p>
            <p style="font-size:13px;color:#9ca3af;line-height:1.5;margin:0;">
              Dieser Link ist 24 Stunden gültig. Falls Sie sich nicht registriert haben, können Sie diese E-Mail ignorieren.
            </p>
          `,
        }),
      });
    }
  } catch (e) {
    console.error('Verification mail error:', e);
  }

  redirect('/register/check-email');
}
