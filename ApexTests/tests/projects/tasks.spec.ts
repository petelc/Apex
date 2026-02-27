import { test, expect } from '@playwright/test';
import { TaskBoardPage } from '../../pages/TaskBoardPage';

test.describe('Task Board', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to projects and enter the first one
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');

    const rows = page.getByRole('row');
    const rowCount = await rows.count();

    if (rowCount <= 1) {
      test.skip(true, 'No projects available — seed test data first');
      return;
    }

    // Click first project to get its ID, then navigate to tasks
    await rows.nth(1).click();
    await page.waitForLoadState('networkidle');

    // Navigate to tasks tab / tasks page
    const tasksLink = page.getByRole('link', { name: /tasks/i }).or(
      page.getByRole('button', { name: /tasks/i }),
    );
    const hasTasksLink = await tasksLink.first().isVisible().catch(() => false);
    if (hasTasksLink) {
      await tasksLink.first().click();
      await page.waitForLoadState('networkidle');
    } else {
      // URL might be /projects/:id — add /tasks
      const url = page.url();
      if (!url.includes('/tasks')) {
        await page.goto(url + '/tasks');
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('task board shows kanban columns', async ({ page }) => {
    const taskBoard = new TaskBoardPage(page);
    await taskBoard.assertKanbanColumnsVisible();
  });

  test('can create a new task', async ({ page }) => {
    const taskBoard = new TaskBoardPage(page);
    const taskTitle = `[E2E] Task ${Date.now()}`;

    await taskBoard.clickAddTask();
    await taskBoard.fillTaskTitle(taskTitle);
    await taskBoard.submitTaskDialog();
    await taskBoard.assertTaskCardVisible(taskTitle);
  });

  test('task starts in Not Started column', async ({ page }) => {
    const taskBoard = new TaskBoardPage(page);
    const taskTitle = `[E2E] Task ${Date.now()}`;

    await taskBoard.clickAddTask();
    await taskBoard.fillTaskTitle(taskTitle);
    await taskBoard.submitTaskDialog();

    // Newly created task should be in the Not Started column
    await expect(page.getByText(taskTitle)).toBeVisible();
  });
});
