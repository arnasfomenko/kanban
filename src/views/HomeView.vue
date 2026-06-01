<template>
  <div class="home">
    <BoardSkeleton v-if="!board.initialized" />

    <template v-else>
      <header class="home__header">
        <div class="home__header-copy">
          <span class="home__eyebrow">Workflow</span>
          <h1>Kanban Board</h1>
          <p>Drag tasks between columns, reorder within a column, and keep filters in sync with the URL.</p>
        </div>
        <div class="home__stats" aria-label="Board summary">
          <div class="home__stat">
            <span class="home__stat-value">{{ board.tasks.length }}</span>
            <span class="home__stat-label">Tasks</span>
          </div>
          <div class="home__stat">
            <span class="home__stat-value">{{ board.orderedColumns.length }}</span>
            <span class="home__stat-label">Columns</span>
          </div>
        </div>
      </header>

      <section class="home__toolbar">
        <FilterPanel
          :authors="board.authors"
          v-model:author-id="authorId"
          v-model:title="title"
          @clear="clearFilters"
        />
        <NewTaskForm :authors="board.authors" @create-task="handleCreateTask" />
      </section>

      <section class="home__board" data-testid="kanban-board">
        <BoardColumn
          v-for="column in board.orderedColumns"
          :key="column.id"
          :column="column"
          :tasks="visibleTasksForColumn(column.id)"
          :total-count="board.getColumnTaskCount(column.id)"
          :is-filtered-view="hasActiveFilters"
          :authors="board.authors"
          @reorder="handleReorder"
          @delete-task="handleDeleteTask"
        />
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useBoardStore } from '../stores/board';
import FilterPanel from '../components/FilterPanel.vue';
import NewTaskForm from '../components/NewTaskForm.vue';
import BoardColumn from '../components/BoardColumn.vue';
import BoardSkeleton from '../components/BoardSkeleton.vue';
import { useQueryFilters } from '../composables/useQueryFilters';
import { useAppToast } from '../composables/useAppToast';
import { hasActiveTaskFilters, matchesTaskFilters } from '../utils/taskFilters';
import type { Task } from '../types';

const board = useBoardStore();
const { authorId, title, filters, clearFilters } = useQueryFilters();
const { showWarning, showError } = useAppToast();

const hasActiveFilters = computed(() => hasActiveTaskFilters(filters.value));

const visibleTasksForColumn = (columnId: string) => {
  const columnTasks = board.getTasksByColumn(columnId);

  if (!hasActiveFilters.value) {
    return columnTasks;
  }

  return columnTasks.filter((task) => matchesTaskFilters(task, filters.value));
};

const handleCreateTask = async (payload: { title: string; authorId: number }) => {
  await board.createTask(payload.title, payload.authorId);
};

const handleReorder = async (payload: { columnId: string; tasks: Task[] }) => {
  await board.reorderColumn(payload.columnId, payload.tasks, hasActiveFilters.value);
};

const handleDeleteTask = async (taskId: number) => {
  await board.deleteTask(taskId);
};

watch(
  () => board.persistenceWarning,
  (message, previous) => {
    if (!message || message === previous) {
      return;
    }

    showWarning('Persistence issue', message);
  }
);

onMounted(async () => {
  try {
    await board.init();
  } catch (error) {
    showError('Failed to load board', error instanceof Error ? error.message : 'Unknown error');
  }
});
</script>

<style scoped>
.home {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
}

.home__header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1.75rem 1.5rem;
  border-radius: 1.5rem;
  background:
    radial-gradient(circle at top right, rgba(99, 102, 241, 0.12), transparent 42%),
    linear-gradient(135deg, #ffffff 0%, #f3f7ff 100%);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.06);
}

@media screen and (min-width: 768px) {
  .home__header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.home__eyebrow {
  display: inline-block;
  margin-bottom: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6366f1;
}

.home__header h1 {
  margin: 0;
  font-size: clamp(1.85rem, 3vw, 2.5rem);
  letter-spacing: -0.03em;
  color: #0f172a;
}

.home__header p {
  margin: 0.5rem 0 0;
  color: #64748b;
  max-width: 36rem;
  line-height: 1.55;
}

.home__stats {
  display: flex;
  gap: 0.75rem;
}

.home__stat {
  min-width: 5.5rem;
  padding: 0.85rem 1rem;
  border-radius: 1rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  text-align: center;
}

.home__stat-value {
  display: block;
  font-size: 1.35rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.1;
}

.home__stat-label {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.home__toolbar {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
  align-items: stretch;
}

@media screen and (min-width: 960px) {
  .home__toolbar {
    grid-template-columns: 1fr 1fr;
  }
}

.home__board {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media screen and (min-width: 700px) {
  .home__board {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media screen and (min-width: 1100px) {
  .home__board {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
