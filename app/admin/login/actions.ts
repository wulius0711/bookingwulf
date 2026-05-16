'use server'
import { redirect } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'
import { verifyPassword } from '@/src/lib/password'
import { createSession, deleteSession } from '@/src/lib/session'
import { rateLimit } from '@/src/lib/rate-limit'

export type LoginState = { error: string } | { success: true } | undefined

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email')?.toString().trim().toLowerCase()
  const password = formData.get('password')?.toString()

  if (!email || !password) {
    return { error: 'E-Mail und Passwort sind erforderlich.' }
  }

  const { ok } = await rateLimit(`login:${email}`, 5, 15 * 60 * 1000);
  if (!ok) return { error: 'Zu viele Anmeldeversuche. Bitte warten Sie 15 Minuten.' }

  const user = await prisma.adminUser.findUnique({ where: { email } })

  if (!user || !user.isActive) {
    return { error: 'Ungültige Anmeldedaten.' }
  }

  // Only block users created after email verification was introduced (emailVerifyToken was set on creation)
  if (!user.isEmailVerified && user.emailVerifyToken !== null) {
    return { error: 'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse. Prüfen Sie Ihr Postfach.' }
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return { error: 'Ungültige Anmeldedaten.' }
  }

  // Load primary hotel from join table, fall back to legacy hotelId
  const userHotels = await prisma.adminUserHotel.findMany({
    where: { userId: user.id },
    orderBy: { hotelId: 'asc' },
    take: 1,
    select: { hotelId: true },
  });
  const primaryHotelId = userHotels[0]?.hotelId ?? user.hotelId ?? null;

  await createSession({ userId: user.id, email: user.email, role: user.role, hotelId: primaryHotelId })

  // redirect() after createSession causes white screen because cookie change
  // invalidates the client router cache within the same /admin layout.
  // Return success and let the client do a full page navigation.
  return { success: true }
}

export async function logout(): Promise<void> {
  await deleteSession()
  redirect('/admin/login')
}
