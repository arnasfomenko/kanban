import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import FilterPanel from './FilterPanel.vue';

const InputStub = defineComponent({
  props: { modelValue: String },
  emits: ['update:modelValue'],
  setup(props, { emit, attrs }) {
    return () =>
      h('input', {
        ...attrs,
        value: props.modelValue ?? '',
        onInput: (event: Event) => emit('update:modelValue', (event.target as HTMLInputElement).value)
      });
  }
});

const ButtonStub = defineComponent({
  emits: ['click'],
  setup(_, { emit, slots, attrs }) {
    return () =>
      h(
        'button',
        {
          ...attrs,
          onClick: () => emit('click')
        },
        slots.default?.()
      );
  }
});

const DropdownStub = defineComponent({
  props: { modelValue: { type: [Number, null], default: null } },
  emits: ['update:modelValue'],
  setup(props, { attrs }) {
    return () => h('select', { ...attrs, value: props.modelValue ?? '' });
  }
});

const primeStubs = {
  InputText: InputStub,
  Button: ButtonStub,
  Dropdown: DropdownStub
};

const authors = [
  { id: 1, name: 'Emma Carter' },
  { id: 2, name: 'Noah Bennett' }
];

describe('FilterPanel', () => {
  it('shows the selected author chip', () => {
    const wrapper = mount(FilterPanel, {
      props: {
        authors,
        authorId: 1,
        title: ''
      },
      global: { stubs: primeStubs }
    });

    expect(wrapper.text()).toContain('Emma Carter');
    expect(wrapper.text()).toContain('1 active');
  });

  it('emits clear when reset is clicked', async () => {
    const wrapper = mount(FilterPanel, {
      props: {
        authors,
        authorId: 2,
        title: 'board'
      },
      global: { stubs: primeStubs }
    });

    await wrapper.get('[data-testid="clear-filters"]').trigger('click');

    expect(wrapper.emitted('clear')).toHaveLength(1);
  });

  it('emits title updates from the search field', async () => {
    const wrapper = mount(FilterPanel, {
      props: {
        authors,
        authorId: null,
        title: ''
      },
      global: { stubs: primeStubs }
    });

    const input = wrapper.get('[data-testid="filter-title"]');
    await input.setValue('kanban');

    expect(wrapper.emitted('update:title')?.[0]).toEqual(['kanban']);
  });
});
