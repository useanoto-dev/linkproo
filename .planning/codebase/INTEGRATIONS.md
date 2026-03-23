# External Integrations

**Analysis Date:** 2026-03-23

## APIs & External Services

**Backend-as-a-Service:**
- Supabase - Primary backend; provides PostgreSQL database, authentication, file storage, real-time, and edge functions
  - SDK/Client: `@supabase/supabase-js` v2.98
  - Client instantiation: `src/integrations/supabase/client.ts`
  - Type definitions: `src/integrations/supabase/types.ts` (auto-generated, 668 lines)
  - Auth: `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key)
  - Edge functions use: `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

**Performance Monitoring:**
- Vercel Speed Insights - Web performance metrics collection
  - SDK: `@vercel/speed-insights` v2.0
  - Injected globally in `src/main.tsx` via `<SpeedInsights />` component

**Fonts:**
- Google Fonts - Runtime font loading for both app UI and user-customized link pages
  - Loaded dynamically in `src/components/editor/ThemePanel.tsx` (editor preview)
  - Loaded dynamically in `src/components/preview/preview-utils.ts` (public link pages)
  - No API key required; uses public CSS2 API endpoint

**Mapping:**
- Google Maps Embed API - Embedded maps in link page "location" blocks
  - No API key required; uses public embed URL format
  - URL construction in `src/components/preview/preview-utils.ts` and `src/components/preview/BlockRenderer.tsx`
  - Supports: direct embed URLs, coordinate-based maps, place-name search

**Payment Processing (planned/referenced):**
- Stripe - Referenced in `src/pages/PlansPage.tsx` as the payment processor
  - Status: UI-only mention — no Stripe SDK installed, no integration code present
  - Stripe SDK (`@stripe/stripe-js` or similar) is NOT in `package.json`
  - Plan upgrades currently show plan info but have no functional checkout flow

## Data Storage

**Databases:**
- Supabase PostgreSQL - Primary relational database
  - Connection: managed via Supabase client (no direct connection string in frontend)
  - Client: `supabase` from `src/integrations/supabase/client.ts`
  - ORM: None — raw Supabase JS client with typed queries
  - Migrations: `supabase/migrations/` (40+ migration files)

**Database Tables (from `src/integrations/supabase/types.ts`):**
  - `links` - Core link pages with all customization fields (slug, blocks, buttons, theme, hero image, etc.)
  - `profiles` - User profile data (display_name, avatar_url, company, plan)
  - `user_roles` - Role-based access control (`app_role` enum: `"admin" | "user"`)
  - `link_views` - Analytics: page view events (link_id, device, country, referrer, viewed_at)
  - `link_clicks` - Analytics: button click events (link_id, button_id, device, country, referrer)
  - `email_captures` - Email leads collected via capture blocks on link pages
  - `course_modules` - Video course module metadata
  - `course_lessons` - Video course lesson metadata with video_url
  - `lesson_materials` - Downloadable materials attached to lessons
  - `lesson_progress` - Per-user lesson completion tracking
  - `support_contacts` - Admin-managed support channel entries
  - `support_faqs` - Admin-managed FAQ entries

**Database Functions (RPC):**
  - `get_admin_users` - Returns user list with profile data for admin panel
  - `get_course_modules` - Returns full course structure as JSON
  - `get_user_links_with_stats` - Returns user links joined with aggregated view/click counts
  - `has_role` - Role check helper used in RLS policies
  - `is_link_owner` - Ownership check for RLS policies
  - `get_link_owner_plan` - Returns plan tier for a given link (used for watermark enforcement)
  - `admin_delete_user` - Admin-only function to delete a user and their data
  - `get_admin_users_with_device` - Extended admin users view including device fingerprint data

**File Storage:**
- Supabase Storage - Image uploads for hero images, logos, and avatars
  - Bucket: `link-images`
  - Upload utility: `src/lib/storage-utils.ts`
  - Max file size: 5MB enforced client-side
  - Supported formats: PNG, JPG, WEBP
  - Path pattern: `{userId}/{folder}/{timestamp}.{ext}`
  - Features: retry on failure (3 attempts), automatic deletion of replaced images, public URL retrieval

**Caching:**
- TanStack React Query in-memory cache - All Supabase query results cached with `staleTime: 2min`, `gcTime: 10min`

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Handles all authentication flows
  - Implementation: `src/contexts/AuthContext.tsx`
  - Session storage: `localStorage` (configured in `src/integrations/supabase/client.ts`)
  - Auto token refresh: enabled
  - Supported methods:
    - Email + password (`signInWithPassword`, `signUp`)
    - OAuth: Google and GitHub (`signInWithOAuth`)
    - Password reset via email (`resetPasswordForEmail`)
  - Auth state managed via `supabase.auth.onAuthStateChange` subscription
  - Protected routes: `src/components/ProtectedRoute.tsx`
  - Admin routes: `src/components/AdminRoute.tsx`

**Authorization:**
- Role-based access control via `user_roles` table and `app_role` enum (`admin` | `user`)
- Roles checked via `has_role()` database function used in RLS policies
- Frontend role check: `src/hooks/use-user-role.ts`
- Plan-based feature limits: `src/hooks/use-plan-limits.ts`
  - Plans: `free` (3 links), `pro` (50 links), `business` (unlimited), `admin` (unlimited)

**Device Fingerprinting:**
- Custom client-side implementation: `src/lib/device-fingerprint.ts`
- Collects: user-agent, screen dimensions, color depth, timezone, hardware concurrency, canvas render, WebGL renderer
- Hash algorithm: djb2-like double hash returning base-36 string
- Stored to Supabase in `device_fingerprints` table (migration `20260324000001_device_fingerprints.sql`)
- Hook: `src/hooks/use-device-fingerprint.ts`
- Purpose: multi-account abuse detection

## Edge Functions

**`og` function (`supabase/functions/og/index.ts`):**
- Purpose: Server-side Open Graph / social sharing metadata for public link pages
- Trigger: HTTP GET with `?slug=` query param
- Behavior: Queries `links` table, returns HTML with OG tags + meta-refresh redirect to SPA
- Auth: Uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
- CORS: Restricted to `PUBLIC_DOMAIN` env var
- Cache: `public, max-age=300` (5 minutes)
- Runtime: Deno (Supabase Edge Functions environment)

## Monitoring & Observability

**Performance:**
- Vercel Speed Insights - Injected in `src/main.tsx`; reports Core Web Vitals to Vercel dashboard

**Error Tracking:**
- None currently integrated
- Comment in `src/components/preview/BlockRenderer.tsx` line 36 notes: "Em produção: integrar Sentry aqui"
- `console.error` used for error logging throughout hooks (e.g., `src/hooks/use-links.ts`)

**Logs:**
- `console.error` and `console.warn` used directly in hooks and utilities (no structured logging library)

## CI/CD & Deployment

**Hosting:**
- Vercel - Production deployment target
  - Config: `vercel.json` (SPA rewrites, Vite framework preset)
  - Build command: `npm run build`
  - Output directory: `dist`

**CI Pipeline:**
- None detected (no `.github/workflows/`, `.gitlab-ci.yml`, or similar)

**Database Migrations:**
- Supabase CLI migrations in `supabase/migrations/`
- Applied manually via Supabase CLI or Supabase dashboard

## Environment Configuration

**Required frontend env vars:**
- `VITE_SUPABASE_URL` - Supabase project REST URL (e.g., `https://{project-id}.supabase.co`)
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon/public key
- `VITE_SUPABASE_PROJECT_ID` - Project ID (in `.env.example`, usage not verified in code)

**Required edge function env vars (Supabase-managed):**
- `SUPABASE_URL` - Injected automatically by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Injected automatically by Supabase
- `PUBLIC_DOMAIN` - Must be set manually (e.g., `https://yourdomain.com`); used for CORS and OG redirect URLs

**Secrets location:**
- `.env` file at project root (gitignored)
- Supabase Edge Function secrets managed via Supabase dashboard or CLI

## Webhooks & Callbacks

**Incoming:**
- None detected (no webhook endpoint handlers in source)

**Outgoing:**
- Auth email callbacks: password reset redirects to `{origin}/reset-password` (configured in `src/contexts/AuthContext.tsx`)
- OAuth callbacks: redirects to `window.location.origin` after OAuth flow

## Social Platform Integrations (Link Blocks)

The link editor supports embedding/linking to social platforms as content blocks — these are user-configured links, not API integrations:

- WhatsApp, Instagram, TikTok, YouTube, Telegram, Email, Phone - SVG icons and brand colors defined in `src/data/brand-icons.ts`
- Embedded YouTube/video iframes supported in `BlockRenderer.tsx`
- Google Maps embed blocks supported in `BlockRenderer.tsx` and `preview-utils.ts`

---

*Integration audit: 2026-03-23*
