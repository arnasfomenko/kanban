import { ref, watch, type Ref } from 'vue';

export function createDebouncedMirror<T>(source: Ref<T>, delayMs: number) {
  const debounced = ref(source.value) as Ref<T>;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  watch(source, (value) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      debounced.value = value;
    }, delayMs);
  });

  const flush = () => {
    clearTimeout(timeout);
    debounced.value = source.value;
  };

  const setImmediate = (value: T) => {
    source.value = value;
    debounced.value = value;
    clearTimeout(timeout);
  };

  return { debounced, flush, setImmediate };
}
