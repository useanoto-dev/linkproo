---
plan: 09-02
phase: 09-advanced-features
status: complete
completed: 2026-03-26
---

# Summary: Block Scheduling (visibleFrom / visibleUntil)

## Changes

- `src/types/smart-link.ts`: Added `visibleFrom?: string` and `visibleUntil?: string` to `LinkBlock` (ISO datetime strings)
- `src/components/preview/BlockRenderer.tsx`: Added visibility check at function start — returns null if current time is outside [visibleFrom, visibleUntil] window. Skipped in editor preview (isNewLink).
- `src/components/editor/blocks/SortableList.tsx`:
  - Added Clock icon import
  - Added "Agendamento" section inside each block's expanded panel with two datetime-local inputs
  - "ATIVO" badge shows when schedule is configured
  - Warning note clarifies editor always shows block, public page follows schedule

## Behavior

- If `visibleFrom` is set and now < visibleFrom → block is hidden on public page
- If `visibleUntil` is set and now >= visibleUntil → block is hidden on public page
- Editor preview always shows all blocks (isNewLink check)

## Verification

- `npx tsc --noEmit` — 0 errors
