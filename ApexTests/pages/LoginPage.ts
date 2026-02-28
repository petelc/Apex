import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.getByLabel('Email').fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.page.getByLabel('Password').fill(password);
  }

  async submit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Sign In' }).click();
    // Wait for the login API call + redirect to complete before returning.
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  async assertErrorVisible(text?: string): Promise<void> {
    const alert = this.page.getByRole('alert');
    await expect(alert).toBeVisible();
    if (text) await expect(alert).toContainText(text);
  }

  async assertOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login/);
    await expect(
      this.page.getByRole('button', { name: 'Sign In' }),
    ).toBeVisible();
  }

  async assertLocalStorageCleared(): Promise<void> {
    const token = await this.page.evaluate(() =>
      localStorage.getItem('apex_token'),
    );
    expect(token).toBeNull();
  }
}
