---
phase: 05-animations
plan: 01
subsystem: routing/animations
tags: [framer-motion, page-transitions, AnimatePresence, react-router]
dependency_graph:
  requires: []
  provides: [route-transition-system]
  affects: [src/App.tsx, all-app-pages]
tech_stack:
  added: []
  patterns: [AnimatePresence mode=wait, AppRoutes child component pattern, PageTransition wrapper]
key_files:
  created:
    - src/components/PageTransition.tsx
  modified:
    - src/App.tsx
decisions:
  - "AppRoutes extracted as child component inside BrowserRouter so useLocation works correctly (avoids router context error)"
  - "PublicLinkPage routes excluded from PageTransition — they use getEntryVariants stagger system per D-03"
  - "Suspense fallback remains outside AppRoutes to cover lazy-loaded chunks regardless of route change"
metrics:
  duration: "~5 minutes"
  completed: "2026-03-25"
  tasks_completed: 2
  files_created: 1
  files_modified: 1
---

# Phase 05 Plan 01: Route Transitions Summary

**One-liner:** AnimatePresence mode=wait route transitions with fade+slide-up (y:8→0, 0.2s ease-out) on all app pages; public link pages excluded.

## What Was Built

Added route transition animations to the app via:

1. **`src/components/PageTransition.tsx`** — Reusable `motion.div` wrapper with D-02 animation values:
   - `initial: { opacity: 0, y: 8 }`
   - `animate: { opacity: 1, y: 0 }`
   - `exit: { opacity: 0, y: -4 }`
   - `transition: { duration: 0.2, ease: "easeOut" }`
   - Accepts `children` and optional `className`

2. **`src/App.tsx`** — Refactored routing:
   - New `AppRoutes` function component inside `BrowserRouter` so `useLocation` has router context
   - `AnimatePresence mode="wait"` wrapping `<Routes location={location} key={location.pathname}>`
   - All dashboard, admin, and auth pages wrapped in `<PageTransition>`
   - PublicLinkPage (`/:slug`, `/:slug/:pageSlug`) intentionally excluded — uses `getEntryVariants` stagger per D-03
   - `<Suspense fallback={<PageLoader />}>` wrapping `<AppRoutes />` at BrowserRouter level

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Extract `AppRoutes` component | `useLocation` must be called inside a Router context — placing it in a child component avoids the "useLocation called outside Router" runtime error |
| Exclude PublicLinkPage from transitions | Per D-03: public pages already animate blocks individually via `getEntryVariants` stagger — adding a route-level fade would conflict |
| Keep Suspense outside AnimatePresence | Per plan Pitfall 2: Suspense inside AnimatePresence causes exit animation to be cancelled when lazy chunk loads |

## Deviations from Plan

None — plan executed exactly as written.

## Verification

- `npm run build` completed successfully (3893 modules, no TypeScript errors)
- `grep -c "AnimatePresence" src/App.tsx` → 3 (import + usage)
- `grep -c "useLocation" src/App.tsx` → 2 (import + usage)
- `grep -c "PageTransition" src/App.tsx` → 18 (import + all wrapped routes)
- PublicLinkPage routes confirmed without PageTransition wrapper

## Self-Check: PASSED

All files and commits verified present.

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1: Create PageTransition | e20c5cf | feat(05-01): create PageTransition reusable wrapper component |
| Task 2: Refactor App.tsx | 5d3a395 | feat(05-01): refactor App.tsx with AnimatePresence and PageTransition |
