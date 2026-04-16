import { SignJWT, jwtVerify } from 'jose'

export type SessionPayload = {
  userId: number
  email: string
  role: string
  hotelId: number | null
}

function getSecret(): Uint8Array {
  const key = process.env.ADMIN_SESSION_SECRET
  if (!key) throw new Error('ADMIN_SESSION_SECRET env variable is not set')
  return new TextEncoder().encode(key)
}

export async function encrypt(payload: SessionPayload): Promise<string> {
  try {
    return await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(getSecret())
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Session encryption failed: ${msg}`)
  }
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ['HS256'] })
    const p = payload as Record<string, unknown>
    return {
      userId: p.userId as number,
      email: p.email as string,
      role: p.role as string,
      hotelId: (p.hotelId as number | null | undefined) ?? null,
    }
  } catch {
    return null
  }
}
