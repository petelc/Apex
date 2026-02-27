import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  globalSetup: './global-setup.ts',

  // Auto-start the Vite dev server if not already running
  webServer: {
    command: 'npm run dev',
    cwd: path.resolve(__dirname, '../ApexApp'),
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 30_000,
  },

  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    // Headed by default in dev; set CI=true for headless
    headless: process.env.CI === 'true',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 720 },
    // Self-signed cert on local API — safe to ignore locally
    ignoreHTTPSErrors: true,
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    // ─── Unauthenticated (auth tests only) ───────────────────────────────────
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/auth/**/*.spec.ts',
    },

    // ─── Authenticated as TenantAdmin ─────────────────────────────────────────
    {
      name: 'chromium-admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/admin.json',
      },
      testIgnore: '**/auth/**/*.spec.ts',
    },

    // ─── Authenticated as Manager ─────────────────────────────────────────────
    {
      name: 'chromium-manager',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/manager.json',
      },
      testMatch: '**/manager/**/*.spec.ts',
    },

    // ─── Authenticated as User ────────────────────────────────────────────────
    {
      name: 'chromium-user',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/user.json',
      },
      testMatch: '**/user/**/*.spec.ts',
    },

    // ─── Cross-browser smoke (admin state) ────────────────────────────────────
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: '.auth/admin.json',
      },
      testMatch: '**/dashboard/**/*.spec.ts',
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: '.auth/admin.json',
      },
      testMatch: '**/dashboard/**/*.spec.ts',
    },
  ],
});
