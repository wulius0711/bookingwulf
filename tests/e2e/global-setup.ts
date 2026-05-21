import { config } from 'dotenv';
import { resolve } from 'path';
import { hashPassword, createPool } from './db';

config({ path: resolve(process.cwd(), '.env.local') });

export const TEST_USER_EMAIL = 'playwright-test@bookingwulf.internal';
export const TEST_USER_PASSWORD = 'PlaywrightTest_123!';

export default async function globalSetup() {
  const pool = createPool();
  const passwordHash = await hashPassword(TEST_USER_PASSWORD);

  await pool.query(`
    INSERT INTO "AdminUser" (email, "passwordHash", role, "isActive", "isEmailVerified", "sessionVersion", "createdAt", "updatedAt")
    VALUES ($1, $2, 'super_admin', true, true, 0, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE
      SET "passwordHash" = $2, role = 'super_admin', "isActive" = true,
          "isEmailVerified" = true, "sessionVersion" = 0, "updatedAt" = NOW()
  `, [TEST_USER_EMAIL, passwordHash]);

  await pool.end();

  // Clear rate-limit key so repeated test runs don't get locked out (limit: 5 attempts / 15 min)
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (redisUrl && redisToken) {
    await fetch(`${redisUrl}/del/login:${TEST_USER_EMAIL}`, {
      headers: { Authorization: `Bearer ${redisToken}` },
    });
  }
}
