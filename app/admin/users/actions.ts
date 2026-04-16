'use server';

import { prisma } from '@/src/lib/prisma';
import { hashPassword } from '@/src/lib/password';
import { verifySession } from '@/src/lib/session';
import { redirect } from 'next/navigation';

export type CreateUserState = { error?: string } | undefined;

export async function createAdminUser(
  _state: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  const session = await verifySession();
  if (session.role !== 'super_admin') return { error: 'Zugriff verweigert.' };

  const email = formData.get('email')?.toString().trim().toLowerCase();
  const password = formData.get('password')?.toString();
  const confirm = formData.get('confirm')?.toString();
  const role = formData.get('role')?.toString() || 'hotel_admin';
  const hotelIdRaw = formData.get('hotelId')?.toString().trim();
  const hotelId = hotelIdRaw ? Number(hotelIdRaw) : null;

  if (!email || !password || !confirm) {
    return { error: 'Alle Felder sind erforderlich.' };
  }
  if (password.length < 8) {
    return { error: 'Passwort muss mindestens 8 Zeichen lang sein.' };
  }
  if (password !== confirm) {
    return { error: 'Passwörter stimmen nicht überein.' };
  }
  if (role === 'hotel_admin' && !hotelId) {
    return { error: 'Bitte ein Hotel auswählen.' };
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    return { error: 'Diese E-Mail-Adresse wird bereits verwendet.' };
  }

  const passwordHash = await hashPassword(password);

  await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      role,
      hotelId: role === 'hotel_admin' ? hotelId : null,
    },
  });

  redirect('/admin/users');
}
