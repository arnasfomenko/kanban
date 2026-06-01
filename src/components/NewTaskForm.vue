<template>
  <div class="task-form-panel">
    <div class="task-form-panel__header">
      <div class="task-form-panel__title">
        <span class="task-form-panel__icon"><i class="pi pi-plus"></i></span>
        <div>
          <h2>Create Task</h2>
          <p>Adds to the default column</p>
        </div>
      </div>
    </div>
    <div class="task-form-panel__body">
      <form class="task-form-panel__form" @submit.prevent="submit">
        <div class="task-form-panel__controls">
          <div class="task-form-panel__field">
            <label for="task-title">Title</label>
            <InputText
              id="task-title"
              data-testid="create-title"
              v-model="title"
              class="form-control"
              placeholder="What needs to be done?"
            />
          </div>
          <div class="task-form-panel__field">
            <label for="task-author">Author</label>
            <Dropdown
              id="task-author"
              data-testid="create-author"
              v-model="authorId"
              class="form-control"
              :options="authors"
              option-label="name"
              option-value="id"
              placeholder="Select author"
            />
          </div>
          <Button
            type="submit"
            data-testid="create-submit"
            label="Create"
            icon="pi pi-check"
            class="form-control task-form-panel__submit"
            :disabled="!title.trim() || authorId === null"
          />
        </div>
        <p v-if="error" class="task-form-panel__error">
          <i class="pi pi-exclamation-circle"></i>
          {{ error }}
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Author } from '../types';

defineProps<{ authors: Author[] }>();
const emit = defineEmits<{
  (e: 'create-task', payload: { title: string; authorId: number }): void;
}>();

const title = ref('');
const authorId = ref<number | null>(null);
const error = ref('');

const submit = () => {
  if (!title.value.trim()) {
    error.value = 'Title is required.';
    return;
  }

  if (authorId.value === null) {
    error.value = 'Author is required.';
    return;
  }

  emit('create-task', { title: title.value.trim(), authorId: authorId.value });
  title.value = '';
  authorId.value = null;
  error.value = '';
};
</script>

<style scoped>
.task-form-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.task-form-panel__header {
  padding: 1.15rem 1.35rem;
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  border-bottom: 1px solid #bbf7d0;
}

.task-form-panel__title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.task-form-panel__icon {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: #dcfce7;
  color: #16a34a;
}

.task-form-panel__title h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.task-form-panel__title p {
  margin: 0.15rem 0 0;
  font-size: 0.75rem;
  color: #64748b;
}

.task-form-panel__body {
  flex: 1;
  padding: 1.15rem 1.35rem 1.35rem;
}

.task-form-panel__controls {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  align-items: end;
}

@media screen and (min-width: 640px) {
  .task-form-panel__controls {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) auto;
  }
}

.task-form-panel__field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  min-width: 0;
}

.task-form-panel__field label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
}

.task-form-panel__error {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0.75rem 0 0;
  padding: 0.55rem 0.7rem;
  color: #b91c1c;
  font-size: 0.875rem;
  background: #fef2f2;
  border-radius: 0.65rem;
  border: 1px solid #fecaca;
}

.task-form-panel :deep(.p-button.task-form-panel__submit) {
  width: auto;
  min-width: 6.5rem;
}
</style>
