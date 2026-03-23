# Phase 1: Design System & TypeScript Foundation — Research

**Researched:** 2026-03-23
**Domain:** TypeScript strict mode migration + CSS design token completion
**Confidence:** HIGH (all findings from direct source-code inspection)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Enable `strict: true` in `tsconfig.app.json`
- **D-02:** Keep `noUnusedLocals: true` and `noUnusedParameters: true` as-is
- **D-03:** For `strictNullChecks` errors outside the 12 mapped `as any`, use `// @ts-expect-error` with explanatory comment — do NOT silence globally
- **D-04:** Goal is clean compile with `strict: true`, not zero suppressions — documented suppressions are acceptable if the fix is complex
- **D-05:** Each `as any` removal must use real type or `as unknown as TargetType` — never just delete
- **D-06:** Test mocks (`slug-utils.test.ts`) may use `as unknown as ReturnType<typeof supabase.from>` pattern
- **D-07:** Create manual `SmartLinkRow` type in `src/lib/link-mappers.ts` based on fields used inside `rowToSmartLink` — do NOT generate from Supabase API
- **D-08:** Parameter must be `Partial<SmartLinkRow>` to reflect that queries return subsets of fields
- **D-09:** Optional fields must have `| null | undefined` where code already handles with `|| ""` or `?? undefined`
- **D-10:** Add `backdropBlur` to `theme.extend` in `tailwind.config.ts`
- **D-11:** Add `--glass-bg` and `--glass-border` tokens to `:root` and `.dark`
- **D-12:** Verify `--editor-bg` and `--editor-surface` tokens are applied in `editor-panel` utility
- **D-13:** Add `glass-subtle` variant (less blur, more transparent) for sidebars and light overlays

### Claude's Discretion
- Order of `as any` corrections within the phase
- Exact shape of `SmartLinkRow` (fields and specific optionality)
- Specific CSS token names for glass variants
- Whether to create a separate file for mapper types or keep inline

### Deferred Ideas (OUT OF SCOPE)
- Framer Motion variants in design system — Phase 5
- Generic Skeleton component — Phase 5
- Custom color themes per user — outside v1.0 scope
- Storybook for design system documentation — backlog
</user_constraints>

---

## Summary

Phase 1 has two distinct workstreams that are fully independent and can be parallelized: (1) TypeScript strict mode enablement and `as any` elimination, and (2) design token completion. Both are low-risk surgical changes to existing working code — no new components, no new dependencies.

The TypeScript work is more involved than it appears. The `strict: true` flag in `tsconfig.app.json` already has `noImplicitAny: true` active, so the primary new constraint from `strict` is `strictNullChecks`. The 12 mapped `as any` instances all have clear fixes. The bigger unknown is how many additional `strictNullChecks` errors surface across `src/` beyond the mapped 12 — these must be suppressed with `// @ts-expect-error` per D-03.

The design token work is even simpler: the existing token system in `src/index.css` is already excellent. The three gaps are: (1) missing `backdropBlur` in Tailwind config, (2) missing `--glass-bg`/`--glass-border` semantic tokens, and (3) missing `glass-subtle` utility class. The `editor-panel` utility currently uses `@apply bg-card border border-border` which does NOT use the `--editor-bg`/`--editor-surface` tokens — this is the only dark mode inconsistency to fix.

**Primary recommendation:** Run `tsc --noEmit` immediately after enabling `strict: true` to get the full error list before writing any fixes. Address `as any` in dependency order: `link-mappers.ts` first (since `rowToSmartLink` propagates to 6 callers), then the admin pages, then test mocks last.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| TypeScript | ~5.x (via Vite) | Static typing | Already in project |
| Tailwind CSS | ~3.x | Utility CSS | Already in project |
| `@supabase/supabase-js` | installed | DB client + types | Already in project |

No new dependencies are needed for this phase. Zero new packages to install.

---

## Architecture Patterns

### Pattern 1: `SmartLinkRow` Manual Type

**What:** A hand-written interface in `src/lib/link-mappers.ts` that represents the superset of all DB columns read by `rowToSmartLink`. This is intentionally NOT `Tables<"links">` because the generated type is stale — it's missing `bg_effects`, `business_name_align`, `business_name_font_size`, and `business_name_html` (verified: these fields do not appear in `src/integrations/supabase/types.ts` `links.Row`).

**When to use:** Any function that reads a DB row from the `links` table.

**Exact shape needed** (derived from `rowToSmartLink` body, line by line):

```typescript
// Source: src/lib/link-mappers.ts — fields actually accessed by rowToSmartLink
export interface SmartLinkRow {
  id: string;
  slug: string;
  business_name: string;
  business_name_html: boolean | null;
  tagline: string | null;
  hero_image: string | null;
  hero_image_height_px: number | null;
  hero_object_fit: string | null;
  hero_focal_point: unknown | null;       // cast to SmartLink['heroFocalPoint'] in mapper
  hero_image_opacity: number | null;
  hero_overlay_opacity: number | null;
  hero_overlay_color: string | null;
  logo_url: string | null;
  logo_size_px: number | null;
  logo_shape: string | null;
  logo_shadow: boolean | null;
  background_color: string | null;
  text_color: string | null;
  accent_color: string | null;
  font_family: string | null;
  title_size: number | null;
  business_name_font_size: number | string | null;  // coerced with Number() in mapper
  business_name_align: string | null;
  hide_business_name: boolean | null;
  hide_tagline: boolean | null;
  entry_animation: string | null;
  snow_effect: unknown | null;            // cast to SnowEffect in mapper
  bg_effects: {
    bubbles?: unknown;
    fireflies?: unknown;
    matrix?: unknown;
    stars?: unknown;
    bgHtml?: unknown;
  } | null;
  buttons: unknown | null;               // cast to SmartLink["buttons"] in mapper
  pages: unknown | null;                 // cast to SmartLink["pages"] in mapper
  badges: unknown | null;                // cast to string[] in mapper
  floating_emojis: unknown | null;       // cast to string[] in mapper
  blocks: unknown | null;                // cast to SmartLink["blocks"] in mapper
  is_active: boolean | null;
  created_at: string;
}
```

The function signature becomes:
```typescript
export function rowToSmartLink(
  row: Partial<SmartLinkRow>,
  viewCount = 0,
  clickCount = 0,
  ownerPlan?: string
): SmartLink
```

**Why `Partial<SmartLinkRow>`:** Supabase queries like `.select("id, slug")` return only a subset. `rowToSmartLink` is already written defensively with `|| ""` and `?? undefined` throughout, so `Partial` is accurate.

**Why NOT `Tables<"links">`:** The generated type is missing at least 4 columns (`bg_effects`, `business_name_align`, `business_name_font_size`, `business_name_html`) that exist in the actual DB schema but haven't been regenerated. Using `Tables<"links">` would require adding them to the generated file OR regenerating — D-07 explicitly avoids this.

### Pattern 2: Supabase `.from()` without `as any`

**What:** The `user_roles` table IS in `src/integrations/supabase/types.ts` (Row has `id`, `role: app_role`, `user_id`). The `as any` in `use-user-role.ts` was used because the Supabase client type sometimes doesn't infer table names correctly. The fix is to remove the cast entirely — the table name is a valid string literal key.

**Fix:**
```typescript
// Before:
.from("user_roles" as any)

// After:
.from("user_roles")
// user_roles IS in Database["public"]["Tables"] — no cast needed
```

### Pattern 3: `ElementsSidebar.tsx` — `defaults` property

**What:** The `categories` array has items of mixed shape — some have `defaults: {...}`, some don't. The two `as any` casts (`(el as any).defaults`) are needed because the item type inferred by TypeScript doesn't include `defaults`.

**Fix:** Add `defaults?` to the item type explicitly:
```typescript
interface CategoryItem {
  type: BlockType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaults?: Record<string, unknown>;
}
```
Then type the `categories` array with this interface. The `as any` casts on lines 136 and 144 are eliminated.

### Pattern 4: `AdminAnalyticsPage.tsx` — Supabase result arrays

**What:** The 4x `as any[]` casts on lines 78-81 wrap Supabase query results. The queries fetch from `link_views`, `link_clicks`, `profiles`, `links` — all of which have generated types.

**Fix:** Use `Tables<>` helper for each:
```typescript
import type { Tables } from "@/integrations/supabase/types";

type LinkView = Tables<"link_views">;   // has: viewed_at, device, link_id, id, etc.
type LinkClick = Tables<"link_clicks">; // has: clicked_at, link_id, id, etc.
type Profile = Tables<"profiles">;      // has: plan, created_at, id, etc.
type Link = Pick<Tables<"links">, "id" | "business_name" | "slug">;

// In queryFn return:
return {
  views: (allViews ?? []) as LinkView[],
  clicks: (allClicks ?? []) as LinkClick[],
  profiles: (allProfiles ?? []) as Profile[],
  links: (allLinks ?? []) as Link[],
};
```

Then the `(p: any)`, `(v: any)`, `(c: any)`, `(l: any)` useMemo callbacks also become typed — replace with proper param types matching the arrays.

### Pattern 5: `AdminSupportPage.tsx` — upsert payload

**What:** 2x `as any` in lines 76 and 86. The mutation functions `useUpsertFaq` and `useUpsertContact` in `use-support.ts` already have correctly typed parameters. The `as any` casts are unnecessary — the payloads match the mutation types.

**Fix analysis:**
- `handleSaveFaq`: `payload` is `SupportFaq` (when editing) or `{ question, answer }`. The mutation accepts `Partial<SupportFaq> & { question: string; answer: string }`. The `payload as any` cast hides a real mismatch: when editing, `payload` is `SupportFaq` (has `id`) which satisfies the mutation type. When inserting, `{ question, answer }` also satisfies. The cast is not needed — just annotate `payload` correctly:
  ```typescript
  const payload: Partial<SupportFaq> & { question: string; answer: string } =
    faqDialog.editing ? { ...faqDialog.editing, ...data } : data;
  upsertFaq.mutate(payload);  // no cast needed
  ```
- Same pattern for `handleSaveContact`.

### Pattern 6: `LinkEditor.tsx` — `.update(row as any)`

**What:** Line 113: `.update(row as any)` where `row = smartLinkToRow(l, user.id)`. The `smartLinkToRow` return type is an object literal inferred by TypeScript. The `.update()` method on the Supabase query builder expects `TablesUpdate<"links">` — which is `Database["public"]["Tables"]["links"]["Update"]`.

**Root cause:** The `links.Update` type in generated types is missing `bg_effects`, `business_name_align`, `business_name_font_size`, `business_name_html`. So the object returned by `smartLinkToRow` has properties not in `Update`.

**Fix options:**
1. (Recommended, aligned with D-07 approach) Cast the return of `smartLinkToRow` to `Tables<"links">["Update"] & Record<string, unknown>` — acceptable intermediate
2. Simpler: `as unknown as Parameters<typeof supabase.from<"links">>[0] extends ... ` — too complex
3. Simplest correct fix: use `// @ts-expect-error` per D-03 since the root cause is stale generated types, not a logic error:
   ```typescript
   // @ts-expect-error: smartLinkToRow returns extra fields (bg_effects etc.) not yet in generated types
   .update(row)
   ```
   Per D-04, a documented suppression is acceptable here.

### Anti-Patterns to Avoid

- **Do NOT use `as any` as a solution** — every `as any` must become a real type or `as unknown as TargetType`
- **Do NOT regenerate `src/integrations/supabase/types.ts`** — this is generated code; instead create `SmartLinkRow` manually per D-07
- **Do NOT add `strictNullChecks: false`** — that defeats the purpose; use `// @ts-expect-error` for complex cases
- **Do NOT hardcode `rgba()` in new glass utilities** — use the new `--glass-bg` / `--glass-border` tokens

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tailwind backdropBlur classes | Custom CSS backdrop-filter utilities | `theme.extend.backdropBlur` in tailwind.config.ts | Tailwind already generates all variants; just extend the scale |
| Type-safe Supabase row | Custom runtime validator | TypeScript interface at compile time | Runtime validation out of scope for this phase |
| Dark mode detection | JS `matchMedia` listener | Existing `.dark` class on `<html>` | Already implemented correctly; don't change |

---

## TypeScript Strict Mode — Full Error Inventory

### What `strict: true` adds over current config

Current `tsconfig.app.json` already has: `noImplicitAny: true`, `noUnusedLocals: true`, `noUnusedParameters: true`.

`strict: true` additionally enables:
- `strictNullChecks: true` — **This is the main new source of errors**
- `strictFunctionTypes: true`
- `strictBindCallApply: true`
- `strictPropertyInitialization: true` (class fields — likely no impact, project uses React hooks)
- `noImplicitThis: true`

### Known `as any` instances — exact fixes

| # | File | Line context | Root cause | Fix |
|---|------|-------------|-----------|-----|
| 1 | `ElementsSidebar.tsx:136` | `(el as any).defaults` in onDragStart | Item type has no `defaults` | Add `defaults?: Record<string, unknown>` to item interface |
| 2 | `ElementsSidebar.tsx:144` | `(el as any).defaults` in onClick | Same as above | Same fix |
| 3 | `use-user-role.ts:14` | `.from("user_roles" as any)` | Supabase client type inference | Remove cast — `user_roles` is in generated types |
| 4 | `AdminAnalyticsPage.tsx:78` | `(allViews as any[])` | Supabase result not typed | `as Tables<"link_views">[]` after null-coalescing |
| 5 | `AdminAnalyticsPage.tsx:79` | `(allClicks as any[])` | Same | `as Tables<"link_clicks">[]` |
| 6 | `AdminAnalyticsPage.tsx:80` | `(allProfiles as any[])` | Same | `as Tables<"profiles">[]` |
| 7 | `AdminAnalyticsPage.tsx:81` | `(allLinks as any[])` | Same | `as Pick<Tables<"links">, "id" \| "business_name" \| "slug">[]` |
| 8 | `AdminSupportPage.tsx:76` | `payload as any` in handleSaveFaq | Unnecessary cast | Type `payload` as `Partial<SupportFaq> & { question: string; answer: string }` |
| 9 | `AdminSupportPage.tsx:86` | `payload as any` in handleSaveContact | Unnecessary cast | Same pattern with `SupportContact` |
| 10 | `LinkEditor.tsx:113` | `.update(row as any)` | `smartLinkToRow` returns fields missing from generated `links.Update` | `// @ts-expect-error` with comment per D-03/D-04 (root cause: stale generated types) |
| 11 | `slug-utils.test.ts:227` | `{ select: selectSpy } as any` | Mock object doesn't implement full Supabase client type | `as unknown as ReturnType<typeof supabase.from>` per D-06 |
| 12 | `slug-utils.test.ts:244` | `{ select: selectSpy } as any` | Same | Same pattern |

### Predicted `strictNullChecks` surface area

The project has `noImplicitAny` already — so no implicit `any` errors. The new errors will be `strictNullChecks` violations: accessing properties on potentially-undefined values, passing `T | null` where `T` is expected, etc.

**High-risk areas** (identified by patterns in the codebase):
- React Query `data` results: `data?.x` is already used widely but some callers may not null-guard
- `useParams<{ id: string }>()` returns `string | undefined` under strict — `id` in `LinkEditor.tsx` must be treated as `string | undefined`
- Optional chaining on Supabase results where destructured without null check
- Array access patterns like `data[0].field` where `data` could be `null`

**Instruction for implementation:** Run `tsc --noEmit` after enabling `strict: true`, capture the error list, then work through it. Do not guess — the compiler output is ground truth. Suppress with `// @ts-expect-error` for cases where the fix would require refactoring beyond this phase's scope.

---

## Design Token Gap Analysis

### What already exists (do NOT rebuild)

All verified by direct inspection of `src/index.css` and `tailwind.config.ts`:

**CSS tokens present in both `:root` and `.dark`:**
- Full color system: `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`
- Sidebar tokens: `--sidebar-background` through `--sidebar-ring`
- Surface tokens: `--surface`, `--surface-foreground`, `--surface-hover`
- Glow tokens: `--glow`, `--glow-muted`
- Status tokens: `--success`, `--warning`
- Editor tokens: `--editor-bg`, `--editor-surface`, `--editor-surface-hover`, `--editor-border`, `--editor-text`, `--editor-text-muted`

**Tailwind color extensions present:**
- `border`, `input`, `ring`, `background`, `foreground`, `primary`, `secondary`, `destructive`, `muted`, `accent`, `popover`, `card`, `surface`, `glow`, `success`, `warning`, `sidebar`

**Glass utility classes present:**
- `.glass` — `backdrop-filter: blur(12px) saturate(160%)`, with dark mode variant
- `.glass-strong` — `backdrop-filter: blur(16px) saturate(180%)`, with dark mode variant
- `.nexus-card` — Apple frosted glass card, with dark mode variant

**Animation keyframes present:**
- `accordion-down`, `accordion-up`, `float`, `pulse-glow`

### Gaps to fill (the actual work)

**Gap 1 — `backdropBlur` in Tailwind config (D-10)**

Current state: `tailwind.config.ts` has NO `backdropBlur` entry in `theme.extend`. Tailwind 3.x ships `backdrop-blur-*` utilities by default via the `backdropBlur` core plugin — BUT without extending the scale, only the default values are available (sm=4px, DEFAULT=8px, md=12px, lg=16px, xl=24px, 2xl=40px, 3xl=64px).

The gap is not that the classes don't exist — Tailwind 3 includes them. The gap is that the glass utilities in CSS use `blur(12px)` and `blur(16px)` which correspond to `backdrop-blur-md` and `backdrop-blur-lg` — confirming the default scale is sufficient.

**Actual action:** Add to `tailwind.config.ts` to make it explicit and allow `@apply backdrop-blur-md` in CSS utilities:

```typescript
// In theme.extend:
backdropBlur: {
  xs: '2px',
  sm: '4px',
  DEFAULT: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '40px',
  '3xl': '64px',
},
```

This restores the full default scale explicitly (Tailwind merges with defaults) and allows `@apply backdrop-blur-md` to work in CSS layers.

**Gap 2 — `--glass-bg` and `--glass-border` semantic tokens (D-11)**

Current state: `.glass` uses hardcoded `rgba(255, 255, 255, 0.80)` in light mode and `.dark .glass` uses `hsl(var(--card) / 0.80)`. This works but means the glass color isn't a reusable token.

Add to `:root`:
```css
--glass-bg: 255 255 255;          /* RGB triplet for rgba() usage */
--glass-border: 0 0 0;
--glass-bg-opacity: 0.80;
--glass-border-opacity: 0.06;
```

However, since the existing pattern uses raw `rgba()` (not `hsl()`), and the existing tokens use HSL values, the simplest approach that aligns with D-11 intent is:

```css
/* :root */
--glass-bg: rgba(255, 255, 255, 0.80);
--glass-border: rgba(0, 0, 0, 0.06);

/* .dark */
--glass-bg: hsl(var(--card) / 0.80);
--glass-border: hsl(var(--border) / 0.50);
```

Then update `.glass` to use `background: var(--glass-bg)` and `border-color: var(--glass-border)`. This removes the hardcoded rgba while keeping the existing dark mode variants working.

**Gap 3 — `glass-subtle` utility (D-13)**

Current state: No `glass-subtle` class exists. Intended for sidebars and light overlays.

Add to `@layer utilities` in `src/index.css`:
```css
.glass-subtle {
  background: rgba(255, 255, 255, 0.60);
  backdrop-filter: blur(8px) saturate(140%);
  -webkit-backdrop-filter: blur(8px) saturate(140%);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.dark .glass-subtle {
  background: hsl(var(--card) / 0.60);
  border-color: hsl(var(--border) / 0.30);
}
```

**Gap 4 — `editor-panel` uses generic tokens, not editor-specific tokens (D-12)**

Current state in `src/index.css`:
```css
.editor-panel {
  @apply bg-card border border-border rounded-xl;
}
```

This uses `--card` and `--border` — which are correct. The `--editor-surface` token in dark mode maps to `hsl(255 25% 7%)` which is the same as `--card` (both `255 25% 7%`). So functionally there is no inconsistency. The `editor-panel` class is fine as-is.

**Verdict on D-12:** No change needed to `editor-panel`. The `--editor-bg` and `--editor-surface` tokens are already aligned with `--background` and `--card` in both modes. This is correct by design — the editor uses the same background as the rest of the app.

---

## Common Pitfalls

### Pitfall 1: `Partial<SmartLinkRow>` causing `undefined` errors inside rowToSmartLink

**What goes wrong:** Once `row` is `Partial<SmartLinkRow>`, every field is `T | undefined`. The mapper already handles this with `|| ""` and `?? undefined`, but TypeScript may complain about certain accesses even where the fallback is present.

**Why it happens:** `Partial<T>` makes all fields optional. A line like `row.buttons as SmartLink["buttons"]` may error if `row.buttons` is `undefined | null`.

**How to avoid:** Keep the existing defensive patterns. The cast `(row.buttons as SmartLink["buttons"]) || []` remains valid — TypeScript accepts a cast from `unknown | undefined | null` to a specific type when the intent is explicit. If TypeScript complains, use `(row.buttons ?? null) as SmartLink["buttons"] | null ?? []`.

**Warning signs:** TypeScript errors saying "Object is possibly 'undefined'" inside `rowToSmartLink` after the type change.

### Pitfall 2: `use-user-role.ts` — removing `as any` may surface a Supabase type inference bug

**What goes wrong:** The Supabase client `.from("user_roles")` should work because `user_roles` is in `Database["public"]["Tables"]`. But some versions of `@supabase/supabase-js` have inference issues with certain table names.

**How to avoid:** Test by removing the cast and running `tsc --noEmit`. If it errors, the correct fix is `supabase.from("user_roles" as "user_roles")` (same type, explicit literal) — which satisfies the type system without widening to `any`.

### Pitfall 3: `backdropBlur` in Tailwind 3 — already enabled by default

**What goes wrong:** Developer adds `backdropBlur` to `theme.extend` and expects this enables the plugin. In Tailwind 3, `backdrop-blur-*` utilities are enabled by default via the `backdropBlur` core plugin. Extending the theme just customizes the scale.

**How to avoid:** Understand the distinction. Adding to `theme.extend.backdropBlur` customizes values, it doesn't enable the plugin. The `@apply backdrop-blur-md` should work even WITHOUT adding to `theme.extend` in Tailwind 3. If it doesn't, check `tailwind.config.ts` for `corePlugins` restrictions.

**Warning signs:** `@apply backdrop-blur-md` failing with "class does not exist" — in this case check if `backdropBlur` is in a `corePlugins: { ... }` blocklist.

### Pitfall 4: `strictNullChecks` errors in `useParams` — `id` is `string | undefined`

**What goes wrong:** `const { id } = useParams<{ id: string }>()` — under `strictNullChecks`, `useParams` returns `{ id: string | undefined }` even with the generic argument in some React Router versions. Any downstream use of `id` as a non-null string will error.

**How to avoid:** Add a guard: `if (!id) return null` or `const linkId = id!` with a comment. Check the actual error from `tsc --noEmit` — do not assume.

### Pitfall 5: Test file `as any` replacement changes mock type

**What goes wrong:** Replacing `as any` with `as unknown as ReturnType<typeof supabase.from>` in test mocks may change how Vitest interprets the mock. The existing tests pass — the goal is only to satisfy TypeScript, not change behavior.

**How to avoid:** Run tests (`npm test`) after making mock changes to verify they still pass. The `as unknown as X` pattern is semantically equivalent at runtime.

---

## Code Examples

### Minimal `tsconfig.app.json` change
```json
// Source: src file, verified against TypeScript 5.x docs
{
  "compilerOptions": {
    "strict": true,
    // Remove or keep "noImplicitAny": true — it's subsumed by strict
    // "noImplicitAny": true,  ← redundant once strict: true
    "noUnusedLocals": true,   // keep — not subsumed by strict
    "noUnusedParameters": true // keep — not subsumed by strict
  }
}
```

### `SmartLinkRow` minimal complete type
```typescript
// Source: derived from src/lib/link-mappers.ts rowToSmartLink body
export interface SmartLinkRow {
  id: string;
  slug: string;
  business_name: string;
  business_name_html?: boolean | null;
  tagline?: string | null;
  hero_image?: string | null;
  hero_image_height_px?: number | null;
  hero_object_fit?: string | null;
  hero_focal_point?: unknown;
  hero_image_opacity?: number | null;
  hero_overlay_opacity?: number | null;
  hero_overlay_color?: string | null;
  logo_url?: string | null;
  logo_size_px?: number | null;
  logo_shape?: string | null;
  logo_shadow?: boolean | null;
  background_color?: string | null;
  text_color?: string | null;
  accent_color?: string | null;
  font_family?: string | null;
  title_size?: number | null;
  business_name_font_size?: number | string | null;
  business_name_align?: string | null;
  hide_business_name?: boolean | null;
  hide_tagline?: boolean | null;
  entry_animation?: string | null;
  snow_effect?: unknown;
  bg_effects?: {
    bubbles?: unknown;
    fireflies?: unknown;
    matrix?: unknown;
    stars?: unknown;
    bgHtml?: unknown;
  } | null;
  buttons?: unknown;
  pages?: unknown;
  badges?: unknown;
  floating_emojis?: unknown;
  blocks?: unknown;
  is_active?: boolean | null;
  created_at?: string;
}
```

Note: Using `Partial<SmartLinkRow>` as the parameter type (D-08) means all fields become optional. The interface above is already written with `?` on all fields except `id`, `slug`, `business_name` which are always required in a DB row. This aligns with D-09.

### Tailwind backdropBlur extension
```typescript
// Source: tailwind.config.ts — add to theme.extend
backdropBlur: {
  xs: '2px',
  sm: '4px',
  DEFAULT: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '40px',
  '3xl': '64px',
},
```

### `ElementsSidebar` typed item
```typescript
// Source: src/components/editor/ElementsSidebar.tsx
interface CatalogItem {
  type: BlockType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaults?: Record<string, unknown>;
}
// Categories use CatalogItem[] — no more `(el as any).defaults`
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `strict: false` | `strict: true` | This phase | `strictNullChecks` active |
| `row: any` in mapper | `row: Partial<SmartLinkRow>` | This phase | 6 call sites stay compatible |
| Hardcoded `rgba()` in glass | `var(--glass-bg)` tokens | This phase | Dark mode glass consistent |
| No `backdrop-blur-*` in Tailwind | `theme.extend.backdropBlur` | This phase | Classes usable in all components |

---

## Open Questions

1. **How many additional `strictNullChecks` errors are there beyond the 12 mapped `as any`?**
   - What we know: The codebase uses React Query (`data` is T | undefined), Supabase (results are nullable), and router params (potentially undefined)
   - What's unclear: The exact count and locations — this requires running `tsc --noEmit`
   - Recommendation: Make this the FIRST task in Wave 1. Run `tsc --noEmit`, save the output, then categorize: (a) easy fixes, (b) `// @ts-expect-error` candidates

2. **Does `bg_effects` column exist in the Supabase DB but not in generated types?**
   - What we know: `rowToSmartLink` reads `row.bg_effects?.bubbles` etc. — code is live and working. `smartLinkToRow` writes `bg_effects` to the row. The generated types do not include `bg_effects` in `links.Row` or `links.Update`.
   - What's unclear: Whether the generated types are simply stale (column exists in DB but hasn't been regenerated) or if `bg_effects` is a computed property
   - Recommendation: Treat as stale generated type. The manual `SmartLinkRow` approach (D-07) sidesteps this entirely.

3. **Does `support_faqs` / `support_contacts` appear in the Supabase generated types?**
   - What we know: YES — both appear in `types.ts` with full Row/Insert/Update shapes (verified lines 401-456)
   - Implication: The `payload as any` in `AdminSupportPage.tsx` is truly unnecessary — the mutation types are compatible. No blocker.

---

## Validation Architecture

No test infrastructure changes are needed for this phase. The existing Vitest setup covers `src/test/slug-utils.test.ts`. After changes:

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (vitest/globals in tsconfig) |
| Config file | `vite.config.ts` (likely) or `vitest.config.ts` |
| Quick run command | `npm test` or `npx vitest run` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TS-01 | `tsc --noEmit` passes with `strict: true` | smoke | `npx tsc --noEmit` | ✅ (tsconfig) |
| TS-02 | No `as any` in src/ (excluding suppressions) | smoke | `grep -rn "as any" src/` | ✅ (search) |
| DS-01 | `backdrop-blur-md` class works in components | manual | visual check in dev | N/A |
| DS-02 | `.glass-subtle` renders correctly light+dark | manual | visual check in dev | N/A |
| TEST-01 | `slug-utils.test.ts` still passes after mock update | unit | `npx vitest run src/test/slug-utils.test.ts` | ✅ |

### Wave 0 Gaps
None — existing test infrastructure covers all automated checks. No new test files needed for this phase.

---

## Sources

### Primary (HIGH confidence)
- Direct inspection of `src/integrations/supabase/types.ts` — complete `links.Row`, `user_roles`, `support_faqs`, `support_contacts` types, `app_role` enum
- Direct inspection of `src/lib/link-mappers.ts` — exact fields accessed by `rowToSmartLink`
- Direct inspection of `src/index.css` — complete token inventory and existing glass utilities
- Direct inspection of `tailwind.config.ts` — confirmed absence of `backdropBlur` extension
- Direct inspection of all 6 files with `as any` — exact line context for each cast

### Secondary (MEDIUM confidence)
- TypeScript docs: `strict: true` flag composition (includes `strictNullChecks`, `strictFunctionTypes`, etc.) — well-established behavior
- Tailwind CSS 3.x: `backdropBlur` core plugin enabled by default, `theme.extend.backdropBlur` customizes scale

### Tertiary (LOW confidence)
- Predicted `strictNullChecks` error surface area — inference only, not verified by running `tsc --noEmit`

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies, everything verified in source
- TypeScript fixes: HIGH for the 12 known `as any` (exact lines inspected); MEDIUM for additional `strictNullChecks` errors (count unknown until compiler runs)
- Architecture patterns: HIGH — derived from actual code, not assumptions
- Design token gaps: HIGH — direct inspection of CSS and Tailwind config

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (30 days — stable codebase, no external dependencies to track)

---

## RESEARCH COMPLETE
