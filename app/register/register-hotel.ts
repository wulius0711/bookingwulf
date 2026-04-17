'use server';

import { prisma } from '@/src/lib/prisma';
import { hashPassword } from '@/src/lib/password';
import { PLANS, PlanKey } from '@/src/lib/plans';
import { createSession } from '@/src/lib/session';
import { getResend, getFromEmail, buildEmailHtml, buildDivider } from '@/src/lib/email';
import { redirect } from 'next/navigation';

export type RegisterState = { error: string } | undefined;

export async function registerHotel(
  _state: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
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

  const hotel = await prisma.hotel.create({
    data: {
      name: hotelName,
      slug,
      email,
      plan,
      subscriptionStatus: 'trialing',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      adminUsers: {
        create: { email, passwordHash, role: 'hotel_admin', isActive: true },
      },
    },
    include: { adminUsers: { take: 1 } },
  });

  const adminUser = hotel.adminUsers[0];
  await createSession({
    userId: adminUser.id,
    email: adminUser.email,
    role: adminUser.role,
    hotelId: hotel.id,
  });

  // Welcome email
  try {
    const resend = getResend();
    if (resend) {
      await resend.emails.send({
        from: getFromEmail(),
        to: email,
        subject: `Willkommen bei bookingwulf — Ihre Testphase hat begonnen`,
        html: buildEmailHtml({
          hotelName: 'bookingwulf',
          title: 'Willkommen bei bookingwulf!',
          body: `
            <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
              Hallo,<br/><br/>
              vielen Dank, dass Sie bookingwulf testen! Ihr Hotel <strong>${hotelName}</strong> wurde erfolgreich angelegt.
            </p>
            <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 20px;">
              Sie haben <strong>14 Tage</strong> kostenlosen Zugang zu allen Funktionen. In dieser Zeit können Sie:
            </p>
            <ul style="font-size:14px;color:#374151;line-height:1.8;margin:0 0 20px;padding-left:20px;">
              <li>Apartments mit Bildern und Preisen anlegen</li>
              <li>Das Buchungssystem auf Ihrer Website einbauen</li>
              <li>Design und Farben anpassen</li>
              <li>Buchungsanfragen entgegennehmen und verwalten</li>
            </ul>
            ${buildDivider()}
            <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 4px;">
              <strong>Testphase endet am:</strong> ${new Intl.DateTimeFormat('de-AT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(Date.now() + 14 * 86400000))}
            </p>
            <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0 0 20px;">
              Nach Ablauf können Sie ein Abonnement abschließen, um bookingwulf weiter zu nutzen.
            </p>
            <p style="font-size:15px;color:#374151;line-height:1.6;margin:0;">
              Bei Fragen stehen wir Ihnen jederzeit unter <strong>office@wulius.at</strong> zur Verfügung.
            </p>
          `,
        }),
      });
    }
  } catch (e) {
    console.error('Welcome mail error:', e);
  }

  redirect('/admin/onboarding');
}
