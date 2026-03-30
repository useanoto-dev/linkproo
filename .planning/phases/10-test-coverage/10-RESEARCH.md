# Phase 10: Test Coverage — Research

**Date:** 2026-03-29
**Status:** Complete

---

## Current Test State

### Passing (129 tests, 8 files)
| File | What it covers |
|------|---------------|
| `use-editor-history.test.ts` | editor-store: undo/redo, history limit, resetLink |
| `use-plan-limits.test.ts` | usePlanLimits hook (all plans, admin, edge cases) |
| `block-scheduling.test.ts` | BlockRenderer visibleFrom/visibleUntil logic (pure fn) |
| `whatsapp-url.test.ts` | generateWhatsAppUrl with message |
| `slug-utils.test.ts` | normalizeSlug, validateSlug, reserved slugs |
| `link-mappers.test.ts` | rowToSmartLink, smartLinkToRow |
| `color-utils.test.ts` | extractBgColor, getCustomBgGradient |
| `example.test.ts` | sanity (slug + color utils) |

### Failing (1 file)
- `use-autosave.test.ts` — imports `@/hooks/use-autosave` which **no longer exists** (autosave migrated to Zustand in Phase 3). This file must be fully rewritten.

---

## Missing Infrastructure

### Coverage provider not installed
- `@vitest/coverage-v8` not in package.json
- No `test:coverage` script
- No vitest `test` config block in `vite.config.ts` (environment, setupFiles, thresholds)

### Action needed
1. `npm install -D @vitest/coverage-v8`
2. Add `test` block to `vite.config.ts`:
   ```ts
   test: {
     environment: 'jsdom',
     setupFiles: ['./src/test/setup.ts'],
     coverage: {
       provider: 'v8',
       include: ['src/stores/**', 'src/hooks/**', 'src/lib/**', 'src/pages/PublicLinkPage.tsx'],
       thresholds: { lines: 70, functions: 70, branches: 70, statements: 70 },
     },
   }
   ```
3. Add `"test:coverage": "vitest run --coverage"` to scripts

---

## Coverage Gaps

### `src/stores/editor-store.ts`
Partially covered by `use-editor-history.test.ts` (undo/redo, resetLink, history limit).
**Missing:** setLink with skipHistory=true, updateLink, setUI, autosave state mutations (setAutosaveStatus, setAutosaveSavedAt, initAutosaveSnapshot, setAutosaveEnabled), previewLink updates.

### `src/stores/autosave-subscriber.ts`
**Zero coverage.** Core autosave logic: `registerAutosaveSubscriber`, `flushAutosave`, `retryAutosave`, `performSave`.
Needs Supabase mocked: `vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: vi.fn() } }))`.

### `src/pages/PublicLinkPage.tsx`
**Zero coverage.** Critical public route.
Key behaviors: loading skeleton, not-found state ("Link não encontrado"), renders SmartLinkPreview when link found, recordView called once.
Needs: `vi.mock('@/hooks/use-links')`, `vi.mock('@/lib/protect')`, `vi.mock('@/components/SmartLinkPreview', ...)`, HelmetProvider wrapper, MemoryRouter.

---

## Testing Patterns in This Codebase

From reading existing tests:
- Pure logic: test function directly (no hooks) — see `block-scheduling.test.ts`
- Hooks: `renderHook` from `@testing-library/react`, `vi.mock` before import
- Components: `render` + `screen` from `@testing-library/react`, MemoryRouter wrapper
- Async: `act` with `vi.useFakeTimers()` + `vi.advanceTimersByTime()`
- Supabase: mock the entire client module

## Validation Architecture

Coverage gate will be enforced via `vitest run --coverage` with `thresholds` configured. CI can run `npm run test:coverage`.

---

## Summary of Work

3 plans:
1. **Coverage infra** — install `@vitest/coverage-v8`, configure vite.config.ts test block, fix broken `use-autosave.test.ts` → rewrite as `autosave-subscriber.test.ts`
2. **editor-store comprehensive** — cover all store actions not yet tested
3. **PublicLinkPage** — component tests with mocked dependencies
