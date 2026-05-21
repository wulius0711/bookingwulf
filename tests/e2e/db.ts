import { config } from 'dotenv';
import { resolve } from 'path';
import { Pool } from 'pg';
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

config({ path: resolve(process.cwd(), '.env.local') });

const scryptAsync = promisify<string, string, number, Buffer>(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const key = await scryptAsync(password, salt, 64);
  return `${salt}:${key.toString('hex')}`;
}

export function createPool() {
  return new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
    max: 1,
  });
}
