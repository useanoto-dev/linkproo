---
phase: 02-security
plan: 02
subsystem: database
tags: [migrations, slug-validation, plan-limits, postgres, constraints]
dependency_graph:
  requires: []
  provides: [check_link_limit-updated, links_slug_valid_format, links_slug_not_reserved-complete]
  affects: [public.links, public.check_link_limit]
tech_stack:
  added: []
  patterns: [CREATE OR REPLACE FUNCTION, DO $$ idempotent block, CHECK constraint, COMMENT ON]
key_files:
  created:
    - supabase/migrations/20260326000001_update_plan_limit_message.sql
    - supabase/migrations/20260326000002_add_slug_format_constraint.sql
    - supabase/migrations/20260326000003_update_slug_reserved_list.sql
  modified: []
decisions:
  - "Using 'Faca' without cedilla in RAISE EXCEPTION to avoid encoding issues in Supabase environments"
  - "Slug count is 43 (not 38 as stated in plan) — plan had incorrect count; all slugs from slug-utils.ts RESERVED_SLUGS Set are included"
  - "File 2 wraps constraint creation in DO $$ block to skip safely if existing data violates format"
metrics:
  duration: "4 minutes"
  completed: "2026-03-23"
  tasks_completed: 1
  tasks_total: 1
  files_created: 3
  files_modified: 0
---

# Phase 02 Plan 02: DB Constraints — Plan Limits + Slug Validation Summary

3 idempotent Postgres migrations: plan limit trigger updated to PT-BR message with business/admin=9999, slug format CHECK constraint added, reserved slugs list synchronized with client slug-utils.ts (43 slugs).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update plan limit trigger message + add slug constraints | 98a312b | 20260326000001, 20260326000002, 20260326000003 |

## What Was Built

### Migration 1: `20260326000001_update_plan_limit_message.sql`
- `CREATE OR REPLACE FUNCTION public.check_link_limit()` — replaces existing function body
- Corrects `business` plan limit from 999 to 9999
- Adds `admin` plan with 9999 limit (was missing from original)
- Updates error message to: `"Limite de links atingido para o plano %. Faca upgrade para criar mais links."`

### Migration 2: `20260326000002_add_slug_format_constraint.sql`
- New `links_slug_valid_format` CHECK constraint (did not previously exist)
- Validates: `slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'` AND `length(slug) BETWEEN 3 AND 50`
- Wrapped in `DO $$` block — skips safely with NOTICE if existing data violates format
- Idempotent: `DROP CONSTRAINT IF EXISTS` before `ADD CONSTRAINT`

### Migration 3: `20260326000003_update_slug_reserved_list.sql`
- Replaces `links_slug_not_reserved` constraint with complete list
- Previous constraint (20260322100005) had 31 slugs; now synchronized to 43
- Added 12 missing entries: `smtp`, `pop`, `imap`, `null`, `undefined`, `true`, `false` (plus `app`, `www`, `mail`, `ftp` which were in partial earlier migration but now fully consolidated)
- Idempotent: `DROP CONSTRAINT IF EXISTS` before `ADD CONSTRAINT`

## Decisions Made

1. **"Faca" without cedilla in error message** — PostgreSQL `%` string formatting with special chars (cedilha) can cause encoding issues in some Supabase deploy environments. Client-side toast provides proper PT-BR UX.

2. **Slug count is 43, not 38** — The plan stated 38 slugs but the actual `RESERVED_SLUGS` Set in `slug-utils.ts` contains 43 entries. All entries from the source of truth were included. The plan had a counting error in documentation only.

3. **DO $$ block for format constraint** — Wrapping migration 2 in a DO block allows the constraint to skip gracefully if pre-existing data fails validation, preventing migration failure on production with historical data.

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written. The "38 slugs" discrepancy in plan docs was a documentation error only; the migration SQL in the plan body already had all 43 slugs listed correctly.

## Verification Results

```
grep -c "CREATE OR REPLACE|ADD CONSTRAINT|DROP CONSTRAINT" [all 3 files] → 5
```

- `CREATE OR REPLACE FUNCTION` in file 1: 1
- `DROP CONSTRAINT IF EXISTS links_slug_valid_format` + `ADD CONSTRAINT links_slug_valid_format` in file 2: 2
- `DROP CONSTRAINT IF EXISTS links_slug_not_reserved` + `ADD CONSTRAINT links_slug_not_reserved` in file 3: 2

All acceptance criteria met:
- `20260326000001` exists, contains `CREATE OR REPLACE FUNCTION public.check_link_limit()`, `WHEN 'business' THEN 9999`, `WHEN 'admin'    THEN 9999`, `Faca upgrade para criar mais links`
- `20260326000002` exists, contains `links_slug_valid_format`, `slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`, `length(slug) >= 3`, `length(slug) <= 50`, `DROP CONSTRAINT IF EXISTS links_slug_valid_format`
- `20260326000003` exists, contains `links_slug_not_reserved`, `'smtp'`, `'pop'`, `'imap'`, `'null'`, `'undefined'`, `'true'`, `'false'`

## Known Stubs

None — all migrations are complete SQL with no placeholder values.

## Self-Check: PASSED
