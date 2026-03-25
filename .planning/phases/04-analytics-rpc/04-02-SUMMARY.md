---
phase: 04-analytics-rpc
plan: 02
subsystem: frontend
tags: [rpc, analytics, react, typescript, recharts]
dependency_graph:
  requires: [04-01]
  provides: [AdminAnalyticsPage-rpc, AnalyticsPage-rpc]
  affects: [src/pages/admin/AdminAnalyticsPage.tsx, src/pages/AnalyticsPage.tsx]
tech_stack:
  added: []
  patterns: [supabase.rpc consumption, inline data derivation from RPC shape, parseISO for server date strings]
key_files:
  created: []
  modified:
    - src/pages/admin/AdminAnalyticsPage.tsx
    - src/pages/AnalyticsPage.tsx
decisions:
  - "parseISO used for date formatting because RPC returns YYYY-MM-DD strings, not Date objects"
  - "Empty links early-return in AnalyticsPage preserves existing UX: skip RPC call if user has no links"
  - "topCTAs slice removed — RPC already returns top 10 clicks_by_button ordered by count DESC"
metrics:
  duration: 3 minutes
  completed_date: "2026-03-25"
  tasks_completed: 2
  tasks_total: 2
  files_created: 0
  files_modified: 2
---

# Phase 04 Plan 02: Analytics RPC Client Migration Summary

**One-liner:** Both analytics pages rewritten to call `supabase.rpc()` instead of fetching up to 15000 raw rows client-side, eliminating all useMemo aggregation blocks.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Rewrite AdminAnalyticsPage to consume get_admin_analytics RPC | 091c596 | src/pages/admin/AdminAnalyticsPage.tsx |
| 2 | Rewrite AnalyticsPage to consume get_user_analytics RPC with referrer_top5 | a5cd26c | src/pages/AnalyticsPage.tsx |

## What Was Built

### AdminAnalyticsPage.tsx

- Single `supabase.rpc("get_admin_analytics", { period_days })` call replaces `Promise.all` of 4 queries (link_views x10000, link_clicks x10000, profiles, links)
- Removed 4 `useMemo` blocks: `growthChartData`, `planData`, `topLinks`, `newUsers`
- Replaced with inline derivations reading directly from `data.views_by_day`, `data.plans_distribution`, `data.top_links`, `data.new_users`
- Removed dead imports: `subDays`, `startOfDay`, `eachDayOfInterval`, `useMemo`, `Tables`
- Removed dead type aliases: `LinkView`, `LinkClick`, `Profile`, `AdminLink`
- Added `AdminAnalyticsData` interface + supporting types matching RPC return shape
- All Recharts `dataKey` values preserved: `views`, `cliques`, `usuarios` (line chart); `views` (bar chart)
- `parseISO` added to handle YYYY-MM-DD date strings from RPC

### AnalyticsPage.tsx

- Single `supabase.rpc("get_user_analytics", { user_uuid, period_days })` replaces `Promise.all` of 4 queries (views x5000, clicks x5000, count head x2)
- Removed 5 `useMemo` blocks: `chartData`, `deviceData`, `topLinks`, `referrerData`, `topCTAs`
- Replaced with inline derivations reading from RPC shape
- Separate `links` fetch preserved for button label mapping (D-11)
- Empty links early-return preserved — skips RPC when user has no links
- Origens de Trafego section now renders from `referrer_top5` RPC data
- Button label map logic (buttonLabels/buttonLink) preserved unchanged
- Removed dead imports: `subDays`, `startOfDay`, `eachDayOfInterval`, `useMemo`
- Added `UserAnalyticsData` interface + supporting types
- Stat cards updated: `data?.totalViews` → `totalViews` (inline derivation from `data.analytics.total_views`)
- `queryKey: ["analytics", user?.id, period]` preserved (D-12)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. Both pages are fully wired to RPC data. No hardcoded values or placeholder data flows to the UI.

## Verification Results

```
1. No raw link_views/link_clicks fetches in src/pages/: PASS (0 matches)
2. Both pages use supabase.rpc(): PASS (1 match each)
3. Zero useMemo in both pages: PASS (0 each)
4. Dead date-fns imports removed: PASS (0 matches)
5. links fetch preserved in AnalyticsPage: PASS (1 match)
6. npx tsc --noEmit: PASS (exit 0)
```

## Self-Check: PASSED

Files confirmed:
- src/pages/admin/AdminAnalyticsPage.tsx — FOUND
- src/pages/AnalyticsPage.tsx — FOUND

Commits confirmed:
- 091c596 (feat(04-02): rewrite AdminAnalyticsPage to consume get_admin_analytics RPC) — FOUND
- a5cd26c (feat(04-02): rewrite AnalyticsPage to consume get_user_analytics RPC with referrer_top5) — FOUND
