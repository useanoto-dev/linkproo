# Architecture

**Analysis Date:** 2026-03-28

## Pattern Overview

**Overall:** Feature-sliced SPA with React Query as server-state cache and React Context for auth/theme. No Zustand/Redux — local component state is lifted up to the page-level orchestrator (`LinkEditor`). Two distinct rendering modes exist for the editor preview: List mode (drag-reorder via `@dnd-kit`) and Canvas mode (free-position via `react-moveable`).

**Key Characteristics:**
- All pages are lazy-loaded via `React.lazy` + `Suspense` (tree-shaking + code splitting)
- Supabase is the exclusive backend — no custom API server
- Data access is encapsulated in hooks under `src/hooks/` which wrap `useQuery`/`useMutation` from `@tanstack/react-query`
- The `SmartLink` TypeScript type is the canonical domain model; DB rows are mapped in/out via `src/lib/link-mappers.ts`
- Editor preview is debounced (50 ms) so `previewLink` lags slightly behind `link` state, avoiding re-render on every keystroke

## Layers

**Routing / Shell:**
- Purpose: Declare all routes, inject global providers, guard protected/admin routes
- Location: `src/App.tsx`
- Contains: `BrowserRouter`, `Routes`, provider wrappers (`QueryClientProvider`, `AuthProvider`, `ThemeProvider`), `AnimatePresence` for page transitions
- Depends on: all context providers
- Used by: `src/main.tsx` (root render)

**Page Layer:**
- Purpose: Compose features into full-screen views; own page-level state
- Location: `src/pages/`
- Contains: `Dashboard.tsx`, `LinksPage.tsx`, `LinkEditor.tsx`, `PublicLinkPage.tsx`, `AnalyticsPage.tsx`, `PlansPage.tsx`, `SettingsPage.tsx`, `VideoaulasPage.tsx`, `SupportPage.tsx`, `AuthPage.tsx`, `ResetPasswordPage.tsx`, `LandingPage.tsx`, `NotFound.tsx`; admin pages in `src/pages/admin/`
- Depends on: hooks, contexts, layout components, domain types
- Used by: `src/App.tsx` route definitions

**Layout Layer:**
- Purpose: Authenticated shell with sidebar navigation; wraps all protected pages
- Location: `src/components/DashboardLayout.tsx`, `src/components/AppSidebar.tsx`
- Contains: `SidebarProvider`, `AppSidebar` (nav items, user avatar, theme toggle), sticky header with `SidebarTrigger`
- Depends on: `AuthContext`, `ThemeContext`, `use-profile`, `use-user-role`
- Used by: every protected page except `LinkEditor` (which uses full-width layout)

**Editor Layer:**
- Purpose: Interactive link builder — manages editor state, autosave, undo/redo, drag-and-drop, canvas mode
- Location: `src/pages/LinkEditor.tsx` (orchestrator), `src/components/editor/`
- Contains:
  - `LinkEditor.tsx` — page-level state owner (link state, autosave, history, canvas mode toggle)
  - `BlockEditor.tsx` — renders `BusinessInfoPanel` + `SortableList` of unified buttons/blocks
  - `ElementsSidebar.tsx` — block type catalog with drag-to-add and click-to-add
  - `ThemePanel.tsx`, `EffectsPanel.tsx`, `SubPageEditor.tsx` — side panels for styling and sub-pages
  - `DeviceFrame.tsx` — renders a pixel-accurate phone shell (iPhone 15, Pixel 8, Galaxy S24) around the preview
  - `CanvasToolbar.tsx`, `CanvasPropertiesPanel.tsx` — canvas mode controls
  - `blocks/SortableList.tsx` — `@dnd-kit` drag-and-drop list of `UnifiedItem` (buttons and blocks unified by `order` field)
  - `blocks/` — group editors: `TextBlockEditor`, `MediaBlockEditor`, `LayoutBlockEditor`, `InteractiveBlockEditor`, `ListBlockEditor` (all lazy-loaded)
- Depends on: `use-links`, `use-autosave`, `use-editor-history`, `AuthContext`, `link-mappers`, `block-utils`
- Used by: routes `/links/new` and `/links/:id/edit`

**Preview Layer:**
- Purpose: Render the public-facing link page appearance — shared between editor preview and actual public page
- Location: `src/components/SmartLinkPreview.tsx` (main), `src/components/preview/`
- Contains:
  - `SmartLinkPreview.tsx` — full page renderer (background effects, hero image, logo, title, button list, blocks, floating emojis, WhatsApp float, SubPage modal)
  - `BlockRenderer.tsx` — switch-dispatches each `BlockType` to its visual output; includes `FreeHtmlBlock` (sandboxed iframe for user HTML)
  - `ButtonPreview.tsx` — renders an individual `SmartLinkButton`
  - `CanvasPreview.tsx` — canvas mode viewer using `react-moveable` for drag/resize/rotate; renders elements via `createPortal` to escape `overflow:hidden` in `DeviceFrame`
  - `preview-utils.ts` — pure helpers: `isDarkBg`, `getVideoEmbedUrl`, `getMapEmbedUrl`, `getSpotifyEmbedUrl`, `getEntryVariants`, Google Font loader
  - Background effects as standalone components: `SnowEffect`, `BubblesEffect`, `FirefliesEffect`, `MatrixEffect`, `StarsEffect`, `BgHtmlEffect` (in `src/components/`)
- Depends on: `types/smart-link`, `lib/color-utils`, `use-links` (for `recordClick`), `use-email-captures`
- Used by: `LinkEditor` (debounced preview inside `DeviceFrame`) and `PublicLinkPage`

**Data / Hook Layer:**
- Purpose: Wrap all Supabase calls; expose typed React Query hooks
- Location: `src/hooks/`
- Contains:
  - `use-links.ts` — `useLinks`, `useLink`, `usePublicLink`, `useSaveLink`, `useDeleteLink`, `useDuplicateLink`, `useToggleLinkActive`, `useLinkStats`, `recordView`, `recordClick`
  - `use-autosave.ts` — debounced background save with status tracking (`idle | saving | saved | error`) and `flush()` for immediate save on tab hide / unmount
  - `use-editor-history.ts` — undo/redo stack (max 50 snapshots) using `past/present/future` pattern
  - `use-profile.ts` — fetches `profiles` row (display name, avatar, plan)
  - `use-plan-limits.ts` — derives link creation limits from plan (`free:3 / pro:50 / business:∞`)
  - `use-user-role.ts` — admin check
  - `use-device-fingerprint.ts` — silent device tracking on authenticated pages
  - `use-mobile.tsx` — responsive breakpoint hook
  - `use-autosave.ts`, `use-course.ts`, `use-email-captures.ts`, `use-support.ts`
- Depends on: `supabase` client, `AuthContext`, `link-mappers`
- Used by: page components, editor components

**Library / Utility Layer:**
- Purpose: Pure functions, mappers, and utilities with no React dependencies
- Location: `src/lib/`
- Contains:
  - `link-mappers.ts` — `rowToSmartLink` and `smartLinkToRow` — bidirectional mapping between DB rows and the `SmartLink` domain type; also exports `SmartLinkRow` manual interface (Supabase generated types are stale)
  - `block-utils.ts` — `createBlockDefaults(type)` — factory for new block instances with type-specific defaults
  - `slug-utils.ts` — `validateSlug`, `checkSlugAvailability`
  - `color-utils.ts` — background gradient parsing, dark/light detection
  - `image-utils.ts`, `storage-utils.ts` — Supabase Storage helpers
  - `device-fingerprint.ts` — browser fingerprint collection
  - `protect.ts` — `initProtection()` — blocks devtools shortcuts + right-click on public pages
  - `utils.ts` — shadcn `cn()` class merger
- Depends on: `supabase` client (storage utils only), `types/smart-link`
- Used by: hooks, editor components, preview components

**Context Layer:**
- Purpose: App-wide shared state that does not fit React Query (auth session, UI theme)
- Location: `src/contexts/`
- Contains:
  - `AuthContext.tsx` — wraps Supabase `onAuthStateChange`; exposes `session`, `user`, `loading`, `signUp`, `signIn`, `signInWithOAuth`, `signOut`, `resetPassword`
  - `ThemeContext.tsx` — `light | dark` toggle, persisted to `localStorage` as `linkpro_theme`, applies `dark` class to `document.documentElement`
- Depends on: `supabase` client
- Used by: `App.tsx` (providers), `ProtectedRoute`, `AdminRoute`, all pages that need auth/theme

**Integration Layer:**
- Purpose: Supabase client singleton with typed schema
- Location: `src/integrations/supabase/`
- Contains: `client.ts` (instantiates `createClient<Database>`), `types.ts` (generated Supabase types — partially stale, see `link-mappers.ts` note)
- Depends on: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` env vars

**Type Layer:**
- Purpose: Canonical domain model definitions
- Location: `src/types/smart-link.ts`
- Contains: `SmartLink`, `SmartLinkButton`, `LinkBlock`, `BlockType` (union of 24 types), `SubPage`, `ContactItem`, `BadgeItem`, `EntryAnimation`, effect interfaces (`SnowEffect`, `BubblesEffect`, etc.)

## Data Flow

**Editor — Loading an Existing Link:**

1. User navigates to `/links/:id/edit` → `LinkEditor` mounts
2. `useLink(id)` fires a React Query fetch: `supabase.from("links").select("*").eq("id", id)`
3. Response row passes through `rowToSmartLink()` → typed `SmartLink`
4. `reset(existingLink)` loads it into `useEditorHistory` (clears undo stack); `initializeRef(existingLink)` primes `useAutosave` to skip the first save
5. Editor state lives in `useEditorHistory.present` (`link`); mutations call `setLink()` which pushes a snapshot to `past[]`

**Editor — Autosave:**

1. `link` state changes → `useAutosave` effect detects serialized diff vs `lastSavedRef`
2. Debounced 1500 ms timer fires → `smartLinkToRow(link, user.id)` serializes to DB shape
3. `supabase.from("links").update(row).eq("id").eq("user_id")` executes
4. `status` transitions: `idle → saving → saved → idle` (with 2 s display window)
5. On tab hide / unmount: `flush()` bypasses debounce for immediate save

**Editor — Block Drag-and-Drop (List Mode):**

1. `ElementsSidebar` dispatches `block-drag-start` CustomEvent with `type`
2. `LinkEditor` listens via `window.addEventListener` and stores type in `dragTypeRef`
3. User drops onto preview area → `setGhostBlockType` cleared, block inserted at drop position
4. Inside `SortableList`, `@dnd-kit` handles reorder via `arrayMove` on `UnifiedItem[]`
5. Reordered items write back to `link.buttons` and `link.blocks` via `onUpdateLink`

**Editor — Canvas Mode:**

1. User clicks canvas toggle → `handleToggleCanvasMode`
2. `assignInitialCanvasPositions()` stamps `canvasX/Y/W/H` on all items that lack them
3. `CanvasPreview` renders inside `DeviceFrame`; `react-moveable` wraps each element
4. `Moveable` uses `createPortal` to the `document.body` to escape `overflow:hidden` clip
5. Drag/resize/rotate events call `onUpdateElement(id, { canvasX, canvasY, canvasW, canvasH, canvasRotation })`
6. Autosave persists canvas coordinates alongside other link data

**Public Page — View Flow:**

1. Visitor hits `/:slug` → `PublicLinkPage` mounts
2. `usePublicLink(slug)` fetches `links` row filtered by `slug` and `is_active = true`
3. Parallel RPC call `get_link_owner_plan` determines if watermark should show
4. `rowToSmartLink(data, 0, 0, ownerPlan)` → `SmartLink`
5. `recordView(link.id)` fires once (guarded by `viewRecorded` ref) → inserts into `link_views`
6. `SmartLinkPreview` renders the full page; `initProtection()` blocks devtools shortcuts
7. Button click → `recordClick(linkId, buttonId)` inserts into `link_clicks`

## Key Abstractions

**SmartLink:**
- Purpose: The single domain entity that models a complete bio-link page
- Examples: `src/types/smart-link.ts`
- Pattern: Flat TypeScript interface; `buttons[]` and `blocks[]` share the same `order` field to produce a unified sorted list; canvas positioning fields (`canvasX/Y/W/H/Rotation`) are optional overrides on both arrays

**UnifiedItem:**
- Purpose: Merge `SmartLinkButton` and `LinkBlock` into a single sortable list by `order`
- Examples: `src/components/editor/blocks/unified-items.ts`
- Pattern: Tagged union `{ kind: "button" | "block"; id: string; data: SmartLinkButton | LinkBlock }`; `getUnifiedItemsForMode()` returns sub-page blocks when in sub-page editing mode

**BlockType:**
- Purpose: Discriminant for all content block varieties
- Examples: `src/types/smart-link.ts` (union of 24 string literals), `src/lib/block-utils.ts` (`createBlockDefaults`), `src/components/preview/BlockRenderer.tsx` (switch dispatch)
- Pattern: String literal union; each value corresponds to a visual renderer in `BlockRenderer` and an editor group in `SortableList`

**rowToSmartLink / smartLinkToRow:**
- Purpose: Type-safe serialization boundary between Supabase DB rows and the `SmartLink` domain type
- Examples: `src/lib/link-mappers.ts`
- Pattern: Manual mapping (not auto-generated) because Supabase generated types are stale relative to recent migrations; `SmartLinkRow` is the manually maintained superset interface

## Entry Points

**`src/main.tsx`:**
- Location: `src/main.tsx`
- Triggers: Browser loads the app
- Responsibilities: Mounts React root into `#root`; injects `SpeedInsights`

**`src/App.tsx`:**
- Location: `src/App.tsx`
- Triggers: Rendered by `main.tsx`
- Responsibilities: Declares provider tree (`ErrorBoundary → QueryClientProvider → AuthProvider → ThemeProvider → TooltipProvider → BrowserRouter`); defines all routes with lazy loading; wraps pages in `AnimatePresence` + `PageTransition` for animated transitions; enforces `ProtectedRoute` / `AdminRoute` guards

**`src/pages/LinkEditor.tsx`:**
- Location: `src/pages/LinkEditor.tsx`
- Triggers: Routes `/links/new` and `/links/:id/edit`
- Responsibilities: Single orchestrator for entire editor; owns `link` state via `useEditorHistory`; manages autosave, canvas mode, drag-drop detection, preview debouncing, keyboard shortcuts

**`src/pages/PublicLinkPage.tsx`:**
- Location: `src/pages/PublicLinkPage.tsx`
- Triggers: Routes `/:slug` and `/:slug/:pageSlug`
- Responsibilities: Fetches public link data; records view; injects SEO meta tags dynamically; initializes content protection; renders `SmartLinkPreview` with optional `SubPageModal` for deep-linked sub-pages

## Error Handling

**Strategy:** Layered — top-level class-based `ErrorBoundary` catches render crashes; React Query handles async errors via `onError` mutation callbacks with `toast.error()`; individual block renders are wrapped in `BlockErrorBoundary` inside `SortableList`

**Patterns:**
- `src/components/ErrorBoundary.tsx` — catches any unhandled render error app-wide; shows reload prompt
- `src/components/editor/blocks/BlockErrorBoundary.tsx` — per-block error isolation; a single broken block does not crash the whole editor
- All `useMutation` hooks in `use-links.ts` use `onError: (err) => toast.error(err.message)` for user feedback
- Supabase errors bubble up to React Query and are surfaced as loading/error states in components

## Cross-Cutting Concerns

**Logging:** `console.error` only; no third-party error tracking detected. `ErrorBoundary.componentDidCatch` logs to console. Analytics hooks log failures silently (`[analytics] recordView failed:`).

**Validation:** Slug validation via `src/lib/slug-utils.ts` (`validateSlug`, `checkSlugAvailability`). Plan limit enforcement in `useSaveLink` mutation (queries count before insert) and `use-plan-limits.ts` (client-side gate for UI).

**Authentication:** `AuthContext` provides `user` / `session` / `loading`. `ProtectedRoute` redirects unauthenticated users to `/auth`. `AdminRoute` additionally checks `useUserRole().isAdmin`. All Supabase mutations include `.eq("user_id", user.id)` row-level security.

**Content Security:** `DOMPurify` sanitizes user HTML before rendering in `SmartLinkPreview` (title HTML) and user block HTML runs in sandboxed iframes (`sandbox="allow-scripts"`) in `BlockRenderer.FreeHtmlBlock`.

---

*Architecture analysis: 2026-03-28*
