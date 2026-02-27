import { test, expect } from '@playwright/test';
import { ChangeRequestsPage } from '../../pages/ChangeRequestsPage';
import { CreateChangeRequestPage } from '../../pages/CreateChangeRequestPage';
import { ChangeRequestDetailPage } from '../../pages/ChangeRequestDetailPage';
import {
  getAdminToken,
  createChangeRequest,
  deleteChangeRequest,
  submitChangeRequest,
} from '../../utils/api-helpers';

const TEST_CR_TITLE = `[E2E] CR ${Date.now()}`;

test.describe('Change Requests', () => {
  test('list page loads and shows the data grid', async ({ page }) => {
    const crPage = new ChangeRequestsPage(page);
    await crPage.goto();
    await crPage.assertDataGridVisible();
  });

  test('navigates to create page', async ({ page }) => {
    const crPage = new ChangeRequestsPage(page);
    await crPage.goto();
    await crPage.clickCreateButton();
    await expect(page).toHaveURL(/\/change-requests\/create/);
  });

  test('creates a change request via 3-step form', async ({ page }) => {
    const createPage = new CreateChangeRequestPage(page);
    await createPage.goto();

    await createPage.fillAndSubmit({
      title: TEST_CR_TITLE,
      description: 'E2E test change request — automated',
      changeType: 'Standard',
      priority: 'Low',
      impactAssessment: 'Minimal impact on production systems',
      rollbackPlan: 'Revert to previous deployment',
      affectedSystems: 'Test environment only',
      riskLevel: 'Low',
    });

    // After submit, should navigate to detail or list with the new CR
    await expect(page).toHaveURL(/\/change-requests/);
    await expect(page.getByText(TEST_CR_TITLE)).toBeVisible();
  });

  test.describe('CR lifecycle (requires existing draft)', () => {
    let token: string;
    let crId: string;

    test.beforeAll(async () => {
      token = await getAdminToken();
      crId = await createChangeRequest(token, {
        title: `[E2E] Lifecycle CR ${Date.now()}`,
        description: 'Lifecycle test',
      });
    });

    test.afterAll(async () => {
      if (crId) {
        // Best-effort cleanup
        try { await deleteChangeRequest(token, crId); } catch { /* already deleted */ }
      }
    });

    test('opens a change request detail page', async ({ page }) => {
      const detailPage = new ChangeRequestDetailPage(page);
      await detailPage.goto(crId);
      await detailPage.assertStatus('Draft');
    });

    test('submits draft for review', async ({ page }) => {
      const detailPage = new ChangeRequestDetailPage(page);
      await detailPage.goto(crId);
      await detailPage.clickSubmitForReview();
      await detailPage.assertStatusChip('Under Review');
    });
  });

  test.describe('Approve / Deny flow (requires submitted CR)', () => {
    let token: string;
    let approveCrId: string;
    let denyCrId: string;

    test.beforeAll(async () => {
      token = await getAdminToken();
      approveCrId = await createChangeRequest(token, {
        title: `[E2E] Approve CR ${Date.now()}`,
        description: 'Will be approved',
      });
      await submitChangeRequest(token, approveCrId);

      denyCrId = await createChangeRequest(token, {
        title: `[E2E] Deny CR ${Date.now()}`,
        description: 'Will be denied',
      });
      await submitChangeRequest(token, denyCrId);
    });

    test.afterAll(async () => {
      try { await deleteChangeRequest(token, approveCrId); } catch { /* */ }
      try { await deleteChangeRequest(token, denyCrId); } catch { /* */ }
    });

    test('approves a change request under review', async ({ page }) => {
      const detailPage = new ChangeRequestDetailPage(page);
      await detailPage.goto(approveCrId);
      await detailPage.assertStatusChip('Under Review');
      await detailPage.clickApprove();
      await detailPage.assertStatusChip('Approved');
    });

    test('denies a change request with a reason', async ({ page }) => {
      const detailPage = new ChangeRequestDetailPage(page);
      await detailPage.goto(denyCrId);
      await detailPage.assertStatusChip('Under Review');
      await detailPage.clickDeny();
      await detailPage.fillDenialReason('Not meeting compliance requirements for this sprint');
      await detailPage.assertStatusChip('Denied');
    });
  });
});
