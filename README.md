## Run locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open the local address shown in the terminal.

### Quality checks

```bash
npm run typecheck
npm run test
npm run test:e2e
npm run ci
```

`npm run ci` runs typecheck, unit/component tests, a production build, and Playwright E2E tests.

First-time E2E setup:

```bash
npx playwright install chromium
```
## Implementation notes

### Architecture

- **Pinia store** (`src/stores/board.ts`) — board state, task CRUD, column ordering, persistence orchestration.
- **Composables** — `useIndexedDB` (read/write with typed results), `useQueryFilters` (URL sync), `useAppToast` (user-visible persistence feedback).
- **Pure utilities** — `taskFilters`, `boardOrder`, `taskIds` (testable without Vue).
- **Components** — presentational UI only; `HomeView` wires store, filters, and handlers.

### IndexedDB

- Database: `kanban-board-db`, store: `board-state`, document id: `kanban-board`.
- First visit seeds from `data.json` and writes to IndexedDB.
- Read/write failures return `{ ok: false, error, reason }` and surface a PrimeVue toast warning; the app falls back to seed data when reads fail or stored payloads are invalid.
- Persisted payloads are validated on read and before write via `parseBoardPayload` in `src/utils/boardValidation.ts` (shape checks plus referential integrity for column/author ids).

### URL filters

- `authorId` updates the URL immediately.
- `title` updates the input immediately but debounces URL writes by 300ms to avoid history noise.
- Browser back/forward and refresh restore filters from query params via `syncFromRoute`.

### Drag and drop while filtering

- Columns render a filtered subset when filters are active.
- Reordering calls `reorderColumn(..., mergeVisible: true)` so hidden tasks keep their relative positions via `mergeVisibleOrder`.

### Task IDs and order

- New task IDs use `max(existing id) + 1` (stable with seed data ids 101–124).
- Seed tasks without `order` get order assigned on init from `createdAt` per column.

### Loading state

- The board renders a skeleton until `board.initialized` is true after the first IndexedDB read.

### Tests

- **Unit / store**: filter matching, order merging, ID generation, payload validation, IndexedDB round-trip (via `fake-indexeddb`), store init/create/reorder/delete, persistence warnings, debounced URL filters.
- **Component**: `FilterPanel` and `BoardColumn` wiring (with draggable stubbed).
- **E2E** (`e2e/kanban.spec.ts`): seed load, URL filter restore, create + reload persistence, cross-column drag-and-drop, filtered-board sanity check.

No IndexedDB schema migrations are implemented; the take-home dataset is fixed and validation rejects corrupted snapshots instead.
