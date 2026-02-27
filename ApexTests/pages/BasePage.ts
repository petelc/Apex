import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
    // networkidle waits until all XHR/fetch settle — more reliable than polling
    // for a progressbar that may appear/disappear before our waitFor starts.
    await this.page.waitForLoadState('networkidle');
  }

  /** Wait for the MUI CircularProgress / linear progress to disappear */
  async waitForDataLoad(timeout = 10_000): Promise<void> {
    // Wait for any visible progress indicators to finish
    const spinner = this.page.getByRole('progressbar');
    try {
      await spinner.first().waitFor({ state: 'hidden', timeout });
    } catch {
      // No spinner present — that's fine
    }
  }

  /** Wait for a notistack toast (snackbar) to appear */
  async waitForToast(text?: string, timeout = 8_000): Promise<Locator> {
    const container = this.page.locator('.notistack-SnackbarContainer');
    await container.waitFor({ state: 'visible', timeout });
    if (text) {
      await container.getByText(text).waitFor({ timeout });
    }
    return container;
  }

  /** Click a sidebar navigation item by its visible label.
   *  The sidebar uses ListItemButton (renders as <button>), not <a> links. */
  async clickNavItem(label: string): Promise<void> {
    await this.page.getByRole('button', { name: label, exact: true }).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  /** Open the user avatar menu in the app bar */
  async openUserMenu(): Promise<void> {
    await this.page.getByRole('button', { name: /account|profile|avatar/i }).click();
  }

  /** Click a dialog action button by label */
  async clickDialogButton(label: string): Promise<void> {
    await this.page
      .getByRole('dialog')
      .getByRole('button', { name: label })
      .click();
  }

  /** Assert current URL includes the given path segment */
  async assertUrl(pathSegment: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(pathSegment));
  }

  get page_(): Page {
    return this.page;
  }
}
