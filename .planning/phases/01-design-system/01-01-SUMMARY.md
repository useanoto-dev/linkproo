---
phase: 01-design-system
plan: 01
subsystem: ui
tags: [tailwind, css-variables, glassmorphism, design-tokens, dark-mode]

# Dependency graph
requires: []
provides:
  - backdropBlur Tailwind scale (xs through 3xl) available as theme.extend utilities
  - "--glass-bg and --glass-border CSS custom properties in :root and .dark"
  - ".glass utility migrated to semantic tokens (no more hardcoded rgba)"
  - ".glass-subtle and .dark .glass-subtle utility classes"
affects: [02-animations, 03-skeletons, 04-landing, 05-public-pages, 06-editor-refactor]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS custom properties pattern: define tokens in :root and .dark, consume via var() in utilities"
    - "Glass utilities use semantic tokens instead of hardcoded rgba — one source of truth for dark mode"

key-files:
  created: []
  modified:
    - tailwind.config.ts
    - src/index.css

key-decisions:
  - "Glass tokens defined as CSS custom properties in :root/.dark rather than Tailwind config to support runtime theme switching"
  - ".dark .glass override block removed — dark mode handled entirely by CSS variables, eliminating duplication"
  - "glass-subtle uses inline rgba for light mode (no corresponding token) since it is a standalone utility not shared"

patterns-established:
  - "Token pattern: CSS custom property defined in :root and .dark, consumed via var() in utilities"
  - "Glass hierarchy: glass-subtle (60% opacity, blur 8px) < glass (80% opacity, blur 12px) < glass-strong (92% opacity, blur 16px)"

requirements-completed: [DS-01, DS-02]

# Metrics
duration: 2min
completed: 2026-03-23
---

# Phase 01 Plan 01: Design Token Gaps Summary

**CSS glass tokens and backdropBlur scale added — glass utilities migrated from hardcoded rgba to semantic CSS custom properties for consistent dark mode rendering.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-23T23:05:11Z
- **Completed:** 2026-03-23T23:06:23Z
- **Tasks:** 1 of 1
- **Files modified:** 2

## Accomplishments

- Added explicit `backdropBlur` scale to `tailwind.config.ts` (8 stops: xs/sm/DEFAULT/md/lg/xl/2xl/3xl) so `@apply backdrop-blur-*` works reliably in downstream phases
- Added `--glass-bg` and `--glass-border` CSS custom properties to both `:root` (light) and `.dark` blocks, making glass rendering theme-aware
- Migrated `.glass` utility from hardcoded `rgba(255, 255, 255, 0.80)` to `var(--glass-bg)` and `var(--glass-border)` — removed separate `.dark .glass` override block (dark mode now handled by the token switch)
- Added `.glass-subtle` and `.dark .glass-subtle` utility classes (blur 8px, 60% opacity) for lighter glass surfaces
- Verified `.editor-panel` unchanged (`@apply bg-card border border-border rounded-xl`) — no action needed

## Task Commits

Each task was committed atomically:

1. **Task 1: Add backdropBlur scale, glass tokens, and glass-subtle utility** - `05ceb9e` (feat)

**Plan metadata:** _(docs commit follows)_

## Files Created/Modified

- `tailwind.config.ts` - Added `backdropBlur` object in `theme.extend` after the `animation` key
- `src/index.css` - Added `--glass-bg`/`--glass-border` tokens to `:root` and `.dark`; migrated `.glass` to tokens; removed `.dark .glass` override; added `.glass-subtle` and `.dark .glass-subtle`

## Deviations from Plan

None — plan executed exactly as written.

## Verification

All acceptance criteria verified:

- `tailwind.config.ts` contains `backdropBlur:` inside theme.extend with `xs: '2px'` and `'3xl': '64px'`
- `src/index.css` `:root` block contains `--glass-bg: rgba(255, 255, 255, 0.80);`
- `src/index.css` `:root` block contains `--glass-border: rgba(0, 0, 0, 0.06);`
- `src/index.css` `.dark` block contains `--glass-bg: hsl(var(--card) / 0.80);`
- `src/index.css` `.dark` block contains `--glass-border: hsl(var(--border) / 0.50);`
- `.glass` uses `background: var(--glass-bg);` (no hardcoded rgba)
- `.glass` uses `border: 1px solid var(--glass-border);` (no hardcoded rgba)
- No separate `.dark .glass` override block exists
- `.glass-subtle` with `backdrop-filter: blur(8px) saturate(140%)` present
- `.dark .glass-subtle` with `background: hsl(var(--card) / 0.60)` present
- `.editor-panel` remains `@apply bg-card border border-border rounded-xl`
- `npx tsc --noEmit` passes with zero errors
