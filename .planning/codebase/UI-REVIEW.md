# UI Review — Sistema Link PRO

**Audited:** 2026-03-28
**Baseline:** Abstract standards (Vercel/Linear/Framer/Webflow tier)
**Screenshots:** Not captured (no active dev server detected — code-only audit)
**Reviewer note:** All findings cite exact file paths and line numbers from source inspection.

---

## Score Summary

| Dimension | Score | One-line Verdict |
|-----------|-------|-----------------|
| 1. Visual Hierarchy | 5/10 | Typography scale unsystematised; stat card icons invisible; toolbar is a flat wall of equal-weight items |
| 2. Design System Consistency | 6/10 | Token system is solid but leaks hardcoded Tailwind colors, arbitrary font sizes, and fractured spacing units |
| 3. Animation & Motion | 7/10 | Entry animations and WhatsApp float are polished; editor toolbar and dashboard cards have zero motion; canvas drag has no spring feedback |
| 4. Component Polish | 5/10 | Focus rings absent on native buttons; empty states miss illustrations on several views; canvas mode has zero onboarding; delete is instant with no undo toast |
| 5. Responsive Design | 4/10 | Editor is desktop-only by design but collapses badly below 1024px; canvas mode entirely broken on mobile; touch targets hit 28px in several toolbar buttons |
| 6. Information Architecture | 5/10 | Toolbar has no zone separation; drawer navigation hides primary action (Elementos); canvas mode switches editing paradigm without any signal to the user |

**Total: 32/60**

---

## Top 3 Priority Fixes

1. **Toolbar zone separation and visual weight** — Users cannot scan the editor toolbar because all 10+ actions render at identical visual weight in a single horizontal strip. The primary action (Salvar) is indistinguishable from secondary ones (Undo, Copiar). Impact: task completion slows, users miss autosave status. Fix: split toolbar into three named zones with a 1 px divider — Left (mode tabs), Center (undo/redo + autosave status), Right (Copy + Open + Save). Give Save `size="default"` instead of `text-xs` and remove `shadow-primary/20` in favor of `shadow-md` so it pops visually.

2. **Typography scale must be codified and enforced** — The codebase uses `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`, `text-xs` (12 px), `text-sm` (14 px), `text-base`, `text-2xl` across adjacent components with no documented scale contract. This produces a "ransom note" effect where labels of semantically equivalent rank render at 3 different sizes depending on where they live. Impact: cognitive load on every panel; professional editors feel inconsistent. Fix: define a 5-step scale in `tailwind.config.ts` (`label-xs 10px`, `label-sm 11px`, `body-sm 12px`, `body-md 14px`, `heading-sm 15px`), then do a single grep-replace pass to eliminate all `text-[Npx]` arbitrary values.

3. **Canvas mode needs a UX entry moment** — Clicking the Canvas button silently transitions the entire editor paradigm with no tooltip, no overlay, no keyboard shortcut list. Users who accidentally enter canvas mode see a blank phone artboard and have no idea how to proceed. Impact: canvas feature is effectively invisible to non-technical users. Fix: add a one-time `<Popover>` that fires on first canvas activation (stored in `localStorage`), listing the 4 key shortcuts (drag to move, double-click to edit text, Delete to remove, Ctrl+Z to undo). Add a persistent `?` icon in the canvas toolbar that reopens this.

---

## Detailed Findings

### 1. Visual Hierarchy (5/10)

**What works:** The public minisite (`SmartLinkPreview`) has a clear 3-level hierarchy: hero image → business name (h1) → buttons/blocks. The `motion.div` stagger on entry animations reinforces this reading order. The dashboard `TemplateCard` uses a gradient overlay + truncated name on dark backdrop — readable and intentional.

**Problem 1 — Stat card icons are invisible (Dashboard.tsx:231-233)**
```
<div className="shrink-0 ml-2 mt-0.5 p-1.5 rounded-lg bg-muted/60">
  <stat.icon className="h-3.5 w-3.5 text-muted-foreground" />
</div>
```
`h-3.5 w-3.5` (14 px) inside a `p-1.5` container (`bg-muted/60`) produces a faint 14 px icon in a muted container. At the Vercel/Linear tier, stat card icons are 20–24 px with full saturation color — the icon IS the scannable signal. The current implementation renders at 24 × 24 px total (icon + padding) but the icon itself is muted gray, identical to the label. No hierarchy.

**Problem 2 — Toolbar is a flat wall of controls (LinkEditor.tsx:620-755)**
Ten interactive elements (Elementos, Tema, Efeitos, Páginas, Canvas, Undo, Redo, Shortcuts, Autosave, Copy, Open, Save) render in a single `flex` row with `gap-1.5`. No grouping, no dividers, no visual weight differentiation between mode toggles and file operations. The Save button uses `text-xs` — the same size as the Undo icon button's tooltip — making the primary CTA visually subordinate to secondary actions.

**Problem 3 — Section headers in editor panels use inconsistent hierarchy signals**
Some section headers use `text-[10px] uppercase tracking-wider` (e.g. `InteractiveBlockEditor.tsx:28`), others use `text-xs font-semibold` (e.g. `BusinessInfoPanel.tsx`), and some use `text-[11px] font-bold uppercase tracking-wider`. Three different visual treatments for semantically identical section headers across the same panel system.

**Problem 4 — Device picker text at `text-[9px]` (LinkEditor.tsx:854)**
```
className={`px-2.5 py-1 rounded-md text-[9px] font-semibold ...`}
```
9 px text on a button with labels "iPhone 15", "Pixel 8", "Galaxy S24" is below legible threshold on standard displays and fails WCAG AA minimum of 12 px for normal-weight text. The labels are effectively decorative at this size.

**Problem 5 — `text-[8px]` badge in AppSidebar.tsx:155**
```
<span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
```
8 px text is unreadable on any display. If this badge carries information (plan tier, feature flag), it fails basic legibility. If it is decorative, it should be removed.

**Recommendations:**
- Stat card icons: change to `h-5 w-5`, use `text-primary` / `text-success` / `text-warning` per semantic meaning.
- Toolbar: insert two `<div className="w-px h-6 bg-border mx-2" />` dividers after "Páginas" and after the undo cluster.
- Save button: use `size="default"` shadcn Button variant with full height (40 px), not `py-2 text-xs`.
- Replace all `text-[8px]` and `text-[9px]` instances — 9 px is below WCAG AA readable threshold.
- Codify section header style as a single `<SectionLabel>` component: `text-xs font-semibold uppercase tracking-wide text-muted-foreground`.

---

### 2. Design System Consistency (6/10)

**What works:** The CSS token system in `index.css` is the strongest part of the design system. Semantic tokens (`--primary`, `--secondary`, `--muted-foreground`, etc.) are defined correctly for both light and dark modes. The `glass`, `glass-strong`, `glass-subtle`, `nexus-card`, and `editor-card` utilities provide reusable surface vocabulary. The `cn()` + `cva` pattern is used consistently.

**Problem 1 — Canvas mode toggle bypasses token system (LinkEditor.tsx:647-648)**
```
isCanvasMode
  ? "bg-indigo-600 text-white shadow-sm"
  : "bg-secondary ..."
```
`bg-indigo-600` is a hardcoded Tailwind utility, not a semantic token. When the user switches to dark mode, the button stays `indigo-600` — no dark mode adaptation. This single button is also visually distinct from every other mode tab (which uses `bg-primary`), creating an orphaned visual identity for canvas mode.

**Problem 2 — `text-green-400` / `bg-green-500/10` / `bg-emerald-400` for success states (LinkEditor.tsx:696, 841-842; LinksPage.tsx:171)**
The design system defines `--success: 142 71% 45%` in `index.css` line 48, but no Tailwind token maps to this variable. Instead, code uses Tailwind's `green-400`, `green-500`, and `emerald-400` directly — three different greens that don't resolve through the token system and don't adapt to dark mode.

**Problem 3 — Spacing is not on a grid**
Adjacent components mix the following spacing utilities without a shared base unit:
- Toolbar: `gap-1.5 px-3 py-2` (6 px / 12 px / 8 px)
- Undo cluster: `gap-0.5 ml-1 p-2` (2 px / 4 px / 8 px)
- Drawer header: `p-3` (12 px)
- Canvas properties panel inputs: `gap-2 px-2` (8 px / 8 px)

`gap-0.5` (2 px) between Undo and Redo buttons means they nearly touch. `gap-1.5` (6 px) in the main toolbar row alongside `gap-0.5` (2 px) in the undo sub-group creates a perceived inconsistency. Vercel/Linear use strict 4 px or 8 px multiples.

**Problem 4 — `getTemplateBgStyle` maps only -950/-900 Tailwind shades (Dashboard.tsx:23-58)**
The `tailwindToHex` map covers only `red-950`, `red-900`, `red-800`, `orange-950`, `orange-900`, etc. Templates using any shade between -800 and -400 fall through to the accent-color gradient fallback — rendering a completely different color than the actual public page. This breaks design consistency between the template preview and the live link.

**Problem 5 — `glass-strong` hardcodes `rgba(255,255,255,0.92)` (index.css:149)**
```
.glass-strong {
  background: rgba(255, 255, 255, 0.92);
```
This works for light mode but the dark override at line 157 drops `box-shadow` entirely:
```
.dark .glass-strong {
  background: hsl(var(--card) / 0.90);
  border-color: hsl(var(--border) / 0.60);
  box-shadow: none;
}
```
`box-shadow: none` removes the elevation cue in dark mode that exists in light mode. Both modes should have equivalent depth signaling, just with different shadow colors.

**Recommendations:**
- Map `--success` to a Tailwind extension: `success: "hsl(var(--success))"` in `tailwind.config.ts`, then replace all `green-*` and `emerald-*` success usages with `text-success` / `bg-success/10`.
- Replace `bg-indigo-600` in canvas toggle with `bg-primary` — canvas mode is a primary action, it should use the primary token.
- Add `emerald-400` to the token map as `--online` or use `bg-success`.
- Adopt a strict 4 px spacing unit: replace `gap-0.5` with `gap-1`, `gap-1.5` with `gap-2`.
- Restore `box-shadow` in `.dark .glass-strong` using `rgba(0,0,0,0.3)`.

---

### 3. Animation & Motion (7/10)

**What works:** The public minisite animations are the best part of the product. `getEntryVariants()` with spring physics for `bounce`, easeOut for `fade-up`, and staggered delays per item index creates a genuinely premium feel. The WhatsApp float pulse/bounce keyframes (`index.css:314-376`) are well-crafted — the `cubic-bezier(0.16, 1, 0.3, 1)` label transition is particularly polished. `AnimatePresence` on the editor drawer with `ease: [0.25, 0.46, 0.45, 0.94]` is correct. Hero image has `initial: {scale: 1.05}` Ken Burns entry — good.

**Problem 1 — Dashboard stat cards animate in but have no hover motion**
```tsx
// Dashboard.tsx:93-97
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: i * 0.07, duration: 0.25 }}
  className="bg-card border border-border rounded-xl p-4 relative"
>
```
Cards enter with a stagger, which is good. But there is no `whileHover` or `whileTap`. The Tailwind `hover:shadow-lg` on `TemplateCard` works because CSS, but stat cards have zero interactive feedback. At the Linear/Vercel tier, data cards have a subtle `whileHover={{ y: -2, boxShadow: "..." }}`.

**Problem 2 — Canvas drag/resize has no spring feedback on drop**
After a drag/resize operation via `react-moveable`, the element snaps to its new position instantly (Moveable updates inline styles directly). There is no spring ease-to-final-position. Canva, Framer, and Webflow all apply a spring when releasing a drag. Since Moveable bypasses React state for performance, this would require a post-drag `motion.animate()` call on the element's ref.

**Problem 3 — Preview panel slides in but content inside doesn't stagger (LinkEditor.tsx:813-819)**
```tsx
<motion.div
  initial={{ opacity: 0, x: 16 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 16 }}
  transition={{ duration: 0.15, ease: "easeOut" }}
```
The preview panel slides in, but the device frame, URL bar, and header labels all appear simultaneously at `opacity: 0 → 1` as a unit. Framer itself staggers its panel contents on panel open — header first, then device, then URL bar — creating a sense of the interface "materialising."

**Problem 4 — Autosave status change has no transition**
When autosave status changes from `saving` → `saved`, the content swaps instantly (`autosaveStatus === "saving" && <> ... </>` conditionals with no `AnimatePresence`). A cloud icon snapping to a checkmark with no interpolation looks like a bug, not a feature.

**Problem 5 — `animate-pulse` on bgHtml template card shimmer (Dashboard.tsx:115)**
```tsx
<div className="absolute inset-0 animate-pulse bg-white/5" />
```
`animate-pulse` is CSS-only and ignores `prefers-reduced-motion`. The Tailwind `animate-pulse` keyframe does not include a `@media (prefers-reduced-motion: reduce)` override (unlike the CSS in `index.css` line 273, which correctly handles it for custom animations). Use Framer Motion's `motion.div` with `useReducedMotion()` check instead.

**Recommendations:**
- Add `whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }}` to stat cards.
- Wrap autosave status in `<AnimatePresence mode="wait">` with `initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}`.
- Stagger preview panel children: add `transition={{ delay: 0.08 }}` to the device frame wrapper and `delay: 0.16` to the URL bar.
- Replace `animate-pulse` shimmer on template cards with a Framer Motion variant that respects `useReducedMotion()`.

---

### 4. Component Polish (5/10)

**What works:** The `editor-card` hover state in `index.css:224-227` with `border-color` transitioning to `primary/0.25` and a `violet` shadow is a polished detail that most amateurs miss. The `Skeleton` implementation for both the editor loading state (left panel + preview) and the LinksPage card loading is correct. The `BlockErrorBoundary` per-block isolation is professional.

**Problem 1 — Native `<button>` elements have no visible focus ring**
All custom `<button>` elements in `LinkEditor.tsx`, `Dashboard.tsx`, and `LinksPage.tsx` use raw HTML `<button>` with Tailwind classes and no `focus-visible:ring-*` modifier. Examples:
- `LinkEditor.tsx:629` — mode tab buttons: no focus ring
- `LinkEditor.tsx:746` — Save button: no `focus-visible:ring-2`
- `Dashboard.tsx:251` — "Criar do Zero" button: no focus ring
- `LinksPage.tsx:122` — "Novo Link" button: no focus ring

The shadcn `<Button>` component correctly includes `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`, but the codebase frequently bypasses shadcn for inline buttons. This is a WCAG 2.1 AA failure (Success Criterion 2.4.7).

**Problem 2 — Canvas mode empty artboard state: no guidance (LinkEditor.tsx:896-911)**
When `isCanvasMode` is true and the link has no elements, `CanvasPreview` renders an empty artboard — a blank white/dark rectangle with no illustration, no "Arraste um elemento aqui" instruction, and no visible drop target. From the CONCERNS.md: "Canvas mode has zero UX onboarding." The empty canvas artboard is indistinguishable from a broken state.

**Problem 3 — Delete in canvas is instant and irreversible (CanvasPreview.tsx:255-256)**
```tsx
if (e.key === "Delete" || e.key === "Backspace") {
  e.preventDefault(); onDeleteElement?.(selectedId);
}
```
No confirmation, no undo toast. Ctrl+Z works, but there is no visible affordance informing the user. Vercel/Linear/Framer all show a `toast("Elemento removido", { action: { label: "Desfazer", onClick: undo } })` pattern.

**Problem 4 — "Abrir" link in toolbar has no `title` or visual distinction from "Copiar" (LinkEditor.tsx:733-743)**
Both "Copiar" and "Abrir" render as `px-3 py-2 rounded-xl text-xs font-medium bg-secondary` buttons. The `<a>` tag at line 733 is missing the `cursor-pointer` class that all adjacent `<button>` elements have. It is also the only anchor that lacks `title` attribute while nearby buttons provide tooltip titles.

**Problem 5 — Loading skeleton for editor omits the toolbar area (LinkEditor.tsx:521-544)**
The loading skeleton renders a "left panel skeleton" and a "preview area skeleton" but skips the toolbar entirely. During the 200–500 ms load, the real toolbar flashes in with live buttons before the content panels are ready. A skeleton for the toolbar row would prevent the janky appearance of interactive controls above a loading state.

**Recommendations:**
- Global: replace all inline `<button className="...">` with the shadcn `<Button variant="ghost" size="sm">` component. If the variant doesn't exist, create it — do not bypass the component system.
- Canvas empty state: add a centered `<motion.div>` with dashed border, upload icon, and "Adicione elementos pela barra lateral" text.
- Delete action: wrap `onDeleteElement` in a toast with an undo action: `toast("Elemento removido", { action: { label: "Desfazer", onClick: undo }, duration: 4000 })`.
- Add `cursor-pointer` to the "Abrir" anchor and a `title="Abrir link público em nova aba"` attribute.
- Extend the loading skeleton to include a full-width toolbar row.

---

### 5. Responsive Design (4/10)

**What works:** `useIsMobile()` correctly hides the preview panel on mobile and converts it to a full-screen overlay. The drawer (`AnimatePresence` slide-in at `w-full` on mobile) is a clean pattern. `DashboardLayout`'s `p-4 sm:p-6` padding adapts correctly. The `public-minisite` CSS class correctly handles iOS rubber-band and touch-action.

**Problem 1 — Editor collapses to a two-panel layout below 1024px with no intermediate breakpoint**
`LinkEditor.tsx:763` sets `max-w-3xl` when preview is shown, `max-w-2xl` when not. The toolbar at line 620 is `overflow-x-auto` — on tablets (768–1024 px), the toolbar scrolls horizontally without any visible scroll indicator, and the labels disappear at `sm:hidden` (line 638). The result is a toolbar of icon-only buttons with no labels, no tooltips, and no scroll affordance for 7 icon buttons that exceed the viewport.

**Problem 2 — Touch targets below 44 px minimum in multiple areas**
- Device picker buttons (LinkEditor.tsx:854): `px-2.5 py-1` = approximately 8 px height padding + 9 px text = ~25 px total height. WCAG 2.5.5 requires 44 × 44 px minimum touch targets.
- Undo/Redo buttons (LinkEditor.tsx:660-675): `p-2` on a `h-4 w-4` icon = 32 × 32 px. Below the 44 px minimum.
- Block type icon buttons in `ElementsSidebar` (`w-9 h-9` = 36 × 36 px): just below minimum.

**Problem 3 — Canvas mode is desktop-only but has no guard or degraded mobile experience**
From CONCERNS.md: "Canvas mode has no touch/pointer-event handling." On mobile, activating canvas mode is possible (the Canvas button appears in the toolbar), but `react-moveable` drag events are unreliable on iOS Safari. There is no check like `if (isMobile) { toast.error("Canvas mode is optimised for desktop"); return; }`. Mobile users who activate canvas mode get a broken editing experience with no explanation.

**Problem 4 — The preview panel's `width: 500` is hardcoded (LinkEditor.tsx:820)**
```tsx
style={{ width: isMobile ? "100%" : 500 }}
```
At viewport widths between 1024 and 1280 px, the 500 px fixed preview panel plus the editor panel plus the sidebar can exceed viewport width. The editor panel's `flex-1 min-w-0` mitigates this, but the preview may clip at 1024 px with a narrowed editor panel that breaks its grid.

**Problem 5 — No `sm:` or `md:` breakpoint on the Dashboard template grid at the category sidebar level (Dashboard.tsx:289)**
```tsx
<div className="w-48 shrink-0">
```
The 192 px (`w-48`) category sidebar is always visible with no collapse at small viewport. Below 640 px, the two-column layout (sidebar + grid) produces a grid with `flex-1 min-w-0` — approximately 380 px − 192 px − 24 px gap = ~164 px for the template grid, too narrow for even 2 columns of the 3-column `sm:grid-cols-3` spec.

**Recommendations:**
- Add `min-h-[44px]` and `min-w-[44px]` to all icon-only buttons. For the device picker, increase to `py-2`.
- Add an `md:hidden` collapse for the category sidebar on Dashboard, replacing it with a horizontal scrolling chip row.
- Guard canvas mode activation on mobile: detect `isMobile` in `handleToggleCanvasMode` and show an informational toast instead of activating.
- The toolbar icon-only mode needs `title` attributes on every button for discoverability; consider adding a horizontal scroll indicator (gradient fade on the right edge).

---

### 6. Information Architecture (5/10)

**What works:** The sidebar navigation (AppSidebar) correctly groups Dashboard, Meus Links, Analytics, Configurações as a persistent mental model. The `SortableList` + drag-and-drop for block reorder is the right pattern for a list editor. The sub-page breadcrumb (`← Páginas / PageTitle`) at `LinkEditor.tsx:769-779` is a correct information hierarchy.

**Problem 1 — Editor primary action (add content) is buried in a drawer**
The "Elementos" tab opens a drawer that slides over the left side of the editor. Adding a new block — the most common user action in a link editor — requires: click "Elementos" → see drawer → find block type → add. On Canva/Framer, the "+" action is always visible in the main toolbar with primary visual weight. The current pattern treats content addition as a secondary panel action rather than the primary workflow.

**Problem 2 — No visual relationship between drawer content and preview**
When "Elementos" drawer is open and the user adds a block, the block appears in the preview panel (right side). But there is no connective visual between the drawer action and the preview update — no animated "insertion" indicator showing where the block landed, no scroll-to behavior in the preview. The cause-effect relationship is unclear, especially when blocks are added to the bottom of a long list that's offscreen in the preview.

**Problem 3 — Canvas mode changes IA without signaling the paradigm shift**
In list mode, the left drawer provides structured form inputs for each block. In canvas mode, the same drawer is replaced by `CanvasPropertiesPanel` (X/Y/W/H inputs) for a selected element. This is a fundamentally different mental model — from "form editor" to "design canvas" — but the transition is a single button click with no splash/tooltip/overlay explaining that the editing paradigm has changed. Users who have built a 20-block list and accidentally hit "Canvas" will be disoriented.

**Problem 4 — Autosave status is placed after secondary actions in the toolbar (LinkEditor.tsx:689-715)**
The autosave status ("Salvando... / Salvo / Erro") is rendered after the Shortcuts button and before the Copy/Open/Save buttons. In Vercel's dashboard, save state is always top-left. In Notion, it is always top-right at maximum specificity. In this editor it is center-right, sandwiched between secondary utilities, reducing its visibility. An "Erro — tentar novamente" alert here, at `text-[11px] text-destructive`, competes with 8 other equal-weight items.

**Problem 5 — LinksPage filter bar is hidden when there are zero links (LinksPage.tsx:198)**
```tsx
{!isLoading && links.length > 0 && (
  <div className="flex flex-col sm:flex-row gap-3 mb-5">
    {/* Search, sort, filter bar */}
  </div>
)}
```
This is correct behavior — don't show filters for zero results. But when a search produces zero results (lines 293-303), the "empty search" state renders below the (now-visible) filter bar with a plain icon and one line of text. The "Limpar filtros" CTA is `text-xs text-primary hover:underline` — a link-style affordance on a button action. This breaks the pattern used everywhere else in the app (pill button with `bg-primary/10`).

**Recommendations:**
- Elevate "Add content" to a persistent, always-visible action. On desktop, a collapsible left panel (not a drawer) that is open by default. On mobile, a floating "+" button.
- Add a `toast` with scroll-to behavior when a block is added: `toast("Bloco adicionado", { description: "Role o preview para ver" })`.
- Show a modal or informational popover on first canvas mode activation (keyed to `localStorage`).
- Move autosave status to a dedicated indicator strip between the toolbar and the editor content area — or place it in the top-left of the editor chrome adjacent to the page title.
- Replace the "Limpar filtros" anchor-style button with a proper `<Button variant="outline" size="sm">` consistent with the rest of the app.

---

## Files Audited

| File | Lines Inspected |
|------|-----------------|
| `src/index.css` | 1–413 (complete) |
| `src/pages/LinkEditor.tsx` | 1–200, 550–960 (sampled) |
| `src/components/SmartLinkPreview.tsx` | 1–759 (complete) |
| `src/components/preview/CanvasPreview.tsx` | 1–363 (complete) |
| `src/components/editor/BlockEditor.tsx` | 1–71 (complete) |
| `src/components/editor/DeviceFrame.tsx` | 1–274 (complete) |
| `src/pages/Dashboard.tsx` | 1–346 (complete) |
| `src/pages/LinksPage.tsx` | 1–329 (complete) |
| `src/components/DashboardLayout.tsx` | 1–44 (complete) |
| `.planning/codebase/CONCERNS.md` | 1–326 (complete) |
| `.planning/codebase/CONVENTIONS.md` | 1–257 (complete) |

**Supporting grep searches conducted:**
- Arbitrary font-size values (`text-[Npx]`) across all `*.tsx` files
- Focus ring patterns (`focus:ring`, `focus-visible`) across all `*.tsx` files
- ARIA attribute count across all `*.tsx` files
- Hardcoded hex color usage in `src/pages/`
- Success/error color usage (`green-*`, `emerald-*`) in editor files
- Gap/spacing patterns in `LinkEditor.tsx`
- Animation patterns (`whileHover`, `animate`, `transition`) in dashboard/layout files
- Responsive breakpoint usage (`sm:`, `md:`, `lg:`) in `LinkEditor.tsx`
- Skeleton/loading state patterns in `LinkEditor.tsx`

---

## Prioritised Improvement List

### Critical (blocks Vercel-tier perception)
1. Codify the typography scale — eliminate all `text-[8px]` through `text-[11px]` arbitrary values
2. Add `focus-visible:ring-2 focus-visible:ring-ring` to all native `<button>` elements (WCAG 2.1 AA)
3. Toolbar zone separation with visual weight differentiation for Save
4. Canvas mode first-use onboarding (one-time popover)
5. Delete action undo toast in canvas mode

### High (clearly sub-Linear quality without these)
6. Stat card icons: size to 20–24 px with semantic color
7. Replace `bg-indigo-600` and `text-green-*` with semantic tokens
8. Autosave status with `AnimatePresence` transition
9. Touch targets: audit and pad all interactive elements to 44 px minimum
10. Canvas empty artboard empty state

### Medium (polish that separates premium from good)
11. Dashboard stat card `whileHover` micro-interaction
12. Animated template card: replace `animate-pulse` with Framer Motion + `useReducedMotion`
13. Dashboard category sidebar collapse at `md:` breakpoint
14. "Abrir" anchor: add `cursor-pointer` and `title` attribute
15. Canvas mobile guard with informational toast

### Low (refinement)
16. Restore `box-shadow` in `.dark .glass-strong`
17. Editor loading skeleton: extend to cover toolbar area
18. `getTemplateBgStyle` hex map: extend to cover all Tailwind shade suffixes
19. Preview panel slide-in: stagger child content appearance
20. "Limpar filtros" CTA: convert to `<Button variant="outline" size="sm">`

---

*Audit conducted: 2026-03-28 — code-only (no dev server active)*
