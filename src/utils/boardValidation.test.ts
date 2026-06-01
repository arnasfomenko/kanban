import { describe, expect, it } from 'vitest';
import { parseBoardPayload } from './boardValidation';

const validPayload = {
  columns: [
    { id: 'todo', name: 'to do', order: 1, default: true },
    { id: 'done', name: 'done', order: 2 }
  ],
  authors: [{ id: 1, name: 'Emma Carter' }],
  tasks: [
    {
      id: 101,
      title: 'Valid task',
      authorId: 1,
      status: 'todo',
      createdAt: '2025-01-05T09:00:00Z',
      order: 0
    }
  ]
};

describe('parseBoardPayload', () => {
  it('accepts a valid board payload', () => {
    const result = parseBoardPayload(validPayload);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.tasks[0]?.title).toBe('Valid task');
    }
  });

  it('rejects non-object payloads', () => {
    const result = parseBoardPayload(null);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('Board payload must be an object');
    }
  });

  it('rejects tasks with unknown status or author', () => {
    const result = parseBoardPayload({
      ...validPayload,
      tasks: [
        {
          id: 101,
          title: 'Broken task',
          authorId: 99,
          status: 'missing',
          createdAt: '2025-01-05T09:00:00Z',
          order: 0
        }
      ]
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((error) => error.includes('unknown status'))).toBe(true);
      expect(result.errors.some((error) => error.includes('unknown authorId'))).toBe(true);
    }
  });

  it('rejects duplicate task ids', () => {
    const result = parseBoardPayload({
      ...validPayload,
      tasks: [
        validPayload.tasks[0],
        { ...validPayload.tasks[0], title: 'Duplicate id' }
      ]
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toContain('duplicate task id 101');
    }
  });
});
