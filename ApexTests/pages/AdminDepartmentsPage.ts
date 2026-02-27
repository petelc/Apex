import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminDepartmentsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/admin/departments');
  }

  async assertTableVisible(): Promise<void> {
    await expect(this.page.getByRole('table').or(this.page.locator('table'))).toBeVisible();
  }

  async assertDepartmentInTable(name: string): Promise<void> {
    await expect(this.page.getByText(name)).toBeVisible();
  }

  async assertDepartmentNotInTable(name: string): Promise<void> {
    await expect(this.page.getByText(name)).not.toBeVisible();
  }

  async clickCreateDepartment(): Promise<void> {
    await this.page
      .getByRole('button', { name: /create department|add department|new/i })
      .first()
      .click();
  }

  async fillDepartmentForm(data: { name: string; description?: string }): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel(/name/i).fill(data.name);
    if (data.description) {
      await dialog.getByLabel(/description/i).fill(data.description);
    }
  }

  async submitDepartmentForm(): Promise<void> {
    await this.page
      .getByRole('dialog')
      .getByRole('button', { name: /create|save/i })
      .click();
    await this.waitForDataLoad();
  }

  async clickDeleteDepartment(name: string): Promise<void> {
    // filter({ hasText }) avoids special-char issues (names may contain [ ] etc.)
    const row = this.page.getByRole('row').filter({ hasText: name });
    await row.getByRole('button', { name: /delete/i }).click();
  }

  async confirmDelete(): Promise<void> {
    // Confirmation dialog
    const dialog = this.page.getByRole('dialog');
    await dialog.getByRole('button', { name: /confirm|delete|yes/i }).click();
    await this.waitForDataLoad();
  }
}
