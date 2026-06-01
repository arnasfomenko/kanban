<template>
  <div class="filter-panel">
    <div class="filter-panel__header">
      <div class="filter-panel__title">
        <span class="filter-panel__icon"><i class="pi pi-filter"></i></span>
        <div>
          <h2>Filters</h2>
          <p>Synced with the URL</p>
        </div>
      </div>
      <span v-if="activeFilterCount > 0" class="filter-panel__badge">{{ activeFilterCount }} active</span>
    </div>
    <div class="filter-panel__body">
      <div class="filter-panel__controls">
        <div class="filter-panel__field">
          <label for="filter-author">Author</label>
          <Dropdown
            id="filter-author"
            data-testid="filter-author"
            v-model="authorDropdown"
            class="form-control"
            :options="authorOptions"
            option-label="name"
            option-value="id"
            placeholder="All authors"
          />
        </div>
        <div class="filter-panel__field">
          <label for="filter-title">Title</label>
          <InputText
            id="filter-title"
            data-testid="filter-title"
            v-model="titleInput"
            class="form-control"
            placeholder="Search by title"
            type="search"
          />
        </div>
        <Button
          data-testid="clear-filters"
          label="Clear filters"
          class="form-control filter-panel__clear"
          outlined
          :disabled="activeFilterCount === 0"
          @click="resetFilters"
        />
      </div>
      <div v-if="selectedAuthor" class="filter-panel__selection">
        <span class="filter-panel__selection-label">Selected author</span>
        <span class="filter-panel__selection-chip">
          <i class="pi pi-user"></i>
          {{ selectedAuthor.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Author } from '../types';

const props = defineProps<{ authors: Author[]; authorId: number | null; title: string }>();
const emit = defineEmits<{
  (e: 'update:authorId', value: number | null): void;
  (e: 'update:title', value: string): void;
  (e: 'clear'): void;
}>();

const authorDropdown = computed({
  get: () => props.authorId,
  set: (value) => emit('update:authorId', value ?? null)
});

const titleInput = computed({
  get: () => props.title,
  set: (value) => emit('update:title', value)
});

const authorOptions = computed(() => props.authors);

const selectedAuthor = computed(() => {
  if (props.authorId === null) {
    return null;
  }

  return props.authors.find((author) => author.id === props.authorId) ?? null;
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (props.authorId !== null) count++;
  if (props.title.length > 0) count++;
  return count;
});

const resetFilters = () => {
  emit('clear');
};
</script>

<style scoped>
.filter-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.filter-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1.15rem 1.35rem;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-bottom: 1px solid #e2e8f0;
}

.filter-panel__title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-panel__icon {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: #eef2ff;
  color: #4f46e5;
}

.filter-panel__title h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.filter-panel__title p {
  margin: 0.15rem 0 0;
  font-size: 0.75rem;
  color: #64748b;
}

.filter-panel__badge {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #4f46e5;
  background: #eef2ff;
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  white-space: nowrap;
}

.filter-panel__body {
  flex: 1;
  padding: 1.15rem 1.35rem 1.35rem;
}

.filter-panel__selection {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.85rem;
  padding: 0.55rem 0.7rem;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  border-radius: 0.75rem;
}

.filter-panel__selection-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6366f1;
}

.filter-panel__selection-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #312e81;
}

.filter-panel__controls {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  align-items: end;
}

@media screen and (min-width: 640px) {
  .filter-panel__controls {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) auto;
  }
}

.filter-panel__field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  min-width: 0;
}

.filter-panel__field label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
}

.filter-panel__clear {
  white-space: nowrap;
}

.filter-panel :deep(.p-button.filter-panel__clear) {
  width: auto;
  min-width: 7.5rem;
}
</style>
