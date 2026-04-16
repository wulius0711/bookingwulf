'use server';

import { prisma } from '@/src/lib/prisma';
import { hashPassword } from '@/src/lib/password';
import { PLANS, PlanKey } from '@/src/lib/plans';
import { createSession } from '@/src/lib/session';
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

  redirect('/admin');
}
