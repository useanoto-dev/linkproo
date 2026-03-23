---
phase: 02-security
plan: 01
subsystem: security
tags: [csp, iframe, sandbox, content-protection, protect-ts, react]

# Dependency graph
requires: []
provides:
  - initProtection scoped to PublicLinkPage with unmount cleanup
  - CSP sandbox + referrerPolicy on all 5 iframes in the codebase
  - Permissions policy (allow="") on BgHtmlEffect blocks camera/mic/geo
affects: [PublicLinkPage, BgHtmlEffect, BlockRenderer, LessonPlayer]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "initProtection returns cleanup fn — React useEffect cleanup pattern for global event listeners"
    - "Named functions for event listeners so removeEventListener works correctly"
    - "BgHtmlEffect sandbox without allow-same-origin — prevents script from accessing parent origin"
    - "External player iframes (video/spotify) get allow-same-origin for player functionality"

key-files:
  created: []
  modified:
    - src/lib/protect.ts
    - src/main.tsx
    - src/pages/PublicLinkPage.tsx
    - src/components/BgHtmlEffect.tsx
    - src/components/preview/BlockRenderer.tsx
    - src/components/course/LessonPlayer.tsx

key-decisions:
  - "initProtection scoped to PublicLinkPage only — admins and editors no longer blocked from DevTools"
  - "BgHtmlEffect: sandbox=allow-scripts only (no allow-same-origin) — HTML background cannot access parent origin"
  - "Video/Spotify/LessonPlayer iframes get allow-same-origin — required for external video player APIs to function"
  - "Map iframe gets sandbox without allow-presentation (maps don't need fullscreen presentation mode)"

patterns-established:
  - "Pattern: Event listener cleanup — always use named functions + return cleanup from init fns called in useEffect"
  - "Pattern: iframe hardening tiers — untrusted HTML (no allow-same-origin), external players (with allow-same-origin)"

requirements-completed: [D-01, D-02, D-03, D-04, D-14, D-15, D-16, D-17]

# Metrics
duration: 12min
completed: 2026-03-23
---

# Phase 02 Plan 01: Security — Content Protection Scoping + iframe Sandbox Summary

**initProtection scoped to PublicLinkPage with cleanup, and CSP sandbox/referrerPolicy added to all 5 iframes closing 2 of 5 security gaps**

## Performance

- **Duration:** 12 min
- **Started:** 2026-03-23T23:20:00Z
- **Completed:** 2026-03-23T23:32:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Removed global initProtection() call from main.tsx — admins and editor users can now use DevTools freely
- Rewrote protect.ts to use named functions returning a cleanup fn — listeners are properly removed on PublicLinkPage unmount
- Hardened all 5 iframes with appropriate sandbox tiers: BgHtmlEffect gets strictest (no allow-same-origin), external players get functional set
- All iframes now have referrerPolicy set — reduces referrer leakage to third-party embeds

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor protect.ts to return cleanup + scope to PublicLinkPage** - `cc0ce11` (feat)
2. **Task 2: Add CSP sandbox attributes to all 5 iframes** - `b8a1b66` (feat)

## Files Created/Modified

- `src/lib/protect.ts` — Rewritten with named functions, returns cleanup fn; showProtectToast unchanged
- `src/main.tsx` — Removed initProtection import and call; now only bootstraps React + SpeedInsights
- `src/pages/PublicLinkPage.tsx` — Added initProtection import + useEffect with cleanup
- `src/components/BgHtmlEffect.tsx` — Added allow="" and referrerPolicy="no-referrer" to iframe
- `src/components/preview/BlockRenderer.tsx` — Added sandbox + updated allow + referrerPolicy to all 3 iframes (video, spotify, map)
- `src/components/course/LessonPlayer.tsx` — Added sandbox + updated allow + referrerPolicy to video iframe

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- All 6 modified files exist on disk
- Commit cc0ce11 (Task 1) found in git log
- Commit b8a1b66 (Task 2) found in git log
- npx tsc --noEmit exits with 0 errors
