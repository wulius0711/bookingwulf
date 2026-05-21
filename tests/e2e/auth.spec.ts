import { test, expect } from '@playwright/test';
import { createPool } from './db';
import { TEST_USER_EMAIL, TEST_USER_PASSWORD } from './global-setup';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/admin/login');
  await page.fill('input[name=email]', TEST_USER_EMAIL);
  await page.fill('input[name=password]', TEST_USER_PASSWORD);
  await page.click('button[type=submit]');
  await page.waitForURL('**/admin', { timeout: 10_000 });
}

test.describe('Admin Auth', () => {
  test('unauthenticated /admin redirects to login page', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL('**/admin/login');
    await expect(page.locator('input[name=email]')).toBeVisible();
  });

  test('wrong password shows error, no redirect', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[name=email]', TEST_USER_EMAIL);
    await page.fill('input[name=password]', 'wrongpassword');
    await page.click('button[type=submit]');
    await expect(page.locator('text=Ungültige Anmeldedaten')).toBeVisible();
    expect(page.url()).toContain('/admin/login');
  });

  test('valid login redirects to /admin dashboard', async ({ page }) => {
    await login(page);
    expect(page.url()).toMatch(/\/admin$/);
  });

  test('already logged in: /admin/login redirects to /admin', async ({ page }) => {
    await login(page);
    await page.goto('/admin/login');
    await page.waitForURL('**/admin', { timeout: 5_000 });
    expect(page.url()).toMatch(/\/admin$/);
  });

  test('stale JWT after logout causes no redirect loop', async ({ page, context }) => {
    const pool = createPool();

    try {
      // 1. Login — session cookie lands in the browser context
      await login(page);

      // 2. Simulate logout: increment sessionVersion (JWT stays valid, DB version doesn't match)
      await pool.query(
        `UPDATE "AdminUser" SET "sessionVersion" = "sessionVersion" + 1 WHERE email = $1`,
        [TEST_USER_EMAIL],
      );

      // 3. Use the API client to trace the redirect chain precisely (no JS, pure HTTP).
      //    /admin with stale cookie → must end up at /admin/login (200).
      //    maxRedirects:3 means: if there's a loop, this throws before 30+ browser redirects.
      const r1 = await context.request.get('/admin', { maxRedirects: 3 });
      expect(r1.url()).toContain('/admin/login');

      // 4. /admin/login with stale cookie → must return 200, NOT redirect to /admin.
      //    If login layout redirects to /admin (the bug), that's 1 redirect, then /admin
      //    redirects back to /admin/login — 2 total → throws → loop detected.
      const r2 = await context.request.get('/admin/login', { maxRedirects: 1 });
      expect(r2.url()).toContain('/admin/login');
      expect(r2.status()).toBe(200);
    } finally {
      await pool.query(
        `UPDATE "AdminUser" SET "sessionVersion" = 0 WHERE email = $1`,
        [TEST_USER_EMAIL],
      );
      await pool.end();
    }
  });
});
