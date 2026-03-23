# Architecture

**Analysis Date:** 2026-03-23

## Pattern Overview

**Overall:** Single-Page Application (SPA) with client-side rendering, Supabase BaaS backend, and feature-sliced layering by concern.

**Key Characteristics:**
- All data access is centralized in custom React Query hooks (`src/hooks/`) — no direct Supabase calls in pages or components
- Domain model (`SmartLink`) is the single canonical type that flows through every layer; DB rows are mapped at the boundary via `src/lib/link-mappers.ts`
- Editor state is managed entirely in React local state (`useEditorHistory` + `useAutosave`); no global store (no Redux/Zustand)
- Public pages (`/:slug`) and app pages (`/dashboard`, etc.) share routes in the same SPA; app routes take priority via route ordering in `src/App.tsx`
- Role-based access control uses two guard components: `ProtectedRoute` (auth check) and `AdminRoute` (auth + role check)

## Layers

**Entry / Bootstrap:**
- Purpose: Mount React app, initialize protection, attach Vercel Speed Insights
- Location: `src/main.tsx`, `index.html`
- Contains: Root render, `initProtection()` call
- Depends on: `src/App.tsx`, `src/lib/protect.ts`
- Used by: Browser

**Routing / Provider Shell:**
- Purpose: Declare all routes, wrap app in global providers
- Location: `src/App.tsx`
- Contains: `QueryClientProvider`, `AuthProvider`, `ThemeProvider`, `BrowserRouter`, all `<Route>` definitions with lazy-loaded page components
- Depends on: All context providers, `ProtectedRoute`, `AdminRoute`, page components
- Used by: `src/main.tsx`

**Pages (Views):**
- Purpose: Compose UI from layout and feature components; orchestrate hook data into rendered output
- Location: `src/pages/`, `src/pages/admin/`
- Contains: Page-level components (Dashboard, LinkEditor, PublicLinkPage, AnalyticsPage, etc.)
- Depends on: Hooks, layout components, editor/preview components
- Used by: React Router route definitions in `src/App.tsx`

**Layout:**
- Purpose: Authenticated shell (sidebar + header) wrapping all protected pages
- Location: `src/components/DashboardLayout.tsx`, `src/components/AppSidebar.tsx`
- Contains: `SidebarProvider`, `AppSidebar`, sticky header with `SidebarTrigger`; calls `useDeviceFingerprint()` on every authenticated mount
- Depends on: `src/components/ui/sidebar.tsx`, `src/hooks/use-device-fingerprint.ts`
- Used by: Every protected page

**Editor Feature:**
- Purpose: Visual SmartLink builder — panels, drag-and-drop blocks, live preview pane
- Location: `src/components/editor/`
- Contains: `BlockEditor.tsx` (1944 lines, main editor panel), `ElementsSidebar.tsx`, `ThemePanel.tsx`, `EffectsPanel.tsx`, `SubPageEditor.tsx`, `DeviceFrame.tsx`, `ImageUploader.tsx`, `ButtonBlockEditor.tsx`, `CropEditor.tsx`
- Depends on: `src/types/smart-link.ts`, `src/hooks/use-autosave.ts`, `src/hooks/use-editor-history.ts`, `@dnd-kit/*`
- Used by: `src/pages/LinkEditor.tsx`

**Preview Feature:**
- Purpose: Render a SmartLink for display (both live in editor and on public page)
- Location: `src/components/SmartLinkPreview.tsx`, `src/components/preview/`
- Contains: `SmartLinkPreview.tsx` (root renderer), `BlockRenderer.tsx` (renders individual blocks), `ButtonPreview.tsx`, `AnimatedButtonBlock.tsx`, `CountdownBlock.tsx`, `FaqAccordionItem.tsx`, `FloatingEmoji.tsx`, `preview-utils.ts`
- Depends on: `src/types/smart-link.ts`, `src/hooks/use-links.ts` (for `recordClick`), `src/hooks/use-email-captures.ts`
- Used by: `src/pages/LinkEditor.tsx` (preview pane), `src/pages/PublicLinkPage.tsx`

**Visual Effects:**
- Purpose: Animated background overlays rendered on top of SmartLink pages
- Location: `src/components/SnowEffect.tsx`, `BubblesEffect.tsx`, `FirefliesEffect.tsx`, `MatrixEffect.tsx`, `StarsEffect.tsx`, `BgHtmlEffect.tsx`
- Depends on: Props from `SmartLink` effect fields
- Used by: `src/components/SmartLinkPreview.tsx`

**Hooks (Data Access Layer):**
- Purpose: All Supabase queries and mutations; enforce plan limits; abstract domain logic from UI
- Location: `src/hooks/`
- Contains: `use-links.ts` (CRUD + analytics), `use-profile.ts`, `use-plan-limits.ts`, `use-admin.ts`, `use-autosave.ts`, `use-editor-history.ts`, `use-user-role.ts`, `use-device-fingerprint.ts`, `use-email-captures.ts`, `use-course.ts`, `use-support.ts`
- Depends on: `src/integrations/supabase/client.ts`, `src/contexts/AuthContext.tsx`, `@tanstack/react-query`
- Used by: Pages and feature components

**Contexts:**
- Purpose: Global React state shared across all components
- Location: `src/contexts/`
- Contains: `AuthContext.tsx` (session, user, auth methods), `ThemeContext.tsx` (dark/light mode)
- Depends on: `src/integrations/supabase/client.ts`
- Used by: All pages and hooks that need auth state

**Lib (Pure Utilities):**
- Purpose: Stateless helper functions with no React dependencies
- Location: `src/lib/`
- Contains: `link-mappers.ts` (DB row ↔ SmartLink conversion), `block-utils.ts` (block defaults), `slug-utils.ts` (validation + availability check), `color-utils.ts`, `image-utils.ts`, `storage-utils.ts`, `device-fingerprint.ts`, `protect.ts`, `utils.ts` (Tailwind `cn()`)
- Depends on: `src/types/smart-link.ts`
- Used by: Hooks, pages, editor components

**Supabase Integration:**
- Purpose: Typed Supabase client and generated DB types
- Location: `src/integrations/supabase/`
- Contains: `client.ts` (singleton `supabase` export), `types.ts` (auto-generated `Database` type)
- Depends on: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` env vars
- Used by: All hooks and `AuthContext`

**Domain Types:**
- Purpose: TypeScript source-of-truth for the core domain model
- Location: `src/types/smart-link.ts`
- Contains: `SmartLink`, `SmartLinkButton`, `LinkBlock`, `BlockType`, `SubPage`, all effect interfaces, supporting item types (`FaqItem`, `GalleryImage`, `StatItem`, `ContactItem`, etc.)
- Depends on: Nothing (pure types)
- Used by: Every layer

**Static Data:**
- Purpose: Hardcoded configuration that does not live in the DB
- Location: `src/data/`
- Contains: `templates.ts` (link templates), `plans.ts` (plan definitions and feature lists), `brand-icons.ts`, `mock-links.ts`
- Used by: Pages, editor components

**Supabase Edge Functions:**
- Purpose: Server-side logic that cannot run in the browser
- Location: `supabase/functions/og/`
- Contains: OG image generation endpoint

## Data Flow

**Creating / Editing a SmartLink:**

1. User opens `/links/new` or `/links/:id/edit` → `src/pages/LinkEditor.tsx`
2. `useLink(id)` fetches row from `links` table via Supabase; `rowToSmartLink()` in `src/lib/link-mappers.ts` maps to `SmartLink` domain object
3. `useEditorHistory` (`src/hooks/use-editor-history.ts`) wraps state with undo/redo (max 50 steps)
4. User edits via `BlockEditor`, `ThemePanel`, `EffectsPanel` (all in `src/components/editor/`)
5. `useAutosave` (`src/hooks/use-autosave.ts`) debounces changes (1500ms) and calls `useSaveLink()` mutation
6. `useSaveLink` calls `smartLinkToRow()` to serialize, then upserts to `links` table; invalidates `["links"]` and `["link"]` query keys

**Viewing a Public Link:**

1. Visitor navigates to `/:slug` → `src/pages/PublicLinkPage.tsx`
2. `usePublicLink(slug)` queries `links` table (no auth); calls `get_link_owner_plan` RPC to resolve watermark visibility
3. `rowToSmartLink()` maps DB row including `ownerPlan`
4. `SmartLinkPreview` renders the link with `BlockRenderer` for blocks, `ButtonPreview` for buttons, effects overlaid
5. `recordView(linkId)` fires once (ref guard) inserting into `link_views` table
6. Button clicks call `recordClick(linkId, buttonId)` inserting into `link_clicks` table

**Authentication Flow:**

1. `AuthProvider` calls `supabase.auth.getSession()` on mount and subscribes to `onAuthStateChange`
2. `ProtectedRoute` reads `{ user, loading }` from `useAuth()`; redirects to `/auth` if unauthenticated
3. `AdminRoute` additionally calls `useUserRole()` which queries the `profiles` table for a `role` field; redirects to `/` if not admin
4. OAuth (Google/GitHub) and email/password sign-in are both supported via `signInWithOAuth` and `signIn` in `AuthContext`

**Plan Limits Enforcement:**

1. `usePlanLimits()` (`src/hooks/use-plan-limits.ts`) derives limits from `profile.plan` and current link count
2. Frontend: `canCreateLink` flag gates the create button
3. Backend: `useSaveLink` mutation re-checks plan + count server-side before insert (free: 3, pro: 50, business: unlimited)

## Key Abstractions

**SmartLink (Domain Model):**
- Purpose: Canonical representation of a user's link page — used throughout UI, editor state, preview rendering, and DB serialization
- File: `src/types/smart-link.ts`
- Pattern: Plain TypeScript interface; never mutated directly — always replaced via state setter or history hook

**rowToSmartLink / smartLinkToRow (Mapper Pair):**
- Purpose: Single point of transformation between Supabase DB snake_case rows and camelCase domain objects
- File: `src/lib/link-mappers.ts`
- Pattern: Pure functions called only by `src/hooks/use-links.ts`

**BlockType + LinkBlock (Block System):**
- Purpose: Extensible content block system; each `BlockType` string maps to a specific editor form in `BlockEditor` and a renderer in `BlockRenderer`
- Files: `src/types/smart-link.ts` (type), `src/lib/block-utils.ts` (defaults), `src/components/editor/BlockEditor.tsx` (edit), `src/components/preview/BlockRenderer.tsx` (render)
- Pattern: Discriminated by `type` string; switching on type is the convention for both edit and render paths

**useEditorHistory (Undo/Redo):**
- Purpose: Tracks past/present/future snapshots of the entire `SmartLink` object for undo/redo
- File: `src/hooks/use-editor-history.ts`
- Pattern: Immutable snapshot stack; max 50 entries; `set()` accepts functional updater like React setState

**useAutosave (Debounced Persistence):**
- Purpose: Automatically saves the link after 1500ms of inactivity
- File: `src/hooks/use-autosave.ts`
- Pattern: Serializes SmartLink to JSON, compares to last saved snapshot; exposes `flush()` for manual save on exit

## Entry Points

**Browser Bootstrap:**
- Location: `src/main.tsx`
- Triggers: Browser loads `index.html`, `<script type="module" src="/src/main.tsx">`
- Responsibilities: Call `initProtection()`, mount React root, inject `SpeedInsights`

**App Shell:**
- Location: `src/App.tsx`
- Triggers: Mounted by `src/main.tsx`
- Responsibilities: Provide QueryClient, AuthProvider, ThemeProvider; declare all routes with lazy loading

**Public Link Entry:**
- Location: `src/pages/PublicLinkPage.tsx`
- Triggers: Route `/:slug` or `/:slug/:pageSlug`
- Responsibilities: Fetch link by slug, render `SmartLinkPreview`, record view, manage sub-page modal, inject SEO meta tags

**Dashboard Entry:**
- Location: `src/pages/Dashboard.tsx`
- Triggers: Route `/dashboard` (protected)
- Responsibilities: Show stats overview, template gallery, quick-create flow

**Link Editor Entry:**
- Location: `src/pages/LinkEditor.tsx`
- Triggers: Routes `/links/new` and `/links/:id/edit` (protected)
- Responsibilities: Initialize state from existing link or template, orchestrate editor panels and preview, manage autosave and history

## Error Handling

**Strategy:** Class-based `ErrorBoundary` wraps the entire app; individual data errors surface via `sonner` toast notifications.

**Patterns:**
- `src/components/ErrorBoundary.tsx` catches uncaught render errors app-wide; shows reload prompt
- React Query mutations call `toast.error(err.message)` in `onError` callbacks (see `src/hooks/use-links.ts`)
- Async utilities (e.g., `recordView`, `recordClick`, `saveEmailCapture`) use try/catch with `console.error` — failures are silent to UX
- Auth errors return `{ error }` objects rather than throwing, for caller inspection

## Cross-Cutting Concerns

**Toasts/Notifications:** `sonner` library; imported as `toast` from `"sonner"` throughout hooks and pages. A `<Sonner />` component is mounted in `src/App.tsx`.

**Validation:** Slug validation via `validateSlug` / `checkSlugAvailability` in `src/lib/slug-utils.ts`. No form validation library — inline logic per field.

**Authentication:** `useAuth()` hook from `src/contexts/AuthContext.tsx` is the single access point. Never import `supabase.auth` directly in pages or components.

**Device Fingerprinting:** `useDeviceFingerprint()` is called silently in `src/components/DashboardLayout.tsx` on every authenticated page mount, writing to a `device_fingerprints` table.

**HTML Sanitization:** `dompurify` is used in `src/components/preview/BlockRenderer.tsx` for the `html` block type to sanitize user-provided HTML before rendering.

---

*Architecture analysis: 2026-03-23*
