---
phase: 03-block-editor-refactor
plan: "03"
subsystem: editor
tags: [refactor, lazy-loading, code-splitting, orchestrator]
dependency_graph:
  requires:
    - src/components/editor/blocks/TextBlockEditor.tsx (from 03-01)
    - src/components/editor/blocks/LayoutBlockEditor.tsx (from 03-01)
    - src/components/editor/blocks/constants.ts (from 03-01)
    - src/components/editor/blocks/unified-items.ts (from 03-01)
    - src/components/editor/blocks/MediaBlockEditor.tsx (from 03-02)
    - src/components/editor/blocks/InteractiveBlockEditor.tsx (from 03-02)
    - src/components/editor/blocks/ListBlockEditor.tsx (from 03-02)
  provides:
    - src/components/editor/BlockEditor.tsx (lean orchestrator, 71 lines)
    - src/components/editor/blocks/SortableButton.tsx
    - src/components/editor/blocks/SortableList.tsx
    - src/components/editor/blocks/BlockErrorBoundary.tsx
    - src/components/editor/blocks/BusinessInfoPanel.tsx
  affects:
    - All consumers of BlockEditor (LinksPage, LinkEditor, sub-page mode)
tech_stack:
  added: []
  patterns:
    - React.lazy + Suspense for code-split group editors
    - Module-level lazy declarations (D-07 compliant — not inside components)
    - Dependency injection of lazy editors via stable EDITORS const
    - switch-based dispatcher (renderGroupEditor) replacing 1400+ lines of conditionals
    - memo() wrapping for all internal components (SortableBlock, SortableItem, SortableList)
key_files:
  created:
    - src/components/editor/blocks/SortableButton.tsx
    - src/components/editor/blocks/BlockErrorBoundary.tsx
    - src/components/editor/blocks/BusinessInfoPanel.tsx
    - src/components/editor/blocks/SortableList.tsx
  modified:
    - src/components/editor/BlockEditor.tsx (1944 lines -> 71 lines)
decisions:
  - "Extracted BusinessInfoPanel to blocks/ to hit <=300 line target on BlockEditor.tsx (slug state + hero/info JSX moved, 130+ lines saved)"
  - "Extracted BlockErrorBoundary to blocks/ per plan step 4 fallback rule (30 lines saved)"
  - "Lazy editors injected as EDITORS stable module-level const — prevents SortableList re-render on every BlockEditor render"
  - "SortableList.tsx receives editors via GroupEditorComponents interface — avoids circular imports and keeps lazy declarations in BlockEditor.tsx"
  - "renderGroupEditor switch dispatcher uses inline case-fall-through for compact grouping"
  - "onUpdate passed directly (no wrappers) in renderGroupEditor and SortableBlock — preserves undo/redo correctness"
metrics:
  duration: "~25 minutes"
  completed_date: "2026-03-24"
  tasks_completed: 1
  files_created: 4
  files_modified: 1
---

# Phase 03 Plan 03: BlockEditor Orchestrator Summary

BlockEditor.tsx reduced from 1944 lines to 71 lines via React.lazy code splitting, SortableBlock switch dispatcher, and extraction of 4 helper components into `src/components/editor/blocks/`.

## Commits

| Hash | Message |
|------|---------|
| a17e713 | feat(03-03): rewrite BlockEditor.tsx as lean orchestrator with lazy loading |

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Extract SortableButton and rewrite BlockEditor.tsx as orchestrator | a17e713 | BlockEditor.tsx, SortableButton.tsx, BlockErrorBoundary.tsx, BusinessInfoPanel.tsx, SortableList.tsx |

## What Was Built

**BlockEditor.tsx (71 lines)** — Pure orchestrator. Declares 5 `React.lazy` imports at module level, builds a stable `EDITORS` const, renders `BusinessInfoPanel` (for non-subpage mode) and `SortableList` with editors injected.

**SortableList.tsx** — Contains all DnD logic, SortableBlock dispatcher (with `renderGroupEditor` switch), SortableItem, drag-over drop zones, and unified item CRUD. Receives lazy editors as `GroupEditorComponents` prop for clean dependency injection.

**SortableButton.tsx** — Extracted sortable wrapper for SmartLinkButton rows. Uses `useSortable` + `ButtonBlockEditor`.

**BlockErrorBoundary.tsx** — React error boundary class extracted from BlockEditor, shows "Erro neste bloco" with remove button on error.

**BusinessInfoPanel.tsx** — Business name, slug availability check, tagline, HTML toggle, size/align pickers. Extracted from BlockEditor main JSX section; manages its own slug debounce state.

## Code Splitting Verification

Build output confirms 5 separate lazy chunks:
- `TextBlockEditor-*.js` (4.21 kB)
- `MediaBlockEditor-*.js` (6.10 kB)
- `LayoutBlockEditor-*.js` (3.03 kB)
- `ListBlockEditor-*.js` (11.34 kB)
- `InteractiveBlockEditor-*.js` (11.86 kB)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Extracted BusinessInfoPanel to hit <=300 line target**
- **Found during:** Step 4 (line count verification)
- **Issue:** After extracting SortableButton and BlockErrorBoundary, BlockEditor.tsx was still 366 lines. The plan said "if still over 300, extract BlockErrorBoundary" but that only saved 30 lines — the business info JSX section (~130 lines) was the main driver.
- **Fix:** Extracted hero/info section into `BusinessInfoPanel.tsx` (slug debounce state + all business info JSX).
- **Files modified:** src/components/editor/blocks/BusinessInfoPanel.tsx (new), src/components/editor/BlockEditor.tsx
- **Commit:** a17e713

**2. [Rule 3 - Blocking] Extracted SortableList.tsx to hold SortableBlock, SortableItem, and DnD logic**
- **Found during:** Step 4 (further line reduction needed)
- **Issue:** Even after BusinessInfoPanel extraction, BlockEditor.tsx had 366 lines with all DnD/sortable logic inline.
- **Fix:** Extracted SortableList, SortableBlock, SortableItem, renderGroupEditor into `SortableList.tsx`. Lazy editors injected via `GroupEditorComponents` props to avoid circular imports while keeping React.lazy declarations in BlockEditor.tsx.
- **Files modified:** src/components/editor/blocks/SortableList.tsx (new)
- **Commit:** a17e713

## Verification Results

- `wc -l src/components/editor/BlockEditor.tsx` → 71 lines (target: <=300)
- `grep "React.lazy" src/components/editor/BlockEditor.tsx` → 5 matches
- `grep "renderGroupEditor" src/components/editor/blocks/SortableList.tsx` → 2 matches (definition + call)
- `grep "Suspense" src/components/editor/blocks/SortableList.tsx` → 1 usage match
- `grep "animate-pulse h-20 bg-muted/30"` → 1 match (D-06 skeleton)
- `grep "as any" src/components/editor/BlockEditor.tsx` → 0 matches
- `grep "ImageUploader" src/components/editor/BlockEditor.tsx` → 0 matches
- `grep "buildButtonPresets" src/components/editor/BlockEditor.tsx` → 0 matches
- `npx tsc --noEmit` → 0 errors
- `npx vitest run` → 88/88 tests pass
- `npx vite build` → succeeds, 5 separate lazy chunks in output

## Known Stubs

None — pure extraction/refactor. No data stubs introduced.

## Self-Check: PASSED

- [x] src/components/editor/BlockEditor.tsx exists (71 lines)
- [x] src/components/editor/blocks/SortableButton.tsx exists
- [x] src/components/editor/blocks/SortableList.tsx exists
- [x] src/components/editor/blocks/BlockErrorBoundary.tsx exists
- [x] src/components/editor/blocks/BusinessInfoPanel.tsx exists
- [x] Commit a17e713 exists
- [x] tsc --noEmit: 0 errors
- [x] vitest run: 88/88 tests pass
- [x] vite build: succeeds with 5 lazy code-split chunks
