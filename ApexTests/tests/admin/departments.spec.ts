import { test, expect } from '@playwright/test';
import { AdminDepartmentsPage } from '../../pages/AdminDepartmentsPage';
import { getAdminToken, createDepartment, deleteDepartment } from '../../utils/api-helpers';

const DEPT_NAME = `[E2E] Dept ${Date.now()}`;

test.describe('Admin — Department Management', () => {
  test('departments page loads', async ({ page }) => {
    const deptPage = new AdminDepartmentsPage(page);
    await deptPage.goto();
    await expect(page).toHaveURL(/\/admin\/departments/);
  });

  test('departments table is visible', async ({ page }) => {
    const deptPage = new AdminDepartmentsPage(page);
    await deptPage.goto();
    await deptPage.assertTableVisible();
  });

  test('creates a new department', async ({ page }) => {
    const deptPage = new AdminDepartmentsPage(page);
    await deptPage.goto();

    await deptPage.clickCreateDepartment();
    await deptPage.fillDepartmentForm({
      name: DEPT_NAME,
      description: 'E2E test department',
    });
    await deptPage.submitDepartmentForm();

    await deptPage.assertDepartmentInTable(DEPT_NAME);
  });

  test.describe('Delete department', () => {
    let token: string;
    let deptId: string;
    const deptToDelete = `[E2E] Delete ${Date.now()}`;

    test.beforeAll(async () => {
      token = await getAdminToken();
      deptId = await createDepartment(token, deptToDelete, 'To be deleted');
    });

    test.afterAll(async () => {
      // Attempt cleanup in case delete test didn't run
      if (deptId) {
        try { await deleteDepartment(token, deptId); } catch { /* */ }
      }
    });

    test('deletes a department with confirmation', async ({ page }) => {
      const deptPage = new AdminDepartmentsPage(page);
      await deptPage.goto();

      await deptPage.assertDepartmentInTable(deptToDelete);
      await deptPage.clickDeleteDepartment(deptToDelete);
      await deptPage.confirmDelete();
      await deptPage.assertDepartmentNotInTable(deptToDelete);
    });
  });
});
