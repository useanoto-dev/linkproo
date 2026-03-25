---
phase: 04-analytics-rpc
plan: 01
subsystem: database
tags: [rpc, analytics, postgres, migration, aggregation]
dependency_graph:
  requires: []
  provides: [get_admin_analytics, get_user_analytics]
  affects: [AdminAnalyticsPage.tsx, AnalyticsPage.tsx]
tech_stack:
  added: []
  patterns: [SECURITY DEFINER plpgsql RPC, json_build_object aggregation, generate_series gap-fill]
key_files:
  created:
    - supabase/migrations/20260326000010_create_get_admin_analytics_rpc.sql
    - supabase/migrations/20260326000011_create_get_user_analytics_rpc.sql
  modified: []
decisions:
  - "Admin guard uses has_role(auth.uid(), 'admin'::app_role) — consistent with existing admin_delete_user pattern"
  - "User guard uses auth.uid() <> user_uuid direct comparison — simpler than has_role for self-ownership check"
  - "plans_distribution not filtered by period — counts ALL profiles, matching existing client behavior"
  - "top_links returns 10 entries — client can slice to 5 if needed for UI"
  - "referrer_top5: NULL/empty referrer normalized to 'Direto' server-side — raw string returned, client does URL hostname parsing"
metrics:
  duration: 3 minutes
  completed_date: "2026-03-25"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 0
---

# Phase 04 Plan 01: Analytics RPC Migrations Summary

**One-liner:** Two Postgres RPC functions (`get_admin_analytics`, `get_user_analytics`) that return pre-aggregated JSON, replacing client-side O(N) row scanning of up to 10k/5k rows.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create get_admin_analytics RPC migration | c083fd8 | supabase/migrations/20260326000010_create_get_admin_analytics_rpc.sql |
| 2 | Create get_user_analytics RPC migration | 88cf302 | supabase/migrations/20260326000011_create_get_user_analytics_rpc.sql |

## What Was Built

### get_admin_analytics(period_days integer) -> json

Returns 7 aggregate sections:

- `total_views` — count of link_views in period
- `total_clicks` — count of link_clicks in period
- `new_users` — count of profiles created in period
- `views_by_day` — gap-free day series via generate_series with views, clicks, new_users per day
- `views_by_device` — device breakdown ordered by count DESC
- `top_links` — top 10 links by views with business_name, slug, views, clicks
- `plans_distribution` — ALL profiles grouped by plan (not period-filtered, matches existing behavior)

Security: admin-only guard via `has_role(auth.uid(), 'admin'::app_role)`.

### get_user_analytics(user_uuid uuid, period_days integer) -> json

Returns 7 aggregate sections:

- `total_views` / `total_clicks` — exact counts for user's links in period
- `views_by_day` — gap-free day series with views + clicks per day
- `views_by_device` — device breakdown for user's link views
- `clicks_by_button` — top 10 button_ids by click count (NULL button_id excluded)
- `views_by_link` — ALL user links with view counts ordered by views DESC
- `referrer_top5` — top 5 referrers; NULL/"" normalized to 'Direto'

Security: `auth.uid() <> user_uuid` check ensures users only access their own data.

### Common patterns

Both functions use:
- `LANGUAGE plpgsql`, `STABLE`, `SECURITY DEFINER`, `SET search_path = public`
- `COALESCE(json_agg(...), '[]'::json)` on all aggregations to prevent NULL on empty sets
- `CREATE OR REPLACE FUNCTION` for idempotent migrations
- `REVOKE ALL FROM PUBLIC; GRANT EXECUTE TO authenticated`

## Deviations from Plan

None — plan executed exactly as written. Both migration files match the exact SQL specified in the plan frontmatter.

## Known Stubs

None. These are SQL migration files with complete implementations. The client-side consumption (AdminAnalyticsPage.tsx, AnalyticsPage.tsx) is handled in plan 04-02.

## Verification Results

```
get_admin_analytics occurrences in migrations: 4 (>= 2 required)
get_user_analytics occurrences in migrations:  4 (>= 2 required)
referrer_top5 occurrences in migrations:       2 (>= 1 required)
```

## Self-Check: PASSED

Files confirmed:
- supabase/migrations/20260326000010_create_get_admin_analytics_rpc.sql — FOUND
- supabase/migrations/20260326000011_create_get_user_analytics_rpc.sql — FOUND

Commits confirmed:
- c083fd8 (feat(04-01): create get_admin_analytics RPC migration) — FOUND
- 88cf302 (feat(04-01): create get_user_analytics RPC migration) — FOUND
