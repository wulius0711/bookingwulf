import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3099',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  webServer: {
    // Dedicated test port — leaves the dev server on 3099 untouched.
    // First run compiles Next.js (~30s); subsequent runs reuse the server.
    command: 'npm run dev -- --port 3099',
    url: 'http://localhost:3099',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
