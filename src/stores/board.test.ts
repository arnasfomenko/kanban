import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useBoardStore } from './board';

const { getBoardFromDb, saveBoardToDb } = vi.hoisted(() => ({
  getBoardFromDb: vi.fn(),
  saveBoardToDb: vi.fn()
}));

vi.mock('../composables/useIndexedDB', () => ({
  getBoardFromDb,
  saveBoardToDb
}));

describe('board store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    getBoardFromDb.mockReset();
    saveBoardToDb.mockReset();
    saveBoardToDb.mockResolvedValue({ ok: true, data: undefined });
  });

  it('loads persisted board data on init', async () => {
    getBoardFromDb.mockResolvedValue({
      ok: true,
      data: {
        columns: [{ id: 'todo', name: 'to do', order: 1, default: true }],
        authors: [{ id: 1, name: 'Emma Carter' }],
        tasks: [
          {
            id: 101,
            title: 'Persisted task',
            authorId: 1,
            status: 'todo',
            createdAt: '2025-01-05T09:00:00Z',
            order: 0
          }
        ]
      }
    });

    const board = useBoardStore();
    await board.init();

    expect(board.initialized).toBe(true);
    expect(board.tasks).toHaveLength(1);
    expect(board.tasks[0]?.title).toBe('Persisted task');
  });

  it('creates tasks in the default column with incremental ids', async () => {
    getBoardFromDb.mockResolvedValue({
      ok: true,
      data: {
        columns: [
          { id: 'todo', name: 'to do', order: 1, default: true },
          { id: 'done', name: 'done', order: 2 }
        ],
        authors: [{ id: 1, name: 'Emma Carter' }],
        tasks: [
          {
            id: 10,
            title: 'Existing',
            authorId: 1,
            status: 'todo',
            createdAt: '2025-01-05T09:00:00Z',
            order: 0
          }
        ]
      }
    });

    const board = useBoardStore();
    await board.init();

    const created = await board.createTask('New task', 1);

    expect(created.id).toBe(11);
    expect(created.status).toBe('todo');
    expect(created.order).toBe(0);
    expect(board.getTasksByColumn('todo')[0]?.title).toBe('New task');
    expect(saveBoardToDb).toHaveBeenCalled();
  });

  it('surfaces persistence warnings when save fails', async () => {
    getBoardFromDb.mockResolvedValue({ ok: true, data: null });
    saveBoardToDb.mockResolvedValue({ ok: false, error: 'Quota exceeded', reason: 'storage' });

    const board = useBoardStore();
    await board.init();
    await board.createTask('Blocked task', 1);

    expect(board.persistenceWarning).toContain('Quota exceeded');
  });

  it('falls back to seed data when persisted payload is invalid', async () => {
    getBoardFromDb.mockResolvedValue({
      ok: false,
      error: 'tasks[0].title must be a non-empty string',
      reason: 'invalid_payload'
    });

    const board = useBoardStore();
    await board.init();

    expect(board.initialized).toBe(true);
    expect(board.persistenceWarning).toContain('invalid');
    expect(board.tasks.length).toBeGreaterThan(20);
  });

  it('reorders visible tasks while preserving hidden tasks when filtered', async () => {
    getBoardFromDb.mockResolvedValue({
      ok: true,
      data: {
        columns: [
          { id: 'todo', name: 'to do', order: 1, default: true },
          { id: 'done', name: 'done', order: 2 }
        ],
        authors: [{ id: 1, name: 'Emma Carter' }],
        tasks: [
          {
            id: 1,
            title: 'Visible A',
            authorId: 1,
            status: 'todo',
            createdAt: '2025-01-01T00:00:00Z',
            order: 0
          },
          {
            id: 2,
            title: 'Hidden',
            authorId: 1,
            status: 'todo',
            createdAt: '2025-01-02T00:00:00Z',
            order: 1
          },
          {
            id: 3,
            title: 'Visible B',
            authorId: 1,
            status: 'todo',
            createdAt: '2025-01-03T00:00:00Z',
            order: 2
          }
        ]
      }
    });

    const board = useBoardStore();
    await board.init();

    const visibleA = board.tasks.find((task) => task.id === 3);
    const visibleB = board.tasks.find((task) => task.id === 1);
    expect(visibleA).toBeDefined();
    expect(visibleB).toBeDefined();

    await board.reorderColumn('todo', [visibleA!, visibleB!], true);

    expect(board.getTasksByColumn('todo').map((task) => task.id)).toEqual([3, 2, 1]);
  });

  it('moves tasks to another column on reorder', async () => {
    getBoardFromDb.mockResolvedValue({
      ok: true,
      data: {
        columns: [
          { id: 'todo', name: 'to do', order: 1, default: true },
          { id: 'done', name: 'done', order: 2 }
        ],
        authors: [{ id: 1, name: 'Emma Carter' }],
        tasks: [
          {
            id: 1,
            title: 'Move me',
            authorId: 1,
            status: 'todo',
            createdAt: '2025-01-01T00:00:00Z',
            order: 0
          }
        ]
      }
    });

    const board = useBoardStore();
    await board.init();
    const task = board.tasks[0];

    await board.reorderColumn('done', [{ ...task, status: 'done' }]);

    expect(board.getTasksByColumn('done')[0]?.id).toBe(1);
    expect(board.getTasksByColumn('todo')).toHaveLength(0);
  });

  it('deletes tasks and reindexes the column', async () => {
    getBoardFromDb.mockResolvedValue({
      ok: true,
      data: {
        columns: [{ id: 'todo', name: 'to do', order: 1, default: true }],
        authors: [{ id: 1, name: 'Emma Carter' }],
        tasks: [
          {
            id: 1,
            title: 'Keep',
            authorId: 1,
            status: 'todo',
            createdAt: '2025-01-01T00:00:00Z',
            order: 0
          },
          {
            id: 2,
            title: 'Remove',
            authorId: 1,
            status: 'todo',
            createdAt: '2025-01-02T00:00:00Z',
            order: 1
          }
        ]
      }
    });

    const board = useBoardStore();
    await board.init();

    await board.deleteTask(2);

    expect(board.tasks.map((task) => task.id)).toEqual([1]);
    expect(board.getTasksByColumn('todo')[0]?.order).toBe(0);
    expect(saveBoardToDb).toHaveBeenCalled();
  });
});
