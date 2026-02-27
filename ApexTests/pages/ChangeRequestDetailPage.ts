import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ChangeRequestDetailPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(id: string): Promise<void> {
    await this.navigate(`/change-requests/${id}`);
  }

  async assertTitle(title: string): Promise<void> {
    await expect(this.page.getByText(title)).toBeVisible();
  }

  async assertStatus(status: string): Promise<void> {
    // Status shown as a MUI Chip
    await expect(this.page.getByText(status)).toBeVisible();
  }

  async clickSubmitForReview(): Promise<void> {
    await this.page.getByRole('button', { name: /submit for review/i }).click();
    await this.waitForDataLoad();
  }

  async clickApprove(): Promise<void> {
    await this.page.getByRole('button', { name: /approve/i }).click();
    await this.waitForDataLoad();
  }

  async clickDeny(): Promise<void> {
    await this.page.getByRole('button', { name: /deny/i }).click();
  }

  async fillDenialReason(reason: string): Promise<void> {
    // A dialog or text field appears after clicking Deny
    const dialog = this.page.getByRole('dialog');
    await dialog.getByRole('textbox').fill(reason);
    await dialog.getByRole('button', { name: /confirm|deny|submit/i }).click();
    await this.waitForDataLoad();
  }

  async assertStatusChip(expectedStatus: string): Promise<void> {
    const chip = this.page.locator('.MuiChip-root', { hasText: expectedStatus });
    await expect(chip).toBeVisible();
  }
}
