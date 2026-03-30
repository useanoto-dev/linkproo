# Codebase Structure

**Analysis Date:** 2026-03-28

## Directory Layout

```
Sistema Link PRO/
├── src/
│   ├── main.tsx                    # React root mount + SpeedInsights
│   ├── App.tsx                     # Router, providers, route definitions
│   ├── App.css                     # Global app styles
│   ├── index.css                   # Tailwind base + CSS variables
│   ├── vite-env.d.ts               # Vite env type declarations
│   │
│   ├── pages/                      # Full-screen page components (lazy-loaded)
│   │   ├── Dashboard.tsx
│   │   ├── LinksPage.tsx
│   │   ├── LinkEditor.tsx          # Main editor orchestrator
│   │   ├── PublicLinkPage.tsx      # Public bio-link viewer
│   │   ├── AnalyticsPage.tsx
│   │   ├── PlansPage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── VideoaulasPage.tsx
│   │   ├── SupportPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── LandingPage.tsx
│   │   ├── NotFound.tsx
│   │   └── admin/                  # Admin-only pages (AdminRoute guard)
│   │       ├── AdminDashboardPage.tsx
│   │       ├── AdminUsersPage.tsx
│   │       ├── AdminAnalyticsPage.tsx
│   │       ├── AdminVideoaulasPage.tsx
│   │       └── AdminSupportPage.tsx
│   │
│   ├── components/
│   │   ├── DashboardLayout.tsx     # Shell with sidebar for authenticated pages
│   │   ├── AppSidebar.tsx          # Navigation sidebar
│   │   ├── ProtectedRoute.tsx      # Auth guard (redirects to /auth)
│   │   ├── AdminRoute.tsx          # Admin guard
│   │   ├── ErrorBoundary.tsx       # Top-level error boundary
│   │   ├── PageTransition.tsx      # Framer Motion page wrapper
│   │   ├── SmartLinkPreview.tsx    # Full bio-link page renderer
│   │   ├── SubPagePreview.tsx      # Sub-page preview panel
│   │   ├── SubPageModal.tsx        # Sub-page modal overlay
│   │   ├── SmartLinkCard.tsx       # Link card in LinksPage
│   │   ├── NavLink.tsx             # Active-aware nav link
│   │   ├── OnboardingDialog.tsx    # First-link creation dialog
│   │   ├── ConfirmDialog.tsx       # Generic confirm modal
│   │   ├── WhatsAppFloat.tsx       # Floating WhatsApp button overlay
│   │   ├── SnowEffect.tsx          # Particle background effect
│   │   ├── BubblesEffect.tsx       # Particle background effect
│   │   ├── FirefliesEffect.tsx     # Particle background effect
│   │   ├── MatrixEffect.tsx        # Particle background effect
│   │   ├── StarsEffect.tsx         # Particle background effect
│   │   ├── BgHtmlEffect.tsx        # Custom HTML background effect
│   │   │
│   │   ├── editor/                 # Editor-specific components
│   │   │   ├── BlockEditor.tsx     # Renders BusinessInfoPanel + SortableList
│   │   │   ├── ElementsSidebar.tsx # Block type catalog (drag or click to add)
│   │   │   ├── ThemePanel.tsx      # Colors, fonts, header style
│   │   │   ├── EffectsPanel.tsx    # Background effects controls
│   │   │   ├── SubPageEditor.tsx   # Sub-page editing panel
│   │   │   ├── DeviceFrame.tsx     # Phone shell (iPhone 15 / Pixel 8 / Galaxy)
│   │   │   ├── CanvasToolbar.tsx   # Canvas mode top toolbar
│   │   │   ├── CanvasPropertiesPanel.tsx # Canvas element position/size panel
│   │   │   ├── ButtonBlockEditor.tsx     # Button editing form
│   │   │   ├── CropEditor.tsx      # Image crop tool
│   │   │   ├── ImageUploader.tsx   # Supabase Storage image uploader
│   │   │   └── blocks/             # SortableList + per-type block editors
│   │   │       ├── SortableList.tsx        # dnd-kit unified drag list
│   │   │       ├── SortableButton.tsx      # Single draggable button row
│   │   │       ├── BusinessInfoPanel.tsx   # Name, tagline, logo, hero fields
│   │   │       ├── TextBlockEditor.tsx     # text / cta / header blocks
│   │   │       ├── MediaBlockEditor.tsx    # image / video / spotify / map / gallery / carousel blocks
│   │   │       ├── LayoutBlockEditor.tsx   # spacer / separator / hero / banner blocks
│   │   │       ├── InteractiveBlockEditor.tsx # countdown / email-capture / product / animated-button blocks
│   │   │       ├── ListBlockEditor.tsx     # faq / stats / testimonial / contacts / badges blocks
│   │   │       ├── BlockErrorBoundary.tsx  # Per-block error isolation
│   │   │       ├── unified-items.ts        # UnifiedItem merge logic
│   │   │       └── constants.ts            # BLOCK_LABELS display names
│   │   │
│   │   ├── preview/                # Shared rendering components (editor + public)
│   │   │   ├── BlockRenderer.tsx   # Switch-dispatches BlockType to visual output
│   │   │   ├── ButtonPreview.tsx   # Single SmartLinkButton renderer
│   │   │   ├── CanvasPreview.tsx   # Canvas mode with react-moveable
│   │   │   ├── AnimatedButtonBlock.tsx  # Animated button block renderer
│   │   │   ├── CountdownBlock.tsx  # Countdown timer block
│   │   │   ├── FaqAccordionItem.tsx     # FAQ accordion item
│   │   │   ├── FloatingEmoji.tsx   # Floating emoji particle
│   │   │   └── preview-utils.ts    # Pure helpers: embeds, fonts, entry animations
│   │   │
│   │   ├── ui/                     # shadcn/ui primitives (do not edit directly)
│   │   ├── course/                 # Course/videoaulas components
│   │   └── support/                # Support ticket components
│   │
│   ├── contexts/                   # React Context providers
│   │   ├── AuthContext.tsx         # Supabase session, user, auth methods
│   │   └── ThemeContext.tsx        # light/dark toggle, persisted to localStorage
│   │
│   ├── hooks/                      # React Query wrappers + custom hooks
│   │   ├── use-links.ts            # CRUD for links + analytics helpers
│   │   ├── use-autosave.ts         # Debounced background save
│   │   ├── use-editor-history.ts   # Undo/redo stack (max 50)
│   │   ├── use-profile.ts          # User profile from profiles table
│   │   ├── use-plan-limits.ts      # Plan-based link count limits
│   │   ├── use-user-role.ts        # Admin role check
│   │   ├── use-device-fingerprint.ts  # Silent device tracking
│   │   ├── use-mobile.tsx          # Responsive breakpoint
│   │   ├── use-admin.ts            # Admin-specific queries
│   │   ├── use-course.ts           # Course module queries
│   │   ├── use-email-captures.ts   # Email capture form submissions
│   │   ├── use-support.ts          # Support tickets
│   │   └── use-toast.ts            # shadcn toast utility
│   │
│   ├── lib/                        # Pure utilities, no React
│   │   ├── link-mappers.ts         # rowToSmartLink / smartLinkToRow
│   │   ├── block-utils.ts          # createBlockDefaults(type)
│   │   ├── slug-utils.ts           # validateSlug, checkSlugAvailability
│   │   ├── color-utils.ts          # Background gradient parsing
│   │   ├── image-utils.ts          # Image processing helpers
│   │   ├── storage-utils.ts        # Supabase Storage upload/delete
│   │   ├── device-fingerprint.ts   # Fingerprint collection logic
│   │   ├── protect.ts              # initProtection() for public pages
│   │   └── utils.ts                # cn() class merger (shadcn)
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts           # Supabase singleton (typed with Database)
│   │       └── types.ts            # Generated Supabase types (partially stale)
│   │
│   ├── types/
│   │   └── smart-link.ts           # SmartLink, SmartLinkButton, LinkBlock, BlockType, SubPage, effects
│   │
│   ├── data/
│   │   ├── templates.ts            # Pre-built link templates
│   │   ├── plans.ts                # Plan definitions and feature lists
│   │   ├── brand-icons.ts          # Social platform icon catalog
│   │   └── mock-links.ts           # Dev mock data
│   │
│   └── test/                       # Test utilities / setup
│
├── supabase/
│   ├── migrations/                 # SQL migration files (chronological)
│   └── functions/
│       └── og/                     # Edge function for Open Graph image generation
│
├── public/                         # Static assets
├── dist/                           # Build output (generated, not committed to source)
├── .planning/                      # GSD planning documents
│   ├── codebase/                   # Codebase analysis (this directory)
│   └── phases/                     # Implementation phase plans
├── docs/                           # Additional documentation
├── referencias sistema/            # Design references
└── node_modules/                   # Dependencies (not committed)
```

## Directory Purposes

**`src/pages/`:**
- Purpose: Full-screen views, one file per route
- Contains: Page components that compose features using hooks and layout components
- Key files: `LinkEditor.tsx` (largest, ~500 lines, editor orchestrator), `PublicLinkPage.tsx` (public viewer)

**`src/components/editor/`:**
- Purpose: All components exclusively used by `LinkEditor`
- Contains: Panels, sidebars, device frame, canvas tools, block editors
- Key files: `BlockEditor.tsx` (entry point), `DeviceFrame.tsx` (phone shell), `CanvasPropertiesPanel.tsx`

**`src/components/editor/blocks/`:**
- Purpose: The drag-reorder list and all per-type block editing forms
- Contains: `SortableList.tsx` (dnd-kit orchestrator), five group editors, shared constants
- Key files: `SortableList.tsx`, `unified-items.ts`, `constants.ts`

**`src/components/preview/`:**
- Purpose: Visual renderers shared between editor preview and the live public page
- Contains: `BlockRenderer.tsx` (dispatches all 24 block types), `CanvasPreview.tsx`, utilities
- Key files: `BlockRenderer.tsx`, `CanvasPreview.tsx`, `preview-utils.ts`

**`src/components/ui/`:**
- Purpose: shadcn/ui component primitives
- Contains: Button, Card, Dialog, Input, Skeleton, Sidebar, Tooltip, Sonner, etc.
- Generated: Installed via shadcn CLI — do not hand-edit; update via CLI

**`src/hooks/`:**
- Purpose: All data fetching and stateful logic extracted from components
- Contains: React Query wrappers for Supabase; editor-specific hooks
- Key files: `use-links.ts` (primary data layer), `use-autosave.ts`, `use-editor-history.ts`

**`src/lib/`:**
- Purpose: Pure TypeScript utilities with zero React dependencies
- Contains: Mappers, factories, validators, utils
- Key files: `link-mappers.ts` (critical serialization boundary), `block-utils.ts`

**`src/integrations/supabase/`:**
- Purpose: Singleton Supabase client + generated types
- Contains: `client.ts` (one import, used everywhere), `types.ts`
- Note: `types.ts` is partially stale (missing columns added in recent migrations). Prefer `SmartLinkRow` in `link-mappers.ts` for DB shape.

**`src/contexts/`:**
- Purpose: App-wide shared state that cannot be server-cached
- Contains: `AuthContext` (session), `ThemeContext` (light/dark)

**`src/types/`:**
- Purpose: Canonical domain model
- Contains: `smart-link.ts` — the only type file; all domain types live here

**`src/data/`:**
- Purpose: Static application data (templates, plans, icons)
- Contains: Read-only arrays and objects; no runtime mutation
- Key files: `templates.ts` (pre-built link templates selectable in Dashboard)

**`supabase/migrations/`:**
- Purpose: Database schema evolution
- Contains: Timestamped SQL files applied by Supabase CLI
- Generated: No — hand-authored; must be committed

**`supabase/functions/og/`:**
- Purpose: Edge function for generating Open Graph preview images
- Generated: No — hand-authored Deno function

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React root mount
- `src/App.tsx`: Route definitions and provider tree

**Domain Types:**
- `src/types/smart-link.ts`: All domain interfaces and type unions

**Supabase Client:**
- `src/integrations/supabase/client.ts`: Import as `import { supabase } from "@/integrations/supabase/client"`

**Data Mapping:**
- `src/lib/link-mappers.ts`: `rowToSmartLink()` and `smartLinkToRow()` — all DB/domain conversions go here

**Block Factory:**
- `src/lib/block-utils.ts`: `createBlockDefaults(type, order, extraDefaults?)` — use to create new blocks

**Editor Orchestrator:**
- `src/pages/LinkEditor.tsx`: All editor state; start here when modifying editor behavior

**Public Renderer:**
- `src/components/SmartLinkPreview.tsx`: The rendered bio-link page (shared by editor preview and live public page)
- `src/components/preview/BlockRenderer.tsx`: Add new block visual renderers here

**Auth:**
- `src/contexts/AuthContext.tsx`: Auth state and methods
- `src/components/ProtectedRoute.tsx`: Route guard component

**Analytics:**
- `src/hooks/use-links.ts`: `recordView()` and `recordClick()` at bottom of file

## Naming Conventions

**Files:**
- Pages: PascalCase, descriptive noun + "Page" suffix: `LinksPage.tsx`, `AnalyticsPage.tsx` (except `Dashboard.tsx`, `LinkEditor.tsx`, `PublicLinkPage.tsx`)
- Components: PascalCase noun or noun phrase: `SmartLinkPreview.tsx`, `DeviceFrame.tsx`
- Hooks: kebab-case with `use-` prefix: `use-links.ts`, `use-autosave.ts`, `use-editor-history.ts`
- Utilities: kebab-case noun: `link-mappers.ts`, `block-utils.ts`, `color-utils.ts`
- Types file: `smart-link.ts` (kebab-case)
- Constants: kebab-case: `constants.ts`

**Directories:**
- Lowercase kebab-case for all: `components/editor/blocks/`, `integrations/supabase/`
- Feature grouping over technical grouping: `preview/` groups renderers, `editor/` groups editor tools

**Exports:**
- Pages: `export default` (required for lazy loading)
- Components: named exports (`export function ComponentName`)
- Hooks: named exports (`export function useHookName`)
- Lib utilities: named exports
- Contexts: named exports for provider and `useX` hook

## Where to Add New Code

**New Block Type:**
1. Add type literal to `BlockType` union in `src/types/smart-link.ts`
2. Add fields to `LinkBlock` interface in `src/types/smart-link.ts`
3. Add defaults to `createBlockDefaults` switch in `src/lib/block-utils.ts`
4. Add visual renderer case to `BlockRenderer` switch in `src/components/preview/BlockRenderer.tsx`
5. Add editor form to the appropriate group editor in `src/components/editor/blocks/` (or create a new group editor)
6. Add to `categories` array in `src/components/editor/ElementsSidebar.tsx`
7. Add label to `BLOCK_LABELS` in `src/components/editor/blocks/constants.ts`
8. Add canvas height default to `getDefaultHeight` in `src/components/preview/CanvasPreview.tsx`
9. Add DB column(s) via new migration in `supabase/migrations/`
10. Update `SmartLinkRow` interface and `rowToSmartLink`/`smartLinkToRow` in `src/lib/link-mappers.ts`

**New Protected Page:**
1. Create `src/pages/MyPage.tsx` with `export default function MyPage()`
2. Add lazy import in `src/App.tsx`
3. Add route wrapped in `<ProtectedRoute><PageTransition>` in `AppRoutes`
4. Add nav item to `mainItems` or appropriate group in `src/components/AppSidebar.tsx`

**New Admin Page:**
1. Create `src/pages/admin/AdminMyPage.tsx`
2. Add lazy import and route wrapped in `<AdminRoute>` in `src/App.tsx`
3. Add to `adminItems` in `src/components/AppSidebar.tsx`

**New Data Hook:**
- Create `src/hooks/use-my-feature.ts`
- Use `useQuery` for reads, `useMutation` for writes
- Always gate on `!!user` with `enabled` option
- Use `queryClient.invalidateQueries` in `onSuccess` to refresh dependent data

**New Utility Function:**
- Pure function (no React): `src/lib/my-utils.ts`
- Supabase-dependent: add to relevant existing file in `src/lib/` or `src/hooks/`

**New shadcn Component:**
- Install via `npx shadcn@latest add component-name`
- Output goes to `src/components/ui/` — do not hand-edit

## Special Directories

**`dist/`:**
- Purpose: Vite production build output
- Generated: Yes
- Committed: No (in `.gitignore`)

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes
- Committed: No

**`.planning/`:**
- Purpose: GSD planning documents (phases, codebase analysis)
- Generated: By GSD commands
- Committed: Yes

**`supabase/migrations/`:**
- Purpose: Database schema history
- Generated: No (hand-authored)
- Committed: Yes — required for Supabase CLI to apply schema

**`supabase/functions/`:**
- Purpose: Supabase Edge Functions (Deno)
- Generated: No
- Committed: Yes

**`src/components/ui/`:**
- Purpose: shadcn/ui primitive components
- Generated: Via shadcn CLI
- Committed: Yes — these are owned source files once added

**`referencias sistema/`:**
- Purpose: Design reference screenshots/documents
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-03-28*
