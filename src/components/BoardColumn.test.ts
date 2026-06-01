import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import BoardColumn from './BoardColumn.vue';

const DraggableStub = defineComponent({
  name: 'draggable',
  props: {
    list: {
      type: Array,
      required: true
    }
  },
  emits: ['change'],
  setup(props, { slots, emit }) {
    return () =>
      h(
        'div',
        {
          class: 'draggable-stub',
          onClick: () => emit('change')
        },
        slots.item ? props.list.map((item, index) => slots.item?.({ element: item, index })) : []
      );
  }
});

const column = { id: 'todo', name: 'to do', order: 1, default: true };
const authors = [{ id: 1, name: 'Emma Carter' }];
const tasks = [
  {
    id: 101,
    title: 'Visible task',
    authorId: 1,
    status: 'todo',
    createdAt: '2025-01-05T09:00:00Z',
    order: 0
  }
];

describe('BoardColumn', () => {
  it('renders task cards and column metadata', () => {
    const wrapper = mount(BoardColumn, {
      props: {
        column,
        tasks,
        totalCount: 3,
        authors,
        isFilteredView: true
      },
      global: {
        stubs: {
          draggable: DraggableStub
        }
      }
    });

    expect(wrapper.get('[data-testid="board-column-todo"]').attributes('data-testid')).toBe(
      'board-column-todo'
    );
    expect(wrapper.get('[data-testid="task-card-101"]').text()).toContain('Visible task');
    expect(wrapper.text()).toContain('3 tasks');
    expect(wrapper.text()).toContain('1 shown');
  });

  it('emits reorder when the draggable list changes', async () => {
    const wrapper = mount(BoardColumn, {
      props: {
        column,
        tasks,
        totalCount: 1,
        authors
      },
      global: {
        stubs: {
          draggable: DraggableStub
        }
      }
    });

    await wrapper.get('.draggable-stub').trigger('click');

    expect(wrapper.emitted('reorder')?.[0]).toEqual([
      {
        columnId: 'todo',
        tasks
      }
    ]);
  });

  it('shows a filtered empty state when tasks are hidden', () => {
    const wrapper = mount(BoardColumn, {
      props: {
        column,
        tasks: [],
        totalCount: 2,
        authors,
        isFilteredView: true
      },
      global: {
        stubs: {
          draggable: DraggableStub
        }
      }
    });

    expect(wrapper.text()).toContain('No tasks match your filters');
  });
});
