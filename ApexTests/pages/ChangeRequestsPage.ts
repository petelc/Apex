import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ChangeRequestsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/change-requests');
  }

  async assertDataGridVisible(): Promise<void> {
    // MUI DataGrid renders role="grid". Using .first() avoids strict-mode violations
    // if the OR locator resolves the same element twice.
    await expect(this.page.getByRole('grid').first()).toBeVisible();
  }

  async clickCreateButton(): Promise<void> {
    await this.page
      .getByRole('button', { name: /create|new change request/i })
      .first()
      .click();
    await this.page.waitForURL(/\/change-requests\/create/);
  }

  async clickFirstRow(): Promise<void> {
    const rows = this.page.getByRole('row');
    // Skip header row — click first data row
    await rows.nth(1).click();
    await this.waitForDataLoad();
  }

  async searchByTitle(title: string): Promise<void> {
    const searchInput = this.page.getByPlaceholder(/search/i);
    await searchInput.fill(title);
    await this.waitForDataLoad();
  }

  async filterByStatus(status: string): Promise<void> {
    const filter = this.page.getByLabel(/status/i).or(this.page.getByRole('combobox', { name: /status/i })).first();
    await filter.click();
    await this.page.getByRole('option', { name: status }).click();
    await this.waitForDataLoad();
  }

  async assertRowWithTitle(title: string): Promise<void> {
    await expect(this.page.getByText(title)).toBeVisible();
  }

  async countDataRows(): Promise<number> {
    const rows = this.page.getByRole('row');
    const count = await rows.count();
    return Math.max(0, count - 1); // subtract header row
  }
}
