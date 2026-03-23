---
phase: 01-design-system
plan: "02"
subsystem: typescript
tags: [typescript, strict-mode, types, link-mappers]
dependency_graph:
  requires: []
  provides: [SmartLinkRow, strict-mode-foundation]
  affects: [src/lib/link-mappers.ts, src/pages/LinkEditor.tsx, tsconfig.app.json]
tech_stack:
  added: []
  patterns: [Partial<SmartLinkRow> typed mapper, ts-expect-error suppression for stale generated types]
key_files:
  created: []
  modified:
    - tsconfig.app.json
    - src/lib/link-mappers.ts
    - src/pages/LinkEditor.tsx
decisions:
  - "Partial<SmartLinkRow> used as rowToSmartLink parameter type — all fields optional because Supabase queries can return subsets"
  - "SmartLinkRow is a manual type, NOT derived from generated Supabase types (those are stale — missing bg_effects, business_name_align, business_name_font_size, business_name_html)"
  - "LinkEditor.tsx .update(row as any) replaced with // @ts-expect-error — root cause is stale generated Supabase types, not logic error (D-03, D-04)"
  - "noImplicitAny removed from tsconfig (subsumed by strict:true); noUnusedLocals and noUnusedParameters kept explicitly (not subsumed by strict)"
metrics:
  duration: "~5 minutes"
  completed_date: "2026-03-23"
  tasks_completed: 2
  files_modified: 3
---

# Phase 01 Plan 02: TypeScript Strict Mode & SmartLinkRow Type Summary

TypeScript strict mode enabled with clean compile (0 errors), SmartLinkRow manual type created with 30+ fields, rowToSmartLink typed as Partial<SmartLinkRow>, and LinkEditor.tsx as-any eliminated via documented ts-expect-error.

## Tasks Completed

| # | Task | Commit | Status |
|---|------|--------|--------|
| 1 | Enable strict:true and create SmartLinkRow type | bec7110 | Done |
| 2 | Fix LinkEditor.tsx as-any and capture strictNullChecks error list | a247ad5 | Done |

## What Was Built

### tsconfig.app.json

- Changed `"strict": false` to `"strict": true`
- Removed `"noImplicitAny": true` (redundant — subsumed by `strict: true`)
- Kept `"noUnusedLocals": true` and `"noUnusedParameters": true` (not subsumed by `strict`)

### src/lib/link-mappers.ts — SmartLinkRow Interface

Added the `SmartLinkRow` export interface with 30+ fields. This is a manually maintained type representing the superset of all DB columns accessed by `rowToSmartLink`. It is intentionally NOT derived from `Database["public"]["Tables"]["links"]["Row"]` because the generated types are stale and missing 4 columns: `bg_effects`, `business_name_align`, `business_name_font_size`, `business_name_html`.

Key design choices:
- Required fields (always present in a DB row): `id: string`, `slug: string`, `business_name: string`
- All other fields optional with `| null` where the mapper uses defensive `|| ""` or `?? undefined`
- JSONB fields (`buttons`, `pages`, `blocks`, etc.) typed as `unknown` to allow downstream casts
- `bg_effects` field has structured sub-shape matching the 5 background effect types

Changed `rowToSmartLink` signature from `row: any` to `row: Partial<SmartLinkRow>`. All 6 call sites in `use-links.ts` remain compatible because the function body already has defensive patterns for every field access.

### src/pages/LinkEditor.tsx

Replaced `.update(row as any)` with:
```typescript
// @ts-expect-error smartLinkToRow includes fields (bg_effects, business_name_font_size, business_name_align, business_name_html) not yet in generated Supabase types
.update(row)
```

Root cause: `smartLinkToRow` returns an object with 4 fields that exist in the actual Supabase DB but are absent from the generated `TablesUpdate<"links">` type (stale generated file). The `// @ts-expect-error` is the correct suppression per D-03/D-04 — this is not a logic error.

## tsc --noEmit Error Count

**Total errors after enabling strict:true: 0**

The codebase compiled cleanly with zero errors after making the 3 targeted changes. This means:
- The existing defensive patterns in `rowToSmartLink` (all those `|| ""` and `?? undefined`) already handled `strictNullChecks` correctly
- No additional `// @ts-expect-error` suppressions were needed beyond the one in LinkEditor.tsx
- Plan 03 does NOT need to suppress a backlog of `strictNullChecks` errors — the codebase was already defensively written

This is a significant positive finding: the TypeScript migration was cleaner than estimated in the research phase which predicted an unknown number of additional `strictNullChecks` errors.

## Deviations from Plan

None - plan executed exactly as written.

The one thing worth noting: The research predicted an unknown number of `strictNullChecks` errors requiring `// @ts-expect-error` suppression across the codebase. In practice, 0 additional errors appeared. This is not a deviation — it was correctly called out as "MEDIUM confidence" in the research. The codebase was already written defensively.

## Known Stubs

None — all changes are real type improvements with no placeholder or stub values.

## Verification Results

- `grep "strict.*true" tsconfig.app.json` — matches `"strict": true`
- `grep "noImplicitAny" tsconfig.app.json` — no matches (removed)
- `grep "interface SmartLinkRow" src/lib/link-mappers.ts` — matches at line 20
- `grep "Partial<SmartLinkRow>" src/lib/link-mappers.ts` — matches at line 70
- `grep -rn "as any" src/lib/link-mappers.ts src/pages/LinkEditor.tsx` — no matches
- `npx tsc --noEmit` — EXIT 0 (0 errors)
- `npx vitest run src/test/slug-utils.test.ts` — 39/39 tests passing

## Self-Check: PASSED

Files verified:
- FOUND: tsconfig.app.json (strict:true, no noImplicitAny)
- FOUND: src/lib/link-mappers.ts (SmartLinkRow interface at line 20, Partial<SmartLinkRow> at line 70)
- FOUND: src/pages/LinkEditor.tsx (ts-expect-error at line 113, .update(row) at line 114)

Commits verified:
- FOUND: bec7110 - feat(01-02): enable strict:true and create SmartLinkRow type
- FOUND: a247ad5 - fix(01-02): replace as-any in LinkEditor.tsx with ts-expect-error
