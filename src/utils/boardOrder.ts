import type { Task } from '../types';

export const sortTasksByOrder = (a: Task, b: Task) => a.order - b.order;

export function ensureTaskOrders(taskList: Task[]): void {
  const columnIds = [...new Set(taskList.map((task) => task.status))];

  for (const columnId of columnIds) {
    const columnTasks = taskList
      .filter((task) => task.status === columnId)
      .sort((a, b) => {
        if (typeof a.order === 'number' && typeof b.order === 'number' && a.order !== b.order) {
          return a.order - b.order;
        }

        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

    columnTasks.forEach((task, index) => {
      task.order = index;
    });
  }
}

export function mergeVisibleOrder(columnTasks: Task[], visibleOrder: Task[]): Task[] {
  const visibleIds = new Set(visibleOrder.map((task) => task.id));
  let visibleIndex = 0;

  return columnTasks.map((task) => {
    if (visibleIds.has(task.id)) {
      const next = visibleOrder[visibleIndex];
      visibleIndex += 1;
      return next ?? task;
    }

    return task;
  });
}

export function incrementColumnOrders(tasks: Task[], columnId: string): void {
  for (const task of tasks) {
    if (task.status === columnId) {
      task.order += 1;
    }
  }
}
