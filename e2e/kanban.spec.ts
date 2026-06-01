import { expect, type Locator, type Page, test } from '@playwright/test';
import { dragTaskToColumn } from './helpers/drag';

async function resetBoard(page: Page) {
  await page.goto('/');
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase('kanban-board-db');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => resolve();
    });
  });
  await page.reload();
  await expect(page.getByTestId('kanban-board')).toBeVisible();
}

async function selectDropdownOption(page: Page, trigger: Locator, optionLabel: string) {
  await trigger.click();
  await page.getByRole('option', { name: optionLabel, exact: true }).click();
}

test.describe('Kanban board', () => {
  test.beforeEach(async ({ page }) => {
    await resetBoard(page);
  });

  test('loads seeded columns and tasks', async ({ page }) => {
    await expect(page.getByTestId('board-column-todo')).toBeVisible();
    await expect(page.getByTestId('board-column-done')).toBeVisible();
    await expect(page.getByTestId('task-card-101')).toContainText('Set up project structure');
  });

  test('restores filters from the URL', async ({ page }) => {
    await page.goto('/?authorId=1&title=project');
    await expect(page.getByTestId('kanban-board')).toBeVisible();

    await expect(page.getByTestId('filter-title')).toHaveValue('project');
    await expect(page.getByText('Emma Carter').first()).toBeVisible();
    await expect(page.getByTestId('task-card-101')).toBeVisible();
    await expect(page.getByTestId('task-card-102')).toHaveCount(0);
  });

  test('creates a task in the default column and persists it after reload', async ({ page }) => {
    const title = `E2E task ${Date.now()}`;

    await page.getByTestId('create-title').fill(title);
    await selectDropdownOption(page, page.getByTestId('create-author'), 'Emma Carter');
    await page.getByTestId('create-submit').click();

    const createdCard = page.locator('[data-testid^="task-card-"]', { hasText: title });
    await expect(createdCard).toBeVisible();
    await expect(page.getByTestId('board-column-todo')).toContainText(title);

    await page.reload();
    await expect(page.getByTestId('kanban-board')).toBeVisible();
    await expect(page.locator('[data-testid^="task-card-"]', { hasText: title })).toBeVisible();
  });

  test('moves a task between columns with drag and drop', async ({ page }) => {
    const taskCard = page.getByTestId('task-card-104');
    const targetDropZone = page.getByTestId('board-drop-in_progress');

    await expect(taskCard).toBeVisible();
    await dragTaskToColumn(page, taskCard, targetDropZone);

    await expect(page.getByTestId('board-column-in_progress').getByTestId('task-card-104')).toBeVisible({
      timeout: 10_000
    });
    await expect(page.getByTestId('board-column-todo').getByTestId('task-card-104')).toHaveCount(0);

    await page.reload();
    await expect(page.getByTestId('board-column-in_progress').getByTestId('task-card-104')).toBeVisible();
  });

  test('keeps hidden tasks when dragging under an active title filter', async ({ page }) => {
    await page.goto('/?title=Set%20up');
    await expect(page.getByTestId('kanban-board')).toBeVisible();

    const visibleCard = page.getByTestId('task-card-101');
    await expect(visibleCard).toBeVisible();
    await expect(page.getByTestId('board-column-todo').getByTestId('task-card-104')).toHaveCount(0);

    await dragTaskToColumn(page, visibleCard, page.getByTestId('board-drop-done'));

    await expect(page.getByTestId('board-column-done').getByTestId('task-card-101')).toBeVisible({
      timeout: 10_000
    });

    const todoTaskIds = await page.evaluate(async () => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('kanban-board-db');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const payload = await new Promise<{ tasks: { id: number; status: string }[] } | null>(
        (resolve, reject) => {
          const transaction = db.transaction('board-state', 'readonly');
          const store = transaction.objectStore('board-state');
          const request = store.get('kanban-board');
          request.onsuccess = () => resolve(request.result?.payload ?? null);
          request.onerror = () => reject(request.error);
        }
      );

      return (payload?.tasks ?? [])
        .filter((task) => task.status === 'todo')
        .map((task) => task.id)
        .sort((a, b) => a - b);
    });

    expect(todoTaskIds).toContain(104);
    expect(todoTaskIds).not.toContain(101);
  });
});
