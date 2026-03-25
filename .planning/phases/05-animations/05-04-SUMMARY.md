---
phase: 05-animations
plan: "04"
subsystem: editor-animations
tags: [drag-and-drop, framer-motion, dnd-kit, micro-animations, ux]
dependency_graph:
  requires: []
  provides: [drag-overlay-feedback, smartlinkcard-hover-lift, drop-zone-hover-tap]
  affects: [SortableList, SmartLinkCard]
tech_stack:
  added: []
  patterns: [DragOverlay-from-dnd-kit, motion.div-overlay, whileHover-lift, whileTap-press]
key_files:
  created: []
  modified:
    - src/components/editor/blocks/SortableList.tsx
    - src/components/SmartLinkCard.tsx
decisions:
  - "Display-only motion.div in DragOverlay (not SortableItem) — avoids useSortable hook violation inside overlay context"
  - "activeId tracked via onDragStart/onDragEnd callbacks rather than useDndMonitor — simpler and sufficient per D-15"
metrics:
  duration: "~10 minutes"
  completed: "2026-03-25"
  tasks_completed: 2
  files_modified: 2
---

# Phase 05 Plan 04: Drag Overlay and Hover Micro-Animations Summary

**One-liner:** DragOverlay with scale 1.02 + shadow-2xl during drag, opacity 0.4 on source item, drop zone whileHover/whileTap, and SmartLinkCard whileHover y:-2 lift.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add DragOverlay with motion.div to SortableList and drop zone hover/tap animations | f40fef3 | src/components/editor/blocks/SortableList.tsx |
| 2 | Add whileHover micro-animation to SmartLinkCard | ffa20e9 | src/components/SmartLinkCard.tsx |

## What Was Built

### Task 1 — SortableList DragOverlay + Drop Zone (D-12/D-13/D-15/D-16)

**SortableList.tsx changes:**

1. Added `DragOverlay` and `DragStartEvent` to `@dnd-kit/core` imports
2. Added `activeId` state (`useState<string | null>(null)`) for drag tracking
3. Added `handleDragStart` handler that calls `setActiveId(String(event.active.id))`
4. Updated `handleDragEnd` to call `setActiveId(null)` at the start (clearing on drop)
5. Added `onDragStart={handleDragStart}` prop to `<DndContext>`
6. Added `style={{ opacity: activeId === item.id ? 0.4 : 1 }}` to the item wrapper div
7. Converted bottom drop zone `<div>` to `<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>`
8. Added `<DragOverlay>` before `</DndContext>` — renders a display-only `motion.div` with the block's label (grip icon + type label), `animate={{ scale: 1.02 }}`, and elevated `boxShadow: "0 20px 40px rgba(0,0,0,0.25)"`

The DragOverlay deliberately uses a simplified display-only component (not `SortableItem`) to avoid calling `useSortable` inside the overlay context, which is a known dnd-kit pitfall.

### Task 2 — SmartLinkCard Hover Lift (D-17)

**SmartLinkCard.tsx changes:**

- Changed outermost card `<div>` to `<motion.div>` with `whileHover={{ y: -2, transition: { duration: 0.15 } }}`
- Closing tag updated to `</motion.div>`
- Existing CSS `hover:glow-border transition-all duration-300` preserved alongside framer-motion lift

## Decisions Made

1. **Display-only overlay component** — The DragOverlay renders a minimal `<motion.div>` with grip icon and label rather than reusing `SortableItem`. This avoids the dnd-kit rule that overlay children must not call `useSortable`. The overlay shows block type label from `BLOCK_LABELS` or button label.

2. **activeId via callbacks** — Used `onDragStart`/`onDragEnd` callbacks on `<DndContext>` rather than `useDndMonitor`. Simpler, already had `handleDragEnd` wired up, and sufficient for the opacity + overlay tracking needed.

## Verification

- `grep -c "DragOverlay" src/components/editor/blocks/SortableList.tsx` → 3
- `grep -c "activeId" src/components/editor/blocks/SortableList.tsx` → 5
- `grep -c 'animate={{ scale: 1.02 }}' src/components/editor/blocks/SortableList.tsx` → 1
- `grep -c "whileTap" src/components/editor/blocks/SortableList.tsx` → 1
- `grep -c "whileHover" src/components/SmartLinkCard.tsx` → 1
- `npm run build` → success, 0 TypeScript errors

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- [x] `src/components/editor/blocks/SortableList.tsx` — modified with DragOverlay, activeId, drop zone motion.div
- [x] `src/components/SmartLinkCard.tsx` — modified with whileHover lift
- [x] Commit f40fef3 exists (Task 1)
- [x] Commit ffa20e9 exists (Task 2)
- [x] Build passes with 0 errors
