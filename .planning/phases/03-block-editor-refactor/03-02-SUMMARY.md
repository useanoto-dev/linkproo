---
phase: 03-block-editor-refactor
plan: 02
subsystem: editor
tags: [refactor, block-editor, performance, split]
dependency_graph:
  requires: []
  provides:
    - MediaBlockEditor for image, video, spotify, map, html, carousel
    - InteractiveBlockEditor for badges, image-button, countdown, email-capture, animated-button
    - ListBlockEditor for faq, gallery, testimonial, stats, product, contacts
  affects:
    - src/components/editor/BlockEditor.tsx (consumer in Plan 03)
tech_stack:
  added: []
  patterns:
    - memo() wrapping for all group editor components
    - useMemo for buttonPresets inside InteractiveBlockEditor
    - IIFE pattern preserved in contacts block of ListBlockEditor
key_files:
  created:
    - src/components/editor/blocks/MediaBlockEditor.tsx
    - src/components/editor/blocks/InteractiveBlockEditor.tsx
    - src/components/editor/blocks/ListBlockEditor.tsx
  modified: []
decisions:
  - ANIM_STYLE_OPTIONS imported from ./constants (already extracted in Plan 01 parallel work)
  - buttonPresets useMemo moved into InteractiveBlockEditor from SortableBlock in BlockEditor.tsx
  - contacts IIFE pattern lifted verbatim per D-13 (no logic changes)
metrics:
  duration: 15m
  completed: "2026-03-24"
  tasks_completed: 2
  files_created: 3
---

# Phase 03 Plan 02: Group Block Editors Extraction Summary

Three largest JSX group editors extracted from BlockEditor.tsx monolith (~700 lines) into separate files under `src/components/editor/blocks/`, each exporting a named `memo()` component ready for Plan 03 integration.

## What Was Built

**MediaBlockEditor** (`src/components/editor/blocks/MediaBlockEditor.tsx`) — Handles the 6 media/embed block types: `image` (ImageUploader + borderRadius Slider), `video` (URL Input), `spotify` (URL Input + compact checkbox), `map` (address Input + URL Textarea + height Slider), `html` (Textarea + height Slider), `carousel` (slide grid with delete + ImageUploader add + autoplay checkbox).

**InteractiveBlockEditor** (`src/components/editor/blocks/InteractiveBlockEditor.tsx`) — Handles the 5 interactive block types: `badges` (Input with emoji:label parsing), `image-button` (ImageUploader with buttonPresets + height Slider + url/page toggle), `countdown` (datetime-local + label Inputs), `email-capture` (content/placeholder/button-label/success-message Inputs), `animated-button` (animStyle grid using ANIM_STYLE_OPTIONS + content/subtitle/buttonLabel/url Inputs + title/height Sliders + primary/secondary color pickers + gradient preview swatch). `buttonPresets` is computed via `useMemo(() => buildButtonPresets(block.buttonHeight ?? 110), [block.buttonHeight])` inside the component.

**ListBlockEditor** (`src/components/editor/blocks/ListBlockEditor.tsx`) — Handles the 6 list block types: `faq` (mapped FaqItem Q&A editors + add button), `gallery` (image grid + ImageUploader add), `testimonial` (name/role/content/rating/avatar), `stats` (mapped StatItem editors + add button), `product` (image/name/price/oldPrice/description/buttonLabel/buttonUrl), `contacts` (IIFE pattern with mode toggle + up to 2 contact cards each with photo/name/role/whatsapp inputs).

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | 5ce5f95 | feat(03-02): create MediaBlockEditor for image, video, spotify, map, html, carousel |
| Task 2 | bb73d83 | feat(03-02): create InteractiveBlockEditor and ListBlockEditor group editors |

## Decisions Made

- **ANIM_STYLE_OPTIONS from ./constants**: The constants file already exported `ANIM_STYLE_OPTIONS` from Plan 01 parallel work, so the import path `./constants` works as specified.
- **buttonPresets inside InteractiveBlockEditor**: Moved `useMemo(() => buildButtonPresets(block.buttonHeight ?? 110), [block.buttonHeight])` from SortableBlock in BlockEditor.tsx into InteractiveBlockEditor so it's collocated with the only consumer (`image-button` type).
- **contacts IIFE lifted verbatim**: The IIFE `(() => { ... })()` pattern in the contacts block was preserved exactly as in BlockEditor.tsx per D-13.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all 3 files are complete implementations. BlockEditor.tsx is not yet modified to use these components (that is Plan 03's responsibility).

## Self-Check

Files created:
- src/components/editor/blocks/MediaBlockEditor.tsx: FOUND
- src/components/editor/blocks/InteractiveBlockEditor.tsx: FOUND
- src/components/editor/blocks/ListBlockEditor.tsx: FOUND

Commits:
- 5ce5f95: FOUND
- bb73d83: FOUND

TypeScript: npx tsc --noEmit exits 0

## Self-Check: PASSED
