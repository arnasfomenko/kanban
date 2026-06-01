import { defineComponent, nextTick } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { describe, expect, it, vi } from 'vitest';
import { useQueryFilters } from './useQueryFilters';

const TestHarness = defineComponent({
  setup() {
    return useQueryFilters();
  },
  template: '<div />'
});

async function mountFilters(initialPath = '/') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }]
  });

  await router.push(initialPath);
  await router.isReady();

  const wrapper = mount(TestHarness, {
    global: {
      plugins: [router]
    }
  });

  return { wrapper, router };
}

describe('useQueryFilters', () => {
  it('restores filters from the URL on load', async () => {
    const { wrapper } = await mountFilters('/?authorId=3&title=board');

    expect(wrapper.vm.authorId).toBe(3);
    expect(wrapper.vm.title).toBe('board');
    expect(wrapper.vm.filters.title).toBe('board');
  });

  it('debounces title updates in the URL', async () => {
    vi.useFakeTimers();
    const { wrapper, router } = await mountFilters('/');

    wrapper.vm.title = 'kan';
    await nextTick();
    expect(router.currentRoute.value.query.title).toBeUndefined();

    vi.advanceTimersByTime(300);
    await flushPromises();
    expect(router.currentRoute.value.query.title).toBe('kan');

    vi.useRealTimers();
  });

  it('clears filters immediately in the URL', async () => {
    const { wrapper, router } = await mountFilters('/?authorId=2&title=task');

    wrapper.vm.clearFilters();
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({});
    expect(wrapper.vm.authorId).toBeNull();
    expect(wrapper.vm.title).toBe('');
  });
});
