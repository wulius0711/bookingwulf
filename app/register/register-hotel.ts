'use server';

import { prisma } from '@/src/lib/prisma';
import { hashPassword } from '@/src/lib/password';
import { PLANS, PlanKey } from '@/src/lib/plans';
import { getResend, getFromEmail, buildEmailHtml } from '@/src/lib/email';
import { rateLimit } from '@/src/lib/rate-limit';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { randomBytes } from 'crypto';

export type RegisterState = { error: string } | undefined;

export async function registerHotel(
  _state: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  // Honeypot: bots fill this, humans don't
  const honeypot = formData.get('website')?.toString() ?? '';
  if (honeypot) return undefined; // silently ignore

  const ip = (await headers()).get('x-forwarded-for') ?? 'unknown';
  const { ok } = await rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!ok) return { error: 'Zu viele Registrierungsversuche. Bitte warten Sie eine Stunde.' };

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
  if (password.length > 128) return { error: 'Passwort darf maximal 128 Zeichen lang sein.' };
  if (password !== confirm) return { error: 'Passwörter stimmen nicht überein.' };
  if (!/^[a-z0-9-]+$/.test(slug)) return { error: 'Der Slug darf nur Kleinbuchstaben, Ziffern und Bindestriche enthalten.' };
  if (!(plan in PLANS)) return { error: 'Ungültiger Plan.' };

  // Check for an existing account with this email.
  // If it's an unverified zombie (token expired), clean it up and allow re-registration.
  const existingUser = await prisma.adminUser.findUnique({
    where: { email },
    select: { id: true, hotelId: true, isEmailVerified: true, emailVerifyTokenExpiresAt: true },
  });
  if (existingUser) {
    const isZombie = !existingUser.isEmailVerified &&
      existingUser.emailVerifyTokenExpiresAt &&
      new Date() > existingUser.emailVerifyTokenExpiresAt;
    if (isZombie) {
      await prisma.$transaction(async (tx) => {
        if (existingUser.hotelId) await tx.hotel.delete({ where: { id: existingUser.hotelId } });
        await tx.adminUser.delete({ where: { id: existingUser.id } });
      });
    } else {
      return { error: 'Diese E-Mail wird bereits verwendet.' };
    }
  }

  // Check slug after potential zombie cleanup (zombie hotel may have held this slug).
  const slugConflict = await prisma.hotel.findUnique({ where: { slug } });
  if (slugConflict) return { error: `Der Slug „${slug}" ist bereits vergeben.` };

  // Fail early if Resend is not configured — before any DB writes.
  const resend = getResend();
  if (!resend) {
    return { error: 'E-Mail-Versand ist momentan nicht verfügbar. Bitte kontaktieren Sie support@bookingwulf.com.' };
  }

  const passwordHash = await hashPassword(password);
  const verifyToken = randomBytes(32).toString('hex');
  const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://bookingwulf.com';
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${verifyToken}`;

  // Send verification email BEFORE creating the account.
  // If delivery fails, nothing is written to DB and the user gets an actionable error.
  try {
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
  } catch (e) {
    console.error('Verification mail error:', e);
    return { error: 'Bestätigungs-E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder kontaktieren Sie support@bookingwulf.com.' };
  }

  // Email delivered — create the account.
  // Catch P2002 (unique constraint) in case of a race condition on email or slug.
  try {
    await prisma.$transaction(async (tx) => {
      const created = await tx.hotel.create({
        data: {
          name: hotelName,
          slug,
          email,
          plan,
          subscriptionStatus: 'trialing',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          settings: { create: {} },
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
        include: { adminUsers: { select: { id: true } } },
      });
      await tx.adminUserHotel.create({
        data: { hotelId: created.id, userId: created.adminUsers[0].id },
      });
    });
  } catch (e) {
    if ((e as Record<string, unknown>)?.code === 'P2002') {
      return { error: 'Diese E-Mail wird bereits verwendet.' };
    }
    throw e;
  }

  redirect('/register/check-email');
}
