import { test, expect } from '@playwright/test';
import { DeploymentRequestsPage } from '../../pages/DeploymentRequestsPage';
import {
  getAdminToken,
  createDeploymentRequest,
  deleteDeploymentRequest,
} from '../../utils/api-helpers';

test.describe('Deployment Requests', () => {
  test('list page loads', async ({ page }) => {
    const drPage = new DeploymentRequestsPage(page);
    await drPage.goto();
    await expect(page).toHaveURL(/\/deployment-requests/);
  });

  test('shows list or empty state without error', async ({ page }) => {
    const drPage = new DeploymentRequestsPage(page);
    await drPage.goto();
    await drPage.assertListVisible();
  });

  test('navigates to create page', async ({ page }) => {
    const drPage = new DeploymentRequestsPage(page);
    await drPage.goto();
    await drPage.clickCreateButton();
    await expect(page).toHaveURL(/\/deployment-requests\/create/);
  });

  test('creates a deployment request via form', async ({ page }) => {
    const drPage = new DeploymentRequestsPage(page);
    const title = `[E2E] Deployment ${Date.now()}`;

    await page.goto('/deployment-requests/create');
    await page.waitForLoadState('networkidle');

    await drPage.fillTitle(title);
    await drPage.fillDescription('Automated E2E test deployment');
    await drPage.selectEnvironment('Development');
    await drPage.fillAffectedSystems('E2E test system');
    await drPage.fillRollbackPlan('Revert docker image to previous tag');
    await drPage.submitForm();

    // Should navigate back to list or detail
    await expect(page).toHaveURL(/\/deployment-requests/);
  });

  test.describe('Detail page', () => {
    let token: string;
    let drId: string;

    test.beforeAll(async () => {
      token = await getAdminToken();
      drId = await createDeploymentRequest(token, {
        title: `[E2E] Detail DR ${Date.now()}`,
        description: 'Detail page test',
        environment: 'Staging',
      });
    });

    test.afterAll(async () => {
      if (drId) {
        try { await deleteDeploymentRequest(token, drId); } catch { /* */ }
      }
    });

    test('detail page renders correctly', async ({ page }) => {
      await page.goto(`/deployment-requests/${drId}`);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(new RegExp(drId));
      // Status chip visible
      await expect(page.getByText('Draft').or(page.getByText('PendingApproval'))).toBeVisible();
    });
  });
});
