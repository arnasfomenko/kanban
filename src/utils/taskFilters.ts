import type { Task } from '../types';

export interface TaskFilterCriteria {
  authorId: number | null;
  title: string;
}

export function hasActiveTaskFilters(filters: TaskFilterCriteria): boolean {
  return filters.authorId !== null || filters.title.trim().length > 0;
}

export function matchesTaskFilters(task: Task, filters: TaskFilterCriteria): boolean {
  if (filters.authorId !== null && task.authorId !== filters.authorId) {
    return false;
  }

  const query = filters.title.trim();
  if (query.length > 0 && !task.title.toLowerCase().includes(query.toLowerCase())) {
    return false;
  }

  return true;
}
