---
phase: 05
slug: animations
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-25
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose 2>&1 | tail -20` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose 2>&1 | tail -20`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | D-02/D-04 | grep + build | `grep -c "export function PageTransition" src/components/PageTransition.tsx` | N/A (new file) | ⬜ pending |
| 05-01-02 | 01 | 1 | D-01/D-03 | grep + build | `grep -c "AnimatePresence" src/App.tsx && grep -c "PageTransition" src/App.tsx` | ✅ src/App.tsx | ⬜ pending |
| 05-02-01 | 02 | 1 | D-05/D-06 | grep + build | `grep -c "Skeleton" src/pages/admin/AdminDashboardPage.tsx` | ✅ | ⬜ pending |
| 05-02-02 | 02 | 1 | D-05/D-06 | grep + build | `grep -c "Skeleton" src/pages/VideoaulasPage.tsx && grep -c "Skeleton" src/pages/SupportPage.tsx` | ✅ | ⬜ pending |
| 05-02-03 | 02 | 1 | D-07 | grep + build | `grep -c "Skeleton" src/pages/LinkEditor.tsx` | ✅ | ⬜ pending |
| 05-03-01 | 03 | 1 | D-08/D-09/D-11 | grep + build | `grep -c "animate={{ y: \[0, -6, 0\] }}" src/pages/LinksPage.tsx` | ✅ | ⬜ pending |
| 05-03-02 | 03 | 1 | D-08/D-09/D-11 | grep + build | `grep -c "animate={{ y: \[0, -6, 0\] }}" src/pages/AnalyticsPage.tsx && grep -c "animate={{ y: \[0, -6, 0\] }}" src/pages/Dashboard.tsx` | ✅ | ⬜ pending |
| 05-04-01 | 04 | 1 | D-12/D-13/D-15/D-16 | grep + build | `grep -c "DragOverlay" src/components/editor/blocks/SortableList.tsx && grep -c "animate={{ scale: 1.02 }}" src/components/editor/blocks/SortableList.tsx && grep -c "whileTap" src/components/editor/blocks/SortableList.tsx` | ✅ | ⬜ pending |
| 05-04-02 | 04 | 1 | D-17 | grep + build | `grep -c "whileHover" src/components/SmartLinkCard.tsx` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements:
- vitest is installed and configured (`vitest.config.ts`)
- Test setup exists (`src/test/setup.ts` with jsdom mocks)
- Existing test files provide regression coverage:
  - `src/test/example.test.ts` — slug-utils and color-utils sanity
  - `src/test/color-utils.test.ts` — color extraction
  - `src/test/slug-utils.test.ts` — slug validation
  - `src/test/link-mappers.test.ts` — link data mapping

No new test scaffolds needed. Phase 05 is primarily visual/animation work verified by grep patterns and build success.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Route transitions animate visually | D-01/D-02 | Visual animation timing cannot be unit tested | Navigate between /dashboard, /links, /analytics — confirm fade+slide-up |
| Skeleton loaders match real layout | D-06 | Layout matching is visual | Load each page with slow network — skeleton should match content structure |
| Empty state float animation smooth | D-11 | Animation smoothness is visual | View LinksPage with 0 links — icon should float smoothly |
| DragOverlay elevates during drag | D-12/D-13 | Drag interaction is visual | Drag a block in editor — overlay should show with shadow |
| SmartLinkCard lifts on hover | D-17 | Hover lift is visual | Hover over link cards on LinksPage — card should lift 2px |
| Drop zone scales on hover/tap | D-16 | Hover/tap scale is visual | Hover/tap bottom drop zone in editor — should scale |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-25
