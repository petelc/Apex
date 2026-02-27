import { test, expect } from '@playwright/test';
import { ProjectsPage } from '../../pages/ProjectsPage';
import { ProjectDetailPage } from '../../pages/ProjectDetailPage';

test.describe('Projects', () => {
  test('project list page loads', async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.goto();
    await expect(page).toHaveURL(/\/projects/);
  });

  test('shows projects list or empty state', async ({ page }) => {
    const projectsPage = new ProjectsPage(page);
    await projectsPage.goto();
    // Projects are rendered as MUI Cards (not a DataGrid).
    // When empty the page shows "No projects yet".
    const cardsOrEmpty = page
      .locator('.MuiCard-root')              // project cards when data exists
      .or(page.getByText(/no projects/i));  // empty state text
    await expect(cardsOrEmpty.first()).toBeVisible();
  });

  test('navigates to project requests page', async ({ page }) => {
    await page.goto('/project-requests');
    await expect(page).toHaveURL(/\/project-requests/);
    // Should load without error
    await expect(page.getByRole('alert').filter({ hasText: /error/i })).toHaveCount(0);
  });

  test('project detail page loads when navigating directly', async ({ page }) => {
    // Navigate to projects list and click the first project if any exist
    const projectsPage = new ProjectsPage(page);
    await projectsPage.goto();

    const rows = page.getByRole('row');
    const rowCount = await rows.count();

    if (rowCount > 1) {
      // At least one data row (excluding header)
      await rows.nth(1).click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/\/projects\/.+/);
    } else {
      test.skip(true, 'No projects in database to click into');
    }
  });
});
