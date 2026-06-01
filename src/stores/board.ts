import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Column, Author, Task } from '../types';
import { getBoardFromDb, saveBoardToDb } from '../composables/useIndexedDB';
import {
  ensureTaskOrders,
  incrementColumnOrders,
  mergeVisibleOrder,
  sortTasksByOrder
} from '../utils/boardOrder';
import { nextTaskId } from '../utils/taskIds';
import { parseBoardPayload } from '../utils/boardValidation';
import seedData from '../../data.json';

export const useBoardStore = defineStore('board', () => {
  const columns = ref<Column[]>([]);
  const authors = ref<Author[]>([]);
  const tasks = ref<Task[]>([]);
  const initialized = ref(false);
  const persistenceWarning = ref<string | null>(null);

  const orderedColumns = computed(() => {
    return [...columns.value].sort((a, b) => a.order - b.order);
  });

  const defaultColumnId = computed(() => {
    return columns.value.find((column) => column.default)?.id ?? columns.value[0]?.id ?? 'todo';
  });

  const getTasksByColumn = (columnId: string) => {
    return tasks.value.filter((task) => task.status === columnId).sort(sortTasksByOrder);
  };

  const getColumnTaskCount = (columnId: string) => {
    return tasks.value.filter((task) => task.status === columnId).length;
  };

  const setPersistenceWarning = (message: string) => {
    persistenceWarning.value = message;
  };

  const clearPersistenceWarning = () => {
    persistenceWarning.value = null;
  };

  const loadSeedData = () => {
    columns.value = seedData.columns;
    authors.value = seedData.authors;
    tasks.value = seedData.tasks as Task[];
  };

  const saveState = async (): Promise<boolean> => {
    const payload = {
      columns: JSON.parse(JSON.stringify(columns.value)),
      authors: JSON.parse(JSON.stringify(authors.value)),
      tasks: JSON.parse(JSON.stringify(tasks.value))
    };

    const validated = parseBoardPayload(payload);
    if (!validated.ok) {
      setPersistenceWarning(`Could not save board data: ${validated.errors.join('; ')}`);
      return false;
    }

    const result = await saveBoardToDb(validated.data);
    if (!result.ok) {
      setPersistenceWarning(`Could not save board data: ${result.error}`);
      return false;
    }

    clearPersistenceWarning();
    return true;
  };

  const init = async () => {
    if (initialized.value) {
      return;
    }

    const readResult = await getBoardFromDb();

    if (!readResult.ok) {
      setPersistenceWarning(
        readResult.reason === 'invalid_payload'
          ? `Stored board data was invalid; using seed data. ${readResult.error}`
          : `IndexedDB read failed; using seed data. ${readResult.error}`
      );
      loadSeedData();
    } else if (readResult.data) {
      columns.value = readResult.data.columns;
      authors.value = readResult.data.authors;
      tasks.value = readResult.data.tasks;
    } else {
      columns.value = seedData.columns;
      authors.value = seedData.authors;
      tasks.value = seedData.tasks as Task[];
      await saveState();
    }

    ensureTaskOrders(tasks.value);
    initialized.value = true;
  };

  const createTask = async (title: string, authorId: number) => {
    const columnId = defaultColumnId.value;
    incrementColumnOrders(tasks.value, columnId);

    const task: Task = {
      id: nextTaskId(tasks.value),
      title: title.trim(),
      authorId,
      status: columnId,
      createdAt: new Date().toISOString(),
      order: 0
    };

    tasks.value.unshift(task);
    await saveState();
    return task;
  };

  const reorderColumn = async (columnId: string, visibleOrderedTasks: Task[], mergeVisible = false) => {
    visibleOrderedTasks.forEach((task) => {
      const existing = tasks.value.find((item) => item.id === task.id);
      if (existing) {
        existing.status = columnId;
      }
    });

    const columnTasks = getTasksByColumn(columnId);
    const finalOrder = mergeVisible ? mergeVisibleOrder(columnTasks, visibleOrderedTasks) : visibleOrderedTasks;

    finalOrder.forEach((task, index) => {
      const existing = tasks.value.find((item) => item.id === task.id);
      if (!existing) {
        return;
      }

      existing.status = columnId;
      existing.order = index;
    });

    await saveState();
  };

  const deleteTask = async (taskId: number) => {
    const task = tasks.value.find((item) => item.id === taskId);
    if (!task) {
      return;
    }

    const columnId = task.status;
    tasks.value = tasks.value.filter((item) => item.id !== taskId);
    ensureTaskOrders(tasks.value.filter((item) => item.status === columnId));
    await saveState();
  };

  return {
    columns,
    authors,
    tasks,
    initialized,
    persistenceWarning,
    orderedColumns,
    defaultColumnId,
    init,
    getTasksByColumn,
    getColumnTaskCount,
    createTask,
    reorderColumn,
    deleteTask,
    clearPersistenceWarning
  };
});
