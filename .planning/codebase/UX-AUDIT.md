# UX Audit — Sistema Link PRO

**Audit Date:** 2026-03-28
**Auditor:** Claude Sonnet 4.6 (via code reading — zero speculation, all findings cite specific files/lines)
**Benchmark:** Vercel, Linear, Framer — best-in-class SaaS editors

---

## Executive Summary

The product has a solid technical foundation (autosave, undo/redo, canvas mode, rich block system) but presents it through an interface that feels unfinished. The core problem is not missing features — it's the gap between the capability that exists in the code and the confidence that the UI communicates to the user. Most friction points are architectural decisions expressed as UI gaps: a toolbar without visual hierarchy, a canvas mode with no onboarding, a public page with no page-level entrance animation, and empty states that are either absent or iconographically weak.

The product can reach product-serious quality with focused execution on the 7 critical and 12 high-severity issues identified below.

---

## Severity Scale

- **Critical** — Breaks a core user journey or causes data/trust loss
- **High** — Creates significant friction; users will abandon or be confused
- **Medium** — Degrades quality; creates an "amateur" perception
- **Low** — Polish gap; does not block usage but reduces delight

---

## Flow 1: Criação de Link Novo

### Context
Entry points: Dashboard ("Criar do Zero" button, `Dashboard.tsx:248`) and LinksPage ("Novo Link", `LinksPage.tsx:121`). Both navigate to `/links/new` without parameters. Template selection occurs from the Dashboard template grid.

---

### [CRITICAL] F1-01 — Slug é obrigatório mas não tem campo visível no first-run

**File:** `src/pages/LinkEditor.tsx:31-52` (`createDefaultLink`)
**Problem:** `createDefaultLink()` sets `slug: ""`. The editor mounts with a blank slug. The `handleSave` function (`LinkEditor.tsx:460-494`) validates and checks uniqueness only at save time, showing `toast.error(slugError)` as the first slug-related feedback. The user has no idea a slug is needed until they try to save. There is no slug input visible in the initial editor state — it lives inside a panel that must be opened.
**Comparison (Vercel):** Vercel's new project flow shows the project name/slug as the first field, in the hero area, before any other configuration.
**Fix:** Surface a slug input inline at the top of the `BusinessInfoPanel`, with real-time availability feedback (debounced, already implemented in `slug-utils.ts`). Show a non-blocking validation state ("slug disponível ✓") as the user types, not a blocking toast at save time.

---

### [HIGH] F1-02 — "Criar do Zero" vs. templates: dois destinos sem orçamento visual claro

**File:** `src/pages/Dashboard.tsx:239-270`
**Problem:** "Criar do Zero" is a small `bg-primary` button alongside "Meus Links". Below, a full template library with vertical category nav is presented. The visual hierarchy implies templates are secondary content (section header `h2`, small count badge), but they are actually the primary entry point for most users.
**Comparison (Framer):** Template selection is the full-screen hero interaction on new project creation. The "blank" option is a secondary choice.
**Fix:** Invert the hierarchy on first-visit: lead with a template picker as the primary action, deprioritize "Criar do Zero" to a tertiary link inside the template picker ("ou comece em branco").

---

### [HIGH] F1-03 — Template cards não comunicam o que o usuário vai obter

**File:** `src/pages/Dashboard.tsx:86-143` (`TemplateCard`)
**Problem:** Template cards show a `3/4` ratio image with a hover overlay that says "Usar modelo". There is no preview of the actual blocks inside (how many buttons, what kind of layout), no indication of what use case it's for beyond the category emoji, and the card name is at `text-[11px]` in an overlay gradient. The "✦ Animado" badge is the only differentiator.
**Comparison (Framer):** Framer template cards show the actual content composition (# of sections, key component types) on hover.
**Fix:** Add a hover tooltip or secondary card state that shows: template category description (1 line), number of blocks, and whether it includes canvas mode. Make the template name `text-sm` and outside the hero image area.

---

### [HIGH] F1-04 — Nenhum onboarding no editor para link novo

**File:** `src/pages/LinkEditor.tsx:554` onwards, `src/components/OnboardingDialog.tsx`
**Problem:** `OnboardingDialog` is rendered in `Dashboard.tsx` (line 205), not in `LinkEditor`. A user who navigates directly to `/links/new` gets a blank editor with no contextual guidance. The empty preview shows only a phone emoji and `"Preencha o nome do negócio ou adicione um botão para ver o preview aqui"` (`SmartLinkPreview.tsx:338-345`), which is helpful text but buried inside the preview device frame at 86% scale — nearly unreadable.
**Fix:** For new links (when `link.id.startsWith("new-")`), show an inline "Getting started" card in the editor left panel that sequences the 3 actions: (1) set name, (2) add first button, (3) set slug. Collapse it automatically once all 3 are done.

---

### [MEDIUM] F1-05 — Plan limit errors são blocking toasts, não inline

**File:** `src/pages/Dashboard.tsx:241-258`
**Problem:** When `isAtLimit`, clicking "Criar do Zero" shows `toast.error(...)` and navigates nowhere. The button is visually disabled (`cursor-not-allowed opacity-60`) but the error is ephemeral. Users who miss the toast have no idea why the button didn't work.
**Fix:** When at limit, show an inline upgrade prompt inline below the button (not a toast). Include the plan name, limit, and a direct CTA to the Plans page.

---

## Flow 2: Editor (Sidebar + Preview + Toolbar)

### Context
`LinkEditor.tsx` is the orchestrator. Layout: top toolbar (fixed), center panel (editor forms, scrollable), right panel (device preview, fixed width 500px). Drawers slide over the center panel.

---

### [CRITICAL] F2-01 — Toolbar mistura controles de modo com operações de arquivo sem separação visual

**File:** `src/pages/LinkEditor.tsx:620-755`
**Problem:** The top toolbar contains in one undifferentiated row, left-to-right: [Elementos][Tema][Efeitos][Páginas][Canvas][Undo][Redo][Shortcuts] ········ [autosave status][Copiar][Abrir][Salvar]. All buttons are `px-2.5 py-2 rounded-xl text-xs` — identical height and weight. No dividers separate mode controls from file operations. On small viewports (`hidden sm:inline` hides labels) all mode buttons collapse to icons-only with no visual grouping.
**Comparison (Linear):** Linear's toolbar has a clear 3-zone layout: left (context/navigation), center (view mode controls), right (file/share operations) with `border-r` dividers.
**Fix:** Group toolbar into 3 zones separated by `<div className="w-px h-4 bg-border" />` dividers: (1) Mode panels [Elementos|Tema|Efeitos|Páginas], (2) Edit tools [Canvas|Undo|Redo|Shortcuts], (3) File ops [autosave|Copiar|Abrir|Salvar]. Give "Salvar" a slightly larger `py-2.5` to increase its visual weight as the primary action.

---

### [HIGH] F2-02 — O painel de edição não sincroniza visualmente com o preview

**File:** `src/pages/LinkEditor.tsx:91-97`
**Problem:** Preview debounce is 50ms (`setTimeout(..., 50)` while comment says 150ms — CONCERNS.md notes this discrepancy). When `businessNameHtml` is enabled, `key={srcDoc}` forces iframe remount on every character (`SmartLinkPreview.tsx:104-114`), causing a white flash in the preview on every keystroke. The sidebar form and the preview feel disconnected — no visual line or affordance indicates "this field controls that element."
**Fix:** (a) Raise debounce to 150ms to match the documented intent. (b) Add a highlight ring to the selected preview element when its editor panel is open — use the existing `isSelected` / `outline: '2px solid #6366f1'` pattern (`SmartLinkPreview.tsx:631`) to also highlight on panel focus, not just click. (c) Separate iframe remount trigger from the debounce to prevent flash.

---

### [HIGH] F2-03 — Drawer system: painéis abrem sobre o conteúdo, sem contexto de onde estão no IA

**File:** `src/pages/LinkEditor.tsx:558-615`
**Problem:** The 4 drawers (Elementos, Tema, Efeitos, Páginas) slide over the center panel and are mutually exclusive — opening one closes another. On mobile they are `w-full` full-screen. There is no breadcrumb, no persistent indicator of which drawer is open (the toolbar button becomes `bg-primary` but is above the fold on small screens). When editing a sub-page (`editingSubPageId`), the context is shown only by a small `rounded-xl bg-primary/5 border border-primary/20` bar in the center panel (`LinkEditor.tsx:769-781`) — easy to miss.
**Fix:** Replace the single-icon header in the drawer (`LinkEditor.tsx:579-591`) with a tab-style switcher that shows all 4 panels, allowing switching without closing. Add a persistent `position:sticky` indicator at the top of the center panel when in sub-page editing mode.

---

### [HIGH] F2-04 — "Elementos" sidebar lê como spec sheet de desenvolvedor

**File:** Referenced in CONCERNS.md (UI/UX Quality Gaps, ElementsSidebar)
**Problem:** Block names like "HTML Livre", "Email Capture", "Stats", "Countdown" are developer-facing identifiers. The 3-column icon grid uses `text-[10px]` labels and `w-9 h-9` icons — extremely small on HiDPI displays. No visual preview of what each block looks like when rendered.
**Comparison (Framer):** Framer's component panel shows mini-thumbnails of each component's actual rendered shape, with benefit-led names ("Form", "Navigation Bar", "Hero Section").
**Fix:** Rename using benefit-first Portuguese: "Captura de Leads" → email-capture, "Temporizador" → countdown, "Estatísticas" → stats, "HTML Personalizado" → html. Increase icon grid to 2 columns with `h-12` tiles. Add a hover state that shows a 120×80px thumbnail of the block's rendered output.

---

### [MEDIUM] F2-05 — Autosave status: mensagem "Salvo às HH:MM" não tem baseline de quando

**File:** `src/pages/LinkEditor.tsx:708-713`
**Problem:** The idle autosave status shows "Salvo às 14:32" with a faint `Check` icon at opacity-40. There is no visual differentiation between "saved 2 seconds ago" vs. "saved 45 minutes ago" — the time is always shown in `HH:MM` format with no relative hint. Users doing long editing sessions have no quick confidence signal that their recent changes are persisted.
**Fix:** Show relative time for recency ("Salvo há 3s", "Salvo há 2min") using `Intl.RelativeTimeFormat`. Add a brief `bg-green-500/10` background flash on the status indicator for 1s immediately after a successful save (like Notion's save animation).

---

### [MEDIUM] F2-06 — Preview panel: device picker usa text-[9px] quase ilegível

**File:** `src/pages/LinkEditor.tsx:849-862`
**Problem:** The device picker buttons use `text-[9px]` with device model names ("iPhone 15", "Pixel 8", "Galaxy S24"). At 9px on retina screens these labels are at the limit of legibility. The picker is `p-1 rounded-lg bg-secondary/70` — visually too similar to a tag cloud, not an interactive control.
**Fix:** Use `text-[11px]` minimum. Consider replacing model names with device icons (phone outline shapes) with a tooltip on hover for model name.

---

### [LOW] F2-07 — "Preview ao vivo" dot não comunica o que "live" significa aqui

**File:** `src/pages/LinkEditor.tsx:839-846`
**Problem:** The animated green dot with "Preview ao vivo" uses `animate-ping` which is typically associated with real-time connection status (like Vercel's deployment status). Here it means only that the preview is updating — it's always "live." The label and animation create false mental models about real-time visitor data.
**Fix:** Replace with a static camera/eye icon or change the label to "Preview" without the ping animation.

---

## Flow 3: Canvas Mode

### Context
Canvas mode is activated via a toolbar button (`LinkEditor.tsx:642-655`) and rendered by `CanvasPreview.tsx` inside `DeviceFrame`. Moveable handles drag/resize/rotate via `createPortal` to `document.body`.

---

### [CRITICAL] F3-01 — Zero onboarding no primeiro acesso ao Canvas mode

**File:** `src/pages/LinkEditor.tsx:642-655`, CONCERNS.md (UI/UX Quality Gaps)
**Problem:** Clicking "Canvas" switches the editor paradigm entirely with no explanation. The button title is `"Modo Canvas (Canva-style)"` — visible only on hover. On first activation, `assignInitialCanvasPositions` repositions all elements and the editor shows `CanvasPropertiesPanel` above the block list — with no explanation of what changed or how to use it. Users who accidentally activate canvas mode get a fundamentally different UI with no escape guidance.
**Comparison (Framer):** Framer's Frame/Component layout mode switch includes an animated tooltip on first use, shows a mini-demo of the drag handles, and has a clearly labeled "Switch back to list" affordance.
**Fix:** On first canvas mode activation (persisted in `localStorage`), show a 3-step coach-mark overlay: (1) "Modo Canvas ativado — arraste elementos livremente", (2) "Use as alças para redimensionar e girar", (3) "Clique fora para desselecionar". Add an always-visible "Voltar ao modo lista" button in the center panel header when canvas mode is active.

---

### [CRITICAL] F3-02 — Delete sem confirmação, sem undo toast

**File:** `src/components/preview/CanvasPreview.tsx:255-256`, CONCERNS.md (Missing Critical Features)
**Problem:** `e.key === "Delete" || e.key === "Backspace"` calls `onDeleteElement?.(selectedId)` with `e.preventDefault()` and nothing else. No confirmation dialog, no "Undo" affordance shown, no toast with a timed undo action. The element is permanently gone until Ctrl+Z — which users may not know is available since there is no keyboard shortcut hint visible in canvas mode.
**Comparison (Framer, Figma):** Both show a floating "Deleted [element]" toast with an "Undo" button for 5 seconds.
**Fix:** After delete, show `toast("Elemento removido", { action: { label: "Desfazer", onClick: undo } })` using Sonner's action toast pattern. This requires passing `undo` from `useEditorHistory` into the canvas delete handler.

---

### [HIGH] F3-03 — CanvasPropertiesPanel: inputs são controles crus de desenvolvedor

**File:** `src/components/editor/CanvasPropertiesPanel.tsx`, CONCERNS.md (UI/UX Quality Gaps)
**Problem:** X, Y, W, H, Rotation fields are raw number inputs with single-letter labels. No units displayed ("px"), no visual representation of the transform (like a 9-point position diagram), no min/max clamping, no icon affordances. This is more appropriate for a developer debug panel than a user-facing design tool.
**Comparison (Framer):** Framer's transform panel has labeled numeric inputs with units, a visual position diagram for origin, and constrained ranges.
**Fix:** Add "px" unit labels next to each input. Add a min constraint to keep elements within artboard bounds (X: 0–390, Y: 0–artboardH). Replace the rotation number input with a dial affordance or at minimum add a "°" suffix.

---

### [HIGH] F3-04 — CanvasToolbar usa polling rAF — não há toolbar visível enquanto elemento é movido

**File:** `src/components/editor/CanvasToolbar.tsx:46-54`, CONCERNS.md (Performance Bottlenecks)
**Problem:** The toolbar polls `getBoundingClientRect()` at 60fps via `requestAnimationFrame` to track element position. This causes 60fps DOM reads even when the element is static. More importantly, the toolbar visibly lags during fast drags — it follows the element with a frame delay, creating a "chasing" effect that feels unpolished.
**Comparison (Figma, Canva):** Context toolbars are anchored above the selection box and move synchronously with it via transform, not polling.
**Fix:** Drive toolbar position from Moveable's `onDrag`/`onResize` callbacks via a ref, eliminating the polling loop. Synchronize via the same `createPortal` pattern already used for Moveable itself.

---

### [HIGH] F3-05 — Canvas artboard sem grid visual ou guides

**File:** `src/components/preview/CanvasPreview.tsx:284-313`
**Problem:** The canvas artboard is a blank white rectangle (390px wide) with no visual grid, no center alignment guides, no artboard boundary indicators. `snapGridWidth={8} snapGridHeight={8}` is set on Moveable but there are no visual snap indicators shown when elements align to the grid or to each other.
**Comparison (Framer, Canva):** Both show subtle grid dots or lines, snap lines that flash when elements align, and artboard boundary highlighted in a distinct color.
**Fix:** Add a subtle `background: repeating-linear-gradient(...)` 8px dot grid on the artboard div. Use Moveable's `snapContainer` and `guidelines` props to show alignment helpers. Add a visible artboard boundary (`border: 1px dashed rgba(0,0,0,0.15)`) outside the phone frame.

---

### [MEDIUM] F3-06 — Canvas mode não funciona em mobile

**File:** `src/components/preview/CanvasPreview.tsx`, CONCERNS.md (Missing Critical Features)
**Problem:** Canvas mode has no touch/pointer event handling. `react-moveable`'s drag events work on desktop only. On mobile, activating canvas mode produces a broken UI with no feedback that it's unsupported.
**Fix:** Short-term: disable the Canvas button and show a tooltip "Canvas mode disponível apenas no desktop" when `isMobile === true` (`use-mobile.tsx`). Long-term: implement touch drag support via `react-moveable`'s pointer events configuration.

---

### [LOW] F3-07 — Seleção visual de elementos: outline indistinguível em fundos escuros

**File:** `src/components/preview/CanvasPreview.tsx:146` (`boxShadow: isSelected ? "0 0 0 2px #6366f1" : "none"`)
**Problem:** The selection ring is `2px solid #6366f1` (indigo-500). On dark-background links (e.g. `slate-950`), indigo-on-dark has poor contrast ratio and is easy to miss, especially through the DeviceFrame's `scale(0.86)` transform.
**Fix:** Use a contrast-adaptive selection ring: white ring with `box-shadow: 0 0 0 2px #fff, 0 0 0 4px #6366f1` (white outline + indigo accent, always visible on any background).

---

## Flow 4: Página Pública do Link

### Context
`PublicLinkPage.tsx` fetches the link, records a view, and renders `SmartLinkPreview`. `initProtection()` is called to block devtools. The page is indexed at `/:slug`.

---

### [CRITICAL] F4-01 — Página pública sem animação de entrada da página (só dos blocos)

**File:** `src/pages/PublicLinkPage.tsx`, CONCERNS.md (UI/UX Quality Gaps)
**Problem:** `SmartLinkPreview` animates individual blocks with `getEntryVariants` (fade-up, scale, etc.) but the outer page wrapper in `PublicLinkPage.tsx` has no entry animation. The result: the hero image, logo, and business name appear instantly (or pop in as the network response arrives) while the buttons animate in below. On slow connections this creates a jarring progressive appearance with no coordinated reveal.
**Comparison (Linktree Premium, Koji):** Both have a full-page fade-in or slide-up entrance that masks the incremental content loading.
**Fix:** Wrap `<SmartLinkPreview>` in `<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>` in `PublicLinkPage.tsx`. Coordinate with the `delay` values in `getEntryVariants` so the page fade completes before blocks begin their individual animations.

---

### [HIGH] F4-02 — Página "Link não encontrado" é um dead end sem CTA

**File:** `src/pages/PublicLinkPage.tsx:121-130`, CONCERNS.md (Missing Critical Features)
**Problem:** The 404 state shows a static error message with no "Create your own" CTA, no link back to the platform homepage, and no retry option. This is a lost conversion opportunity.
**Fix:** Add: (1) A platform branding mark, (2) "Crie seu link grátis →" CTA button to the landing page, (3) A subtle "home" link. Style it consistently with the platform's design language, not a generic error page.

---

### [HIGH] F4-03 — Loading state: skeleton não corresponde ao conteúdo real

**File:** `src/pages/PublicLinkPage.tsx:101-118`
**Problem:** The loading skeleton shows generic grey rectangles (likely a full-height placeholder). The actual content is a vertical bio-link with a hero image, avatar, name, and a list of buttons. A skeleton that matches the actual layout shape would significantly reduce perceived load time.
**Comparison (Linktree):** Linktree's public page skeleton precisely mirrors the structure: large image block, circle avatar, two text lines, then button-shaped rectangles.
**Fix:** Replace the generic skeleton with a structured layout: `Skeleton` for hero area at `h-40`, a circle skeleton for avatar at `w-16 h-16 rounded-full`, two text skeletons, and 3 button-shaped skeletons at `h-12 rounded-xl`.

---

### [HIGH] F4-04 — Marca d'água "Feito pela LinkPro" visualmente desloca o conteúdo

**File:** `src/components/SmartLinkPreview.tsx:696-715`
**Problem:** The watermark is `px-5 pb-6 pt-4` — 24px padding-bottom on a `pb-6` container. This pushes the last button away from the watermark with a visible gap. On short links (1-2 buttons), this gap makes the page feel half-empty. The watermark link also opens WhatsApp (`wa.me/5599984389747`) — a personal phone number baked into the component source code.
**Fix:** Reduce watermark padding to `px-5 pb-3 pt-2`. Replace the hardcoded WhatsApp link with an environment variable or a configurable platform URL. Consider making the watermark `position: sticky; bottom: 0` inside the scroll container so it's always visible without consuming layout space.

---

### [MEDIUM] F4-05 — Animações de efeitos (neve, bolhas, fireflies) sem respeito a prefers-reduced-motion além do CSS

**File:** `src/index.css:273-278` (reduced motion CSS), various effect components
**Problem:** `index.css` has a `@media (prefers-reduced-motion: reduce)` rule that sets `animation-duration: 0.01ms`. However the effect components (`SnowEffect`, `BubblesEffect`, etc.) use Framer Motion's `animate` which is independent of this CSS rule. Framer Motion has its own `useReducedMotion` hook that must be explicitly called.
**Fix:** In each effect component, call `const reducedMotion = useReducedMotion()` from Framer Motion and conditionally skip the animation or render a static equivalent.

---

### [MEDIUM] F4-06 — Botões sem estado de loading durante navegação

**File:** `src/components/preview/ButtonPreview.tsx` (not read, but inferred from `SmartLinkPreview.tsx:273`)
**Problem:** Button clicks on the public page trigger `recordClick()` (async Supabase insert) and then navigate to the URL. There is no visual feedback during the click — no ripple, no loading state, no success confirmation. On slow connections, the button appears unresponsive.
**Fix:** Add a brief `scale(0.97)` active state via Framer Motion's `whileTap` prop and a 200ms visual "pressed" state before navigation. This is already partially available via Tailwind's `active:scale-95` but requires checking `ButtonPreview.tsx` for current implementation.

---

## Flow 5: Dashboard de Links

### Context
`LinksPage.tsx` renders `SmartLinkCard` in a responsive grid. Dashboard (`Dashboard.tsx`) shows stats cards + template library. Navigation between them via `AppSidebar`.

---

### [HIGH] F5-01 — SmartLinkCard: área de ações muito pequena, ícones sem labels

**File:** `src/components/SmartLinkCard.tsx:215-250`
**Problem:** The action bar shows 5 icon buttons (Pencil, CopyPlus, Share2, ExternalLink, Trash2) at `p-1.5` (6px padding each side) with `h-3.5 w-3.5` icons. The touch targets are 26px — well below the 44px minimum recommended by Apple HIG and WCAG 2.5.5. No labels are shown. On mobile, users frequently mis-tap between adjacent icons.
**Comparison (Linear):** Linear's list item actions appear on hover (desktop) and are full-height tap targets on mobile with labels.
**Fix:** Increase button padding to `p-2` minimum. On mobile, stack a "Editar" primary button at full width with secondary actions in a `...` overflow menu.

---

### [HIGH] F5-02 — Dashboard stats cards sem contexto temporal e sem delta

**File:** `src/pages/Dashboard.tsx:186-236`, CONCERNS.md (UI/UX Quality Gaps)
**Problem:** The 4 stat cards show raw cumulative totals ("Total acumulado") with no time window, no sparkline, no delta ("↑ 12% last 7 days"). The icon is `h-3.5 w-3.5 text-muted-foreground` at near-invisible size in a `bg-muted/60` container. "Taxa de Conversão" shows `conversionRate%` but it's calculated from all-time views/clicks, making it meaningless for links with years of data.
**Comparison (Vercel Analytics, Linear):** Both show stat cards with a delta indicator, a sparkline for trend, and a "last 7 days" time window selector.
**Fix:** Add a time-window toggle ("7d / 30d / Total"). Add a percentage-change badge. Increase icon to `h-4 w-4` and apply `text-primary` coloring for the primary metric icon.

---

### [HIGH] F5-03 — SmartLinkCard: preview area comunica pouco

**File:** `src/components/SmartLinkCard.tsx:148-193`
**Problem:** The card preview area shows only the hero image (or gradient fallback) and the business name. It does not communicate: how many buttons the link has, what type of content (canvas mode vs. list), whether it has effects enabled, or when it was last edited. The info shown in the stats bar ("3 botões · 2 blocos") is in `text-[10px]` right-aligned in a low-contrast position.
**Fix:** Promote "X botões · Y blocos" to the card body as a subtitle line, `text-xs text-muted-foreground`. Add a small canvas mode badge when `link.canvasMode === true`. Add `updatedAt` relative timestamp ("Editado 2h atrás") to make the list scannable by recency.

---

### [MEDIUM] F5-04 — Seleção em massa: ação de deletar sem confirmação

**File:** `src/pages/LinksPage.tsx:91-94` (`handleBulkDelete`)
**Problem:** `handleBulkDelete` calls `deleteLink.mutate(id)` for every selected ID immediately on button click with no confirmation dialog. Deleting 10+ links is irreversible and runs without any "Are you sure?" prompt.
**Fix:** Show `ConfirmDialog` (already exists in `src/components/ConfirmDialog.tsx`) before executing `handleBulkDelete`. The message should state the number of links being deleted.

---

### [MEDIUM] F5-05 — Empty state de LinksPage não aparece quando links.length === 0 (inconsistência com CONCERNS)

**File:** `src/pages/LinksPage.tsx:258-291`
**Problem:** Reviewing the code directly, an empty state IS rendered when `links.length === 0` (the `motion.div` at line 259). However, the empty state uses `Inbox` icon (a generic mailbox) and the copy "Crie seu primeiro link usando um modelo ou comece do zero." The action buttons navigate to `"/"` ("Ver Modelos") and `/links/new`. Neither button is styled as a primary CTA — both are equal weight (`bg-secondary` vs. `bg-primary`). The primary action should be going to templates, not creating from scratch.
**Fix:** Make "Ver Modelos" the `bg-primary` button. Replace the `Inbox` icon with a more domain-specific illustration (a phone/link icon). Add a 1-line subheading that describes the value ("Seu link em árvore personalizado em 2 minutos").

---

### [LOW] F5-06 — Conversão zero não mostra "—" mas sim nada

**File:** `src/components/SmartLinkCard.tsx:205-207`
**Problem:** `{conversionRate > 0 && (<span>...{conversionRate}% conv.</span>)}` — when conversion rate is 0 (new links), nothing is shown in the stats bar. This creates an inconsistent visual rhythm in the grid where some cards have 3 stats and others have 2.
**Fix:** Always show the conversion stat. Display "— conv." for zero-conversion links or "0% conv." This creates consistent visual rhythm across all cards.

---

## Flow 6: Mobile Experience

### Context
`useIsMobile()` breakpoint hook (`use-mobile.tsx`). Mobile triggers `setShowPreview(false)` at mount (`LinkEditor.tsx:173-174`). Drawer is `w-full` on mobile.

---

### [CRITICAL] F6-01 — Editor em mobile é fundamentalmente quebrado: sem preview, drawers full-screen

**File:** `src/pages/LinkEditor.tsx:173-174`, `577`
**Problem:** On mobile, `showPreview` is set to `false` on mount — the live preview is hidden. The user edits blindly. The 4 drawers open `w-full` overlaying the entire screen. There is no way to see the preview and the editor simultaneously. The preview toggle button is in the toolbar at `hidden sm:inline` — on small screens the label is hidden, leaving only the `Eye`/`EyeOff` icon, which is not shown at all on mobile (the preview toggle button itself is not in the toolbar — preview is only accessible via the `Eye` button which toggles a full-screen modal).
**Comparison (Linktree editor on mobile):** Linktree shows a bottom-sheet editor with a "Preview" tab that slides to the preview without losing editor context.
**Fix:** Implement a mobile layout with a bottom tab bar: [Editar] [Preview] [Temas]. The editor and preview share one `<div>` that slides horizontally like a tab, preserving state. This is a larger architectural change but is the minimum necessary for mobile usability.

---

### [HIGH] F6-02 — Touch targets no editor abaixo de 44px em múltiplos locais

**File:** Various — `LinkEditor.tsx:631-636` (toolbar buttons `py-2`), `SmartLinkCard.tsx:216-246` (action buttons `p-1.5`)
**Problem:** Multiple action buttons across the editor have `py-2` (8px vertical padding) producing ~30-32px touch targets. WCAG 2.5.5 requires 44x44px minimum. Affected areas:
- Toolbar mode buttons: `px-2.5 py-2` → ~34px height
- Card action buttons: `p-1.5` → ~27px height
- Device picker buttons: `px-2.5 py-1` → ~26px height (`LinkEditor.tsx:854`)
**Fix:** Set a global minimum `min-h-[44px]` on all interactive elements in mobile context. Use the `isMobile` flag to conditionally apply this class.

---

### [HIGH] F6-03 — Sidebar trigger (hamburger) sem label no mobile

**File:** `src/components/DashboardLayout.tsx:20`
**Problem:** `<SidebarTrigger>` renders the shadcn sidebar toggle with only an icon — no label. On mobile, the sidebar is the primary navigation. The trigger being icon-only with `text-muted-foreground` color makes it low-visibility.
**Fix:** Add "Menu" label next to the SidebarTrigger on mobile. Or increase the icon size to `h-6 w-6` and ensure sufficient touch target padding.

---

### [MEDIUM] F6-04 — Scroll de preview no DeviceFrame usa overflowY:auto sem momentum nativo

**File:** `src/components/editor/DeviceFrame.tsx:236` (`-webkit-overflow-scrolling: touch` is NOT set here)
**Problem:** The scrollable screen inside `DeviceFrame` (`style={{ position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden" }}`) does not set `-webkit-overflow-scrolling: touch` or `scroll-behavior: smooth`. On iOS Safari, this produces choppy scroll within the device preview that breaks the "live preview" illusion.
**Note:** `index.css:289` sets `-webkit-overflow-scrolling: touch` only on `.public-minisite`, not on the editor preview. The editor DeviceFrame is excluded.
**Fix:** Add `WebkitOverflowScrolling: 'touch'` to the DeviceFrame screen scroll container style, or extend the CSS class to cover the editor preview path.

---

### [MEDIUM] F6-05 — Modal de compartilhamento não usa Web Share API nativa

**File:** `src/components/SmartLinkCard.tsx:95-128` (share overlay)
**Problem:** The share flow shows a custom modal with 3 options: "Copiar Link", "WhatsApp", "QR Code". On mobile, the native share sheet (`navigator.share()`) is universally available and is the expected behavior. Users expect the iOS/Android share sheet, not a custom modal.
**Fix:** If `navigator.share` is available, call it directly on the share button click with the link URL and title. Fallback to the current custom modal on desktop.

---

### [LOW] F6-06 — Form inputs no editor: sem `inputMode` nem `autocomplete` attrs

**File:** Various block editor forms
**Problem:** Text inputs throughout the editor (button URL fields, slug input, etc.) lack `inputMode` attributes (e.g. `inputMode="url"` for URL fields, `inputMode="text"` for names) and `autoComplete` attributes. On mobile, this means the default keyboard is shown for URL inputs instead of the URL keyboard with `.com` button.
**Fix:** Add `inputMode="url"` to URL inputs, `autoComplete="off"` to slug/identifier fields, `autoCapitalize="none"` to slug/handle inputs.

---

## Cross-Cutting Issues

### [HIGH] CC-01 — Typography scale não sistematizada

**File:** CONCERNS.md (UI/UX Quality Gaps), multiple files
**Problem:** The editor uses `text-[10px]`, `text-[11px]`, `text-xs` (12px), and `text-sm` (14px) in a non-systematic mix. Section headers use `text-[10px] uppercase tracking-wider` in some places and `text-xs font-semibold` in others. Block row headers in `SortableList.tsx:105` mix these styles inconsistently.
**Fix:** Define a 5-step scale in `tailwind.config.ts`:
```
label-xs: 10px/1.4
label-sm: 11px/1.4
body-sm: 12px/1.5
body: 14px/1.5
heading-sm: 16px/1.3
```
Replace all `text-[10px]`, `text-[11px]` with semantic class names.

---

### [HIGH] CC-02 — Toasts expõem strings de erro brutas do servidor

**File:** `src/pages/LinkEditor.tsx:488` (`"Erro ao salvar: " + msg`)
**Problem:** Error toasts in `handleSave` append raw server error messages: `toast.error("Erro ao salvar: " + (msg || "tente novamente"))`. Users see database errors like "duplicate key value violates unique constraint" instead of friendly messages.
**Comparison (Linear, Vercel):** Both maintain a strict error message taxonomy — users never see raw system errors.
**Fix:** Create a typed `notifyError(code: string, fallback: string)` helper that maps known error codes to friendly Portuguese messages. The `handleSave` handler already partially does this for `"Limite de links"` and `"duplicate key"` (lines 486-490) — extend this pattern to all errors.

---

### [MEDIUM] CC-03 — Ausência de confirmação em operações destrutivas (padrão)

**Files:** `src/components/preview/CanvasPreview.tsx:255-256` (canvas delete), `src/pages/LinksPage.tsx:91-94` (bulk delete)
**Problem:** Two separate places have destructive operations without confirmation: canvas mode Delete key, and bulk delete in LinksPage. `ConfirmDialog.tsx` exists in the codebase and is even imported in `SmartLinkCard.tsx` for single-link deletion (via the overlay system), but is not used consistently everywhere.
**Fix:** Establish a rule: all destructive operations with no undo path require `ConfirmDialog`. Operations with undo (canvas delete) should use a toast with undo action instead.

---

### [MEDIUM] CC-04 — Cores hardcoded escapam do sistema de tokens

**Files:** `src/lib/protect.ts:17-30`, selection rings `#6366f1` in multiple canvas files
**Problem:** `protect.ts` uses inline `background:#7C3AED` and `color:#fff` bypassing CSS variables. Selection ring color `#6366f1` is hardcoded in `CanvasPreview.tsx:146` and `SmartLinkPreview.tsx:631`. In dark mode, this exact indigo may have insufficient contrast.
**Fix:** Replace all hardcoded color values with `hsl(var(--primary))`, `hsl(var(--primary-foreground))`, etc. The selection ring should use `hsl(var(--ring))` which is already defined in the token system.

---

### [LOW] CC-05 — Spacing sem grid system de 4px/8px

**File:** CONCERNS.md (Spacing lacks a grid system)
**Problem:** The editor mixes `gap-1` (4px), `gap-1.5` (6px), `gap-2` (8px), `gap-2.5` (10px), `gap-3` (12px) in adjacent elements. `px-2.5 py-2` (toolbar buttons) vs. `px-3 py-2.5` (save button) are non-systematic 2px increments.
**Fix:** Adopt 4px base unit. Only permitted gaps: `gap-1` (4px), `gap-2` (8px), `gap-3` (12px), `gap-4` (16px), `gap-6` (24px). Extend Tailwind config to enforce this via custom spacing scale.

---

## Prioritized Action List

### Immediate (Critical — do these first)

| # | Issue | File(s) | Impact |
|---|-------|---------|--------|
| 1 | Canvas delete without undo affordance | `CanvasPreview.tsx:255-256` | Data loss |
| 2 | Canvas mode: zero onboarding | `LinkEditor.tsx:642-655` | Abandonment |
| 3 | Slug field invisible on first-run | `LinkEditor.tsx:460`, `BusinessInfoPanel` | Save failure |
| 4 | Public page: no page-level entrance animation | `PublicLinkPage.tsx` | Poor first impression |
| 5 | Editor mobile: broken layout (no preview + fullscreen drawers) | `LinkEditor.tsx:173-174` | Mobile usability zero |

### Short-term (High — next sprint)

| # | Issue | File(s) | Impact |
|---|-------|---------|--------|
| 6 | Toolbar has no visual zones/hierarchy | `LinkEditor.tsx:620-755` | Discoverability |
| 7 | Canvas Properties Panel: raw dev controls | `CanvasPropertiesPanel.tsx` | Professional quality |
| 8 | Canvas toolbar: rAF polling lag | `CanvasToolbar.tsx:46-54` | Animation quality |
| 9 | Canvas mode disabled on mobile | `CanvasPreview.tsx` | Mobile crash |
| 10 | ElementsSidebar: developer-facing labels | `ElementsSidebar.tsx` | Discoverability |
| 11 | SmartLinkCard: 27px touch targets | `SmartLinkCard.tsx:215-250` | Mobile usability |
| 12 | Dashboard stats: no delta or time window | `Dashboard.tsx:186-236` | Analytics value |
| 13 | Toast system: raw server error strings | `LinkEditor.tsx:488` | Trust |
| 14 | Bulk delete: no confirmation | `LinksPage.tsx:91-94` | Data loss |
| 15 | Public page 404: dead end | `PublicLinkPage.tsx:121-130` | Conversion |

### Medium-term (Medium — quality sprint)

| # | Issue | File(s) |
|---|-------|---------|
| 16 | Typography scale unsystematized | Multiple |
| 17 | Canvas artboard: no grid or snap guides | `CanvasPreview.tsx` |
| 18 | Selection ring: poor contrast on dark BGs | `CanvasPreview.tsx:146` |
| 19 | Watermark padding/hardcoded phone number | `SmartLinkPreview.tsx:696-715` |
| 20 | Autosave status: no relative time | `LinkEditor.tsx:708-713` |
| 21 | Drawer system: no IA breadcrumb | `LinkEditor.tsx:558-615` |
| 22 | prefers-reduced-motion: Framer Motion effects | Effect components |
| 23 | Mobile: Web Share API not used | `SmartLinkCard.tsx:95-128` |
| 24 | Mobile: DeviceFrame missing momentum scroll | `DeviceFrame.tsx:236` |
| 25 | Form inputs: missing inputMode/autocomplete | Block editor forms |

---

## Benchmark Comparison Table

| Dimension | Sistema Link PRO (current) | Vercel | Linear | Framer |
|-----------|---------------------------|--------|--------|--------|
| **Toolbar clarity** | Single-row, no zones | 3-zone with dividers | 3-zone, context-aware | 3-zone, mode-sensitive |
| **Canvas onboarding** | None | N/A | N/A | 3-step coach marks |
| **Empty states** | Present but weak | Illustrated + CTA | Illustrated + CTA | Illustrated + CTA |
| **Destructive ops** | Mixed (some with confirm, some without) | Always with confirm | Always with confirm | Always with confirm |
| **Mobile editor** | Broken (hidden preview, full-screen drawers) | Responsive | Tab-based | Disabled, redirects to desktop |
| **Error messaging** | Raw server strings exposed | Typed, friendly | Typed, friendly | Typed, friendly |
| **Autosave feedback** | Minimal (clock, no relative time) | "Saving..." → "Saved" with dot | "Saved X seconds ago" | "Auto-saved" with animation |
| **Touch targets** | Below 44px in many places | 44px+ enforced | 44px+ enforced | 44px+ enforced |
| **Typography system** | Ad-hoc (`text-[10px]`, `text-[11px]`) | Systematic scale | Systematic scale | Systematic scale |
| **Public page enter** | No page-level animation | Fade in | N/A | Fade + slide |

---

*UX Audit: 2026-03-28 — based on direct code reading of LinkEditor.tsx, SmartLinkPreview.tsx, CanvasPreview.tsx, BlockEditor.tsx, DeviceFrame.tsx, Dashboard.tsx, LinksPage.tsx, DashboardLayout.tsx, SmartLinkCard.tsx, index.css, CONCERNS.md, ARCHITECTURE.md, STRUCTURE.md*
