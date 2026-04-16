'use server'
import { redirect } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'
import { verifyPassword } from '@/src/lib/password'
import { createSession, deleteSession } from '@/src/lib/session'

export type LoginState = { error?: string } | undefined

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email')?.toString().trim().toLowerCase()
  const password = formData.get('password')?.toString()

  if (!email || !password) {
    return { error: 'E-Mail und Passwort sind erforderlich.' }
  }

  const user = await prisma.adminUser.findUnique({ where: { email } })

  if (!user || !user.isActive) {
    return { error: 'Ungültige Anmeldedaten.' }
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return { error: 'Ungültige Anmeldedaten.' }
  }

  await createSession({ userId: user.id, email: user.email, role: user.role, hotelId: user.hotelId ?? null })
  redirect('/admin')
}

export async function logout(): Promise<void> {
  await deleteSession()
  redirect('/admin/login')
}
