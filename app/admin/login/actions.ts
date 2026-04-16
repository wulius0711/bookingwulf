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

  let user
  try {
    user = await prisma.adminUser.findUnique({ where: { email } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { error: `DB-Fehler: ${msg}` }
  }

  if (!user || !user.isActive) {
    return { error: 'Ungültige Anmeldedaten.' }
  }

  let valid = false
  try {
    valid = await verifyPassword(password, user.passwordHash)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { error: `Passwort-Fehler: ${msg}` }
  }

  if (!valid) {
    return { error: 'Ungültige Anmeldedaten.' }
  }

  try {
    await createSession({ userId: user.id, email: user.email, role: user.role })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { error: `Session-Fehler: ${msg}` }
  }

  redirect('/admin')
}

export async function logout(): Promise<void> {
  await deleteSession()
  redirect('/admin/login')
}
