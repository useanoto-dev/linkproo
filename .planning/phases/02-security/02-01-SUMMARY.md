---
plan: 02-01
phase: 02-security
status: complete
completed: 2026-03-26
---

# Summary: protect.ts Scope + iframe CSP Sandbox

All tasks were already implemented correctly when verified.

**Task 1 — protect.ts scoped to PublicLinkPage:**
- `initProtection()` returns cleanup with named functions
- Removed from `main.tsx`, called only in `PublicLinkPage.tsx` useEffect

**Task 2 — CSP sandbox on all 5 iframes:**
- `BgHtmlEffect.tsx`: sandbox="allow-scripts" allow="" referrerPolicy="no-referrer"
- `BlockRenderer.tsx` video/spotify: sandbox + allow-same-origin + referrerPolicy
- `BlockRenderer.tsx` map: sandbox (no presentation) + referrerPolicy
- `LessonPlayer.tsx`: sandbox + allow-same-origin + referrerPolicy

**Verification:** `npx tsc --noEmit` — 0 errors
