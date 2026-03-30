# Technology Stack

**Analysis Date:** 2026-03-28

## Languages

**Primary:**
- TypeScript 5.8 - All application code under `src/`
- TypeScript (Deno) - Supabase Edge Functions under `supabase/functions/`

**Secondary:**
- CSS - Design token layer in `src/index.css` (CSS custom properties / HSL variables)
- SQL - Database migrations in `supabase/migrations/`

## Runtime

**Environment:**
- Browser (SPA) - React app served as static files
- Deno - Supabase Edge Functions runtime (`supabase/functions/og/index.ts`)

**Node (build-time only):**
- No `.nvmrc` or `.node-version` found; inferred from Vite 5 + TypeScript 5.8 requirements (Node 18+)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (present via standard npm install)

## Frameworks

**Core:**
- React 18.3 - UI rendering, all components in `src/components/` and `src/pages/`
- React Router DOM 6.30 - Client-side routing, configured in `src/App.tsx`
- Vite 5.4 - Build tool and dev server, configured in `vite.config.ts`

**UI Component Layer:**
- shadcn/ui (via Radix UI primitives) - All low-level UI atoms in `src/components/ui/`
  - Full Radix UI suite installed: accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, popover, select, slider, switch, tabs, toast, tooltip, and more
- Tailwind CSS 3.4 - Utility styling, configured in `tailwind.config.ts`
- Framer Motion 12.34 - Animations and page transitions throughout editor and public pages

**Testing:**
- Vitest 3.2 - Test runner, configured via `tsconfig.app.json` (vitest/globals)
- @testing-library/react 16 - Component testing utilities
- @testing-library/jest-dom 6.6 - DOM matchers
- jsdom 20 - DOM environment for tests

**Build/Dev:**
- @vitejs/plugin-react-swc 3.11 - React transform using SWC (faster than Babel)
- PostCSS 8.5 - CSS processing, configured in `postcss.config.js`
- Autoprefixer 10.4 - CSS vendor prefixes
- TypeScript ESLint 8.38 - Linting, configured in `eslint.config.js`

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` ^2.98 - Database, auth, storage, and edge function calls. Client initialized at `src/integrations/supabase/client.ts`
- `@tanstack/react-query` ^5.83 - Server state management. QueryClient configured in `src/App.tsx` with staleTime=2min, gcTime=10min
- `framer-motion` ^12.34 - Animation engine used for page transitions (`src/components/PageTransition.tsx`) and block entry animations
- `react-router-dom` ^6.30 - SPA routing with lazy-loaded pages

**Drag & Drop:**
- `@dnd-kit/core` ^6.3, `@dnd-kit/sortable` ^10.0, `@dnd-kit/utilities` ^3.2 - Block reordering in the link editor

**Canvas Editor:**
- `react-moveable` ^0.56 - Free-position drag/resize/rotate for canvas-mode blocks. Used in `src/components/preview/CanvasPreview.tsx`

**Forms & Validation:**
- `react-hook-form` ^7.61 - Form state management
- `@hookform/resolvers` ^3.10 - Zod adapter for react-hook-form
- `zod` ^3.25 - Schema validation

**UI Utilities:**
- `lucide-react` ^0.462 - Icon library
- `react-icons` ^5.6 - Additional brand icons (used where lucide lacks coverage)
- `class-variance-authority` ^0.7 - Variant-based className generation (shadcn/ui pattern)
- `clsx` ^2.1 + `tailwind-merge` ^2.6 - Combined via `cn()` in `src/lib/utils.ts`
- `sonner` ^1.7 - Toast notifications (secondary toaster)
- `next-themes` ^0.3 - Theme provider wrapping

**Media & Content:**
- `react-easy-crop` ^5.5 - Image cropping in hero/logo upload flows
- `qrcode.react` ^4.2 - QR code generation for link sharing
- `dompurify` ^3.3 - HTML sanitization for the `html` block type
- `recharts` ^2.15 - Analytics charts in `src/pages/AnalyticsPage.tsx` and `src/pages/admin/AdminAnalyticsPage.tsx`
- `embla-carousel-react` ^8.6 - Carousel block rendering
- `date-fns` ^3.6 - Date formatting in analytics
- `react-day-picker` ^8.10 - Date picker component

**Observability:**
- `@vercel/speed-insights` ^2.0 - Injected in `src/main.tsx` via `<SpeedInsights />`

**Infrastructure:**
- `tailwindcss-animate` ^1.0.7 - Tailwind keyframe animation utilities (accordion transitions, float, pulse-glow)
- `@tailwindcss/typography` ^0.5 - Prose styles for rich-text blocks

## Configuration

**Environment:**
- Configured via `.env` file (not committed)
- Required variables:
  - `VITE_SUPABASE_URL` - Supabase project URL
  - `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key
- Client validates both on startup with a hard throw if missing (`src/integrations/supabase/client.ts`)

**Build:**
- `vite.config.ts` - Main build config
  - Dev server: `host: "::"`, `port: 8080`, HMR overlay disabled
  - Path alias: `@` → `./src`
  - Manual chunk splitting: `vendor-react`, `vendor-query`, `vendor-ui`, `vendor-supabase`, `vendor-dnd`
- `tailwind.config.ts` - Tailwind config
  - Dark mode: `class`-based
  - Fonts: Inter (sans), Space Grotesk (display)
  - Colors: all mapped to CSS custom properties (`hsl(var(--...))`)
  - Custom tokens: `surface`, `glow`, `success`, `warning`, `sidebar.*`
  - Custom keyframes: `float`, `pulse-glow`, `accordion-down/up`
- `tsconfig.app.json` - Strict TypeScript, ES2020 target, `@/*` path alias
- `vercel.json` - SPA rewrite (`/*` → `/index.html`), Vite framework preset
- `postcss.config.js` - Standard tailwindcss + autoprefixer pipeline

**Design Tokens:**
- `src/index.css` - Full HSL CSS variable set for light mode ("Nexus" theme) and dark mode
  - Primary: violet `262 83% 58%`
  - Background: warm off-white `48 20% 97%`
  - Glass surface tokens: `--glass-bg`, `--glass-border`
  - Editor-specific tokens: `--editor-bg`, `--editor-surface`, `--editor-border`

## Platform Requirements

**Development:**
- Node 18+ (implied by Vite 5 + TypeScript 5.8)
- npm

**Production:**
- Vercel (static hosting, project ID `prj_5JzGRP8CHjspgRVtl37AUB9ZGsAR`, project name `linkpro`)
- Supabase (database, auth, storage, edge functions)

---

*Stack analysis: 2026-03-28*
