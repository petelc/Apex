import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

const KANBAN_COLUMNS = ['Not Started', 'In Progress', 'Blocked', 'Completed'] as const;

export class TaskBoardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(projectId: string): Promise<void> {
    await this.navigate(`/projects/${projectId}/tasks`);
  }

  async assertKanbanColumnsVisible(): Promise<void> {
    for (const col of KANBAN_COLUMNS) {
      await expect(this.page.getByText(col).first()).toBeVisible();
    }
  }

  async clickAddTask(): Promise<void> {
    await this.page
      .getByRole('button', { name: /add task|create task|new task/i })
      .first()
      .click();
  }

  async fillTaskTitle(title: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel(/title/i).fill(title);
  }

  async fillTaskDescription(description: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    await dialog.getByLabel(/description/i).fill(description);
  }

  async submitTaskDialog(): Promise<void> {
    await this.page
      .getByRole('dialog')
      .getByRole('button', { name: /create|save|add/i })
      .click();
    await this.waitForDataLoad();
  }

  async assertTaskCardVisible(title: string): Promise<void> {
    await expect(this.page.getByText(title)).toBeVisible();
  }

  async clickTaskCard(title: string): Promise<void> {
    await this.page.getByText(title).first().click();
    await this.waitForDataLoad();
  }

  async clickStartTask(): Promise<void> {
    await this.page.getByRole('button', { name: /start task|start/i }).first().click();
    await this.waitForDataLoad();
  }

  async clickCompleteTask(): Promise<void> {
    await this.page.getByRole('button', { name: /complete|mark complete/i }).first().click();
    await this.waitForDataLoad();
  }

  /** Assert a task card is in a specific kanban column */
  async assertTaskInColumn(taskTitle: string, columnName: (typeof KANBAN_COLUMNS)[number]): Promise<void> {
    // Find the column container by its heading text, then check the task is inside it
    const column = this.page.locator(`text="${columnName}"`).locator('..').locator('..');
    await expect(column.getByText(taskTitle)).toBeVisible();
  }
}
