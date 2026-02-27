import { test, expect } from '@playwright/test';
import { DashboardPage } from '../../pages/DashboardPage';

// Uses chromium-admin project (storageState: .auth/admin.json)
// Also smoke-tested against firefox and webkit (per playwright.config.ts)

test.describe('Dashboard', () => {
  test('loads without errors', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await expect(page).toHaveURL(/\/dashboard/);
    // No JS error dialogs
    await expect(page.getByRole('alert').filter({ hasText: /error/i })).toHaveCount(0);
  });

  test('shows stat cards', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.assertStatCardsVisible();
  });

  test('shows recent activity section', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.assertRecentActivityVisible();
  });

  test('sidebar navigation links are visible', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.assertNavLinksPresent();
  });

  test('can navigate to Change Requests from sidebar', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.clickNavItem('Change Requests');
    await expect(page).toHaveURL(/\/change-requests/);
  });

  test('can navigate to Projects from sidebar', async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.goto();
    await dashboard.clickNavItem('Projects');
    await expect(page).toHaveURL(/\/projects/);
  });
});
