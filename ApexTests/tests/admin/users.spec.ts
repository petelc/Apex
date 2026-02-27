import { test, expect } from '@playwright/test';
import { AdminUsersPage } from '../../pages/AdminUsersPage';
import { getAdminToken, deleteTestUser } from '../../utils/api-helpers';

const UNIQUE_SUFFIX = Date.now();
const TEST_USER_EMAIL = `e2e-user-${UNIQUE_SUFFIX}@test.local`;

test.describe('Admin — User Management', () => {
  test('user management page loads', async ({ page }) => {
    const usersPage = new AdminUsersPage(page);
    await usersPage.goto();
    await expect(page).toHaveURL(/\/admin\/users/);
  });

  test('user table is visible', async ({ page }) => {
    const usersPage = new AdminUsersPage(page);
    await usersPage.goto();
    await usersPage.assertTableVisible();
  });

  test('admin user appears in the table', async ({ page }) => {
    const usersPage = new AdminUsersPage(page);
    await usersPage.goto();
    const adminEmail = process.env.TEST_ADMIN_EMAIL ?? 'admin@acme.com';
    await usersPage.assertUserInTable(adminEmail);
  });

  test('search filters the user list', async ({ page }) => {
    const usersPage = new AdminUsersPage(page);
    await usersPage.goto();

    const adminEmail = process.env.TEST_ADMIN_EMAIL ?? 'admin@acme.com';
    // Search for admin
    await usersPage.searchUser('admin');
    await usersPage.assertUserInTable(adminEmail);

    // Search for something that should not match
    await usersPage.searchUser('zzz-no-match-xyz');
    await usersPage.assertUserNotInTable(adminEmail);
  });

  test.describe('Create user', () => {
    let token: string;
    let createdUserId: string;

    test.afterAll(async () => {
      // Clean up created user
      if (createdUserId) {
        token = token ?? await getAdminToken();
        try { await deleteTestUser(token, createdUserId); } catch { /* */ }
      }
    });

    test('creates a new user via dialog', async ({ page }) => {
      const usersPage = new AdminUsersPage(page);
      await usersPage.goto();

      await usersPage.clickCreateUser();

      // Intercept the create response to capture userId for cleanup
      const responsePromise = page.waitForResponse(
        (res) => res.url().includes('/admin/users') && res.request().method() === 'POST',
      );

      await usersPage.fillCreateUserForm({
        firstName: 'E2E',
        lastName: `User${UNIQUE_SUFFIX}`,
        email: TEST_USER_EMAIL,
        password: 'TestUser123!',
      });
      await usersPage.submitCreateUserForm();

      try {
        const response = await responsePromise;
        if (response.ok()) {
          const body = await response.json() as { userId?: string; id?: string };
          createdUserId = body.userId ?? body.id ?? '';
        }
      } catch { /* cleanup not critical */ }

      // New user should appear in the table
      await usersPage.assertUserInTable(TEST_USER_EMAIL);
    });
  });
});
