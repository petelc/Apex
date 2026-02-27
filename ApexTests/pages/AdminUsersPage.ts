import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminUsersPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/admin/users');
  }

  async assertTableVisible(): Promise<void> {
    await expect(this.page.getByRole('table').or(this.page.locator('table'))).toBeVisible();
  }

  async searchUser(term: string): Promise<void> {
    await this.page
      .getByPlaceholder(/search by name, email/i)
      .fill(term);
    // Filtering is client-side — no need to wait for network
  }

  async assertUserInTable(nameOrEmail: string): Promise<void> {
    await expect(this.page.getByText(nameOrEmail)).toBeVisible();
  }

  async assertUserNotInTable(nameOrEmail: string): Promise<void> {
    await expect(this.page.getByText(nameOrEmail)).not.toBeVisible();
  }

  async clickCreateUser(): Promise<void> {
    await this.page.getByRole('button', { name: /create user/i }).click();
  }

  async fillCreateUserForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel(/first name/i).fill(data.firstName);
    await dialog.getByLabel(/last name/i).fill(data.lastName);
    await dialog.getByLabel(/email/i).fill(data.email);
    await dialog.getByLabel(/password/i).fill(data.password);
  }

  async submitCreateUserForm(): Promise<void> {
    await this.page
      .getByRole('dialog')
      .getByRole('button', { name: /create|save/i })
      .click();
    await this.waitForDataLoad();
  }

  async openEditDialog(userEmail: string): Promise<void> {
    const row = this.page.getByRole('row', { name: new RegExp(userEmail, 'i') });
    await row.getByRole('button', { name: /edit/i }).click();
  }

  async assignRoleInEditDialog(roleName: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    // Role is a checkbox in the UserRoleManager component
    const checkbox = dialog.getByRole('checkbox', { name: roleName });
    await checkbox.check();
    await dialog.getByRole('button', { name: /save|update/i }).click();
    await this.waitForDataLoad();
  }
}
