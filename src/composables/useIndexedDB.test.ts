import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it } from 'vitest';
import { getBoardFromDb, saveBoardToDb } from './useIndexedDB';

const validPayload = {
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
};

describe('useIndexedDB', () => {
  beforeEach(() => {
    globalThis.indexedDB = new IDBFactory();
  });

  it('returns null when no board has been saved', async () => {
    const result = await getBoardFromDb();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toBeNull();
    }
  });

  it('round-trips valid board payloads', async () => {
    const saveResult = await saveBoardToDb(validPayload);
    expect(saveResult.ok).toBe(true);

    const readResult = await getBoardFromDb();
    expect(readResult.ok).toBe(true);
    if (readResult.ok) {
      expect(readResult.data?.tasks[0]?.title).toBe('Persisted task');
    }
  });

  it('rejects corrupted payloads on read', async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('kanban-board-db', 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore('board-state', { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('board-state', 'readwrite');
      const store = transaction.objectStore('board-state');
      const request = store.put({
        id: 'kanban-board',
        payload: {
          columns: [],
          authors: [{ id: 1, name: 'Emma Carter' }],
          tasks: [{ id: 1, title: '', authorId: 1, status: 'todo', createdAt: 'not-a-date', order: 0 }]
        }
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    const readResult = await getBoardFromDb();

    expect(readResult.ok).toBe(false);
    if (!readResult.ok) {
      expect(readResult.reason).toBe('invalid_payload');
    }
  });
});
