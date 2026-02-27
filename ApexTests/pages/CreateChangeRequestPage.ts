import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CreateChangeRequestPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/change-requests/create');
  }

  async assertOnStep(stepLabel: string): Promise<void> {
    await expect(this.page.getByText(stepLabel)).toBeVisible();
  }

  // ── Step 1: Basic Information ────────────────────────────────────────────────

  async fillTitle(title: string): Promise<void> {
    // The MUI TextField label is "Change Title" — getByLabel does substring match
    await this.page.getByLabel('Change Title').fill(title);
  }

  async fillDescription(description: string): Promise<void> {
    await this.page.getByLabel('Description').fill(description);
  }

  async selectChangeType(type: 'Standard' | 'Normal' | 'Emergency'): Promise<void> {
    const select = this.page.getByLabel('Change Type').or(this.page.getByRole('combobox', { name: /change type/i })).first();
    await select.click();
    await this.page.getByRole('option', { name: type }).click();
  }

  async selectPriority(priority: 'Low' | 'Medium' | 'High' | 'Critical'): Promise<void> {
    const select = this.page.getByLabel('Priority').or(this.page.getByRole('combobox', { name: /priority/i })).first();
    await select.click();
    await this.page.getByRole('option', { name: priority }).click();
  }

  async clickNext(): Promise<void> {
    await this.page.getByRole('button', { name: /next/i }).click();
  }

  // ── Step 2: Impact & Risk ────────────────────────────────────────────────────

  async fillImpactAssessment(text: string): Promise<void> {
    await this.page.getByLabel(/impact assessment/i).fill(text);
  }

  async fillRollbackPlan(text: string): Promise<void> {
    await this.page.getByLabel(/rollback plan/i).fill(text);
  }

  async fillAffectedSystems(text: string): Promise<void> {
    await this.page.getByLabel(/affected systems/i).fill(text);
  }

  async selectRiskLevel(level: 'Low' | 'Medium' | 'High' | 'Critical'): Promise<void> {
    const select = this.page.getByLabel('Risk Level').or(this.page.getByRole('combobox', { name: /risk level/i })).first();
    await select.click();
    await this.page.getByRole('option', { name: level }).click();
  }

  // ── Step 3: Review & Submit ──────────────────────────────────────────────────

  async clickSubmit(): Promise<void> {
    // Button text is "Submit for Review" — use the contained word to match it
    await this.page.getByRole('button', { name: /submit for review/i }).click();
  }

  // ── Full form helper ─────────────────────────────────────────────────────────

  async fillAndSubmit(data: {
    title: string;
    description: string;
    changeType?: 'Standard' | 'Normal' | 'Emergency';
    priority?: 'Low' | 'Medium' | 'High' | 'Critical';
    impactAssessment?: string;
    rollbackPlan?: string;
    affectedSystems?: string;
    riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';
  }): Promise<void> {
    // Step 1 — Basic Information: title, description, changeType
    await this.fillTitle(data.title);
    await this.fillDescription(data.description);
    if (data.changeType) await this.selectChangeType(data.changeType);
    await this.clickNext();

    // Step 2 — Impact & Risk: priority, riskLevel, impact, rollback, affected
    if (data.priority) await this.selectPriority(data.priority);
    if (data.impactAssessment) await this.fillImpactAssessment(data.impactAssessment);
    if (data.rollbackPlan) await this.fillRollbackPlan(data.rollbackPlan);
    if (data.affectedSystems) await this.fillAffectedSystems(data.affectedSystems);
    if (data.riskLevel) await this.selectRiskLevel(data.riskLevel);
    await this.clickNext();

    // Step 3 — review & submit
    await this.assertOnStep('Review');
    await this.clickSubmit();
  }
}
