# Technology Stack

**Analysis Date:** 2026-03-23

## Languages

**Primary:**
- TypeScript 5.8 - All application source code in `src/`
- TSX - React component files throughout `src/components/`, `src/pages/`

**Secondary:**
- TypeScript (Deno) - Supabase Edge Functions in `supabase/functions/`
- SQL - Database migrations in `supabase/migrations/`
- CSS - Global styles in `src/index.css`, `src/App.css`

## Runtime

**Environment:**
- Browser (SPA) - Primary runtime target
- Deno - Edge Function runtime for `supabase/functions/og/index.ts`

**Package Manager:**
- npm (primary — `package-lock.json` present)
- bun also present (`bun.lock` present)
- Lockfile: both `package-lock.json` and `bun.lock` present

## Frameworks

**Core:**
- React 18.3 - UI framework; entry at `src/main.tsx`, root at `src/App.tsx`
- React Router DOM 6.30 - Client-side routing with lazy-loaded pages; configured in `src/App.tsx`
- TanStack React Query 5.83 - Server state and caching; `QueryClient` configured in `src/App.tsx` with `staleTime: 2min`, `gcTime: 10min`

**UI Component System:**
- shadcn/ui - Component library built on Radix UI primitives; config at `components.json`
- Radix UI - Full suite of headless primitives (26 packages) listed in `package.json`
- Tailwind CSS 3.4 - Utility-first styling; config at `tailwind.config.ts`
- tailwindcss-animate - Animation plugin for accordion and transition classes
- Framer Motion 12.34 - Page and element animations; used in landing, editor, and plan pages
- class-variance-authority + clsx + tailwind-merge - Variant and class composition utilities

**Forms:**
- React Hook Form 7.61 - Form state management
- Zod 3.25 - Schema validation; used with `@hookform/resolvers`

**Drag and Drop:**
- @dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities 6.x/10.x - Block and button reordering in link editor; `src/components/editor/`

**Testing:**
- Vitest 3.2 - Test runner; config at `vitest.config.ts`
- @testing-library/react 16.0 + @testing-library/jest-dom 6.6 - Component testing
- jsdom 20 - Browser environment simulation for tests
- Test files located in `src/test/`

**Build/Dev:**
- Vite 5.4 - Bundler and dev server; config at `vite.config.ts`
- @vitejs/plugin-react-swc 3.11 - SWC-powered React transform (faster than Babel)
- PostCSS 8.5 + Autoprefixer - CSS processing; config at `postcss.config.js`
- TypeScript ESLint 8.38 + ESLint 9.32 - Linting; config at `eslint.config.js`

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.98 - Database, auth, storage, and edge function client; `src/integrations/supabase/client.ts`
- `react-router-dom` 6.30 - SPA routing with `/:slug` public link pattern
- `@tanstack/react-query` 5.83 - All data fetching via custom hooks in `src/hooks/`
- `zod` 3.25 - Runtime validation of forms and data shapes

**Infrastructure:**
- `@vercel/speed-insights` 2.0 - Performance monitoring injected in `src/main.tsx`
- `dompurify` 3.3 - HTML sanitization for user-provided content
- `framer-motion` 12.34 - Animation system used across landing, editor, and public pages
- `lucide-react` 0.462 - Icon set used throughout the application
- `react-icons` 5.6 - Additional icon set

**Feature Libraries:**
- `qrcode.react` 4.2 - QR code generation for link sharing
- `react-easy-crop` 5.5 - Image cropping in profile/hero image upload flows
- `recharts` 2.15 - Analytics charts in `src/pages/AnalyticsPage.tsx`
- `date-fns` 3.6 - Date formatting for analytics and timestamps
- `embla-carousel-react` 8.6 - Carousel component
- `sonner` 1.7 - Toast notifications (secondary; primary via Radix toast)
- `next-themes` 0.3 - Dark/light theme management; wraps `src/contexts/ThemeContext.tsx`
- `@dnd-kit` suite - Drag-and-drop block/button ordering in the link editor
- `input-otp` 1.4 - OTP input component
- `cmdk` 1.1 - Command palette component
- `react-day-picker` 8.10 - Date picker component
- `vaul` 0.9 - Drawer component

## Configuration

**Environment:**
- Configured via `.env` file (present but not committed; template at `.env.example`)
- Required variables:
  - `VITE_SUPABASE_URL` - Supabase project URL
  - `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon/public key
  - `VITE_SUPABASE_PROJECT_ID` - Project ID (referenced in example)
- Edge function env vars (Supabase-managed): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_DOMAIN`
- Validation at startup: `src/integrations/supabase/client.ts` throws if vars are missing

**Build:**
- `vite.config.ts` - Manual chunks for vendor splitting: `vendor-react`, `vendor-query`, `vendor-ui`, `vendor-supabase`, `vendor-dnd`
- `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json` - Project references setup
- `tsconfig.app.json` - Strict mode partially enabled (`noImplicitAny: true`, `strict: false`, `noUnusedLocals: true`)
- Path alias `@` maps to `./src/` in both Vite and TypeScript configs
- `vercel.json` - SPA rewrite rule (`/*` → `/index.html`) for client-side routing

## Platform Requirements

**Development:**
- Node.js (LTS recommended; no `.nvmrc` or `.node-version` present)
- npm or bun for package management
- Dev server on port 8080 (`vite.config.ts`)

**Production:**
- Vercel hosting (configured in `vercel.json`, `@vercel/speed-insights` installed)
- Supabase project for backend (database + auth + storage + edge functions)
- Brotli/gzip compression handled automatically by Vercel CDN

## Fonts

- Inter (body) and Space Grotesk (display headings) — loaded at runtime via Google Fonts
- Dynamic font loading for user-customized link pages in `src/components/editor/ThemePanel.tsx` and `src/components/preview/preview-utils.ts`

---

*Stack analysis: 2026-03-23*
