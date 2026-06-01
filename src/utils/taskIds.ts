import type { Task } from '../types';

export function nextTaskId(tasks: Task[]): number {
  if (tasks.length === 0) {
    return 1;
  }

  return Math.max(...tasks.map((task) => task.id)) + 1;
}
