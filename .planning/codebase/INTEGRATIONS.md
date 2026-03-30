# External Integrations

**Analysis Date:** 2026-03-28

## APIs & External Services

**Backend-as-a-Service:**
- Supabase - Core platform. Provides PostgreSQL database, auth, file storage, and edge function hosting.
  - SDK/Client: `@supabase/supabase-js` ^2.98
  - Client singleton: `src/integrations/supabase/client.ts`
  - Type definitions: `src/integrations/supabase/types.ts` (auto-generated, Postgrest v14.1)
  - Auth: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (env vars)

**Performance Monitoring:**
- Vercel Speed Insights - Injected globally in `src/main.tsx` via `<SpeedInsights />`
  - SDK: `@vercel/speed-insights` ^2.0
  - No configuration required; auto-reports to Vercel dashboard for project `linkpro`

## Data Storage

**Databases:**
- PostgreSQL (via Supabase)
  - Connection: managed by Supabase SDK (env vars `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`)
  - Client: `createClient<Database>()` with full TypeScript generics
  - Schema managed via migrations in `supabase/migrations/` (20 migrations as of analysis date)
  - Custom RPC functions: `get_admin_users`, `get_course_modules`, `get_user_links_with_stats`, `has_role`, `is_link_owner`

**Database Tables:**
- `links` - Core entity: slug, blocks (JSON), buttons (JSON), pages (JSON), theme fields, hero/logo images, analytics toggle flags
- `link_views` - Page view events: link_id, device, country, referrer, viewed_at
- `link_clicks` - Button click events: link_id, button_id, device, country, referrer, clicked_at
- `email_captures` - Email capture block submissions: link_id, email, source_block_id, captured_at
- `profiles` - User profile: display_name, avatar_url, company, plan
- `user_roles` - RBAC: user_id, role (enum: `admin` | `user`)
- `course_modules` - Learning module metadata: title, emoji, sort_order
- `course_lessons` - Lessons within modules: title, description, video_url, duration
- `lesson_materials` - Downloadable materials per lesson: label, url
- `lesson_progress` - User lesson completion tracking: user_id, lesson_id, completed_at
- `support_contacts` - Admin-managed support channel list: channel_type, title, url
- `support_faqs` - Admin-managed FAQ entries: question, answer, sort_order

**File Storage:**
- Supabase Storage, bucket: `link-images`
  - Upload logic: `src/lib/storage-utils.ts`
  - Folder structure: `{userId}/{folder}/{timestamp}.{ext}` (e.g., `{userId}/hero/1234567890.jpg`)
  - Max file size: 5MB enforced client-side
  - Accepted MIME types: image/png, image/jpeg, image/webp
  - Retry logic: 3 attempts with 800ms back-off
  - Old image cleanup: deletes previous file from bucket on upload if old URL belongs to `link-images`
  - Returns public URL via `storage.getPublicUrl()`

**Caching:**
- @tanstack/react-query — in-memory client-side cache
  - staleTime: 2 minutes, gcTime: 10 minutes, refetchOnWindowFocus: false, retry: 1
  - Configured in `src/App.tsx`

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built-in)
  - Implementation: `src/contexts/AuthContext.tsx` wraps `supabase.auth.*` calls
  - Session persistence: `localStorage` with `persistSession: true`, `autoRefreshToken: true`
  - Supported methods:
    - Email + password (`signUp`, `signInWithPassword`)
    - OAuth: Google (`google`), GitHub (`github`) via `signInWithOAuth`
    - Password reset via email (`resetPassword`)
  - Auth state managed globally via `AuthProvider` context; consumed with `useAuth()` hook
  - Email redirect on signup: `window.location.origin`

**Authorization (RBAC):**
- Custom role system via `user_roles` table
- Roles: `admin` | `user` (Supabase enum `app_role`)
- Server-side check: `has_role(_role, _user_id)` RPC function
- Client-side guards: `src/components/ProtectedRoute.tsx` (requires authenticated session), `src/components/AdminRoute.tsx` (requires `admin` role)

**Link Ownership:**
- RPC `is_link_owner(_link_id)` enforces that only the owning user can modify a link
- Used in data hooks under `src/hooks/`

## Monitoring & Observability

**Performance:**
- Vercel Speed Insights — automatic Core Web Vitals reporting to Vercel dashboard
  - Mount point: `src/main.tsx`

**Error Tracking:**
- None (no Sentry, Datadog, or similar detected)
- `src/components/ErrorBoundary.tsx` provides client-side React error boundary (UI-level only)

**Logs:**
- Browser `console.warn` / `console.error` used in storage-utils and auth flows
- No centralized log aggregation detected

**Internal Analytics:**
- Self-hosted via Supabase tables (`link_views`, `link_clicks`)
- Views tracked on `PublicLinkPage` load, clicks tracked on button interaction
- Displayed in `src/pages/AnalyticsPage.tsx` (per-user) and `src/pages/admin/AdminAnalyticsPage.tsx` (platform-wide)
- Charts rendered with Recharts

## CI/CD & Deployment

**Hosting:**
- Vercel — static SPA hosting
  - Project: `linkpro` (org `team_N9gkxxYX76Pk0M7cuyuDtFgA`, project ID `prj_5JzGRP8CHjspgRVtl37AUB9ZGsAR`)
  - Config: `vercel.json` — build: `npm run build`, output: `dist`, SPA rewrite `/* → /index.html`
  - Compression: brotli/gzip applied automatically by Vercel (noted in `vite.config.ts`)

**CI Pipeline:**
- Not detected (no GitHub Actions, CircleCI, or similar config files found)

**Edge Functions:**
- Supabase Edge Functions (Deno runtime)
  - `supabase/functions/og/index.ts` — Open Graph / Twitter Card HTML generator
    - Called via GET `?slug={slug}`
    - Reads `links` table using service role key
    - Returns full HTML with OG meta tags + JS redirect to SPA route `/l/{slug}`
    - Cache-Control: `public, max-age=300`
    - Env vars required: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PUBLIC_DOMAIN`
    - CORS origin restricted to `PUBLIC_DOMAIN` env var

## Social Platform Integrations

**Supported Link Destinations (not API integrations — URL scheme only):**
- WhatsApp — `wa.me/` deep links with optional pre-filled message (`whatsappMessage` field on buttons)
- Instagram — profile/post URL links
- TikTok — profile/video URL links
- YouTube — channel/video URL links
- Telegram — `t.me/` links
- Spotify — embed block (`spotify` block type renders iframe embed)
- Email — `mailto:` links
- Phone — `tel:` links
- Google Maps — embed block (`map` block type renders iframe embed)

Brand icons for these platforms are inline SVG in `src/data/brand-icons.ts`.
Brand colors (hex) defined alongside icons in `src/data/brand-icons.ts`.

## Webhooks & Callbacks

**Incoming:**
- None detected

**Outgoing:**
- None detected

## Environment Configuration

**Required env vars (client-side, `VITE_` prefix):**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon/publishable key

**Required env vars (Edge Function `og`, server-side):**
- `SUPABASE_URL` - Supabase project URL (injected by Supabase platform)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for bypassing RLS (injected by Supabase platform)
- `PUBLIC_DOMAIN` - Full domain (e.g., `https://app.linkpro.com`) for canonical URLs and CORS

**Secrets location:**
- Client secrets: `.env` file (not committed, not detected at repo root)
- Edge Function secrets: Supabase project secrets dashboard

---

*Integration audit: 2026-03-28*
