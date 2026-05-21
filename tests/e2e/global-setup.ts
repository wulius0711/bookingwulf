import { config } from 'dotenv';
import { resolve } from 'path';
import { hashPassword, createPool } from './db';

config({ path: resolve(process.cwd(), '.env.local') });

export const TEST_USER_EMAIL = 'playwright-test@bookingwulf.internal';
export const TEST_USER_PASSWORD = 'PlaywrightTest_123!';
export const TEST_HOTEL_SLUG = 'pw-test-hotel';
export const TEST_GUEST_EMAIL = 'playwright-guest@bookingwulf.internal';

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

  // Re-create test hotel cleanly (cascade deletes settings, apartments, requests, blocked ranges)
  await pool.query(`DELETE FROM "Hotel" WHERE slug = $1`, [TEST_HOTEL_SLUG]);

  const { rows: [{ id: testHotelId }] } = await pool.query(`
    INSERT INTO "Hotel" (name, slug, email, plan, "subscriptionStatus", "isActive", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, 'starter', 'active', true, NOW(), NOW())
    RETURNING id
  `, ['Playwright Test Hotel', TEST_HOTEL_SLUG, 'pw-test@bookingwulf.internal']);

  await pool.query(`
    INSERT INTO "HotelSettings" ("hotelId", "bankTransferEnabled", "bankAccountHolder", "bankIban", "bankBic", "createdAt", "updatedAt")
    VALUES ($1, true, $2, $3, $4, NOW(), NOW())
  `, [testHotelId, 'Playwright Test GmbH', 'AT611904300234573201', 'OPSKATWW']);

  await pool.query(`
    INSERT INTO "Apartment" ("hotelId", name, slug, "basePrice", "maxAdults", "isActive", "sortOrder", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, 100, 2, true, 0, NOW(), NOW())
  `, [testHotelId, 'Testzimmer', 'testzimmer']);

  await pool.end();

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (redisUrl && redisToken) {
    const del = (key: string) => fetch(`${redisUrl}/del/${key}`, { headers: { Authorization: `Bearer ${redisToken}` } });
    await Promise.all([
      del(`login:${TEST_USER_EMAIL}`),
      del(`booking:email:${TEST_GUEST_EMAIL}`),
      del('booking:ip:unknown'),
    ]);
  }
}
