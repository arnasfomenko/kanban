import { describe, expect, it } from 'vitest';
import { hasActiveTaskFilters, matchesTaskFilters } from './taskFilters';
import type { Task } from '../types';

const task: Task = {
  id: 1,
  title: 'Sync filters with URL query params',
  authorId: 6,
  status: 'done',
  createdAt: '2025-01-10T15:10:00Z',
  order: 0
};

describe('taskFilters', () => {
  it('matches author and title filters together', () => {
    expect(matchesTaskFilters(task, { authorId: 6, title: 'url' })).toBe(true);
    expect(matchesTaskFilters(task, { authorId: 7, title: 'url' })).toBe(false);
    expect(matchesTaskFilters(task, { authorId: 6, title: 'missing' })).toBe(false);
  });

  it('matches title case-insensitively', () => {
    expect(matchesTaskFilters(task, { authorId: null, title: 'QUERY' })).toBe(true);
  });

  it('detects active filters', () => {
    expect(hasActiveTaskFilters({ authorId: null, title: '' })).toBe(false);
    expect(hasActiveTaskFilters({ authorId: 1, title: '' })).toBe(true);
    expect(hasActiveTaskFilters({ authorId: null, title: 'x' })).toBe(true);
  });
});
