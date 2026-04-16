import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'

export type SessionPayload = {
  userId: number
  email: string
  role: string
}

const secret = new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET)
const SESSION_MS = 7 * 24 * 60 * 60 * 1000

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

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
