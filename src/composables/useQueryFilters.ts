import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createDebouncedMirror } from './useDebouncedRef';

const TITLE_DEBOUNCE_MS = 300;

export function useQueryFilters() {
  const route = useRoute();
  const router = useRouter();

  const authorId = ref<number | null>(null);
  const title = ref('');
  const { debounced: debouncedTitle, flush: flushTitleDebounce, setImmediate: setTitleImmediate } =
    createDebouncedMirror(title, TITLE_DEBOUNCE_MS);

  const buildQuery = () => {
    const query: Record<string, string> = {};

    if (authorId.value !== null) {
      query.authorId = String(authorId.value);
    }

    const titleForUrl = debouncedTitle.value.trim();
    if (titleForUrl.length > 0) {
      query.title = titleForUrl;
    }

    return query;
  };

  const updateRoute = () => {
    const newQuery = buildQuery();
    const currentQuery = {
      authorId: typeof route.query.authorId === 'string' ? route.query.authorId : undefined,
      title: typeof route.query.title === 'string' ? route.query.title : undefined
    };

    if (newQuery.authorId === currentQuery.authorId && newQuery.title === currentQuery.title) {
      return;
    }

    router.replace({ query: newQuery }).catch(() => undefined);
  };

  const syncFromRoute = () => {
    const queryAuthor = route.query.authorId;
    const queryTitle = route.query.title;

    if (typeof queryAuthor === 'string' && queryAuthor.length > 0) {
      const parsed = Number(queryAuthor);
      authorId.value = Number.isNaN(parsed) ? null : parsed;
    } else {
      authorId.value = null;
    }

    const nextTitle = typeof queryTitle === 'string' ? queryTitle : '';
    setTitleImmediate(nextTitle);
  };

  watch([() => route.query.authorId, () => route.query.title], syncFromRoute, {
    immediate: true
  });

  watch([authorId, debouncedTitle], updateRoute);

  const filters = computed(() => ({
    authorId: authorId.value,
    title: title.value.trim()
  }));

  const clearFilters = () => {
    authorId.value = null;
    setTitleImmediate('');
    updateRoute();
  };

  return {
    authorId,
    title,
    filters,
    clearFilters
  };
}
