# Codebase Concerns

**Analysis Date:** 2026-03-23

---

## Tech Debt

**Duplicated block-name lookup tables:**
- Issue: The `names` record mapping `BlockType` to display labels is copy-pasted verbatim in two places inside `addBlock` and `insertBlockAt`, both in `src/pages/LinkEditor.tsx` lines ~205–213 and ~239–247. A new block type requires updating both.
- Files: `src/pages/LinkEditor.tsx`
- Impact: Blocks added without updating both maps silently show "Bloco" in toast messages.
- Fix approach: Extract to a shared `BLOCK_NAMES` constant (same pattern already used in `src/components/editor/BlockEditor.tsx` as `BLOCK_LABELS`).

**`rowToSmartLink` accepts `any` row type:**
- Issue: `rowToSmartLink(row: any, ...)` in `src/lib/link-mappers.ts` line 20 uses untyped input, suppressing compile-time errors when DB column names change.
- Files: `src/lib/link-mappers.ts`
- Impact: DB schema changes (column renames, removals) will silently produce `undefined` fields at runtime rather than compile errors.
- Fix approach: Type the `row` parameter against `Tables<"links">` from Supabase generated types.

**`as any` casts scattered across codebase:**
- Issue: Multiple forced casts suppress type safety — notably `supabase.from("user_roles" as any)` in `src/hooks/use-user-role.ts:14`, `row as any` in `src/pages/LinkEditor.tsx:113`, and `as any[]` in `src/pages/admin/AdminAnalyticsPage.tsx:78-81`.
- Files: `src/hooks/use-user-role.ts`, `src/pages/LinkEditor.tsx`, `src/pages/admin/AdminAnalyticsPage.tsx`, `src/pages/admin/AdminSupportPage.tsx`
- Impact: Type errors from schema changes go undetected; `user_roles` cast specifically indicates the table is not yet in the generated Supabase types file.
- Fix approach: Add `user_roles` to `src/integrations/supabase/types.ts`; run `supabase gen types typescript` to refresh the file.

**`useLinkStats` performs N+1-style queries:**
- Issue: `useLinkStats` in `src/hooks/use-links.ts` first fetches all link IDs for a user, then fires two separate `IN (linkIds)` count queries. As link counts grow this scales poorly.
- Files: `src/hooks/use-links.ts` (lines 262–298)
- Impact: Users with many links (Business plan) will experience slow Dashboard load due to large `IN` clause.
- Fix approach: Replace with a single Supabase RPC that aggregates stats server-side, similar to the existing `get_user_links_with_stats` pattern.

**`AnalyticsPage` caps events at 5,000 rows client-side:**
- Issue: `src/pages/AnalyticsPage.tsx` fetches up to 5,000 view and click records with `.limit(5000)` then aggregates in JavaScript. High-volume pages will show truncated charts with no indication of truncation.
- Files: `src/pages/AnalyticsPage.tsx` (lines 40–71)
- Impact: Charts silently undercount for active users; day-level aggregation is incorrect when the limit is hit.
- Fix approach: Move aggregation to a Supabase RPC or Edge Function that returns pre-aggregated data by day/device.

**`cleanup_old_analytics` is never scheduled:**
- Issue: `supabase/migrations/20260322100003_add_analytics_retention_function.sql` creates the cleanup function but explicitly notes it never runs automatically. No pg_cron job or Edge Function scheduler is configured.
- Files: `supabase/migrations/20260322100003_add_analytics_retention_function.sql`
- Impact: `link_views` and `link_clicks` tables grow indefinitely, increasing query costs and storage.
- Fix approach: Configure a Supabase cron job via `pg_cron` or a scheduled Edge Function to call `cleanup_old_analytics(730)` weekly.

**`SettingsPage` does not use React Query:**
- Issue: Profile loading in `src/pages/SettingsPage.tsx` uses a raw `useEffect` + `supabase.from(...).maybeSingle()` pattern, bypassing the shared `useProfile` hook and React Query cache.
- Files: `src/pages/SettingsPage.tsx` (lines 29–56)
- Impact: Profile edits on the Settings page do not reflect in other components reading from the `useProfile` cache until manual refresh.
- Fix approach: Replace with `useProfile` hook for reads; use `useQueryClient().invalidateQueries` after save.

**`mock-links.ts` exists but is unused:**
- Issue: `src/data/mock-links.ts` exports `mockLinks` but no import of it exists in the codebase (zero grep hits). It contains external Unsplash image URLs hardcoded with `#` placeholder URLs.
- Files: `src/data/mock-links.ts`
- Impact: Dead code that confuses contributors; stale if the `SmartLink` type evolves.
- Fix approach: Remove the file.

---

## Security Considerations

**`lib/protect.ts` blocks legitimate developer tools application-wide:**
- Risk: `src/lib/protect.ts` binds `contextmenu`, `keydown` (F12, Ctrl+U, Ctrl+S, Ctrl+Shift+I/J/C), `dragstart`, and `selectstart` events on `document`. This runs for authenticated admin and developer sessions, blocking their own DevTools and text-select workflows.
- Files: `src/lib/protect.ts`, `src/main.tsx` (where `initProtection()` is called)
- Current mitigation: None — admins are subject to the same restrictions.
- Recommendations: Scope protection to the `PublicLinkPage` route only; skip the listener entirely for authenticated sessions or localhost.

**`BgHtmlEffect` and `HtmlTitle` render arbitrary user HTML in iframes:**
- Risk: Users can supply any HTML/JS via the `bgHtml` effect and `businessNameHtml` feature. Both render in sandboxed iframes (`sandbox="allow-scripts"`) but without `allow-same-origin`, meaning scripts run in a null-origin context. The `allow-scripts` flag allows script execution that could exfiltrate data via `fetch` to external origins.
- Files: `src/components/BgHtmlEffect.tsx`, `src/components/SmartLinkPreview.tsx` (lines 23–69)
- Current mitigation: Sandbox without `allow-same-origin` prevents localStorage/cookie access.
- Recommendations: Add a strict Content Security Policy on the public link page; consider disabling `allow-scripts` or limiting the `bgHtml` feature to Pro/Business plans only.

**HTML block rendered via DOMPurify with `iframe` whitelisted:**
- Risk: `src/components/preview/BlockRenderer.tsx` line 586 uses `DOMPurify.sanitize` but explicitly allows `<iframe>` tags with `src`, `allow`, and `allowfullscreen` attributes. Embedding arbitrary iframes enables clickjacking-style overlays on a user's public page and could load malicious content.
- Files: `src/components/preview/BlockRenderer.tsx` (lines 585–591)
- Current mitigation: DOMPurify strips script tags and event handlers.
- Recommendations: Remove `iframe` from `ALLOWED_TAGS` in DOMPurify config, or limit by plan and validate `src` against an allowlist (YouTube, Spotify, etc.).

**Plan limit enforcement is client-side and can race:**
- Risk: `useSaveLink` in `src/hooks/use-links.ts` (lines 105–113) checks the plan and link count in two parallel reads before inserting. A user can bypass the limit by rapidly submitting multiple simultaneous requests before either check completes.
- Files: `src/hooks/use-links.ts` (lines 103–113)
- Current mitigation: The check does run server-side (within the Supabase mutation), but it is not atomic.
- Recommendations: Enforce the limit in a Postgres trigger or RLS policy on `INSERT INTO links` so it cannot race.

**Device fingerprinting stored in profiles is not disclosed to users:**
- Risk: `src/lib/device-fingerprint.ts` collects canvas fingerprint, WebGL renderer, screen resolution, timezone, hardware concurrency, and user agent, then stores this in the `profiles` table. No privacy policy or consent notice is surfaced in the UI.
- Files: `src/lib/device-fingerprint.ts`, `src/hooks/use-device-fingerprint.ts`
- Current mitigation: Data is stored server-side and only visible to admins.
- Recommendations: Add a disclosure in the sign-up flow and terms of service; comply with LGPD (Brazil) requirements for biometric/device data collection.

---

## Performance Bottlenecks

**`BlockEditor.tsx` is a 1,944-line monolithic component:**
- Problem: All 27+ block type editors live in a single file with no code splitting. Any change forces re-parsing and re-bundling the entire component tree.
- Files: `src/components/editor/BlockEditor.tsx`
- Cause: Feature growth added to one file rather than splitting by block type.
- Improvement path: Extract each block-type form into its own file (e.g., `src/components/editor/blocks/VideoBlockEditor.tsx`), following the existing pattern of `src/components/editor/ButtonBlockEditor.tsx`.

**`useEditorHistory` stores up to 50 full `SmartLink` snapshots in React state:**
- Problem: Each `SmartLink` object can include large JSONB fields (gallery images with base64 URLs, carousel slides, sub-pages). 50 snapshots × large link = several MB in memory for power users.
- Files: `src/hooks/use-editor-history.ts`
- Cause: Full-state snapshots rather than diffs.
- Improvement path: Store structural diffs (only changed fields) or enforce a max snapshot size by dropping history when total size exceeds a threshold.

**`AdminAnalyticsPage` fetches all views and clicks without pagination:**
- Problem: `src/pages/admin/AdminAnalyticsPage.tsx` appears to query `link_views` and `link_clicks` across all users for admin reporting.
- Files: `src/pages/admin/AdminAnalyticsPage.tsx`
- Cause: No pagination or date window applied at the query level for the admin aggregate view.
- Improvement path: Add date range filters and paginate or aggregate server-side.

**Multiple background animation effects run simultaneously:**
- Problem: `src/components/SmartLinkPreview.tsx` renders Snow, Bubbles, Fireflies, Matrix, Stars, and BgHtml effects. Although these are toggled per-link, all effect components are conditionally mounted without `lazy`. On a link with a Matrix or Stars effect, the animation loop runs every frame while the editor is open.
- Files: `src/components/SmartLinkPreview.tsx`, `src/components/MatrixEffect.tsx`, `src/components/StarsEffect.tsx`
- Cause: No visibility-based pause on effects when the editor panel has focus.
- Improvement path: Pause canvas animations when the preview iframe is scrolled out of view using `IntersectionObserver`.

---

## Fragile Areas

**`LinkEditor` `handleSave` conflict detection relies on error message string matching:**
- Files: `src/pages/LinkEditor.tsx` (lines 355–363)
- Why fragile: Duplicate slug detection uses `e?.message?.includes("duplicate key")` or `e?.code === "23505"`. Supabase error message formats can change across versions; the Portuguese locale may also return different message text.
- Safe modification: Check only `e?.code === "23505"` (stable Postgres error code); remove the string match.
- Test coverage: Not tested.

**Public link route conflicts with app routes:**
- Files: `src/App.tsx` (lines 101–103)
- Why fragile: `/:slug` and `/:slug/:pageSlug` catch-all routes are placed last, but any future app route added without considering this will silently shadow existing public links or be shadowed itself. Slugs like `auth`, `dashboard`, `settings`, `reset-password` are already reserved by earlier routes but are not validated at slug creation time.
- Safe modification: Add these reserved slug names to the `validateSlug` blocklist in `src/lib/slug-utils.ts`.
- Test coverage: No route-conflict test exists.

**Autosave fires on every `useEffect` re-run even during rapid undo/redo:**
- Files: `src/hooks/use-autosave.ts`, `src/pages/LinkEditor.tsx`
- Why fragile: Each undo/redo triggers a `link` state change, resetting the 1,500 ms debounce timer. Rapid undo hammering (Ctrl+Z held) resets the timer repeatedly and can prevent autosave from ever firing until the user pauses. The `flush()` on unmount/tab-hide mitigates data loss but is not guaranteed on network errors.
- Safe modification: Autosave is already well-structured; add a max-delay cap (e.g., force save if 10 seconds have elapsed since last save, regardless of debounce).
- Test coverage: Not tested.

**`og` Edge Function relies on `PUBLIC_DOMAIN` env var with no fallback:**
- Files: `supabase/functions/og/index.ts` (line 40–42)
- Why fragile: If `PUBLIC_DOMAIN` is not set in the Supabase secrets, the function returns HTTP 500 for all OG requests, breaking link previews in WhatsApp/Telegram/Slack for every public page.
- Safe modification: Add `PUBLIC_DOMAIN` to the deployment checklist and Supabase project secrets; add an integration test that calls the function with a known slug.
- Test coverage: None.

---

## Missing Critical Features

**Payment/billing is not implemented:**
- Problem: `src/data/plans.ts` defines Pro (R$ 29/mês) and Business (R$ 79/mês) plans with prices, but there is no payment integration (Stripe, Pagar.me, Mercado Pago, or similar). `src/pages/PlansPage.tsx` renders plan cards with no subscribe/checkout action — the CTA buttons are not wired to any payment flow.
- Blocks: Users cannot self-upgrade; plan changes require manual admin intervention via the `AdminUsersPage` plan selector.

**Custom domain feature is a stub:**
- Problem: `customDomain` is present in `src/types/smart-link.ts` and persisted via `src/lib/link-mappers.ts`, but no UI to set a custom domain exists in the editor or settings. The feature is listed in the Pro plan (`src/data/plans.ts`) but is entirely unimplemented.
- Blocks: Custom domain support cannot be delivered to Pro users.

**Analytics data retention has no scheduled runner:**
- Problem: The `cleanup_old_analytics` function exists (see `supabase/migrations/20260322100003_add_analytics_retention_function.sql`) but is explicitly documented as never running automatically.
- Blocks: Without scheduled cleanup, `link_views` and `link_clicks` tables will grow unboundedly.

---

## Test Coverage Gaps

**Editor logic is untested:**
- What's not tested: Block insert/reorder/delete logic, undo/redo behavior, autosave debounce, slug conflict handling on save.
- Files: `src/pages/LinkEditor.tsx`, `src/hooks/use-editor-history.ts`, `src/hooks/use-autosave.ts`
- Risk: Regressions in core editor flows go undetected before deployment.
- Priority: High

**Admin mutations are untested:**
- What's not tested: `useDeleteUser`, `useUpdateUserPlan`, `useAdminUsers` hooks.
- Files: `src/hooks/use-admin.ts`
- Risk: Admin user deletion (`admin_delete_user` RPC) could silently fail or cascade incorrectly without test coverage.
- Priority: High

**Plan limit enforcement is untested:**
- What's not tested: The link-count guard in `useSaveLink`; the `usePlanLimits` hook behavior for each plan tier.
- Files: `src/hooks/use-links.ts` (lines 103–113), `src/hooks/use-plan-limits.ts`
- Risk: A regression could allow Free users to create unlimited links or block Business users.
- Priority: High

**Public route rendering is untested:**
- What's not tested: `PublicLinkPage` slug resolution, 404 behavior, sub-page routing, `recordView` side effect.
- Files: `src/pages/PublicLinkPage.tsx`, `src/hooks/use-links.ts` (`usePublicLink`)
- Risk: Public page breakage would be invisible until user reports.
- Priority: Medium

**Existing tests are only for pure utility functions:**
- What's tested: `normalizeSlug`, `validateSlug`, `checkSlugAvailability`, `extractBgColor`, link mapper round-trips.
- Files: `src/test/example.test.ts`, `src/test/slug-utils.test.ts`, `src/test/color-utils.test.ts`, `src/test/link-mappers.test.ts`
- Risk: All business logic, hooks, and components lack coverage.
- Priority: Medium

---

*Concerns audit: 2026-03-23*
