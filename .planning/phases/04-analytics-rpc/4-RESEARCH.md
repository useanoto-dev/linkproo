# Phase 4: Analytics RPC Migration - Research

**Researched:** 2026-03-24
**Domain:** Supabase Postgres RPC functions — analytics aggregation
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Admin RPC (`get_admin_analytics`):**
- D-01: Criar funcao `get_admin_analytics(period_days integer)` — retorna JSON agregado com:
  - `total_views`, `total_clicks`, `new_users` (no periodo)
  - `views_by_day`: array de `{date, views, clicks, new_users}` para o grafico de crescimento
  - `views_by_device`: array de `{device, count}` para o pie chart
  - `top_links`: array de `{link_id, business_name, slug, views, clicks}` top 10
  - `plans_distribution`: array de `{plan, count}` para o pie chart de planos
- D-02: A funcao usa `SECURITY DEFINER` — admin-only, sem RLS interference
- D-03: O periodo e calculado no servidor: `NOW() - (period_days || ' days')::interval`

**User RPC (`get_user_analytics`):**
- D-04: Criar funcao `get_user_analytics(user_uuid uuid, period_days integer)` — retorna JSON agregado com:
  - `total_views`, `total_clicks` (exact counts, no periodo)
  - `views_by_day`: array de `{date, views, clicks}` para o grafico de linha
  - `views_by_device`: array de `{device, count}` para o breakdown desktop/mobile
  - `clicks_by_button`: array de `{button_id, count}` top 10 botoes mais clicados
  - `views_by_link`: array de `{link_id, slug, business_name, views}` por link do usuario
- D-05: A funcao usa `SECURITY DEFINER` com validacao `user_uuid = auth.uid()` para garantir que o usuario so ve seus proprios dados
- D-06: `button_id` retornado e o ID bruto — o label mapping (buttonLabels/buttonLink) continua sendo feito no client com os dados dos links (que ja sao fetchados separadamente)

**AdminAnalyticsPage.tsx:**
- D-07: Substituir o `Promise.all` de 4 queries (views limit 10000, clicks limit 10000, profiles, links) por `supabase.rpc("get_admin_analytics", { period_days: periodDays })`
- D-08: O `useMemo` de `growthChartData`, `deviceData`, `planData`, `topLinksData` sao eliminados — esses calculos vao para o servidor. O componente usa os arrays retornados diretamente.
- D-09: Remover imports de `eachDayOfInterval`, `startOfDay`, `subDays` que nao serao mais usados

**AnalyticsPage.tsx:**
- D-10: Substituir o `Promise.all` de 4 queries (views limit 5000, clicks limit 5000, + 2 count queries) por `supabase.rpc("get_user_analytics", { user_uuid: user.id, period_days: periodDays })`
- D-11: O fetch separado de `links` para button labels PERMANECE — ainda e necessario para mapear button_id -> label (dados estruturais, nao analiticos). Apenas os fetches de `link_views`/`link_clicks` sao substituidos.
- D-12: Manter o `useQuery` com `queryKey: ["analytics", user.id, period]` — apenas mudar o `queryFn`

**Migrations:**
- D-13: Criar 2 migrations em `supabase/migrations/`:
  - `20260326000010_create_get_admin_analytics_rpc.sql`
  - `20260326000011_create_get_user_analytics_rpc.sql`
- D-14: Ambas as migrations usam `CREATE OR REPLACE FUNCTION` — idempotentes
- D-15: Retorno das funcoes e `RETURNS json` — simples de consumir no client com `supabase.rpc()`

### Claude's Discretion

- Exato SQL de cada aggregate (GROUP BY, date_trunc, JOIN com profiles/links)
- Se usar `json_build_object` ou `row_to_json` para serializacao
- Ordem das colunas no retorno
- Limite de `top_links` (10 ou 20 — usar 10)

### Deferred Ideas (OUT OF SCOPE)

- Analytics por referrer (UTM source) — backlog
- Export de dados CSV — backlog
- Real-time analytics com Supabase Realtime — fora do escopo v1.0
- Analytics de A/B testing (metricas de CTR) — Phase 9
</user_constraints>

---

## Summary

Phase 4 migrates two analytics pages from raw-row fetches (up to 10 000 and 5 000 rows respectively) to two Postgres RPC functions that return pre-aggregated JSON. The scope is fully defined: two migration files, two queryFn replacements, several useMemo deletions, and TypeScript type additions.

The existing codebase already has the exact pattern needed. `get_user_links_with_stats` (LANGUAGE sql, STABLE, SECURITY DEFINER, SET search_path = public, RETURNS TABLE) and `get_course_modules` (RETURNS jsonb, jsonb_build_object, jsonb_agg) demonstrate every SQL primitive required. The new RPCs combine both: a single `RETURNS json` function that uses `jsonb_build_object` at the top level and `jsonb_agg` for each array section.

The client changes are minimal and mechanical: the `queryFn` body shrinks from ~30 lines to 3-4 lines; four `useMemo` blocks are deleted from AdminAnalyticsPage; one `useMemo` block and two separate count queries are removed from AnalyticsPage; three date-fns imports are removed from each file.

**Primary recommendation:** Use `LANGUAGE plpgsql` for the new RPCs (not `LANGUAGE sql`) because the period filter must be computed as a local variable (`start_ts := NOW() - (period_days || ' days')::interval`) and reused across multiple subqueries, which is cleaner in plpgsql. The return type is `json` (not `jsonb`) per D-15 — consistent with `get_course_modules` pattern.

---

## Table Schema (Verified from types.ts)

### `link_views`
| Column | Type | Notes |
|--------|------|-------|
| id | string (uuid) | PK |
| link_id | string (uuid) | FK -> links.id |
| viewed_at | string (timestamptz) | event timestamp |
| device | string \| null | "mobile" or "desktop" |
| referrer | string \| null | raw referrer URL |
| country | string \| null | geo (unused in current UI) |

### `link_clicks`
| Column | Type | Notes |
|--------|------|-------|
| id | string (uuid) | PK |
| link_id | string (uuid) | FK -> links.id |
| clicked_at | string (timestamptz) | event timestamp |
| button_id | string \| null | which button was clicked |
| device | string \| null | "mobile" or "desktop" |
| referrer | string \| null | raw referrer URL |
| country | string \| null | geo (unused in current UI) |

### `profiles` (relevant columns)
| Column | Type | Notes |
|--------|------|-------|
| user_id | uuid | FK -> auth.users.id |
| plan | string \| null | "free" | "pro" | "business" |
| created_at | timestamptz | account creation time |

### `links` (relevant columns)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | owner |
| slug | text | public identifier |
| business_name | text | display name |

---

## What AdminAnalyticsPage Currently Computes Client-Side

All of the following must move to `get_admin_analytics`:

| useMemo / variable | Logic | Data Source |
|--------------------|-------|-------------|
| `startDate` | `startOfDay(subDays(new Date(), periodDays))` | computed locally |
| `totalViews` | `data.views.length` | array length of up to 10 000 rows |
| `totalClicks` | `data.clicks.length` | array length of up to 10 000 rows |
| `newUsers` | `filter(p => new Date(p.created_at) >= startDate).length` | over all profiles |
| `conversionRate` | `Math.round((totalClicks / totalViews) * 100)` | derived — stays client-side (trivial math on 2 numbers) |
| `growthChartData` | `eachDayOfInterval(...).map(day => filter views/clicks/profiles by dayStr)` | O(days * rows) scan |
| `planData` | reduce over all profiles counting by plan | full profiles scan |
| `topLinks` (top 5 by views) | reduce views by link_id, join with links array, sort, slice(0,5) | full views scan |

**What stays client-side in AdminAnalyticsPage:**
- `conversionRate` — trivial math on `data.total_views` and `data.total_clicks`
- PLAN_COLORS / PLAN_LABELS mapping for pie chart rendering
- All JSX rendering logic

---

## What AnalyticsPage Currently Computes Client-Side

All of the following must move to `get_user_analytics`:

| useMemo / variable | Logic | Data Source |
|--------------------|-------|-------------|
| `startDate` | `startOfDay(subDays(new Date(), periodDays))` | computed locally |
| `totalViews` | separate count query (HEAD) | Supabase count |
| `totalClicks` | separate count query (HEAD) | Supabase count |
| `chartData` (views_by_day) | `eachDayOfInterval.map(day => filter views+clicks by dayStr)` | up to 5 000 rows |
| `deviceData` | `filter(v => v.device === "mobile")`, desktop, other | up to 5 000 rows |
| `topLinks` (top 5 by views) | count views per link_id, join with links | up to 5 000 rows |
| `topCTAs` (clicks_by_button) | reduce clicks by button_id, sort, slice(0,10) | up to 5 000 rows |

**What stays client-side in AnalyticsPage:**
- Links fetch (for `buttonLabels` / `buttonLink` mapping) — D-11
- `referrerData` useMemo — NOTE: referrer is NOT in `get_user_analytics` scope (deferred). However, `referrerData` currently relies on `data.views` which will no longer exist. See Open Questions #1.
- `conversionRate` — trivial math
- `topLinks` display with views+clicks combined

---

## Standard Stack

### Core (verified from existing migrations + codebase)
| Tool | Version | Purpose | Source |
|------|---------|---------|--------|
| Postgres plpgsql | Supabase Postgres 15 | RPC function language | existing migrations |
| `jsonb_build_object` | built-in | serialize JSON object | get_course_modules migration |
| `jsonb_agg` | built-in | aggregate rows to JSON array | get_course_modules migration |
| `date_trunc('day', ts)` | built-in | group events by calendar day | standard Postgres |
| `SECURITY DEFINER` | built-in | bypass RLS for aggregate access | existing RPC pattern |
| `supabase.rpc()` | @supabase/supabase-js | client RPC call | use-admin.ts line 31, use-links.ts line 29 |

---

## Architecture Patterns

### Existing RPC Pattern in This Project

All existing RPCs follow this structure:

```sql
CREATE OR REPLACE FUNCTION public.function_name(param type)
RETURNS json   -- or RETURNS TABLE(...) for row-returning RPCs
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- local variables
BEGIN
  -- guard clause
  -- logic
  RETURN ...;
END;
$$;

REVOKE ALL ON FUNCTION public.function_name(type) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.function_name(type) TO authenticated;
```

For JSON-returning RPCs, `get_course_modules` uses `LANGUAGE sql` but the analytics RPCs need `LANGUAGE plpgsql` for the local variable `start_ts`.

### Client Call Pattern (verified from use-admin.ts line 31 and use-links.ts line 29)

```typescript
// Current pattern (use-admin.ts)
const { data, error } = await supabase.rpc("get_admin_users");
if (error) throw error;
return data as AdminUser[];

// New analytics pattern
const { data, error } = await supabase.rpc("get_admin_analytics", { period_days: periodDays });
if (error) throw error;
return data as AdminAnalyticsData;
```

### Recharts Data Key Compatibility

The current `growthChartData` in AdminAnalyticsPage uses keys: `date`, `views`, `cliques`, `usuarios`.
The current `chartData` in AnalyticsPage uses keys: `date`, `views`, `clicks`.

The SQL must produce exactly these keys so `<Line dataKey="views" />` etc. continue to work without JSX changes. Specifically:

**AdminAnalyticsPage chart expects:**
- `date` — formatted as "dd/MM" in pt-BR (currently done with `format(day, "dd/MM", { locale: ptBR })`)
- `views` — integer
- `cliques` — integer (NOT "clicks" — the JSX uses Portuguese key)
- `usuarios` — integer (NOT "new_users")

**Decision:** The SQL `views_by_day` array should return raw `{date: "yyyy-MM-dd", views: N, clicks: N, new_users: N}` and the client does the final `format()` display label. OR the SQL returns pre-formatted Portuguese labels. Given that date formatting requires locale knowledge (pt-BR), **the SQL should return ISO date strings** (`"2026-03-20"`) and the client does the `format(date, "dd/MM", { locale: ptBR })` mapping. This is a client-side transform of 7-90 strings — trivial and correct.

**Therefore:** The RPC returns `{date: "2026-03-20", views: N, clicks: N, new_users: N}` and the client maps the array to `{date: format(parseISO(d.date), "dd/MM", { locale: ptBR }), views: d.views, cliques: d.clicks, usuarios: d.new_users}`.

---

## Exact SQL for `get_admin_analytics`

```sql
-- Migration: 20260326000010_create_get_admin_analytics_rpc.sql

CREATE OR REPLACE FUNCTION public.get_admin_analytics(period_days integer)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  start_ts timestamptz := NOW() - (period_days || ' days')::interval;
BEGIN
  -- Admin-only guard
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Permission denied: admin role required';
  END IF;

  RETURN (
    SELECT json_build_object(
      'total_views',        (SELECT COUNT(*) FROM public.link_views  WHERE viewed_at  >= start_ts),
      'total_clicks',       (SELECT COUNT(*) FROM public.link_clicks WHERE clicked_at >= start_ts),
      'new_users',          (SELECT COUNT(*) FROM public.profiles    WHERE created_at >= start_ts),

      'views_by_day',       (
        SELECT COALESCE(json_agg(day_row ORDER BY day_row->>'date'), '[]'::json)
        FROM (
          SELECT json_build_object(
            'date',      to_char(d.day, 'YYYY-MM-DD'),
            'views',     COALESCE(v.cnt, 0),
            'clicks',    COALESCE(c.cnt, 0),
            'new_users', COALESCE(u.cnt, 0)
          ) AS day_row
          FROM (
            SELECT generate_series(
              date_trunc('day', start_ts),
              date_trunc('day', NOW()),
              '1 day'::interval
            ) AS day
          ) d
          LEFT JOIN (
            SELECT date_trunc('day', viewed_at) AS day, COUNT(*) AS cnt
            FROM public.link_views
            WHERE viewed_at >= start_ts
            GROUP BY 1
          ) v ON v.day = d.day
          LEFT JOIN (
            SELECT date_trunc('day', clicked_at) AS day, COUNT(*) AS cnt
            FROM public.link_clicks
            WHERE clicked_at >= start_ts
            GROUP BY 1
          ) c ON c.day = d.day
          LEFT JOIN (
            SELECT date_trunc('day', created_at) AS day, COUNT(*) AS cnt
            FROM public.profiles
            WHERE created_at >= start_ts
            GROUP BY 1
          ) u ON u.day = d.day
        ) sub
      ),

      'views_by_device',    (
        SELECT COALESCE(json_agg(json_build_object('device', device, 'count', cnt)), '[]'::json)
        FROM (
          SELECT COALESCE(device, 'unknown') AS device, COUNT(*) AS cnt
          FROM public.link_views
          WHERE viewed_at >= start_ts
          GROUP BY 1
          ORDER BY cnt DESC
        ) sub
      ),

      'top_links',          (
        SELECT COALESCE(json_agg(row ORDER BY (row->>'views')::int DESC), '[]'::json)
        FROM (
          SELECT json_build_object(
            'link_id',       l.id,
            'business_name', l.business_name,
            'slug',          l.slug,
            'views',         COALESCE(v.cnt, 0),
            'clicks',        COALESCE(c.cnt, 0)
          ) AS row
          FROM public.links l
          LEFT JOIN (
            SELECT link_id, COUNT(*) AS cnt
            FROM public.link_views
            WHERE viewed_at >= start_ts
            GROUP BY link_id
          ) v ON v.link_id = l.id
          LEFT JOIN (
            SELECT link_id, COUNT(*) AS cnt
            FROM public.link_clicks
            WHERE clicked_at >= start_ts
            GROUP BY link_id
          ) c ON c.link_id = l.id
          ORDER BY COALESCE(v.cnt, 0) DESC
          LIMIT 10
        ) sub
      ),

      'plans_distribution', (
        SELECT COALESCE(json_agg(json_build_object('plan', plan, 'count', cnt)), '[]'::json)
        FROM (
          SELECT COALESCE(plan, 'free') AS plan, COUNT(*) AS cnt
          FROM public.profiles
          GROUP BY 1
          ORDER BY cnt DESC
        ) sub
      )
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_analytics(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_analytics(integer) TO authenticated;
```

---

## Exact SQL for `get_user_analytics`

```sql
-- Migration: 20260326000011_create_get_user_analytics_rpc.sql

CREATE OR REPLACE FUNCTION public.get_user_analytics(user_uuid uuid, period_days integer)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  start_ts timestamptz := NOW() - (period_days || ' days')::interval;
BEGIN
  -- Security: user can only access their own data
  IF auth.uid() <> user_uuid THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  RETURN (
    SELECT json_build_object(
      'total_views',      (
        SELECT COUNT(*)
        FROM public.link_views lv
        JOIN public.links l ON l.id = lv.link_id
        WHERE l.user_id = user_uuid
          AND lv.viewed_at >= start_ts
      ),
      'total_clicks',     (
        SELECT COUNT(*)
        FROM public.link_clicks lc
        JOIN public.links l ON l.id = lc.link_id
        WHERE l.user_id = user_uuid
          AND lc.clicked_at >= start_ts
      ),

      'views_by_day',     (
        SELECT COALESCE(json_agg(day_row ORDER BY day_row->>'date'), '[]'::json)
        FROM (
          SELECT json_build_object(
            'date',   to_char(d.day, 'YYYY-MM-DD'),
            'views',  COALESCE(v.cnt, 0),
            'clicks', COALESCE(c.cnt, 0)
          ) AS day_row
          FROM (
            SELECT generate_series(
              date_trunc('day', start_ts),
              date_trunc('day', NOW()),
              '1 day'::interval
            ) AS day
          ) d
          LEFT JOIN (
            SELECT date_trunc('day', lv.viewed_at) AS day, COUNT(*) AS cnt
            FROM public.link_views lv
            JOIN public.links l ON l.id = lv.link_id
            WHERE l.user_id = user_uuid
              AND lv.viewed_at >= start_ts
            GROUP BY 1
          ) v ON v.day = d.day
          LEFT JOIN (
            SELECT date_trunc('day', lc.clicked_at) AS day, COUNT(*) AS cnt
            FROM public.link_clicks lc
            JOIN public.links l ON l.id = lc.link_id
            WHERE l.user_id = user_uuid
              AND lc.clicked_at >= start_ts
            GROUP BY 1
          ) c ON c.day = d.day
        ) sub
      ),

      'views_by_device',  (
        SELECT COALESCE(json_agg(json_build_object('device', device, 'count', cnt)), '[]'::json)
        FROM (
          SELECT COALESCE(lv.device, 'unknown') AS device, COUNT(*) AS cnt
          FROM public.link_views lv
          JOIN public.links l ON l.id = lv.link_id
          WHERE l.user_id = user_uuid
            AND lv.viewed_at >= start_ts
          GROUP BY 1
          ORDER BY cnt DESC
        ) sub
      ),

      'clicks_by_button', (
        SELECT COALESCE(json_agg(json_build_object('button_id', button_id, 'count', cnt)), '[]'::json)
        FROM (
          SELECT lc.button_id, COUNT(*) AS cnt
          FROM public.link_clicks lc
          JOIN public.links l ON l.id = lc.link_id
          WHERE l.user_id = user_uuid
            AND lc.clicked_at >= start_ts
            AND lc.button_id IS NOT NULL
          GROUP BY lc.button_id
          ORDER BY cnt DESC
          LIMIT 10
        ) sub
      ),

      'views_by_link',    (
        SELECT COALESCE(json_agg(json_build_object(
          'link_id',       l.id,
          'slug',          l.slug,
          'business_name', l.business_name,
          'views',         COALESCE(v.cnt, 0)
        ) ORDER BY COALESCE(v.cnt, 0) DESC), '[]'::json)
        FROM public.links l
        LEFT JOIN (
          SELECT link_id, COUNT(*) AS cnt
          FROM public.link_views
          WHERE viewed_at >= start_ts
          GROUP BY link_id
        ) v ON v.link_id = l.id
        WHERE l.user_id = user_uuid
      )
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_analytics(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_analytics(uuid, integer) TO authenticated;
```

---

## Architecture Patterns

### SQL Serialization Choice
**Use `json_build_object` / `json_agg`** (not `row_to_json`). Rationale: `row_to_json` produces column names from the SELECT alias, which is fragile. `json_build_object` is explicit — field names are visible in the SQL, making future maintenance clear. The `get_course_modules` migration already uses `jsonb_build_object`; this phase uses `json_build_object` (returns `json` not `jsonb` per D-15).

### Generate Series for Day Arrays
Use `generate_series(date_trunc('day', start_ts), date_trunc('day', NOW()), '1 day'::interval)` to produce a complete day sequence with no gaps, then LEFT JOIN the actual event counts. This is more correct than the current client-side `eachDayOfInterval` approach — the server guarantees all days appear even with zero events.

### Client Date Formatting
The RPCs return `to_char(day, 'YYYY-MM-DD')` (ISO date string). The client maps this to the display label:

```typescript
// In AdminAnalyticsPage, replace growthChartData useMemo with:
const growthChartData = (data?.views_by_day ?? []).map((d) => ({
  date: format(parseISO(d.date), "dd/MM", { locale: ptBR }),
  views: d.views,
  cliques: d.clicks,      // rename for Recharts dataKey compatibility
  usuarios: d.new_users,  // rename for Recharts dataKey compatibility
}));

// In AnalyticsPage, replace chartData useMemo with:
const chartData = (data?.views_by_day ?? []).map((d) => ({
  date: format(parseISO(d.date), "dd/MM", { locale: ptBR }),
  views: d.views,
  clicks: d.clicks,
}));
```

This means `format` and `parseISO` from date-fns are still needed. `eachDayOfInterval`, `startOfDay`, and `subDays` can be removed.

---

## Client-Side Changes — Exact Specification

### AdminAnalyticsPage.tsx

**Imports to REMOVE:**
```typescript
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
// Replace with:
import { format, parseISO } from "date-fns";
```

**Also remove these local type definitions** (no longer needed):
```typescript
type LinkView = Pick<Tables<"link_views">, "viewed_at" | "device" | "link_id">;
type LinkClick = Pick<Tables<"link_clicks">, "clicked_at" | "link_id">;
type Profile = Pick<Tables<"profiles">, "plan" | "created_at">;
type AdminLink = Pick<Tables<"links">, "id" | "business_name" | "slug">;
```

**Remove:**
- `const startDate = useMemo(...)` (line 55-58)
- The entire `queryFn` body (lines 63-89) — replace with 3-line RPC call
- `const totalViews = data?.views.length ?? 0` (line 93)
- `const totalClicks = data?.clicks.length ?? 0` (line 94)
- `const newUsers = useMemo(...)` (lines 95-100)
- `const growthChartData = useMemo(...)` (lines 105-126) — replace with inline map
- `const planData = useMemo(...)` (lines 129-141) — replace with inline map
- `const topLinks = useMemo(...)` (lines 143-161) — replace with inline map

**New queryFn:**
```typescript
queryFn: async () => {
  const { data, error } = await supabase.rpc("get_admin_analytics", {
    period_days: periodDays,
  });
  if (error) throw error;
  return data as AdminAnalyticsData;
},
```

**New derived values (replace useMemos):**
```typescript
const totalViews  = data?.total_views  ?? 0;
const totalClicks = data?.total_clicks ?? 0;
const newUsers    = data?.new_users    ?? 0;

const growthChartData = (data?.views_by_day ?? []).map((d) => ({
  date:     format(parseISO(d.date), "dd/MM", { locale: ptBR }),
  views:    d.views,
  cliques:  d.clicks,
  usuarios: d.new_users,
}));

const planData = (data?.plans_distribution ?? []).map((d) => ({
  name:  PLAN_LABELS[d.plan] ?? d.plan,
  value: d.count,
  color: PLAN_COLORS[d.plan] ?? "hsl(250,10%,60%)",
}));

const topLinks = (data?.top_links ?? []).map((d) => ({
  name:  d.business_name || d.slug,
  views: d.views,
}));
```

**`useMemo` import** — remove `useMemo` from the React import if it is no longer used elsewhere in the file. Keep `useState`.

---

### AnalyticsPage.tsx

**Imports to REMOVE:**
```typescript
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
// Replace with:
import { format, parseISO } from "date-fns";
```

**Remove:**
- `const startDate = useMemo(...)` (line 23)
- The 4-query `Promise.all` block (lines 41-71) — replaced by single RPC call
- `const chartData = useMemo(...)` (lines 109-122) — replaced by inline map
- `const deviceData = useMemo(...)` (lines 124-134) — replaced by inline map
- `const topLinks = useMemo(...)` (lines 136-146) — replaced by inline map
- `const topCTAs = useMemo(...)` (lines 164-182) — replaced by inline map

**Keep:**
- The `links` fetch (lines 30-33) — still needed for `buttonLabels`/`buttonLink`
- `referrerData` useMemo — see Open Questions #1

**New queryFn structure:**
```typescript
queryFn: async () => {
  if (!user) return null;

  // Keep: links fetch for button label mapping (D-11)
  const { data: links } = await supabase
    .from("links")
    .select("id, business_name, slug, blocks, buttons")
    .eq("user_id", user.id);

  if (!links || links.length === 0) {
    return {
      analytics: null,
      links: [],
      buttonLabels: {} as Record<string, string>,
      buttonLink: {} as Record<string, string>,
    };
  }

  // Replace all 4 event queries with single RPC
  const { data: analytics, error } = await supabase.rpc("get_user_analytics", {
    user_uuid: user.id,
    period_days: periodDays,
  });
  if (error) throw error;

  // Build button/block label maps (unchanged logic)
  const buttonLabels: Record<string, string> = {};
  const buttonLink: Record<string, string> = {};
  for (const link of links) {
    // ... (same as current lines 76-93)
  }

  return { analytics: analytics as UserAnalyticsData, links, buttonLabels, buttonLink };
},
```

**New derived values:**
```typescript
const totalViews  = data?.analytics?.total_views  ?? 0;
const totalClicks = data?.analytics?.total_clicks ?? 0;

const chartData = (data?.analytics?.views_by_day ?? []).map((d) => ({
  date:   format(parseISO(d.date), "dd/MM", { locale: ptBR }),
  views:  d.views,
  clicks: d.clicks,
}));

const deviceData = (data?.analytics?.views_by_device ?? []).map((d) => ({
  name:  d.device === "mobile" ? "Mobile"
       : d.device === "desktop" ? "Desktop"
       : "Outro",
  value: d.count,
  color: d.device === "mobile"  ? "hsl(262, 83%, 58%)"
       : d.device === "desktop" ? "hsl(292, 84%, 61%)"
       : "hsl(250, 10%, 50%)",
}));

const topLinks = (data?.analytics?.views_by_link ?? []).map((d) => ({
  name:   d.business_name || d.slug,
  views:  d.views,
  clicks: 0,  // clicks_by_link not in RPC — or derive from clicks_by_button sum
}));

const topCTAs = (data?.analytics?.clicks_by_button ?? []).map((d) => ({
  id:       d.button_id,
  label:    data?.buttonLabels?.[d.button_id] || d.button_id,
  linkName: data?.buttonLink?.[d.button_id] || "—",
  count:    d.count,
}));
```

---

## TypeScript Types to Add

Add to `src/integrations/supabase/types.ts` in the `Functions` section:

```typescript
get_admin_analytics: {
  Args: { period_days: number }
  Returns: Json  // AdminAnalyticsData shape
}
get_user_analytics: {
  Args: { user_uuid: string; period_days: number }
  Returns: Json  // UserAnalyticsData shape
}
```

Add local type definitions at the top of each page file (or in a shared `src/types/analytics.ts`):

```typescript
// AdminAnalyticsPage.tsx local types
interface DayStatAdmin {
  date: string;      // "2026-03-20"
  views: number;
  clicks: number;
  new_users: number;
}
interface DeviceStat    { device: string; count: number; }
interface TopLink       { link_id: string; business_name: string; slug: string; views: number; clicks: number; }
interface PlanDist      { plan: string; count: number; }
interface AdminAnalyticsData {
  total_views: number;
  total_clicks: number;
  new_users: number;
  views_by_day: DayStatAdmin[];
  views_by_device: DeviceStat[];
  top_links: TopLink[];
  plans_distribution: PlanDist[];
}

// AnalyticsPage.tsx local types
interface DayStatUser {
  date: string;
  views: number;
  clicks: number;
}
interface ButtonClick   { button_id: string; count: number; }
interface LinkViewStat  { link_id: string; slug: string; business_name: string; views: number; }
interface UserAnalyticsData {
  total_views: number;
  total_clicks: number;
  views_by_day: DayStatUser[];
  views_by_device: DeviceStat[];
  clicks_by_button: ButtonClick[];
  views_by_link: LinkViewStat[];
}
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Gap-free day series | JS array fill loop | `generate_series` in Postgres | Timezone-safe, single DB roundtrip |
| Date aggregation | `startsWith(dayStr)` string match | `date_trunc('day', ts)` | Correct with timezone offsets |
| Exact counts | fetch 5000 rows then `.length` | `COUNT(*)` in SQL | Accurate even beyond 5000 rows |
| JSON serialization | manual `JSON.stringify` | `json_build_object` / `json_agg` | Native Postgres, no extra round-trip |

---

## Common Pitfalls

### Pitfall 1: `json_agg` Returns NULL on Empty Set
**What goes wrong:** `SELECT json_agg(x) FROM empty_table` returns `NULL`, not `[]`. Client code doing `data.views_by_day.map(...)` throws.
**How to avoid:** Always wrap with `COALESCE(json_agg(...), '[]'::json)`.
**Already in SQL above:** Yes — every `json_agg` call is wrapped.

### Pitfall 2: `LANGUAGE sql` Cannot Use DECLARE Variables
**What goes wrong:** Trying to define `start_ts` as a variable in `LANGUAGE sql` is a syntax error.
**How to avoid:** Use `LANGUAGE plpgsql` for RPCs that need local variables. The `admin_delete_user` migration demonstrates this pattern correctly.

### Pitfall 3: `generate_series` Timezone Drift
**What goes wrong:** `generate_series(start_ts, NOW(), '1 day')` with timestamptz inputs can produce unexpected day boundaries if the DB timezone differs from the user's timezone.
**How to avoid:** Use `date_trunc('day', start_ts)` as the series start (already in SQL above). The display label conversion `format(parseISO(d.date), "dd/MM", ...)` happens in the browser with the user's local timezone — acceptable for this use case.

### Pitfall 4: Recharts `dataKey` Key Name Mismatch
**What goes wrong:** The SQL returns `clicks` and `new_users` but the Recharts `<Line>` uses `dataKey="cliques"` and `dataKey="usuarios"` (Portuguese).
**How to avoid:** The client-side `.map()` that transforms `views_by_day` must rename the keys before passing to Recharts. This is explicitly shown in the client patterns above.

### Pitfall 5: `topLinks` in AnalyticsPage Also Renders `clicks`
**What goes wrong:** Current `topLinks` in AnalyticsPage shows both `views` and `clicks` per link. `views_by_link` RPC field only returns `views`. The `clicks` per link is not aggregated in `get_user_analytics`.
**How to avoid:** The BarChart in AnalyticsPage only renders `dataKey="views"` (line 329) — there is no Bar for clicks. The `topLinks` computed value includes `clicks` only in the useMemo (line 141) but it is not rendered. Safe to default to 0 or omit.

### Pitfall 6: `referrerData` in AnalyticsPage
**What goes wrong:** `referrerData` useMemo reads `data.views` (raw rows array). After migration, `data.views` no longer exists.
**How to avoid:** See Open Questions #1.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `startsWith("yyyy-MM-dd")` string match | `date_trunc('day', ts)` GROUP BY | Correct across timezones |
| Fetch raw rows, count in JS | `COUNT(*)` in SQL | Accurate beyond 5000-row cap |
| `eachDayOfInterval` + JS filter | `generate_series` + LEFT JOIN | No gaps, server-side |

---

## Open Questions

### 1. `referrerData` in AnalyticsPage
- **What we know:** `referrerData` useMemo (lines 148-162) reads `data.views` which is the raw 5000-row array. After migration this array will not exist.
- **What's unclear:** Is `referrerData` display in scope to preserve? The CONTEXT.md "Deferred Ideas" lists "Analytics por referrer (UTM source)" as backlog but that is a NEW feature. The existing referrer display is current functionality.
- **Recommendation:** The simplest fix that requires no scope change: add a `referrer_top5` array to `get_user_analytics` returning `{referrer: string | null, count: number}[]`. This is a 6-line addition to the SQL. Alternatively, drop the "Origens de Trafego" section from the page as part of this phase cleanup. The planner should pick one — this research defaults to including it in the RPC as it is pre-existing functionality.

### 2. `topLinks` clicks column in AnalyticsPage
- **What we know:** `topLinks` useMemo returns `{name, views, clicks}` but only `views` is rendered in the BarChart.
- **Recommendation:** Return only `views` from `views_by_link` in the RPC, set `clicks: 0` in the client map. No visible regression.

---

## Sources

### Primary (HIGH confidence)
- `src/integrations/supabase/types.ts` — exact column types for `link_views`, `link_clicks`, `profiles`, `links`
- `supabase/migrations/20260308175031_...sql` — `get_user_links_with_stats` pattern (RETURNS TABLE, SECURITY DEFINER, LANGUAGE sql)
- `supabase/migrations/20260321000005_get_course_modules_rpc.sql` — `jsonb_build_object` / `jsonb_agg` nesting pattern
- `supabase/migrations/20260325000001_fix_admin_delete_and_user_links.sql` — `LANGUAGE plpgsql` + DECLARE + SECURITY DEFINER pattern, `get_admin_users` guard clause pattern
- `src/pages/admin/AdminAnalyticsPage.tsx` — exact lines to replace, Recharts dataKey names
- `src/pages/AnalyticsPage.tsx` — exact lines to replace, button label map pattern
- `src/hooks/use-admin.ts` line 31 — `supabase.rpc()` call pattern

### Secondary (MEDIUM confidence)
- `supabase/migrations/20260322100002_fix_analytics_rls_and_indexes.sql` — confirmed composite indexes on `(link_id, viewed_at DESC)` and `(link_id, clicked_at DESC)` exist, so the JOIN subqueries in the RPCs will use these indexes

---

## Metadata

**Confidence breakdown:**
- Table schema: HIGH — read directly from generated types.ts
- Exact SQL: HIGH — derived from schema + verified patterns in existing migrations
- Client changes: HIGH — read exact line numbers from source files
- TypeScript types: HIGH — derived from locked decisions in CONTEXT.md

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (schema changes would invalidate)

---

## RESEARCH COMPLETE
