'use server'
import { redirect } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'
import { hashPassword } from '@/src/lib/password'
import { createSession } from '@/src/lib/session'

export type SetupState = { error?: string } | undefined

export async function createFirstAdmin(
  state: SetupState,
  formData: FormData
): Promise<SetupState> {
  const existing = await prisma.adminUser.count()
  if (existing > 0) {
    redirect('/admin/login')
  }

  const email = formData.get('email')?.toString().trim().toLowerCase()
  const password = formData.get('password')?.toString()
  const confirm = formData.get('confirm')?.toString()

  if (!email || !password || !confirm) {
    return { error: 'Alle Felder sind erforderlich.' }
  }
  if (password.length < 8) {
    return { error: 'Das Passwort muss mindestens 8 Zeichen lang sein.' }
  }
  if (password !== confirm) {
    return { error: 'Die Passwörter stimmen nicht überein.' }
  }

  const passwordHash = await hashPassword(password)
  const user = await prisma.adminUser.create({
    data: { email, passwordHash, role: 'super_admin' },
  })

  await createSession({ userId: user.id, email: user.email, role: user.role, hotelId: null })
  redirect('/admin')
}
