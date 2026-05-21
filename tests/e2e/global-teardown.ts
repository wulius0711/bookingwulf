import { createPool } from './db';

const TEST_USER_EMAIL = 'playwright-test@bookingwulf.internal';

export default async function globalTeardown() {
  const pool = createPool();
  await pool.query(`DELETE FROM "AdminUser" WHERE email = $1`, [TEST_USER_EMAIL]);
  await pool.end();
}
