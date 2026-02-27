import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DeploymentRequestsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/deployment-requests');
  }

  async assertListVisible(): Promise<void> {
    // Either a DataGrid/table with rows, or an empty state message
    const hasGrid = this.page.getByRole('grid').or(this.page.locator('.MuiDataGrid-root'));
    const hasEmpty = this.page.getByText(/no deployment requests|no requests/i);
    await expect(hasGrid.or(hasEmpty).first()).toBeVisible();
  }

  async clickCreateButton(): Promise<void> {
    await this.page
      .getByRole('button', { name: /create|new deployment/i })
      .first()
      .click();
    await this.page.waitForURL(/\/deployment-requests\/create/);
  }

  async fillTitle(title: string): Promise<void> {
    await this.page.getByLabel(/title/i).fill(title);
  }

  async fillDescription(description: string): Promise<void> {
    await this.page.getByLabel(/description/i).fill(description);
  }

  async selectEnvironment(env: 'Development' | 'Staging' | 'UAT' | 'Production'): Promise<void> {
    const select = this.page.getByLabel(/environment/i).or(this.page.getByRole('combobox', { name: /environment/i })).first();
    await select.click();
    await this.page.getByRole('option', { name: env }).click();
  }

  async fillAffectedSystems(text: string): Promise<void> {
    await this.page.getByLabel(/affected systems/i).fill(text);
  }

  async fillRollbackPlan(text: string): Promise<void> {
    await this.page.getByLabel(/rollback plan/i).fill(text);
  }

  async submitForm(): Promise<void> {
    await this.page.getByRole('button', { name: /submit|create/i }).click();
    await this.waitForDataLoad();
  }

  async clickFirstRow(): Promise<void> {
    const rows = this.page.getByRole('row');
    await rows.nth(1).click();
    await this.waitForDataLoad();
  }

  async assertRowWithTitle(title: string): Promise<void> {
    await expect(this.page.getByText(title)).toBeVisible();
  }
}
