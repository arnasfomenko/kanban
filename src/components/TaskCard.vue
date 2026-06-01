<template>
  <article
    class="task-card"
    :data-testid="`task-card-${task.id}`"
    :style="{ '--task-accent': accentColor }"
  >
    <div class="task-card__content">
      <div class="task-card__header">
        <div class="task-card__title">{{ task.title }}</div>
        <button
          type="button"
          class="task-card__delete no-drag"
          aria-label="Delete task"
          @click.stop="showDeleteDialog = true"
        >
          <i class="pi pi-trash"></i>
        </button>
      </div>

      <div class="task-card__meta">
        <span class="task-card__avatar" :style="{ background: avatarColor }">{{ initials }}</span>
        <div>
          <div class="task-card__author">{{ authorName }}</div>
          <div class="task-card__date">{{ formattedDate }}</div>
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="showDeleteDialog"
      modal
      header="Delete task"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :style="{ width: 'min(420px, 92vw)' }"
    >
      <p class="task-card__dialog-text">Delete “{{ task.title }}”? This cannot be undone.</p>
      <div class="task-card__dialog-actions">
        <Button label="Cancel" outlined @click="showDeleteDialog = false" />
        <Button label="Delete" severity="danger" @click="confirmDelete" />
      </div>
    </Dialog>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import type { Task } from '../types';

const props = defineProps<{ task: Task; authorName: string; accentColor?: string }>();
const emit = defineEmits<{
  (e: 'delete', id: number): void;
}>();

const showDeleteDialog = ref(false);

const accentColor = computed(() => props.accentColor ?? '#6366f1');

const initials = computed(() => {
  return props.authorName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
});

const avatarColor = computed(() => {
  let hash = 0;
  for (let i = 0; i < props.authorName.length; i += 1) {
    hash = props.authorName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hues = [220, 260, 190, 24, 330];
  const hue = hues[Math.abs(hash) % hues.length];
  return `hsl(${hue} 68% 42%)`;
});

const confirmDelete = () => {
  emit('delete', props.task.id);
  showDeleteDialog.value = false;
};

const formattedDate = computed(() => {
  return new Date(props.task.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});
</script>

<style scoped>
.task-card {
  position: relative;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  border-left: 4px solid var(--task-accent);
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  cursor: grab;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.task-card:active {
  cursor: grabbing;
}

.task-card:hover {
  transform: translateY(-2px);
  border-color: #cbd5e1;
  border-left-color: var(--task-accent);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.task-card__content {
  padding: 0.85rem 0.9rem 0.9rem;
}

.task-card__header {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.65rem;
}

.task-card__title {
  flex: 1;
  font-weight: 600;
  font-size: 0.9375rem;
  line-height: 1.35;
  color: #0f172a;
}

.task-card__delete {
  border: none;
  background: transparent;
  padding: 0.2rem;
  color: #94a3b8;
  cursor: pointer;
  opacity: 0;
  border-radius: 0.4rem;
  transition: opacity 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.task-card:hover .task-card__delete {
  opacity: 1;
}

.task-card__delete:hover {
  color: #dc2626;
  background: #fef2f2;
}

.task-card__meta {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.task-card__avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  flex-shrink: 0;
}

.task-card__author {
  font-size: 0.8125rem;
  font-weight: 500;
  color: #334155;
}

.task-card__date {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.1rem;
}

.task-card__dialog-text {
  margin: 0 0 1rem;
  color: #475569;
  line-height: 1.5;
}

.task-card__dialog-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}
</style>

<style>
.task-card--ghost {
  opacity: 0.45;
  background: #f8fafc;
}

.task-card--dragging {
  opacity: 0.92;
  transform: rotate(1.5deg) scale(1.02);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.16) !important;
  cursor: grabbing;
}
</style>
