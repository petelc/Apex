import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProjectsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/projects');
  }

  async assertProjectsVisible(): Promise<void> {
    // Projects shown as cards or in a DataGrid
    const list = this.page.getByRole('grid')
      .or(this.page.locator('.MuiDataGrid-root'))
      .or(this.page.getByRole('list'));
    await expect(list.first()).toBeVisible();
  }

  async clickProject(nameOrIndex: string | number): Promise<void> {
    if (typeof nameOrIndex === 'string') {
      await this.page.getByText(nameOrIndex).first().click();
    } else {
      const rows = this.page.getByRole('row');
      await rows.nth(nameOrIndex + 1).click(); // +1 to skip header
    }
    await this.waitForDataLoad();
  }

  async assertProjectInList(name: string): Promise<void> {
    await expect(this.page.getByText(name)).toBeVisible();
  }
}
