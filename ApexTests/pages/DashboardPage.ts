import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/dashboard');
  }

  async assertStatCardsVisible(): Promise<void> {
    // Dashboard renders stat cards with numbers — look for the card container region
    const main = this.page.getByRole('main').or(this.page.locator('main, [data-testid="dashboard"]'));
    await expect(main.first()).toBeVisible();
    // At least one numeric stat should be rendered
    await expect(this.page.locator('h4, h5, h6').first()).toBeVisible();
  }

  async assertRecentActivityVisible(): Promise<void> {
    // Recent activity section heading or list
    const activity = this.page
      .getByText(/recent activity/i)
      .or(this.page.getByText(/activity/i));
    await expect(activity.first()).toBeVisible();
  }

  async assertNavLinksPresent(): Promise<void> {
    // Sidebar uses ListItemButton (renders as <button>), not <a> links.
    for (const label of ['Dashboard', 'Projects', 'Change Requests']) {
      await expect(
        this.page.getByRole('button', { name: label, exact: true }).first(),
      ).toBeVisible();
    }
  }

  async clickQuickAction(label: string): Promise<void> {
    await this.page.getByRole('button', { name: label, exact: false }).click();
  }
}
