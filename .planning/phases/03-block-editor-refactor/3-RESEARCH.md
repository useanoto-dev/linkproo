# Phase 3: BlockEditor Refactor — Research

**Researched:** 2026-03-24
**Domain:** React component decomposition, lazy loading, TypeScript refactor
**Confidence:** HIGH (all findings from direct source inspection)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Create `src/components/editor/blocks/` as the block editor directory
- **D-02:** Split into 6 editor groups:
  1. `TextBlockEditor` — types: `text`, `cta`, `header`
  2. `MediaBlockEditor` — types: `image`, `video`, `spotify`, `map`, `html`, `carousel`
  3. `LayoutBlockEditor` — types: `spacer`, `separator`, `banner`
  4. `InteractiveBlockEditor` — types: `image-button`, `animated-button`, `email-capture`, `countdown`, `badges`
  5. `ListBlockEditor` — types: `faq`, `gallery`, `testimonial`, `stats`, `product`, `contacts`
  6. Unknown type → fallback `null` (no crash)
- **D-03:** Each group editor receives: `block: LinkBlock`, `onUpdate`, `pages?: SubPage[]`, plus `textareaRef?: RefObject<HTMLTextAreaElement>` and `applyTextFormat` where needed
- **D-04:** `SortableBlock` becomes a dispatcher: keeps shell (drag handle, header, collapse/expand, action buttons) and renders the correct group editor based on `block.type`
- **D-05:** Use `React.lazy()` + `Suspense` for each group editor
- **D-06:** Suspense fallback: `<div className="p-3 animate-pulse h-20 bg-muted/30 rounded" />` — simple skeleton, no external component
- **D-07:** Lazy imports go at the top of `BlockEditor.tsx` (outside the component), not inside render
- **D-08:** Do NOT lazy-load `SortableBlock` itself — only internal group editors
- **D-09:** Move `BLOCK_LABELS`, `ANIM_STYLE_OPTIONS`, `BUSINESS_NAME_SIZE_OPTIONS`, `BUSINESS_NAME_ALIGN_OPTIONS` constants to `src/components/editor/blocks/constants.ts`
- **D-10:** Move `getUnifiedItems` and `getUnifiedItemsForMode` to `src/components/editor/blocks/unified-items.ts`
- **D-11:** `SortableButton`, `SortableBlock`, `SortableItem` stay in `BlockEditor.tsx` for now — move `SortableButton` to `src/components/editor/blocks/SortableButton.tsx` only if still needed to hit ≤300 lines
- **D-12:** Final target: `BlockEditor.tsx` ≤300 lines containing only: lazy imports, `SortableBlock` dispatcher, `SortableItem`, `BlockEditor` main component
- **D-13:** No state logic changes — only move JSX render code to child components
- **D-14:** `onUpdate` callback passed directly to editors — no intermediate wrappers
- **D-15:** `textareaRef` and `applyTextFormat` created in `SortableBlock`, passed as props — no new state
- **D-16:** After refactor, run `npx vitest run` to confirm zero regression

### Claude's Discretion

- Exact filenames inside `src/components/editor/blocks/`
- Whether `SortableButton` needs to be moved (depends on line count after other moves)
- Migration order for groups (any order is fine)
- Whether to create an `index.ts` barrel in the `blocks/` directory

### Deferred Ideas (OUT OF SCOPE)

- Block transition animations — Phase 5
- Block list virtualization (react-virtual) — backlog if list becomes slow
- Inline preview editor — out of v1.0 scope
</user_constraints>

---

## Summary

`BlockEditor.tsx` is a 1944-line monolith. The structure is well-understood from direct inspection: lines 1–208 are imports/constants/utilities/SortableButton, lines 209–1466 are `SortableBlock` (the monolith to split), lines 1467–1516 are `SortableItem`, and lines 1518–1944 are the `BlockEditor` main component.

The entire render body of `SortableBlock` — approximately lines 311–1460 — consists of a flat series of `{block.type === "X" && (...)}` conditional render blocks inside an `AnimatePresence`/`motion.div` wrapper. There are **no nested components** and **no shared state between block types** except two items scoped to `SortableBlock` itself: `textareaRef` (used only by the `text` block type) and `applyTextFormat` (a callback derived from `textareaRef`, used only by `text`).

The refactor strategy is purely JSX extraction: lift each group's conditional render blocks verbatim into a new file, wrap in `memo()`, and replace the original conditionals with a `switch(block.type)` dispatcher that renders the lazy-loaded group component. All state (`open`, `textareaRef`, `buttonPresets`, `applyTextFormat`) lives in `SortableBlock` and is passed as props. The `onUpdate` callback chain from `BlockEditor` → `SortableItem` → `SortableBlock` → group editor is strictly passthrough with no interception.

**Primary recommendation:** Extract groups in order from largest to smallest (Interactive first, then List, then Media, then Text, then Layout) to de-risk incrementally while keeping the file compilable after each extraction.

---

## Exact Line Map of SortableBlock Interior (lines 209–1466)

| Lines | Content |
|-------|---------|
| 209–267 | `SortableBlock` function signature, useSortable, buttonPresets memo, `open` state, `textareaRef` ref, `openKey` useEffect, `applyTextFormat` useCallback |
| 268–310 | Drag-and-drop wrapper div + collapsible header JSX (drag handle, label, duplicate/remove buttons, chevron) |
| 311–315 | `AnimatePresence` + `motion.div` opening, inner `div.p-3.space-y-3.border-t` |
| 312–395 | **Text group:** `text` and `cta` types (format toolbar, Textarea, subtitle, blockTextColor, blockTextAlign) |
| 397–444 | **Text group:** `header` type (Input, emoji, blockTextColor, blockTextAlign) |
| 446–465 | **Media group:** `image` type (ImageUploader, borderRadius Slider) |
| 467–477 | **Media group:** `video` type (URL Input) |
| 479–490 | **Layout group:** `spacer` type (height Slider) |
| 492–513 | **Interactive group:** `badges` type (Input with badge parsing) |
| 514–589 | **Interactive group:** `image-button` type (ImageUploader, buttonHeight Slider, url/page link toggle with Select) |
| 591–593 | **Layout group:** `separator` type (static text) |
| 595–617 | **Interactive group:** `countdown` type (datetime-local Input, label Input) |
| 619–670 | **List group:** `faq` type (mapped FaqItem editors with Q&A inputs + add button) |
| 672–702 | **List group:** `gallery` type (image grid + ImageUploader add) |
| 704–758 | **List group:** `testimonial` type (name, role, content, rating stars, avatar ImageUploader) |
| 760–802 | **List group:** `stats` type (mapped StatItem editors + add button) |
| 804–872 | **List group:** `product` type (ImageUploader, name, price, oldPrice, description, buttonLabel, buttonUrl) |
| 874–914 | **Interactive group:** `email-capture` type (content, emailPlaceholder, emailButtonLabel, emailSuccessMessage) |
| 916–942 | **Media group:** `spotify` type (spotifyUrl Input, spotifyCompact checkbox) |
| 944–982 | **Media group:** `map` type (mapAddress Input, mapUrl Textarea, mapHeight Slider) |
| 984–1010 | **Media group:** `html` type (htmlContent Textarea, htmlHeight Slider) |
| 1012–1051 | **Media group:** `carousel` type (slide grid + ImageUploader add + autoplay checkbox) |
| 1053–1268 | **Interactive group:** `animated-button` type (animStyle grid, content, animSubtitle, animButtonLabel, url/page toggle, animTitleSize Slider, animButtonHeight Slider, animPrimaryColor, animSecondaryColor, gradient preview swatch) |
| 1271–1318 | **Layout group:** `banner` type (bannerTag, content, subtitle, bannerBg color picker) |
| 1320–1459 | **List group:** `contacts` type (IIFE pattern with mode toggle, up to 2 contact cards each with photo/name/role/whatsapp inputs) |
| 1460–1466 | Closing tags for motion.div, AnimatePresence, outer div; end of SortableBlock |

---

## Shared State and Props Analysis

### What SortableBlock owns and must pass to group editors

| Prop/State | Type | Used by | How to handle |
|------------|------|---------|--------------|
| `block` | `LinkBlock` | all groups | pass as prop |
| `onUpdate` | `(id: string, updates: Partial<LinkBlock>) => void` | all groups | pass as prop directly (D-14) |
| `pages` | `SubPage[] \| undefined` | `image-button`, `animated-button` | pass as prop |
| `textareaRef` | `RefObject<HTMLTextAreaElement>` | `text` type only | pass as prop to `TextBlockEditor` only |
| `applyTextFormat` | `(tag: string, url?: string) => void` | `text` type only | pass as prop to `TextBlockEditor` only |
| `buttonPresets` | return of `buildButtonPresets(block.buttonHeight ?? 110)` | `image-button` type only | can be computed inside `InteractiveBlockEditor` using same memo — OR passed as prop |

**Recommendation for `buttonPresets`:** Move the `useMemo(() => buildButtonPresets(block.buttonHeight ?? 110), [block.buttonHeight])` call into `InteractiveBlockEditor` directly. It uses only `block.buttonHeight`, which is available from the `block` prop. This avoids an extra prop and keeps `SortableBlock` cleaner.

### Props interface for each group editor

All group editors share the same base interface (defined once, or each file can re-declare):

```typescript
interface GroupEditorProps {
  block: LinkBlock;
  onUpdate: (id: string, updates: Partial<LinkBlock>) => void;
  pages?: SubPage[];
}
```

`TextBlockEditor` extends this with:
```typescript
interface TextBlockEditorProps extends GroupEditorProps {
  textareaRef: RefObject<HTMLTextAreaElement>;
  applyTextFormat: (tag: string, url?: string) => void;
}
```

### What SortableBlock dispatcher keeps (after extraction)

```typescript
const SortableBlock = memo(function SortableBlock({ block, onUpdate, onRemove, onDuplicate, pages, openKey }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  const [open, setOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (openKey) setOpen(true); }, [openKey]);
  const applyTextFormat = useCallback(/* ... unchanged ... */, [block.id, block.content, onUpdate]);

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="editor-card">
      {/* header JSX unchanged — lines 270–299 */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div /* ... */>
            <div className="p-3 space-y-3 border-t border-border/30">
              <Suspense fallback={<div className="p-3 animate-pulse h-20 bg-muted/30 rounded" />}>
                {renderGroupEditor(block, onUpdate, pages, textareaRef, applyTextFormat)}
              </Suspense>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
```

The `renderGroupEditor` helper (or inline switch) selects the lazy component. Pattern from D-70 of CONTEXT.md:

```typescript
function renderGroupEditor(
  block: LinkBlock,
  onUpdate: (id: string, updates: Partial<LinkBlock>) => void,
  pages: SubPage[] | undefined,
  textareaRef: RefObject<HTMLTextAreaElement>,
  applyTextFormat: (tag: string, url?: string) => void,
) {
  switch (block.type) {
    case "text":
    case "cta":
    case "header":
      return <TextBlockEditor block={block} onUpdate={onUpdate} textareaRef={textareaRef} applyTextFormat={applyTextFormat} />;
    case "image":
    case "video":
    case "spotify":
    case "map":
    case "html":
    case "carousel":
      return <MediaBlockEditor block={block} onUpdate={onUpdate} />;
    case "spacer":
    case "separator":
    case "banner":
      return <LayoutBlockEditor block={block} onUpdate={onUpdate} />;
    case "image-button":
    case "animated-button":
    case "email-capture":
    case "countdown":
    case "badges":
      return <InteractiveBlockEditor block={block} onUpdate={onUpdate} pages={pages} />;
    case "faq":
    case "gallery":
    case "testimonial":
    case "stats":
    case "product":
    case "contacts":
      return <ListBlockEditor block={block} onUpdate={onUpdate} />;
    default:
      return null;
  }
}
```

---

## Standard Stack

### Confirmed imports each group editor needs

| Group | UI imports | Type imports | Utility imports |
|-------|-----------|-------------|----------------|
| TextBlockEditor | Input, Label, Textarea | LinkBlock, SubPage (from `@/types/smart-link`) | none |
| MediaBlockEditor | Input, Label, Textarea, Slider | LinkBlock, SubPage, CarouselSlide | ImageUploader |
| LayoutBlockEditor | Input, Label, Slider | LinkBlock | none |
| InteractiveBlockEditor | Input, Label, Slider, Select, SelectContent, SelectItem, SelectTrigger, SelectValue | LinkBlock, SubPage | ImageUploader, ANIM_STYLE_OPTIONS (from constants.ts), buildButtonPresets |
| ListBlockEditor | Input, Label, Textarea, Slider | LinkBlock, FaqItem, GalleryImage, StatItem, ContactItem | ImageUploader, Trash2 |

All from `@/components/ui/*` and `@/types/smart-link`. All editors must also import `React` for `memo()`.

### Constants file (`src/components/editor/blocks/constants.ts`)

Must export:
- `BLOCK_LABELS: Record<BlockType, string>` — 24 entries (lines 36–63)
- `ANIM_STYLE_OPTIONS` — 10 entries (lines 65–76)
- `BUSINESS_NAME_SIZE_OPTIONS` — 5 entries (lines 78–84)
- `BUSINESS_NAME_ALIGN_OPTIONS` — 3 entries (lines 86–90)

`BlockEditor.tsx` still needs `BLOCK_LABELS` (used in `SortableBlock` header: `BLOCK_LABELS[block.type]`).
`InteractiveBlockEditor` needs `ANIM_STYLE_OPTIONS`.
`BlockEditor` main component needs `BUSINESS_NAME_SIZE_OPTIONS` and `BUSINESS_NAME_ALIGN_OPTIONS`.

### Unified items file (`src/components/editor/blocks/unified-items.ts`)

Must export:
- `UnifiedItem` type (lines 143–145)
- `getUnifiedItems(link: SmartLink): UnifiedItem[]` (lines 147–161)
- `getUnifiedItemsForMode(link: SmartLink, subPageMode?: SubPageMode): UnifiedItem[]` (lines 163–174)

`BlockEditor.tsx` imports both functions and the type. `SubPageMode` interface (lines 126–131) must also be exported or co-located.

---

## Architecture Patterns

### Recommended project structure after refactor

```
src/components/editor/
├── BlockEditor.tsx              # ≤300 lines: lazy imports, SortableBlock dispatcher, SortableItem, BlockEditor main
├── ButtonBlockEditor.tsx        # existing, unchanged (590 lines)
├── SubPageEditor.tsx            # existing, unchanged
└── blocks/
    ├── constants.ts             # BLOCK_LABELS, ANIM_STYLE_OPTIONS, BUSINESS_NAME_SIZE_OPTIONS, BUSINESS_NAME_ALIGN_OPTIONS
    ├── unified-items.ts         # UnifiedItem type, getUnifiedItems, getUnifiedItemsForMode, SubPageMode interface
    ├── TextBlockEditor.tsx      # text, cta, header — ~90 lines
    ├── MediaBlockEditor.tsx     # image, video, spotify, map, html, carousel — ~130 lines
    ├── LayoutBlockEditor.tsx    # spacer, separator, banner — ~65 lines
    ├── InteractiveBlockEditor.tsx # image-button, animated-button, email-capture, countdown, badges — ~280 lines
    ├── ListBlockEditor.tsx      # faq, gallery, testimonial, stats, product, contacts — ~290 lines
    └── SortableButton.tsx       # (optional — create only if BlockEditor.tsx still exceeds 300 lines after D-09/D-10)
```

### Lazy import declarations (top of BlockEditor.tsx, D-07)

```typescript
const TextBlockEditor = React.lazy(() =>
  import("./blocks/TextBlockEditor").then(m => ({ default: m.TextBlockEditor }))
);
const MediaBlockEditor = React.lazy(() =>
  import("./blocks/MediaBlockEditor").then(m => ({ default: m.MediaBlockEditor }))
);
const LayoutBlockEditor = React.lazy(() =>
  import("./blocks/LayoutBlockEditor").then(m => ({ default: m.LayoutBlockEditor }))
);
const InteractiveBlockEditor = React.lazy(() =>
  import("./blocks/InteractiveBlockEditor").then(m => ({ default: m.InteractiveBlockEditor }))
);
const ListBlockEditor = React.lazy(() =>
  import("./blocks/ListBlockEditor").then(m => ({ default: m.ListBlockEditor }))
);
```

Note: if group editor files use `export default`, the `.then(m => ...)` transform is unnecessary. Using named exports (`export const TextBlockEditor = memo(...)`) + the `.then(m => ({ default: m.TextBlockEditor }))` pattern matches the existing `ButtonBlockEditor` pattern in the project.

### Anti-Patterns to Avoid

- **Wrapping onUpdate in a new callback:** Any wrapper around `onUpdate` in a group editor would break undo/redo because the history hook in `LinkEditor.tsx` tracks the exact reference chain. Pass `onUpdate` directly (D-14).
- **Moving the `open` state out of SortableBlock:** The expand/collapse logic and the `openKey` effect that auto-opens when preview is clicked both live in `SortableBlock`. Do not move this state to group editors.
- **Lazy-loading SortableBlock or SortableItem:** These are the structural shell — they must always be available synchronously (D-08).
- **Inline lazy() inside render:** `React.lazy()` calls must be at module level. Creating them inside component render or inside other functions causes React to unmount+remount on every render.
- **Using default exports that conflict with named exports:** Be consistent. The recommended pattern is named exports with the `.then()` transform in the lazy declaration, matching `ButtonBlockEditor`'s export style.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Block type grouping/dispatch | custom type union narrowing | switch on `block.type` | TypeScript narrows the type inside each case; simpler than a Record of components |
| Loading skeleton | custom Skeleton component | inline `div className="p-3 animate-pulse h-20 bg-muted/30 rounded"` | D-06 is explicit; avoids adding a dependency |
| Error boundary | try/catch in render | existing `BlockErrorBoundary` (lines 94–124) — already wraps each SortableBlock via SortableItem | already in place, no duplication needed |

---

## Line Count Estimate After Refactor

After moving constants (D-09) and utilities (D-10), removing the SortableBlock render body (~1150 lines), and leaving the dispatcher + shell:

| Section | Estimated lines remaining in BlockEditor.tsx |
|---------|---------------------------------------------|
| Imports (reduced — no UI imports, no ImageUploader) | ~20 |
| Lazy import declarations (5 components) | ~15 |
| BlockErrorBoundary class | ~30 |
| SubPageMode + BlockEditorProps interfaces | ~15 |
| SortableButton (if kept here) | ~32 |
| SortableBlock dispatcher (shell + switch) | ~65 |
| SortableItem | ~50 |
| BlockEditor main (1518–1944 minus constants usage) | ~80 |
| **Total estimate** | **~307 lines** |

This is slightly over. Moving `SortableButton` to `blocks/SortableButton.tsx` saves ~32 lines, bringing the total to ~275. Moving `BlockErrorBoundary` to `blocks/BlockErrorBoundary.tsx` saves another ~30 lines if still needed. The safest path: do D-09 + D-10 + all group extractions, count lines, then decide on D-11.

---

## Subtle Dependencies and Cross-Block Concerns

### The `contacts` block IIFE pattern

The `contacts` block (lines 1320–1459) uses an immediately invoked function expression `(() => { ... })()` as the render expression. This is valid JSX but uncommon. When extracting to `ListBlockEditor`, this IIFE should be replaced with a normal conditional or refactored into the component's render body — it will work either way, but a direct lift-out (without unwrapping the IIFE) will also work.

### `buttonPresets` dependency

The `buttonPresets` memo at line 227 is used exclusively by the `image-button` type (line 527: `presets={buttonPresets}`). When the `image-button` branch moves to `InteractiveBlockEditor`, `buttonPresets` must move with it. It should be re-declared inside `InteractiveBlockEditor` as a `useMemo` using `block.buttonHeight`.

### `applyTextFormat` dependency on `textareaRef`

`applyTextFormat` (lines 239–266) uses `textareaRef.current` and reads `block.content`. It calls `onUpdate(block.id, { content: newContent })`. This callback is created in `SortableBlock` and passed to `TextBlockEditor`. The `requestAnimationFrame` inside it refocuses the textarea after React re-render — this will still work when the ref is owned by `SortableBlock` but passed down, because the ref object identity is stable.

### `BLOCK_LABELS` used in SortableBlock header

`BLOCK_LABELS` is used at line 282: `BLOCK_LABELS[block.type]`. After moving to `constants.ts`, `BlockEditor.tsx` must import it from there. This is the only use of `BLOCK_LABELS` inside `SortableBlock`.

### No cross-group state sharing

There is no shared state between block type groups. Every block type renders in isolation. The `open` / `textareaRef` / `applyTextFormat` are scoped to `SortableBlock`, not to any specific block type. The extraction is purely JSX lift.

### `ANIM_STYLE_OPTIONS` used inside animated-button render

`ANIM_STYLE_OPTIONS` (lines 1060–1072) is referenced inside the `animated-button` render block. After extraction, `InteractiveBlockEditor.tsx` must import this constant from `constants.ts`.

---

## Common Pitfalls

### Pitfall 1: React.lazy with named exports
**What goes wrong:** `React.lazy()` expects a module with a `default` export. If the group editor file uses `export const TextBlockEditor = memo(...)` (named export), calling `React.lazy(() => import('./TextBlockEditor'))` will cause a runtime error about missing `default` export.
**Why it happens:** React.lazy spec requires default export.
**How to avoid:** Use `.then(m => ({ default: m.TextBlockEditor }))` in the lazy declaration, OR use `export default memo(function TextBlockEditor(...))` in each file.
**Warning signs:** Runtime error "The default export of a lazily-loaded component must be a React component."

### Pitfall 2: Suspense boundary outside AnimatePresence
**What goes wrong:** If the `Suspense` wrapper is placed outside the `AnimatePresence`/`motion.div`, the loading skeleton appears even when the block is collapsed (closed), wasting render cycles.
**Why it happens:** `Suspense` triggers on the first render of the lazy component — if it's always rendered regardless of `open`, it loads even for collapsed blocks.
**How to avoid:** Place `Suspense` inside the `{open && (...)}` conditional, wrapping only the group editor call. The existing code already gates on `{open && ...}` via `AnimatePresence`, so the Suspense should go inside that gate.

### Pitfall 3: Stale closure in applyTextFormat after move
**What goes wrong:** If `applyTextFormat` is recreated inside `TextBlockEditor` instead of being passed from `SortableBlock`, the `textareaRef` won't point to the actual textarea DOM element because the ref is owned by `SortableBlock`.
**Why it happens:** The ref must be attached to the `<Textarea ref={...}>` element AND owned by the component that creates the callback — they must be in the same component.
**How to avoid:** Keep `textareaRef` and `applyTextFormat` in `SortableBlock` (D-15). Pass both as props. Inside `TextBlockEditor`, attach `textareaRef` to the `<Textarea>` element.

### Pitfall 4: TypeScript errors from missing imports in group editors
**What goes wrong:** After extraction, `FaqItem`, `GalleryImage`, `StatItem`, `ContactItem`, `CarouselSlide` are used in group editors but not imported.
**Why it happens:** These types are imported at the top of the current `BlockEditor.tsx` (line 2) and are referenced directly inside the block type conditionals that get extracted.
**How to avoid:** Each group editor file must import from `@/types/smart-link` all types it uses. Reference the complete import at line 2 of the current file.

### Pitfall 5: BlockEditor.tsx still importing removed UI components
**What goes wrong:** After extraction, `BlockEditor.tsx` still imports `Textarea`, `Slider`, `Select`, etc. that are no longer used — TypeScript won't error but it's dead weight.
**Why it happens:** The imports at lines 1–33 were written for the monolith.
**How to avoid:** After all extractions, audit imports in `BlockEditor.tsx` and remove anything only used by the extracted groups. Keep: `React`, `DndContext`/`dnd-kit`, `motion`/`AnimatePresence`, `useMemo`/`useCallback`/`memo`/`useState`/`useRef`/`useEffect`, `useSortable`, `CSS`, `Input`/`Label`/`Textarea`/`Switch`/`Slider`/`Select*` (used by hero/info section), `PUBLISHED_DOMAIN`, `ButtonBlockEditor`, `GripVertical`/`CopyPlus`/`Trash2`/`ChevronDown`/`ChevronUp`/`AlignLeft`/`AlignCenter`/`AlignRight`/`AlertCircle`, `ImageUploader`/`buildButtonPresets` (if SortableButton stays), `checkSlugAvailability`/`normalizeSlug`.

---

## Code Examples

### Verified pattern: group editor file structure (from ButtonBlockEditor.tsx)

```typescript
// Source: src/components/editor/ButtonBlockEditor.tsx lines 89–100
export const ButtonBlockEditor = React.memo(function ButtonBlockEditor({
  button, index, onUpdate, onRemove, dragHandleProps, pages = []
}: ButtonBlockEditorProps) {
  const [expanded, setExpanded] = useState(false);
  // ...
});
```

Apply same pattern to each group editor:

```typescript
// src/components/editor/blocks/TextBlockEditor.tsx
import React, { memo, RefObject } from "react";
import { LinkBlock } from "@/types/smart-link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TextBlockEditorProps {
  block: LinkBlock;
  onUpdate: (id: string, updates: Partial<LinkBlock>) => void;
  textareaRef: RefObject<HTMLTextAreaElement>;
  applyTextFormat: (tag: string, url?: string) => void;
}

export const TextBlockEditor = memo(function TextBlockEditor({
  block, onUpdate, textareaRef, applyTextFormat
}: TextBlockEditorProps) {
  return (
    <>
      {(block.type === "text" || block.type === "cta") && (
        /* JSX from lines 312–395 verbatim */
      )}
      {block.type === "header" && (
        /* JSX from lines 397–444 verbatim */
      )}
    </>
  );
});
```

### Verified pattern: lazy import with named export

```typescript
// At top of BlockEditor.tsx (module level)
const TextBlockEditor = React.lazy(() =>
  import("./blocks/TextBlockEditor").then(m => ({ default: m.TextBlockEditor }))
);
```

### Verified pattern: Suspense in SortableBlock

```typescript
// Inside the {open && (...)} branch, wrapping the group editor call
<Suspense fallback={<div className="p-3 animate-pulse h-20 bg-muted/30 rounded" />}>
  {renderGroupEditor(block, onUpdate, pages, textareaRef, applyTextFormat)}
</Suspense>
```

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 |
| Config file | `vitest.config.ts` (root level) |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run` |
| Environment | jsdom |

### Existing Tests (must pass after refactor)

| File | What it tests | Impact from refactor |
|------|--------------|---------------------|
| `src/test/slug-utils.test.ts` | `normalizeSlug`, `validateSlug` | None — no dependency on BlockEditor |
| `src/test/color-utils.test.ts` | `extractBgColor` | None |
| `src/test/link-mappers.test.ts` | `smartLinkToRow` and related mappers | None |
| `src/test/example.test.ts` | Sanity checks for slug/color utils | None |

**Finding:** None of the 4 existing test files test `BlockEditor.tsx` directly. All test utility functions only. The refactor **cannot break any existing test** by construction — no test imports from `BlockEditor.tsx` or any of its child components.

The regression check from D-16 (`npx vitest run`) will pass as long as imports and exports in utility files remain intact. It is NOT a functional test of the BlockEditor UI.

### Phase Gate

Run `npx vitest run` after completing all extractions. All 4 test files (788 lines total) should remain green. No new test files are required by this phase.

### Wave 0 Gaps

None — existing test infrastructure covers the phase gate requirement (D-16). No test files need to be created.

---

## Open Questions

1. **Should `BlockErrorBoundary` be moved to `blocks/`?**
   - What we know: It's a class component at lines 94–124 (31 lines), currently in `BlockEditor.tsx`. It's used only by `SortableItem`.
   - What's unclear: Moving it would help hit ≤300 lines if needed, but adds another file.
   - Recommendation: Leave in `BlockEditor.tsx` initially. Move only if line count math shows it's required.

2. **Should `SubPageMode` interface be in `unified-items.ts` or stay in `BlockEditor.tsx`?**
   - What we know: `SubPageMode` is used in `BlockEditorProps` (stays in `BlockEditor.tsx`) and also in `getUnifiedItemsForMode` (moves to `unified-items.ts`).
   - Recommendation: Export `SubPageMode` from `unified-items.ts` and re-import into `BlockEditor.tsx`. This keeps `unified-items.ts` self-contained.

3. **Does the `contacts` IIFE pattern need refactoring?**
   - What we know: The IIFE at lines 1320–1459 is syntactically valid JSX and will lift out without changes.
   - Recommendation: Lift verbatim on first extraction. The planner can note it as a code smell to clean up in a future phase, but do not address it here (D-13: no logic changes).

---

## Sources

### Primary (HIGH confidence)

- Direct inspection of `src/components/editor/BlockEditor.tsx` (1944 lines) — full line map, all block types, all shared state
- Direct inspection of `src/components/editor/ButtonBlockEditor.tsx` — established extraction pattern
- Direct inspection of `src/test/` — confirmed 4 test files, none testing BlockEditor
- Direct inspection of `vitest.config.ts` and `package.json` — confirmed Vitest 3.2.4, `npx vitest run` command

### Secondary (MEDIUM confidence)

- React documentation on `React.lazy` + named export pattern — standard pattern, training data HIGH, no API changes expected in React 18/19

---

## Metadata

**Confidence breakdown:**
- Line map: HIGH — read directly from source
- Group assignments: HIGH — matches CONTEXT.md D-02 exactly
- Shared state analysis: HIGH — inspected all usages in source
- Line count estimate: MEDIUM — based on character counts from source, actual count depends on whitespace formatting
- Test impact: HIGH — none of the 4 test files import from BlockEditor

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable refactor — no external API dependencies)

---

## RESEARCH COMPLETE
