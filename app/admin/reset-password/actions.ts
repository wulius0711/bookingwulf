'use server';

import { prisma } from '@/src/lib/prisma';
import { hashPassword } from '@/src/lib/password';

export type ResetState = { error: string } | { success: true } | undefined;

export async function resetPassword(_state: ResetState, formData: FormData): Promise<ResetState> {
  const token = formData.get('token')?.toString().trim();
  const password = formData.get('password')?.toString();
  const confirm = formData.get('confirm')?.toString();

  if (!token) return { error: 'Ungültiger oder abgelaufener Link.' };
  if (!password || !confirm) return { error: 'Bitte Passwort eingeben und bestätigen.' };
  if (password.length < 8) return { error: 'Passwort muss mindestens 8 Zeichen lang sein.' };
  if (password !== confirm) return { error: 'Passwörter stimmen nicht überein.' };

  const user = await prisma.adminUser.findUnique({ where: { resetToken: token } });

  if (!user || !user.resetExpiresAt || new Date() > user.resetExpiresAt) {
    return { error: 'Dieser Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.' };
  }

  const passwordHash = await hashPassword(password);

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetExpiresAt: null },
  });

  return { success: true };
}
