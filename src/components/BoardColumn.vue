<template>
  <section
    class="board-column"
    :data-testid="`board-column-${column.id}`"
    :style="{
      '--column-accent': theme.accent,
      '--column-soft': theme.soft,
      '--column-border': theme.border
    }"
  >
    <div class="board-column__header">
      <div class="board-column__heading">
        <span class="board-column__dot" aria-hidden="true"></span>
        <div>
          <div class="board-column__name">{{ column.name }}</div>
          <div class="board-column__count">
            <span>{{ totalCount }} {{ totalCount === 1 ? 'task' : 'tasks' }}</span>
            <span v-if="isFilteredView" class="board-column__count-filtered">
              · {{ tasks.length }} shown
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="board-column__body">
      <draggable
        :list="taskList"
        :group="{ name: 'kanban', pull: true, put: true }"
        item-key="id"
        class="board-column__list"
        filter=".no-drag"
        :prevent-on-filter="false"
        ghost-class="task-card--ghost"
        drag-class="task-card--dragging"
        :animation="220"
        @change="onListChange"
      >
        <template #item="{ element }">
          <TaskCard
            :task="element"
            :author-name="getAuthorName(element.authorId)"
            :accent-color="theme.accent"
            @delete="(taskId) => emit('delete-task', taskId)"
          />
        </template>
      </draggable>

      <div v-if="tasks.length === 0" class="board-column__empty">
        <i class="pi pi-inbox board-column__empty-icon"></i>
        <p v-if="totalCount > 0">No tasks match your filters</p>
        <p v-else>Drop tasks here</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import draggable from 'vuedraggable';
import type { Column, Task, Author } from '../types';
import { getColumnTheme } from '../constants/columnThemes';
import TaskCard from './TaskCard.vue';

const props = defineProps<{
  column: Column;
  tasks: Task[];
  totalCount: number;
  authors: Author[];
  isFilteredView?: boolean;
}>();

const emit = defineEmits<{
  (e: 'reorder', payload: { columnId: string; tasks: Task[] }): void;
  (e: 'delete-task', taskId: number): void;
}>();

const theme = computed(() => getColumnTheme(props.column.id));
const taskList = ref<Task[]>([]);

watch(
  () => props.tasks,
  (tasks) => {
    taskList.value = [...tasks];
  },
  { immediate: true, deep: true }
);

const getAuthorName = (authorId: number) => {
  return props.authors.find((author) => author.id === authorId)?.name ?? 'Unknown';
};

const onListChange = () => {
  emit('reorder', { columnId: props.column.id, tasks: [...taskList.value] });
};
</script>

<style scoped>
.board-column {
  display: flex;
  flex-direction: column;
  min-height: 440px;
  border-radius: 1.25rem;
  overflow: hidden;
  border: 1px solid var(--column-border);
  background: #ffffff;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 12px 32px rgba(15, 23, 42, 0.06);
}

.board-column__header {
  padding: 1.1rem 1.15rem;
  background: var(--column-soft);
  border-bottom: 1px solid var(--column-border);
}

.board-column__heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.board-column__dot {
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 999px;
  background: var(--column-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--column-accent) 18%, transparent);
  flex-shrink: 0;
}

.board-column__name {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  text-transform: capitalize;
  letter-spacing: -0.01em;
}

.board-column__count {
  font-size: 0.8125rem;
  color: #64748b;
  margin-top: 0.1rem;
}

.board-column__count-filtered {
  color: #4f46e5;
  font-weight: 500;
}

.board-column__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 360px;
  padding: 0.85rem;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
}

.board-column__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 2rem;
  flex: 1;
}

.board-column__empty {
  margin-top: 0.5rem;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  color: #94a3b8;
  background: var(--column-soft);
  border-radius: 1rem;
  border: 1px dashed var(--column-border);
  text-align: center;
  padding: 1rem;
}

.board-column__empty p {
  margin: 0;
  font-size: 0.875rem;
}

.board-column__empty-icon {
  font-size: 1.35rem;
  color: var(--column-accent);
  opacity: 0.7;
}
</style>
