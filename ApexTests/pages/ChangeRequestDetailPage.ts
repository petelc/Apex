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
    // Scope to MUI Chip to avoid strict-mode violations with stepper step labels.
    await expect(this.page.locator('.MuiChip-root', { hasText: status })).toBeVisible();
  }

  async clickSubmitForReview(): Promise<void> {
    await this.page.getByRole('button', { name: /submit for review/i }).click();
    // networkidle catches both the submit API call and the subsequent data reload.
    await this.page.waitForLoadState('networkidle');
  }

  async clickApprove(): Promise<void> {
    await this.page.getByRole('button', { name: /approve/i }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickDeny(): Promise<void> {
    await this.page.getByRole('button', { name: /deny/i }).click();
  }

  async fillDenialReason(reason: string): Promise<void> {
    // A dialog or text field appears after clicking Deny
    const dialog = this.page.getByRole('dialog');
    await dialog.getByRole('textbox').fill(reason);
    await dialog.getByRole('button', { name: /confirm|deny|submit/i }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async assertStatusChip(expectedStatus: string): Promise<void> {
    const chip = this.page.locator('.MuiChip-root', { hasText: expectedStatus });
    await expect(chip).toBeVisible();
  }
}
