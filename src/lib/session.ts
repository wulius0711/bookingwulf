import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { encrypt, decrypt, type SessionPayload } from './session-crypto'

export type { SessionPayload } from './session-crypto'
export { encrypt, decrypt }

const SESSION_MS = 7 * 24 * 60 * 60 * 1000

export async function createSession(data: SessionPayload): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_MS)
  const token = await encrypt(data)
  const cookieStore = await cookies()
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
}

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  const payload = await decrypt(token)
  if (!payload) redirect('/admin/login')
  return payload
})
