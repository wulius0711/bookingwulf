import { createPool } from './db';

const TEST_USER_EMAIL = 'playwright-test@bookingwulf.internal';
const TEST_HOTEL_SLUG = 'pw-test-hotel';

export default async function globalTeardown() {
  const pool = createPool();
  await pool.query(`DELETE FROM "AdminUser" WHERE email = $1`, [TEST_USER_EMAIL]);
  await pool.query(`DELETE FROM "Hotel" WHERE slug = $1`, [TEST_HOTEL_SLUG]);
  await pool.end();
}
