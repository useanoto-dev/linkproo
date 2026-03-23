---
phase: 01-design-system
plan: "03"
subsystem: typescript
tags: [typescript, strict-mode, types, as-any-elimination]

requires:
  - phase: 01-02
    provides: strict-mode-foundation (strict:true active, tsc 0 errors)
provides:
  - zero-as-any (grep "as any" src/ returns 0 matches)
  - CatalogItem typed interface in ElementsSidebar
  - Pick<Tables<>> typed Supabase result arrays in AdminAnalyticsPage
  - Typed mutation payloads in AdminSupportPage
  - as-unknown-as mock pattern in slug-utils.test
affects: [all-phases]

tech-stack:
  added: []
  patterns:
    - "Pick<Tables<'table'>> for Supabase query result typing — only select the columns actually queried"
    - "as unknown as ReturnType<typeof supabase.from> for test mock casts (avoids as any)"
    - "Partial<T> & { required: fields } for typed mutation payloads where shape is partially known"
    - "CatalogItem interface with defaults?: Record<string, unknown> for heterogeneous item catalogs"

key-files:
  created: []
  modified:
    - src/components/editor/ElementsSidebar.tsx
    - src/hooks/use-user-role.ts
    - src/test/slug-utils.test.ts
    - src/pages/admin/AdminAnalyticsPage.tsx
    - src/pages/admin/AdminSupportPage.tsx

key-decisions:
  - "Pick<Tables<>> used for Supabase result aliases — matches only the .select() columns, avoids importing full Row type"
  - "as unknown as ReturnType<typeof supabase.from> is the accepted test-mock pattern for partial Supabase client mocks"
  - "No ts-expect-error suppressions were needed — all 10 as-any instances had proper type solutions"

patterns-established:
  - "Pattern: Supabase typed results — use Pick<Tables<'table'>, 'col1' | 'col2'> matching .select() fields"
  - "Pattern: Test mocks — use as unknown as X (double cast) instead of as any for intentionally partial mocks"
  - "Pattern: Mutation payloads — type as Partial<T> & required fields intersection when shape is variable"

requirements-completed: [TS-02, TEST-01]

duration: ~3min
completed: 2026-03-23
---

# Phase 01 Plan 03: Eliminate All as-any Casts Summary

**All 10 remaining `as any` instances eliminated from 5 files using proper TypeScript types — zero `as any` in codebase, `tsc --noEmit` exits 0 with `strict:true`.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-23T23:09:18Z
- **Completed:** 2026-03-23T23:12:39Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Zero `as any` in entire `src/` directory (`grep -rn "as any" src/` returns 0 matches)
- `tsc --noEmit` exits with code 0 — no errors, no `// @ts-expect-error` suppressions added
- All 39 existing slug-utils tests still pass after mock type changes
- Vite production build succeeds cleanly

## Task Commits

1. **Task 1: Fix as-any in ElementsSidebar, use-user-role, and slug-utils.test** - `9b9cd14` (fix)
2. **Task 2: Fix as-any in AdminAnalyticsPage, AdminSupportPage** - `0fc51d6` (fix)

## Files Created/Modified

- `src/components/editor/ElementsSidebar.tsx` - Added `CatalogItem` and `Category` interfaces, typed `categories` array, removed 2x `(el as any).defaults`
- `src/hooks/use-user-role.ts` - Removed `as any` cast from `.from("user_roles")` — table exists in generated types
- `src/test/slug-utils.test.ts` - Replaced 2x `as any` with `as unknown as ReturnType<typeof supabase.from>` pattern
- `src/pages/admin/AdminAnalyticsPage.tsx` - Added `import type { Tables }`, defined `LinkView`/`LinkClick`/`Profile`/`AdminLink` aliases, replaced 4x `as any[]` casts + all `(x: any)` callback params
- `src/pages/admin/AdminSupportPage.tsx` - Typed `handleSaveFaq` payload as `Partial<SupportFaq> & { question, answer }`, `handleSaveContact` payload as `Partial<SupportContact> & { channel_type, title, url }`

## Decisions Made

- Used `Pick<Tables<"table">, "col1" | "col2">` for Supabase result types rather than full Row types — matches the actual `.select()` columns and avoids importing extra fields
- Used `as unknown as ReturnType<typeof supabase.from>` (double-cast) for test mocks — the standard pattern when a mock intentionally implements only the subset of methods used by the test
- No `// @ts-expect-error` suppressions were required — all instances had clean type solutions

## ts-expect-error Suppressions Added

**Zero** — no suppressions were needed. All 10 `as any` instances were resolved with proper types.

## Verification Results

- `grep -rn "as any" src/` — ZERO matches
- `npx tsc --noEmit` — EXIT 0 (0 errors)
- `npx vitest run src/test/slug-utils.test.ts` — 39/39 tests passing
- `npx vite build` — builds successfully

## Deviations from Plan

None — plan executed exactly as written. All `as any` instances had the exact fixes described in the plan.

## Known Stubs

None — all changes are type improvements with no stub or placeholder values.

## Self-Check: PASSED

Files verified:
- FOUND: src/components/editor/ElementsSidebar.tsx (contains `interface CatalogItem`, `defaults?: Record<string, unknown>`, `el.defaults` without cast)
- FOUND: src/hooks/use-user-role.ts (`.from("user_roles")` without any cast)
- FOUND: src/test/slug-utils.test.ts (contains `as unknown as ReturnType<typeof supabase.from>`)
- FOUND: src/pages/admin/AdminAnalyticsPage.tsx (contains `import type { Tables }`, `type LinkView = Pick<Tables<"link_views">`)
- FOUND: src/pages/admin/AdminSupportPage.tsx (`handleSaveFaq` has typed payload, `handleSaveContact` has typed payload)

Commits verified:
- FOUND: 9b9cd14 - fix(01-03): eliminate as-any in ElementsSidebar, use-user-role, slug-utils.test
- FOUND: 0fc51d6 - fix(01-03): eliminate as-any in AdminAnalyticsPage and AdminSupportPage

---
*Phase: 01-design-system*
*Completed: 2026-03-23*
