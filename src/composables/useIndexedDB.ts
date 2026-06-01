import { BoardPayload } from '../types';
import { parseBoardPayload } from '../utils/boardValidation';

const DB_NAME = 'kanban-board-db';
const STORE_NAME = 'board-state';
const DB_VERSION = 1;

export type PersistenceFailureReason = 'storage' | 'invalid_payload';

export type PersistenceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; reason: PersistenceFailureReason };

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

class InvalidBoardPayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidBoardPayloadError';
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown persistence error';
}

export async function getBoardFromDb(): Promise<PersistenceResult<BoardPayload | null>> {
  try {
    const db = await openDatabase();
    const payload = await new Promise<BoardPayload | null>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('kanban-board');

      request.onsuccess = () => {
        const raw = request.result?.payload ?? null;
        if (raw === null) {
          resolve(null);
          return;
        }

        const validated = parseBoardPayload(raw);
        if (!validated.ok) {
          reject(new InvalidBoardPayloadError(validated.errors.join('; ')));
          return;
        }

        resolve(validated.data);
      };
      request.onerror = () => reject(request.error);

      transaction.onerror = () => reject(transaction.error);
    });

    return { ok: true, data: payload };
  } catch (error) {
    if (error instanceof InvalidBoardPayloadError) {
      return { ok: false, error: error.message, reason: 'invalid_payload' };
    }

    return { ok: false, error: getErrorMessage(error), reason: 'storage' };
  }
}

export async function saveBoardToDb(payload: BoardPayload): Promise<PersistenceResult<void>> {
  try {
    const db = await openDatabase();
    const data = JSON.parse(JSON.stringify(payload));

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ id: 'kanban-board', payload: data });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);

      transaction.onerror = () => reject(transaction.error);
    });

    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error), reason: 'storage' };
  }
}
