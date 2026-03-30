# Zustand Store Design — Sistema Link PRO Editor

**Authored:** 2026-03-29
**Status:** Design / Pre-implementation
**Scope:** Editor state only — server state stays in React Query
**Source files audited:**
- `src/pages/LinkEditor.tsx` (full — ~940 lines)
- `src/hooks/use-editor-history.ts`
- `src/hooks/use-autosave.ts`
- `src/hooks/use-links.ts`
- `src/types/smart-link.ts`

---

## 1. Problem Statement

`LinkEditor.tsx` currently manages at least **14 distinct pieces of state** spread across `useState`, `useRef`, and two custom hooks (`useEditorHistory`, `useAutosave`). The result:

| Problem | Evidence |
|---|---|
| History and link data live in separate `useState` calls inside a hook, causing multiple re-renders per action | `useEditorHistory` maintains `past`, `present`, `future` as three independent `useState` calls |
| Autosave is tightly coupled to component lifecycle via `useEffect` — it cannot persist across unmounts | `useAutosave` fires on every `link` reference change; `flush` is called in a component unmount effect |
| Preview debounce requires a second copy of `link` in `useState` | `previewLink` is a local `useState` that lags `link` by 50ms |
| Canvas drag state (`isDraggingOverPreview`, `ghostBlockType`) is component-local but needs to reach sub-tree | Only usable by prop-drilling or re-renders |
| `selectedElementId` is local but multiple distant components need it | `BlockEditor`, `CanvasPreview`, `CanvasPropertiesPanel` all consume it via props |

A Zustand store eliminates prop-drilling, decouples autosave from the component tree, and makes the history slice a first-class concern with a single source of truth.

---

## 2. Dependency Baseline

Neither `zustand` nor `immer` are currently installed (`package.json` verified 2026-03-29).

**Install command:**
```bash
npm install zustand@5 immer@11
```

Current registry versions (verified 2026-03-29):
- `zustand` — 5.0.12
- `immer` — 11.1.4

Zustand 5 exports `create` from `zustand` and `immer` middleware from `zustand/middleware/immer`. The `combine` and `subscribeWithSelector` middleware are available from `zustand/middleware`.

---

## 3. Boundary: What Goes in the Store vs. React Query

This is the most important architectural decision. **Zustand owns editor/client state. React Query owns server/remote state.**

```
React Query cache                        Zustand editor store
────────────────────────────             ────────────────────────────────────
useLink(id)  → SmartLink from DB         link (in-progress edits)
useSaveLink() → mutationFn               autosave.status, autosave.savedAt
useLinks()   → list of all links         ui.openDrawer, ui.device, etc.
                                         history.past[], history.future[]
                                         canvas.selectedElementId
                                         drag.isDraggingOverPreview
```

When the editor loads an existing link, `useLink(id)` fetches from Supabase, then `store.initFromServer(link)` hydrates the store. From that point, the store is the single source of truth. The server copy is only touched by autosave/explicit save.

---

## 4. Store Slices

Four cohesive slices. Each slice owns its state and actions.

### Slice A: `data` — The SmartLink being edited

Contains the authoritative in-progress `SmartLink`. Every field edit goes through this slice. This is what history tracks and what autosave serializes.

**State:**
```
link: SmartLink
isNew: boolean          — true until first explicit save or id doesn't start with "new-"
initialized: boolean    — false until server data has been loaded into the store
```

**Actions:**
```
updateLink(updates: Partial<SmartLink>): void
setLink(link: SmartLink): void          — replaces entire link (used by undo/redo, save response)
initFromServer(link: SmartLink): void   — hydrates store from server, sets initialized = true, resets history
```

### Slice B: `history` — Undo/Redo

Tracks snapshots of the `data.link` value. Operates on the `data` slice — it pushes to `past` before every `updateLink` call and manages `future` for redo.

**State:**
```
past: SmartLink[]       — capped at MAX_HISTORY = 50
future: SmartLink[]
```

**Actions:**
```
pushHistory(snapshot: SmartLink): void  — internal; called by updateLink middleware
undo(): void
redo(): void
clearHistory(): void                    — called on initFromServer
canUndo: boolean        — derived selector, not stored state
canRedo: boolean        — derived selector, not stored state
```

### Slice C: `autosave` — Save Status

Tracks debounce lifecycle and UI indicators. The actual save call lives in an external subscriber (see Section 7), not in the store itself. The store only records outcomes.

**State:**
```
status: 'idle' | 'saving' | 'saved' | 'error'
savedAt: Date | null
lastSavedSnapshot: string   — serialized link at last successful save (for dirty-check)
enabled: boolean            — false for new links until first explicit save
```

**Actions:**
```
setSaveStatus(status: AutosaveStatus): void
setSavedAt(date: Date): void
setLastSavedSnapshot(snapshot: string): void
setAutosaveEnabled(enabled: boolean): void
initSavedSnapshot(link: SmartLink): void    — called on load to prevent immediate save
```

### Slice D: `ui` — Editor UI State

All UI state that currently lives as `useState` in `LinkEditor`. No business logic — pure display decisions.

**State:**
```
openDrawer: 'elements' | 'theme' | 'effects' | 'pages' | null
selectedElementId: string | null
editingSubPageId: string | null
showPreview: boolean
showShortcuts: boolean
device: DeviceType                       — 'iphone15' | 'pixel8' | 'galaxy'
isCanvasMode: boolean
isDraggingOverPreview: boolean
ghostBlockType: BlockType | null
previewLink: SmartLink | null            — debounced copy for the preview panel
```

**Actions:**
```
setOpenDrawer(drawer: UISlice['openDrawer']): void
closeDrawer(): void
setSelectedElementId(id: string | null): void
setEditingSubPageId(id: string | null): void
setShowPreview(show: boolean): void
setShowShortcuts(show: boolean): void
setDevice(device: DeviceType): void
setCanvasMode(enabled: boolean): void
setIsDraggingOverPreview(dragging: boolean): void
setGhostBlockType(type: BlockType | null): void
setPreviewLink(link: SmartLink): void
```

---

## 5. Full TypeScript Interface

```typescript
// src/store/editor-store.ts

import { SmartLink, BlockType } from '@/types/smart-link';
import { DeviceType } from '@/components/editor/DeviceFrame';

// ─── Autosave ───────────────────────────────────────────────

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface AutosaveSlice {
  status: AutosaveStatus;
  savedAt: Date | null;
  lastSavedSnapshot: string;
  enabled: boolean;
  // actions
  setSaveStatus: (status: AutosaveStatus) => void;
  setSavedAt: (date: Date) => void;
  setLastSavedSnapshot: (snapshot: string) => void;
  setAutosaveEnabled: (enabled: boolean) => void;
  initSavedSnapshot: (link: SmartLink) => void;
}

// ─── History ────────────────────────────────────────────────

export interface HistorySlice {
  past: SmartLink[];
  future: SmartLink[];
  // actions
  pushHistory: (snapshot: SmartLink) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

// ─── UI ─────────────────────────────────────────────────────

export type OpenDrawer = 'elements' | 'theme' | 'effects' | 'pages' | null;

export interface UISlice {
  openDrawer: OpenDrawer;
  selectedElementId: string | null;
  editingSubPageId: string | null;
  showPreview: boolean;
  showShortcuts: boolean;
  device: DeviceType;
  isCanvasMode: boolean;
  isDraggingOverPreview: boolean;
  ghostBlockType: BlockType | null;
  previewLink: SmartLink | null;
  // actions
  setOpenDrawer: (drawer: OpenDrawer) => void;
  closeDrawer: () => void;
  setSelectedElementId: (id: string | null) => void;
  setEditingSubPageId: (id: string | null) => void;
  setShowPreview: (show: boolean) => void;
  setShowShortcuts: (show: boolean) => void;
  setDevice: (device: DeviceType) => void;
  setCanvasMode: (enabled: boolean) => void;
  setIsDraggingOverPreview: (dragging: boolean) => void;
  setGhostBlockType: (type: BlockType | null) => void;
  setPreviewLink: (link: SmartLink) => void;
}

// ─── Data ───────────────────────────────────────────────────

export interface DataSlice {
  link: SmartLink;
  isNew: boolean;
  initialized: boolean;
  // actions
  updateLink: (updates: Partial<SmartLink>) => void;
  setLink: (link: SmartLink) => void;
  initFromServer: (link: SmartLink) => void;
}

// ─── Full store ─────────────────────────────────────────────

export type EditorStore = DataSlice & HistorySlice & AutosaveSlice & UISlice;
```

---

## 6. Action Signatures (Full Catalogue)

This is the contract the component layer depends on. Do not modify these signatures during migration without updating all consumers.

```typescript
// ── Data actions ──────────────────────────────────────────

/**
 * Merges partial updates into the current link.
 * Automatically pushes the PREVIOUS state to history.past before merging.
 * Triggers the preview debounce.
 */
updateLink(updates: Partial<SmartLink>): void

/**
 * Replaces the link entirely.
 * Called after undo/redo and after explicit save returns the server copy.
 * Does NOT push to history (caller is responsible).
 */
setLink(link: SmartLink): void

/**
 * Called once when the editor loads an existing link from React Query.
 * Resets history, sets initialized = true, inits the autosave snapshot.
 * Sets isNew = false.
 */
initFromServer(link: SmartLink): void

// ── History actions ───────────────────────────────────────

/**
 * Pushes `snapshot` onto past[], trimming to MAX_HISTORY = 50.
 * Clears future[]. Internal — only called by updateLink.
 */
pushHistory(snapshot: SmartLink): void

/**
 * Pops the last entry from past[], moves current link to future[],
 * calls setLink() with the popped state. No-op if past is empty.
 */
undo(): void

/**
 * Pops the first entry from future[], moves current link to past[],
 * calls setLink() with the popped state. No-op if future is empty.
 */
redo(): void

/**
 * Empties past[] and future[]. Called on initFromServer.
 */
clearHistory(): void

// ── Autosave actions ──────────────────────────────────────

/** Updates the save indicator in the toolbar. */
setSaveStatus(status: 'idle' | 'saving' | 'saved' | 'error'): void

/** Records the timestamp of the last successful save. */
setSavedAt(date: Date): void

/**
 * Records the serialized snapshot of the last successfully saved state.
 * The autosave subscriber compares current serialization against this
 * to determine if a save is needed.
 */
setLastSavedSnapshot(snapshot: string): void

/** Enables or disables autosave (false for new links). */
setAutosaveEnabled(enabled: boolean): void

/**
 * Serializes the link and stores it as lastSavedSnapshot WITHOUT
 * triggering a save. Called on initFromServer to prevent spurious
 * saves on load.
 */
initSavedSnapshot(link: SmartLink): void

// ── UI actions ────────────────────────────────────────────

setOpenDrawer(drawer: OpenDrawer): void
closeDrawer(): void                           // sets openDrawer = null, editingSubPageId = null
setSelectedElementId(id: string | null): void
setEditingSubPageId(id: string | null): void
setShowPreview(show: boolean): void
setShowShortcuts(show: boolean): void
setDevice(device: DeviceType): void
setCanvasMode(enabled: boolean): void
setIsDraggingOverPreview(dragging: boolean): void
setGhostBlockType(type: BlockType | null): void
setPreviewLink(link: SmartLink): void
```

---

## 7. Autosave Integration: Subscriber Pattern

**Decision: external subscriber, not middleware and not component lifecycle.**

### Why Not Component Lifecycle

The current `useAutosave` hook fires inside a `useEffect` that depends on the `link` prop. If the component unmounts (e.g., route navigation), the pending debounce timer is torn down, potentially losing data. Moving autosave to a store subscriber means it outlives any single component.

### Why Not Middleware

Zustand middleware runs synchronously inside `set()`. Async debounced I/O does not belong in middleware — it would block the state update path and complicate error handling.

### The Subscriber Design

A dedicated module (`src/store/autosave-subscriber.ts`) is initialized once when the app boots (or when the editor is mounted for the first time). It subscribes to the store with `subscribeWithSelector` and manages its own debounce timer:

```typescript
// src/store/autosave-subscriber.ts  (signatures only)

/**
 * Serializes the SmartLink for dirty-checking.
 * Excludes volatile fields: views, clicks, createdAt.
 */
function serializeForDirtyCheck(link: SmartLink): string

/**
 * The save function implementation.
 * Calls Supabase update directly (same logic as the current autosaveFn in LinkEditor).
 * Receives userId from a closure or a separate auth store.
 */
async function performSave(link: SmartLink, userId: string): Promise<void>

/**
 * Registers the subscriber on the store.
 * Returns an unsubscribe function.
 *
 * Internal logic:
 * 1. Subscribe to store.link changes via subscribeWithSelector
 * 2. On each change, if autosave.enabled === false, skip
 * 3. Serialize current link, compare to store.autosave.lastSavedSnapshot
 * 4. If equal, skip (no changes)
 * 5. Else: clear existing timer, set new timer for AUTOSAVE_DELAY_MS (1500)
 * 6. In timer callback: call performSave, update store.autosave.* accordingly
 */
export function registerAutosaveSubscriber(
  store: StoreApi<EditorStore>,
  userId: string,
  delayMs?: number
): () => void   // returns unsubscribe

/**
 * Flushes any pending debounced save immediately.
 * Called on visibilitychange to 'hidden' and on editor unmount.
 */
export function flushAutosave(): Promise<void>
```

### Lifecycle in LinkEditor

```
Component mounts
  → registerAutosaveSubscriber(useEditorStore, user.id)   // once
  → returns unsubscribeFn, stored in a ref

React Query resolves existingLink
  → store.initFromServer(existingLink)                     // resets history, inits snapshot

User edits
  → store.updateLink(...)                                  // subscriber sees link change, starts timer

Tab hidden / component unmounts
  → flushAutosave()                                        // fires pending save immediately
  → unsubscribeFn()                                        // only on unmount
```

### Retry from UI

```typescript
// Still exposed as a store action for the toolbar retry button
store.autosave.retry = () => flushAutosave()
```

---

## 8. History Integration: Immer Middleware

**Decision: immer middleware for all state writes, history logic inside `updateLink`.**

### Why Immer

The `SmartLink` type is deeply nested (buttons array, blocks array, pages array, each with their own optional sub-objects). Without immer, every `updateLink` call requires careful spread chains to avoid mutating nested state. Immer lets action implementations write as if mutating — the middleware produces the correct immutable result.

### History Push Inside `updateLink`

The key insight from the current `useEditorHistory` is that `skipRef` is used to prevent undo/redo operations themselves from pushing to history. In the store, we replicate this with a flag:

```typescript
// Conceptual implementation (not code — design only)

// In the store's updateLink action:
updateLink: (updates) => {
  set((state) => {
    // 1. Push current link to past (before applying update)
    state.past = [...state.past.slice(-(MAX_HISTORY - 1)), state.link];
    state.future = [];                    // new edit invalidates redo stack
    // 2. Apply the update to link (immer handles immutability)
    Object.assign(state.link, updates);
    // 3. Schedule preview debounce (see section 9)
  });
}

// In undo:
undo: () => {
  set((state) => {
    if (state.past.length === 0) return;
    const prev = state.past[state.past.length - 1];
    state.future = [state.link, ...state.future];
    state.link = prev;
    state.past = state.past.slice(0, -1);
    // Note: does NOT re-push to past because this IS the undo —
    // we moved link → future, past[-1] → link
  });
}
```

This is simpler than the current hook because there is no `skipRef` needed — the undo/redo actions directly manipulate `past` and `future` as part of the same atomic `set()` call. The race condition that `skipRef` guarded against (setting `present` firing another `setPresent` effect) does not exist in Zustand's synchronous `set()`.

### MAX_HISTORY

Constant defined at module level: `const MAX_HISTORY = 50`. Matches the current hook.

### Derived Selectors (not stored state)

```typescript
// Computed on read — never stored in state
const canUndo = useEditorStore((s) => s.past.length > 0);
const canRedo = useEditorStore((s) => s.future.length > 0);
```

These are selectors, not slice state. Storing boolean flags that derive from array lengths creates redundant state and sync bugs.

---

## 9. Preview Debounce in the Store

The current component uses a `useEffect + setTimeout` to maintain `previewLink` as a 50ms-lagged copy of `link`. This can move into the store as a side effect of `updateLink`, or remain as a lightweight hook.

**Recommendation: keep as a hook, but source the data from the store.**

The debounce is purely a rendering optimization (it prevents 60fps re-renders of the expensive `SmartLinkPreview` tree). It does not belong in the store's core state. However, `previewLink` as a store field (`ui.previewLink`) lets distant components like `CanvasPreview` consume it via selector without prop-drilling.

**Pattern:**
```typescript
// A thin hook that reads from the store and updates ui.previewLink
// src/hooks/use-preview-link.ts

export function usePreviewLinkSync() {
  const link = useEditorStore((s) => s.link);
  const setPreviewLink = useEditorStore((s) => s.setPreviewLink);

  useEffect(() => {
    const timer = setTimeout(() => setPreviewLink(link), 50);
    return () => clearTimeout(timer);
  }, [link, setPreviewLink]);
}
```

This hook is called once at the top of `LinkEditor` (or in a store initializer component). `previewLink` is then available in the store for any subscriber.

---

## 10. Migration Path

The goal is incremental migration — each step is independently deployable without breaking the editor.

### Phase 0: Install dependencies and create the store skeleton

```bash
npm install zustand@5 immer@11
```

Create `src/store/editor-store.ts` with all slices and initial state. At this point, the store is not used by any component — it is simply importable.

Create `src/store/autosave-subscriber.ts` with `registerAutosaveSubscriber` and `flushAutosave`.

**Risk:** Zero — nothing is wired yet.

### Phase 1: Migrate UI state

Replace these `useState` calls in `LinkEditor` with store reads/writes:
- `showPreview`
- `showShortcuts`
- `device`
- `openDrawer`
- `selectedElementId`
- `editingSubPageId`
- `isCanvasMode`
- `isDraggingOverPreview`
- `ghostBlockType`

These have no cross-cutting concerns. Each `useState` becomes a `useEditorStore(s => s.X)` read and `useEditorStore(s => s.setX)` action call.

**Validation:** All existing behavior works identically. The drawer opens/closes, device picker works, canvas mode toggles, drag-over highlight appears.

**Risk:** Low — no async, no side effects, pure UI state.

### Phase 2: Migrate link data and history

Replace `useEditorHistory(initialLink)` with the store's `data` and `history` slices.

Replace all `setLink(...)` calls with `store.updateLink(...)`.
Replace `set(prev => ...)` functional updates with `store.updateLink(...)` + `get().link` reads where needed.

Wire `initFromServer` in the `useEffect` that currently calls `reset(existingLink)`.

**Validation:** Undo/redo buttons work. Ctrl+Z / Ctrl+Shift+Z work. Changes survive navigating between drawers.

**Risk:** Medium — history logic changes. Requires careful audit of every `setLink` call site.

### Phase 3: Migrate autosave

Remove `useAutosave` from `LinkEditor`.
Wire `registerAutosaveSubscriber(useEditorStore.getState(), user.id)` in a `useEffect` with cleanup.
Wire `flushAutosave()` on `visibilitychange` and on unmount.
Display `store.autosave.status` and `store.autosave.savedAt` in the toolbar.

**Validation:** Autosave indicator shows correctly. Edits trigger save after 1500ms. Tab-hide triggers immediate save. Error state shows retry button.

**Risk:** Medium — async I/O, needs thorough testing of the timing contract.

### Phase 4: Delete old hooks

Once all three phases validate:
- Delete `src/hooks/use-editor-history.ts`
- Remove `useAutosave` import and usage from `LinkEditor`
- Remove `previewLink` local `useState` (now in store)
- Remove `previewTimerRef` (now in `usePreviewLinkSync`)

**Net result:** `LinkEditor.tsx` shrinks from ~940 lines. All state reads/writes are single-line store selectors. The component is reduced to layout and event routing.

---

## 11. Selector Patterns for Consumers

### Fine-grained subscriptions (avoid full-store re-renders)

Each component should subscribe to only the fields it reads:

```typescript
// Good — only re-renders when openDrawer changes
const openDrawer = useEditorStore((s) => s.openDrawer);

// Good — only re-renders when link.buttons array changes
const buttons = useEditorStore((s) => s.link.buttons);

// Dangerous — re-renders on ANY store change
const store = useEditorStore();
```

### Shallow equality for object/array selections

When selecting multiple scalars at once, use the `shallow` comparator from Zustand 5:

```typescript
import { useShallow } from 'zustand/react/shallow';

const { canUndo, canRedo } = useEditorStore(
  useShallow((s) => ({
    canUndo: s.past.length > 0,
    canRedo: s.future.length > 0,
  }))
);
```

### Pre-built selectors file

Create `src/store/editor-selectors.ts` to colocate derived computations:

```typescript
export const selectCanUndo      = (s: EditorStore) => s.past.length > 0;
export const selectCanRedo      = (s: EditorStore) => s.future.length > 0;
export const selectIsExisting   = (s: EditorStore) => !s.link.id.startsWith('new-');
export const selectCanvasElement = (s: EditorStore) =>
  s.selectedElementId
    ? (s.link.buttons.find(b => b.id === s.selectedElementId) ??
       s.link.blocks.find(b => b.id === s.selectedElementId) ??
       null)
    : null;
export const selectAutosaveVisible = (s: EditorStore) =>
  !s.link.id.startsWith('new-') && s.initialized;
```

---

## 12. Open Questions and Risks

### Q1: Store lifetime vs. route lifecycle

Zustand stores are module singletons by default — they persist across React route changes. If a user navigates Editor → Dashboard → Editor (different link), the store will still hold the previous link's data until `initFromServer` is called.

**Risk:** Brief flash of stale data on second load.
**Mitigation:** Call `store.initFromServer(newLink)` at the start of the new route render, before the first paint. Alternatively, use `useEditorStore.setState(initialState)` on route entry to reset all slices. Consider exporting a `resetStore()` action.

### Q2: Multi-tab editing

If a user opens the same link in two tabs, each tab has its own store instance (different JS contexts). Autosave in tab A may overwrite autosave in tab B.

**Risk:** Data loss.
**Current risk:** Same problem exists today. Not made worse by this migration.
**Future mitigation:** Use Supabase Realtime to detect concurrent edits (out of scope for this migration).

### Q3: Immer and `SmartLink` type compatibility

Immer wraps state in a `Draft<T>` proxy. The `SmartLink` type has optional array fields (`buttons`, `blocks`, `pages`) that might be `undefined`. Immer handles this correctly as long as initial state is never `undefined` for arrays — they must be `[]`.

**Risk:** Subtle bugs if `createDefaultLink()` returns undefined arrays.
**Verification:** `createDefaultLink()` already initializes `buttons: []`, `blocks: []`, `pages: []`. The `SmartLink` interface has these as required non-optional fields in the type. Safe.

### Q4: `smartLinkToRow` in the autosave subscriber

The autosave subscriber needs to call `smartLinkToRow(link, user.id)` before writing to Supabase. This mapper currently lives in `src/lib/link-mappers.ts`. The subscriber needs access to the current `userId`.

**Design:** Pass `userId` into `registerAutosaveSubscriber` at mount time (from `useAuth()`). If the user logs out during an edit session, the subscriber should detect `userId` becoming null and skip saves.

### Q5: History memory usage

Storing 50 full `SmartLink` snapshots. A complex link with many blocks, canvas positions, effects, and sub-pages could reach 50–100KB per snapshot. 50 snapshots × 100KB = ~5MB in-memory.

**Risk:** Elevated memory on complex links.
**Mitigation:** The 50-entry cap is the primary guard. For V2, consider structural sharing (only store diffs) using immer's `enableMapSet` + patches API (`produceWithPatches`). Not needed for initial migration.

---

## 13. File Structure

```
src/
├── store/
│   ├── editor-store.ts           — store creation, all slices, immer middleware
│   ├── editor-selectors.ts       — derived selector functions
│   └── autosave-subscriber.ts    — external subscriber + flushAutosave
├── hooks/
│   ├── use-preview-link.ts       — syncs store.link → store.ui.previewLink with 50ms debounce
│   └── use-editor-shortcuts.ts   — keyboard handler (Ctrl+Z, Ctrl+S etc.) — reads from store
```

The old hooks are deleted after Phase 4 of the migration:
- `src/hooks/use-editor-history.ts` — replaced by history slice
- `src/hooks/use-autosave.ts` — replaced by autosave subscriber

---

## 14. Summary Decisions

| Concern | Decision | Rationale |
|---|---|---|
| Store library | Zustand 5 | Minimal boilerplate, no Provider required, native TS support |
| Immutability | Immer middleware | SmartLink is deeply nested; spread-based updates are error-prone |
| History | Inside store, in `updateLink` action | Single atomic set() avoids the skipRef race condition |
| Autosave | External subscriber | Decoupled from component lifecycle, survives unmounts |
| Preview debounce | Thin hook writing to `ui.previewLink` | Rendering concern, not business logic — stays in hook layer |
| Server state | Stays in React Query | No replacement — Zustand is for editor/UI state only |
| Slice structure | 4 slices: data, history, autosave, ui | Clear ownership boundaries, no cross-slice spaghetti |
| Selector strategy | Fine-grained + `useShallow` for multi-field | Prevents unnecessary re-renders in complex sub-components |
| Migration strategy | 4 phases, each independently deployable | Zero-risk Phase 0, low-risk Phase 1, validates before proceeding |
