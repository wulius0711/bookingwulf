import { SignJWT, jwtVerify } from 'jose'

export type SessionPayload = {
  userId: number
  email: string
  role: string
}

function getSecret(): Uint8Array {
  const key = process.env.ADMIN_SESSION_SECRET
  if (!key || key.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET must be set and at least 32 characters long')
  }
  return new TextEncoder().encode(key)
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}
