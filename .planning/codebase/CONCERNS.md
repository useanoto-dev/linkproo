# Codebase Concerns

**Analysis Date:** 2026-03-28

---

## Tech Debt

**Duplicate `names` map in `LinkEditor.tsx`:**
- Issue: The block-type-to-label mapping (`{ button: "Botão Visual", text: "Texto", ... }`) is defined twice inside `addBlock` and `insertBlockAt` in `src/pages/LinkEditor.tsx` (lines 323-331 and 357-365). This is a copy-paste artifact with no shared constant.
- Files: `src/pages/LinkEditor.tsx`
- Impact: Any new block type must be added in two places; both can diverge silently.
- Fix approach: Extract to a shared constant (already partially done as `BLOCK_LABELS` in `src/components/editor/blocks/constants.ts`) and reference it in both functions.

**`@ts-expect-error` on Supabase autosave call:**
- Issue: The autosave `.update(row)` in `LinkEditor.tsx` (line 118) suppresses a TypeScript error because the generated Supabase types are out of sync with the actual DB columns (`bg_effects`, `business_name_font_size`, `business_name_align`, `business_name_html`).
- Files: `src/pages/LinkEditor.tsx`, `src/integrations/supabase/types.ts`
- Impact: Silent type unsafety on every autosave. New DB fields added later will also be silently unsuppressed.
- Fix approach: Regenerate Supabase types (`supabase gen types typescript`) after migrating the missing columns.

**`handleSave` referenced inside `useEffect` without stable identity:**
- Issue: In `LinkEditor.tsx` the keyboard shortcut `useEffect` (line 496) lists `handleSave` in its deps array, but `handleSave` is an inline async function defined in the component body — it is recreated on every render, causing the effect to re-register on each keystroke.
- Files: `src/pages/LinkEditor.tsx`
- Impact: Memory leak from repeated event listener registration; `handleSave` must be wrapped in `useCallback`.
- Fix approach: Wrap `handleSave` in `useCallback` with correct deps.

**`eslint-disable react-hooks/exhaustive-deps` suppressions:**
- Issue: Two suppression comments exist — `src/components/editor/CropEditor.tsx:161` and `src/components/editor/blocks/SortableList.tsx:226` — hiding potential stale-closure bugs.
- Files: `src/components/editor/CropEditor.tsx`, `src/components/editor/blocks/SortableList.tsx`
- Impact: Latent render bugs that only appear under specific state transitions.
- Fix approach: Audit each suppressed dependency and either fix the dependency array or restructure the logic with refs.

**`Date.now().toString()` as element IDs:**
- Issue: New button/block IDs are generated via `Date.now().toString()` or `Date.now()` throughout `LinkEditor.tsx` (lines 335, 378, etc.) and `SortableList.tsx`. ID collision is possible when adding multiple elements within the same millisecond.
- Files: `src/pages/LinkEditor.tsx`, `src/components/editor/blocks/SortableList.tsx`
- Impact: Duplicate IDs can corrupt the sorted render list and the canvas item map.
- Fix approach: Use `crypto.randomUUID()` or `nanoid`.

**`loadGoogleFont` duplicated:**
- Issue: The same function body for loading a Google Font via a `<link>` tag exists in both `src/components/editor/ThemePanel.tsx:35` and `src/components/preview/preview-utils.ts`. No shared module is imported.
- Files: `src/components/editor/ThemePanel.tsx`, `src/components/preview/preview-utils.ts`
- Impact: Behaviour diverges if one copy is patched; font loading in editor may differ from public page.
- Fix approach: Keep the canonical copy in `preview-utils.ts` and import it in `ThemePanel.tsx`.

**`getTemplateBgStyle` Tailwind-to-hex map is incomplete:**
- Issue: `src/pages/Dashboard.tsx` (line 23) has a 40-entry `tailwindToHex` map that only covers `*-950` and `*-900` suffixes. Template cards using any other shade (`*-800`, custom hex, etc.) silently fall back to the `accentColor` gradient, producing a different color than the actual public page.
- Files: `src/pages/Dashboard.tsx`
- Impact: Template preview cards misrepresent their real appearance for ~30% of templates.
- Fix approach: Generate the map programmatically from Tailwind config, or use computed styles/canvas approach.

---

## Known Bugs

**`handleSave` called inside keyboard `useEffect` before async slug check completes:**
- Symptoms: Pressing Ctrl+S while the editor is initialising (before `initialized=true`) triggers a save on a link whose slug may be blank, producing a toast error rather than a silent no-op.
- Files: `src/pages/LinkEditor.tsx`
- Trigger: Press Ctrl+S during the first ~200 ms after opening a new link form.
- Workaround: None.

**Canvas element ID collision on rapid duplication:**
- Symptoms: Duplicating two elements in the same millisecond assigns the same `Date.now().toString()` ID to both, making only one visible in the canvas selection system.
- Files: `src/pages/LinkEditor.tsx` (lines 227-252), `src/components/editor/blocks/SortableList.tsx`
- Trigger: Ctrl+D twice in rapid succession in canvas mode.
- Workaround: Pause briefly between duplications.

**`canvasH` default differs between editor and public render:**
- Symptoms: Blocks placed in canvas mode use `getDefaultHeight()` in `CanvasPreview.tsx` for their initial `canvasH`, but `SmartLinkPreview.tsx`'s `CanvasModeRender` uses the same field. If `canvasH` is not explicitly saved (e.g. link loaded before canvas mode ever opened), elements may overlap on the public page.
- Files: `src/components/preview/CanvasPreview.tsx`, `src/components/SmartLinkPreview.tsx`
- Trigger: Switch to canvas mode, add elements, save immediately without moving anything.

**Email-capture silently discards save errors:**
- Symptoms: If `saveEmailCapture` throws (network error, RLS violation), the submitted state is already shown as success and the error is only logged to `console.error`.
- Files: `src/components/preview/BlockRenderer.tsx:129-132`
- Trigger: Supabase outage or misconfigured RLS during email capture.
- Workaround: None for the end user.

**`beforeunload` warning fires even when autosave is in `idle/saved` state:**
- Symptoms: The `beforeunload` guard checks `autosaveStatus === "saving" || autosaveStatus === "error"`. "Saving" is a transient state that lasts <200 ms; the guard correctly fires. But the `flush()` call in the handler is `async` — the browser will not await it before closing the tab, so data can still be lost.
- Files: `src/pages/LinkEditor.tsx:136-163`
- Trigger: Close the tab while autosave is mid-flight.
- Workaround: The `visibilitychange` flush partially mitigates this.

---

## Security Considerations

**`dangerouslySetInnerHTML` with SVG from static data — low risk but worth noting:**
- Risk: `src/components/editor/ButtonBlockEditor.tsx:19` injects inline SVG from `brandIcons` via `dangerouslySetInnerHTML`. The source is a static module (`src/data/brand-icons.ts`) not user input, so XSS is not currently exploitable. However if `brandIcons` is ever populated from user data or external fetch, this becomes a direct XSS vector.
- Files: `src/components/editor/ButtonBlockEditor.tsx`, `src/data/brand-icons.ts`
- Current mitigation: Static data only.
- Recommendations: Use a sanitisation pass via DOMPurify even for static SVGs; or render as an `<img src="data:image/svg+xml,..." />`.

**HTML block iframe — `allow-scripts` sandbox without `allow-same-origin`:**
- Risk: The `FreeHtmlBlock` in `src/components/preview/BlockRenderer.tsx` and the `HtmlTitle` iframe in `src/components/SmartLinkPreview.tsx` both use `sandbox="allow-scripts"` only. This correctly prevents access to the parent DOM. However the postMessage channel (`fhb-height`, `html-title-height`) does not validate `e.origin`, meaning any page loaded in the same browser can spoof a resize message.
- Files: `src/components/preview/BlockRenderer.tsx:28-35`, `src/components/SmartLinkPreview.tsx:88-95`
- Current mitigation: The spoofed message can only cause layout distortion (iframe height), not data exfiltration.
- Recommendations: Validate `e.origin === window.location.origin` in the `onMessage` handler, or add the `msgId` check that is already partially in place.

**Content protection in `protect.ts` is bypass-trivial:**
- Risk: `src/lib/protect.ts` blocks F12, Ctrl+Shift+I, right-click, and Ctrl+U. This is security theatre — opening DevTools from the browser menu, using the mobile inspector, or disabling JS entirely all bypass it.
- Files: `src/lib/protect.ts`, `src/pages/PublicLinkPage.tsx:35-38`
- Current mitigation: None meaningful.
- Recommendations: Accept that client-side content protection is not enforceable. Remove or clearly document it as UX-only (blocks accidental drag of images, not determined scrapers).

**Supabase anon key exposed via `VITE_SUPABASE_PUBLISHABLE_KEY`:**
- Risk: The Supabase publishable (anon) key is embedded in the client bundle via `import.meta.env`. This is expected for Supabase architectures but means Row Level Security (RLS) is the only barrier against unauthorised data access.
- Files: `src/integrations/supabase/client.ts`
- Current mitigation: Supabase RLS. Severity depends entirely on how complete RLS policies are.
- Recommendations: Audit all Supabase tables for complete RLS coverage; never use the service-role key on the client.

---

## Performance Bottlenecks

**`SmartLinkPreview.tsx` is 758 lines — monolithic render tree:**
- Problem: A single component handles normal mode, canvas mode, effects layer, HTML title iframe, floating emojis, WhatsApp float, sub-page modal, and all block rendering delegation. Every prop change re-evaluates all branches.
- Files: `src/components/SmartLinkPreview.tsx`
- Cause: Incremental feature addition without extraction.
- Improvement path: Extract `CanvasModeRender` (already partially separated), `EffectsLayer`, and `HeaderSection` into their own memoised components.

**`BlockRenderer.tsx` is 856 lines with a large `switch` dispatch:**
- Problem: All 24+ block types render from a single component via a switch statement. The entire file is parsed and evaluated even if only one block type is used.
- Files: `src/components/preview/BlockRenderer.tsx`
- Cause: No code-splitting at the block-type level.
- Improvement path: Convert the switch cases to `React.lazy` per block type, or group into 4–5 category-level lazy chunks (matching the pattern used in `BlockEditor.tsx`).

**`CanvasToolbar` uses `requestAnimationFrame` polling to track element position:**
- Problem: `src/components/editor/CanvasToolbar.tsx:46-54` runs a `rAF` loop continuously while an element is selected, comparing `getBoundingClientRect()` on every frame. This is 60 fps DOM measurement even when the element is not moving.
- Files: `src/components/editor/CanvasToolbar.tsx`
- Cause: No React state connection between the Moveable drag events and toolbar position.
- Improvement path: Use a `ResizeObserver` + `MutationObserver` on the target element, or drive toolbar position from the Moveable `onDrag`/`onResize` callbacks via a shared ref/context.

**`data/templates.ts` is 2317 lines loaded synchronously:**
- Problem: The entire template library (including all embedded Unsplash image URLs and default content strings) is imported at module level by both `Dashboard.tsx` and `LinkEditor.tsx`, adding to the initial JS bundle.
- Files: `src/data/templates.ts`, `src/pages/Dashboard.tsx`, `src/pages/LinkEditor.tsx`
- Cause: Static import with no code splitting.
- Improvement path: Lazy import templates only when the dashboard or template picker is rendered.

**Preview debounce is 50 ms, not the commented 150 ms:**
- Problem: `LinkEditor.tsx:96` sets `setTimeout(..., 50)` but the comment above says "150ms after user stops typing". At 50 ms, the preview still re-renders ~20 times per second during fast typing, partially defeating the optimisation.
- Files: `src/pages/LinkEditor.tsx:95-96`
- Cause: Code-comment mismatch; the value was likely tuned down without updating the comment.
- Improvement path: Raise to 120–150 ms for a better typing experience with no perceptible lag.

---

## Fragile Areas

**Canvas mode — position state scattered across buttons and blocks arrays:**
- Files: `src/pages/LinkEditor.tsx:212-301`, `src/components/preview/CanvasPreview.tsx`
- Why fragile: Canvas position (`canvasX`, `canvasY`, `canvasW`, `canvasH`, `canvasRotation`) is stored directly on each button/block object. Any operation that maps over buttons OR blocks (reorder, duplicate, filter) must be aware of canvas fields or it will silently clear them. There are already two separate `map()` calls in `handleCanvasBringForward` and `handleCanvasSendBackward` that apply the same mutation redundantly to both arrays.
- Safe modification: Always update BOTH `buttons` and `blocks` when changing canvas positions; never spread-overwrite canvas fields.
- Test coverage: No tests for canvas position persistence or ordering.

**Order numbering using fractional offsets (`order + 0.5`, `order - 0.5`):**
- Files: `src/pages/LinkEditor.tsx:235,269,285,296`
- Why fragile: Bring-forward and send-backward set `order` to `nextOrder + 0.5` or `prevOrder - 0.5`. After many reorder operations, order values are no longer integers and can accumulate floating-point precision issues. Sorting by these values in `getUnifiedItemsForMode` may produce inconsistent results.
- Safe modification: After any reorder, renormalise all order values to a clean 0, 1, 2... sequence.
- Test coverage: No tests for repeated bring-forward/send-backward cycles.

**`SortableList.tsx` `eslint-disable` on `useMemo` deps:**
- Files: `src/components/editor/blocks/SortableList.tsx:225-227`
- Why fragile: The `useMemo` for `unifiedItems` only lists `link.buttons`, `link.blocks`, and `subPageMode?.page.blocks`. If `subPageMode` itself changes identity (e.g. due to parent re-render), the memoised items will not update.
- Safe modification: Include `subPageMode` in the dependency array.

**`HtmlTitle` iframe remounts on every `srcDoc` change:**
- Files: `src/components/SmartLinkPreview.tsx:104`
- Why fragile: The `key={srcDoc}` pattern forces a full iframe remount whenever the HTML content changes. This is intentional for correctness but means any edit to `businessName` (even a single character in a non-HTML field) triggers a full iframe reload, causing a visible flash in the preview.
- Safe modification: Only force remount when the HTML structure changes, not on every debounced preview update.
- Test coverage: None.

---

## Scaling Limits

**Editor history (`useEditorHistory`) stores full `SmartLink` snapshots:**
- Current capacity: The editor stores up to 50 undo history entries (`src/hooks/use-editor-history.ts`). Each entry is a full serialised `SmartLink` object, including all blocks, buttons, and canvas positions.
- Limit: A link with 30 blocks × 50 history entries ≈ large in-memory footprint; in extreme cases with gallery/carousel blocks, each snapshot can be 50–100 KB.
- Scaling path: Switch to structural diffing (store only the delta between states) or reduce history depth.

**`templates.ts` template count growth:**
- Current capacity: 2317-line file with ~40+ templates.
- Limit: No pagination or virtualisation in the dashboard template grid. At 100+ templates, the initial render and filter will become perceptibly slow.
- Scaling path: Virtualise the template grid (e.g. `react-window`); move templates to a Supabase table with server-side filtering.

---

## Dependencies at Risk

**`react-moveable` — canvas drag/resize:**
- Risk: `react-moveable` is a complex DOM-manipulation library that uses `getBoundingClientRect` and applies CSS transforms directly to DOM nodes. It bypasses React's render cycle entirely for drag/resize. This makes it fragile against React concurrent features and future Framer Motion upgrades.
- Impact: Canvas mode drag/resize breaks silently if the DOM node is recycled by React before Moveable finishes a gesture.
- Migration plan: Watch for `react-moveable` compatibility with React 19 concurrent mode; the `createPortal` workaround already in place mitigates the `overflow:hidden` issue but not the concurrent render issue.

---

## Missing Critical Features

**No confirmation on destructive operations in canvas mode:**
- Problem: Pressing Delete/Backspace while an element is selected in canvas mode immediately removes it (`onDeleteElement` called directly in keyboard handler). There is no undo toast, no "Undo" affordance shown, and the action is only recoverable via Ctrl+Z if the user knows the shortcut.
- Blocks: Users accidentally delete elements with no recovery path visible.

**No mobile canvas mode support:**
- Problem: Canvas mode (`isCanvasMode`) has no touch/pointer-event handling. `react-moveable`'s drag events rely on pointer events that work on desktop but are unreliable on mobile without additional configuration. The canvas toolbar positioning via `getBoundingClientRect` also misbehaves on iOS Safari with the virtual keyboard open.
- Files: `src/components/preview/CanvasPreview.tsx`, `src/components/editor/CanvasToolbar.tsx`
- Blocks: Mobile users who activate canvas mode get a broken editing experience.

**No error state for failed public link loads:**
- Problem: `src/pages/PublicLinkPage.tsx:121-130` shows a static "Link não encontrado" message with no call-to-action, no link back to the platform, and no retry option. It also uses `font-display` Tailwind class which does not exist in the Tailwind v3 typography plugin by default, potentially rendering with the wrong font family.
- Files: `src/pages/PublicLinkPage.tsx`
- Blocks: Brand impression suffers on 404; the page has no utility for converting lost visitors.

**Sub-page editor has no empty state:**
- Problem: When a sub-page has zero blocks, the `BlockEditor` renders only the `SortableList` drop zone with the text "↓ solte aqui" — no illustration, no onboarding text, no "Adicionar primeiro bloco" CTA. Users can mistake the empty state for a broken UI.
- Files: `src/components/editor/blocks/SortableList.tsx:362-372`

---

## UI/UX Quality Gaps

**Editor layout — toolbar, sidebar, and canvas lack visual hierarchy:**
- Issue: The top toolbar (`px-3 py-2`) is nearly flush with the editor panel below it. There is no clear separation between "navigation/mode controls" (Elementos, Tema, Efeitos, Páginas) and "file operations" (Save, Copy, Open). All buttons are the same height and visual weight, making it hard to scan quickly.
- Files: `src/pages/LinkEditor.tsx:620-755`
- Fix approach: Group and space the toolbar into 3 distinct zones with a divider. Give Save a higher visual weight (filled primary, not just `bg-primary text-primary-foreground`).

**Canvas mode has zero UX onboarding:**
- Issue: The "Canvas" button in the toolbar provides no tooltip explanation, no first-use modal, and no visual hint that the entire editing paradigm is changing. Users who accidentally click it are dropped into a fundamentally different UI with no guidance.
- Files: `src/pages/LinkEditor.tsx:642-655`
- Fix approach: Add a one-time welcome tooltip/popover on first canvas-mode activation. Show keyboard shortcut hints inline.

**`ElementsSidebar` reads as a developer spec sheet, not a product:**
- Issue: Block names like "HTML Livre", "Badges", "Stats", "Countdown" are internal technical identifiers. The icon grid is 3-column at `w-9 h-9` with `text-[10px]` labels — very small and hard to scan on high-DPI displays. There is no preview of what each block looks like.
- Files: `src/components/editor/ElementsSidebar.tsx`
- Fix approach: Rename blocks to benefit-first labels ("Captura de Leads" instead of "Captura Email"). Add hover previews or a small illustration per category.

**`CanvasPropertiesPanel` inputs are barebones developer controls:**
- Issue: The X, Y, W, H, Rotation fields are raw number inputs with abbreviated single-letter labels ("X", "Y", "W", "H"). There are no units displayed ("px"), no step arrows beyond the browser default, no visual representation of the transform, and no min/max clamping that prevents elements from being placed outside the artboard.
- Files: `src/components/editor/CanvasPropertiesPanel.tsx`
- Fix approach: Add units, icon affordances, and constrain X/Y to artboard bounds (0–390 for X).

**Block list in `SortableList` shows only internal type names:**
- Issue: Each block row header displays `BLOCK_LABELS[block.type]` which maps to Portuguese technical names ("Título", "Texto", "Espaçador"). There is no secondary descriptor, no preview thumbnail, and no visual differentiation between block categories. The list looks identical whether a link has 3 blocks or 20.
- Files: `src/components/editor/blocks/SortableList.tsx:105`
- Fix approach: Add a small coloured dot or icon per category (matches the `ElementsSidebar` category colours). Show a one-line content preview in the collapsed block header.

**Preview panel has no smooth transition when editing content:**
- Issue: The preview update debounce is 50 ms (see `src/pages/LinkEditor.tsx:95`). While this prevents every keystroke from re-rendering, the preview snaps between states with no crossfade. Edits to the business name trigger an iframe remount (via `key={srcDoc}`), causing a white flash on every character typed when `businessNameHtml` is enabled.
- Files: `src/pages/LinkEditor.tsx:91-97`, `src/components/SmartLinkPreview.tsx:104`
- Fix approach: Crossfade the preview container via `AnimatePresence` on content changes; separate the iframe remount trigger from the debounce.

**Empty states are absent or minimal:**
- Issue:
  - `LinksPage.tsx`: When `links.length === 0` and not loading, no empty state is rendered — the page is just blank below the header buttons.
  - `AnalyticsPage.tsx`: Not inspected but a known gap per product scope.
  - Canvas mode with no elements: Renders a blank white artboard with no "Add your first element" hint.
- Files: `src/pages/LinksPage.tsx`, `src/pages/LinkEditor.tsx` (canvas section)
- Fix approach: Add illustrated empty states with a primary action CTA for all zero-data views.

**Loading states are skeletal but lack contextual messaging:**
- Issue: Skeleton screens are correctly implemented in `LinkEditor.tsx` and `PublicLinkPage.tsx` but are generic grey rectangles. There is no "Loading your link..." text, no animated progress indicator, and no differentiation between a slow load and a failed load.
- Files: `src/pages/LinkEditor.tsx:517-552`, `src/pages/PublicLinkPage.tsx:101-118`
- Fix approach: Add a subtle label below the skeleton ("Carregando editor...") and a timeout-based fallback message after 5 s.

**Toast/feedback messages have no personality:**
- Issue: All toasts use Sonner's default style with hardcoded English-style brevity ("Link copiado!", "Bloco adicionado!", "Erro ao salvar: ..."). The success emoji 🎉 appears on save only. Error messages expose raw error strings from the server (`"Erro ao salvar: " + msg`).
- Files: `src/pages/LinkEditor.tsx:352,399,479,488`
- Fix approach: Create a typed `notify` wrapper around `toast` that enforces tone and never exposes raw server messages. Add consistent emoji/icon treatment.

**Typography scale is inconsistent between components:**
- Issue: The editor uses `text-[10px]`, `text-[11px]`, `text-xs` (12px), and `text-sm` (14px) in a pattern that is not systematised. Some labels use `text-[10px] uppercase tracking-wider` for section headers; others use `text-xs font-semibold`. The public preview uses `text-xs` for block subtexts but `text-[11px]` for the same element in other places.
- Files: `src/components/editor/CanvasPropertiesPanel.tsx:25`, `src/components/editor/blocks/SortableList.tsx:105`, `src/components/editor/ElementsSidebar.tsx:137`
- Fix approach: Define a 5-step type scale in Tailwind config (e.g. `label-xs`, `label-sm`, `body-sm`, `body-md`, `heading-sm`) and enforce it across editor components.

**Dashboard stat cards lack information hierarchy:**
- Issue: Each stat card in `Dashboard.tsx` (lines 209-236) has a `text-[11px]` label, a `text-2xl` value, and a `text-[10px]` secondary line. The icon is `h-3.5 w-3.5 text-muted-foreground` in a muted `bg-muted/60` container — almost invisible. There is no sparkline, no delta indicator ("↑ 12% this week"), and no contextual action per card.
- Files: `src/pages/Dashboard.tsx:208-237`
- Fix approach: Increase icon size and saturation. Add a percentage-change badge with up/down arrow. Link each card to its relevant detail page.

**Dark mode tokens inconsistently applied:**
- Issue: `protect.ts` (lines 17-30) hardcodes light-theme colours (`background:#7C3AED`, `color:#fff`) using inline styles, bypassing the CSS token system entirely. The `glass-strong` utility in `index.css:149-153` hardcodes `rgba(255,255,255,0.92)` for the light mode, which works fine, but the `.dark .glass-strong` override uses `hsl(var(--card)/0.90)` with a `box-shadow:none` that removes the depth shadow in dark mode.
- Files: `src/lib/protect.ts`, `src/index.css:149-160`
- Fix approach: Replace all hardcoded colour values in `protect.ts` with CSS custom properties. Restore shadow depth in `.dark .glass-strong`.

**Spacing lacks a grid system:**
- Issue: The editor UI mixes `gap-1`, `gap-1.5`, `gap-2`, `gap-2.5`, `gap-3` with `p-2`, `p-2.5`, `p-3`, `p-4` in adjacent elements without a consistent 8 px base grid. Example: the toolbar uses `gap-1.5 px-3 py-2` (6 px gap, 12 px horizontal, 8 px vertical) while block cards use `gap-1.5 px-2 py-1.5`.
- Files: `src/pages/LinkEditor.tsx:620-640`, `src/components/editor/blocks/SortableList.tsx:101-115`
- Fix approach: Adopt a strict 4 px or 8 px base unit; map all spacing values to multiples. Codify in Tailwind config extensions.

**Public page (`PublicLinkPage`) has no entry animations for the page itself:**
- Issue: `SmartLinkPreview.tsx` animates individual buttons and blocks on mount with entry variants. However the outer page wrapper in `PublicLinkPage.tsx` has no `motion.div` — the hero image, logo, and business name appear instantly with no fade-in. On a slow connection, content pops in jarring order as it loads.
- Files: `src/pages/PublicLinkPage.tsx`, `src/components/SmartLinkPreview.tsx`
- Fix approach: Wrap the `<SmartLinkPreview>` in a `motion.div` with a staggered fade-up entrance. Coordinate with the existing per-block `delay` system.

---

## Test Coverage Gaps

**Canvas mode has zero test coverage:**
- What's not tested: `assignInitialCanvasPositions`, canvas element selection, drag/resize state updates, bring-forward/send-backward order logic, canvas mode toggle.
- Files: `src/components/preview/CanvasPreview.tsx`, `src/pages/LinkEditor.tsx:199-301`
- Risk: Any refactor to canvas order/position logic can break silently.
- Priority: High

**`SmartLinkPreview` rendering is untested:**
- What's not tested: Block rendering dispatch for all 24 block types, dark/light mode switching, effects layer, canvas mode render path, HTML title iframe behaviour.
- Files: `src/components/SmartLinkPreview.tsx`, `src/components/preview/BlockRenderer.tsx`
- Risk: Regressions in the public-facing page go undetected.
- Priority: High

**`useAutosave` edge cases not covered:**
- What's not tested: Concurrent saves triggered by rapid edits, `flush` called during an in-flight save, retry after error, `visibilitychange` trigger.
- Files: `src/hooks/use-autosave.ts`, `src/test/use-autosave.test.ts`
- Risk: Data loss scenarios under poor network conditions.
- Priority: Medium

**No integration tests for Supabase mutations:**
- What's not tested: `saveLink`, `deleteLink`, `duplicateLink`, `toggleLinkActive`, `recordView`, `recordClick`, `saveEmailCapture`.
- Files: `src/hooks/use-links.ts`
- Risk: Schema changes or RLS policy updates break production silently.
- Priority: Medium

---

*Concerns audit: 2026-03-28*
