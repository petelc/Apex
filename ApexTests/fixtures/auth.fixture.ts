import { test as base, BrowserContext, Page } from '@playwright/test';
import * as path from 'path';

type AuthFixtures = {
  /** Page pre-authenticated as TenantAdmin */
  adminPage: Page;
  /** Page pre-authenticated as Manager */
  managerPage: Page;
  /** Page pre-authenticated as standard User */
  userPage: Page;
  /** Isolated admin context (for tests that need full context access) */
  adminContext: BrowserContext;
};

export const test = base.extend<AuthFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.resolve(__dirname, '../.auth/admin.json'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  managerPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.resolve(__dirname, '../.auth/manager.json'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  userPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.resolve(__dirname, '../.auth/user.json'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  adminContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.resolve(__dirname, '../.auth/admin.json'),
    });
    await use(context);
    await context.close();
  },
});

export { expect } from '@playwright/test';
