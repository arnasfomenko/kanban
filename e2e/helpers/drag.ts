import type { Locator, Page } from '@playwright/test';

export async function dragTaskToColumn(
  page: Page,
  task: Locator,
  dropZone: Locator
): Promise<void> {
  await task.scrollIntoViewIfNeeded();
  await dropZone.scrollIntoViewIfNeeded();

  const taskBox = await task.boundingBox();
  const dropBox = await dropZone.boundingBox();

  if (!taskBox || !dropBox) {
    throw new Error('Could not resolve drag or drop bounding boxes');
  }

  const startX = taskBox.x + taskBox.width / 2;
  const startY = taskBox.y + taskBox.height / 2;
  const endX = dropBox.x + dropBox.width / 2;
  const endY = dropBox.y + 28;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.waitForTimeout(200);
  await page.mouse.move(startX, startY + 12, { steps: 3 });
  await page.mouse.move(endX, endY, { steps: 18 });
  await page.waitForTimeout(200);
  await page.mouse.up();
}
