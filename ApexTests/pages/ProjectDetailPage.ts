import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProjectDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(id: string): Promise<void> {
    await this.navigate(`/projects/${id}`);
  }

  async assertProjectName(name: string): Promise<void> {
    await expect(this.page.getByText(name).first()).toBeVisible();
  }

  async clickAssignManagerButton(): Promise<void> {
    await this.page
      .getByRole('button', { name: /assign.*manager|manager/i })
      .first()
      .click();
  }

  async selectManagerFromAutocomplete(name: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const input = dialog.getByRole('combobox').or(dialog.locator('input')).first();
    await input.fill(name);
    await this.page.getByRole('option', { name, exact: false }).click();
  }

  async clickAssignConfirm(): Promise<void> {
    await this.page
      .getByRole('dialog')
      .getByRole('button', { name: /assign/i })
      .click();
    await this.waitForDataLoad();
  }

  async clickViewTasksButton(): Promise<void> {
    await this.page.getByRole('button', { name: /tasks|view tasks/i }).first().click();
    await this.waitForDataLoad();
  }

  async assertManagerName(name: string): Promise<void> {
    await expect(this.page.getByText(name)).toBeVisible();
  }
}
