import { describe, expect, it } from 'vitest';
import { nextTaskId } from './taskIds';
import type { Task } from '../types';

describe('nextTaskId', () => {
  it('returns 1 for an empty task list', () => {
    expect(nextTaskId([])).toBe(1);
  });

  it('returns max id plus one', () => {
    const tasks = [
      { id: 101, title: 'a', authorId: 1, status: 'todo', createdAt: '', order: 0 },
      { id: 124, title: 'b', authorId: 1, status: 'todo', createdAt: '', order: 1 }
    ] as Task[];

    expect(nextTaskId(tasks)).toBe(125);
  });
});
