import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify<string, string, number, Buffer>(scrypt)

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const key = await scryptAsync(password, salt, 64)
  return `${salt}:${key.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const key = await scryptAsync(password, salt, 64)
  const storedBuf = Buffer.from(hash, 'hex')
  return timingSafeEqual(key, storedBuf)
}
