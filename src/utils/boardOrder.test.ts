import { describe, expect, it } from 'vitest';
import { ensureTaskOrders, mergeVisibleOrder } from './boardOrder';
import type { Task } from '../types';

const makeTask = (id: number, status: string, createdAt: string, order?: number): Task => ({
  id,
  title: `Task ${id}`,
  authorId: 1,
  status,
  createdAt,
  order: order ?? 0
});

describe('boardOrder', () => {
  it('assigns order by createdAt when order is missing', () => {
    const tasks = [
      makeTask(1, 'todo', '2025-01-03T00:00:00Z'),
      makeTask(2, 'todo', '2025-01-01T00:00:00Z')
    ];

    ensureTaskOrders(tasks);

    expect(tasks.find((task) => task.id === 2)?.order).toBe(0);
    expect(tasks.find((task) => task.id === 1)?.order).toBe(1);
  });

  it('merges visible order without dropping hidden tasks', () => {
    const columnTasks = [
      makeTask(1, 'todo', '2025-01-01T00:00:00Z', 0),
      makeTask(2, 'todo', '2025-01-02T00:00:00Z', 1),
      makeTask(3, 'todo', '2025-01-03T00:00:00Z', 2)
    ];
    const visibleOrder = [columnTasks[2], columnTasks[0]];

    const merged = mergeVisibleOrder(columnTasks, visibleOrder);

    expect(merged.map((task) => task.id)).toEqual([3, 2, 1]);
  });
});
