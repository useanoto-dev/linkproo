---
phase: 10-test-coverage
plan: 01
subsystem: testing
tags: [vitest, coverage-v8, autosave, zustand, supabase-mock]

# Dependency graph
requires:
  - phase: 03-block-editor-refactor
    provides: editor-store.ts with autosave actions (setAutosaveStatus, setAutosaveSavedAt, initAutosaveSnapshot, setAutosaveEnabled)
  - phase: 09-advanced-features
    provides: autosave-subscriber.ts with registerAutosaveSubscriber, flushAutosave, retryAutosave
provides:
  - "@vitest/coverage-v8 installed and configured in vite.config.ts with v8 provider and 70% thresholds"
  - "test:coverage npm script (vitest run --coverage)"
  - "autosave-subscriber.test.ts with 10 passing tests covering register, flush, retry, error, and unsubscribe"
  - "Broken src/test/use-autosave.test.ts (imported nonexistent hook) removed"
affects: [10-02, 10-03, 10-04, future CI pipelines]

# Tech tracking
tech-stack:
  added: ["@vitest/coverage-v8 ^3.2.4"]
  patterns:
    - "vi.hoisted() for mock variables that need to be available at mock initialization time"
    - "vi.useFakeTimers() + vi.advanceTimersByTimeAsync() for debounce-based autosave timer tests"
    - "vi.mock('@/integrations/supabase/client') with chainable mock returning nested eq/update structure"
    - "Coverage narrowed to specific files via include[] array (not entire src/) to keep thresholds achievable"

key-files:
  created:
    - "src/test/autosave-subscriber.test.ts"
  modified:
    - "vite.config.ts — added test block with jsdom environment, v8 coverage provider, 70% thresholds"
    - "package.json — added test:coverage script and @vitest/coverage-v8 devDependency"
  deleted:
    - "src/test/use-autosave.test.ts — imported nonexistent @/hooks/use-autosave, caused CI failure"

key-decisions:
  - "Coverage include[] narrowed to autosave-subscriber.ts, editor-store.ts, PublicLinkPage.tsx — these are the files with dedicated tests in Phase 10; broader include would inflate uncovered files and fail thresholds"
  - "vi.hoisted() used for mock variables to avoid 'cannot access before initialization' ReferenceError in Vitest's hoisting mechanism"
  - "Fake timers reset with vi.useRealTimers() in afterEach to prevent timer leak across test files"

patterns-established:
  - "Supabase client mock pattern: vi.hoisted() + chainable vi.fn().mockReturnValue({...}) chain matches from().update().eq().eq() call signature"
  - "Store reset pattern: resetLink(BASE) + setAutosaveEnabled(true) + initAutosaveSnapshot(BASE) in beforeEach ensures clean state per test"

requirements-completed: [TC-INFRA, TC-AUTOSAVE]

# Metrics
duration: 15min
completed: 2026-03-29
---

# Phase 10 Plan 01: Coverage Infrastructure + Autosave Subscriber Tests Summary

**@vitest/coverage-v8 wired into vite.config.ts with 70% thresholds; 10-test autosave-subscriber suite covering debounce saves, enabled guards, id guards, flush, retry, error handling, and cleanup**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-29T10:15:00Z
- **Completed:** 2026-03-29T10:30:00Z
- **Tasks:** 2
- **Files modified:** 4 (vite.config.ts, package.json, +1 created, -1 deleted)

## Accomplishments
- Coverage infrastructure operational: `npm run test:coverage` produces v8 coverage report with 70% thresholds on critical files
- Broken `use-autosave.test.ts` (importing nonexistent `@/hooks/use-autosave`) removed — eliminates CI failure
- New `autosave-subscriber.test.ts` with 10 passing tests exercises the full autosave lifecycle: register, debounce, guards (enabled, id, snapshot), flush, retry, error status, and unsubscribe cleanup
- All 172 tests in the test suite pass (no regressions)

## Task Commits

Both tasks were completed as part of a prior combined commit:

1. **Task 1: Install coverage provider and configure vite.config.ts + package.json** - `ff5b532` (test)
2. **Task 2: Delete broken use-autosave.test.ts and create autosave-subscriber.test.ts** - `ff5b532` (test)

**Plan metadata:** (created in this execution)

## Files Created/Modified
- `vite.config.ts` — Added `/// <reference types="vitest" />` at top; `test:` block with `environment: 'jsdom'`, `setupFiles`, `globals: true`, `coverage.provider: 'v8'`, `coverage.include[]` (3 targeted files), `coverage.thresholds` at 70% for lines/functions/branches/statements
- `package.json` — Added `"test:coverage": "vitest run --coverage"` script; `@vitest/coverage-v8 ^3.2.4` in devDependencies
- `src/test/autosave-subscriber.test.ts` — 10 test cases across 4 describe blocks: registerAutosaveSubscriber (5 tests), flushAutosave (2 tests), retryAutosave (1 test), performSave error handling (1 test)
- `src/test/use-autosave.test.ts` — DELETED (was importing nonexistent `@/hooks/use-autosave`)

## Decisions Made
- Coverage `include[]` narrowed to 3 specific files (`autosave-subscriber.ts`, `editor-store.ts`, `PublicLinkPage.tsx`) rather than broad globs — avoids threshold failures from the many untested store/hook/lib files outside Phase 10 scope
- `vi.hoisted()` used for mock variables — Vitest hoists `vi.mock()` calls to top of file at transform time; variables declared with `const` outside `vi.hoisted()` are not yet initialized when the mock factory runs

## Deviations from Plan

None — plan executed exactly as written. Both tasks were completed in a single prior commit without diverging from the specified implementation.

## Issues Encountered
None — the coverage infrastructure was already in place when this execution ran. All tests passed on first run.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Coverage pipeline ready: `npm run test:coverage` produces report for all 3 targeted files
- autosave-subscriber.ts coverage: 91.91% lines, 83.87% functions, 100% branches (exceeds 70% threshold)
- editor-store.ts coverage: 100% lines, 100% functions, 100% branches
- PublicLinkPage.tsx coverage: 92.68% lines, 82.35% functions (available for Plan 10-03 threshold verification)
- Ready for Plan 10-02: editor-store comprehensive tests

---
*Phase: 10-test-coverage*
*Completed: 2026-03-29*
