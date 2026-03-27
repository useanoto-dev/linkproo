# Phase 4: Analytics RPC Migration — Context

**Gathered:** 2026-03-24
**Status:** Ready for planning
**Mode:** --auto (Claude defaults)

<domain>
## Phase Boundary

Migrar os fetches de raw rows client-side em `AdminAnalyticsPage.tsx` e `AnalyticsPage.tsx` para Postgres RPC functions que retornam dados já agregados. O client recebe apenas os dados necessários para renderizar os gráficos — não raw rows.

Fora do escopo: redesign dos gráficos, novas métricas, mudança no schema das tabelas `link_views`/`link_clicks`.

</domain>

<decisions>
## Implementation Decisions

### RPC Functions a Criar

Dois contextos distintos: admin (todas as contas) e usuário (seus próprios links).

**Admin RPC (`get_admin_analytics`):**
- **D-01:** Criar função `get_admin_analytics(period_days integer)` — retorna JSON agregado com:
  - `total_views`, `total_clicks`, `new_users` (no período)
  - `views_by_day`: array de `{date, views, clicks, new_users}` para o gráfico de crescimento
  - `views_by_device`: array de `{device, count}` para o pie chart
  - `top_links`: array de `{link_id, business_name, slug, views, clicks}` top 10
  - `plans_distribution`: array de `{plan, count}` para o pie chart de planos
- **D-02:** A função usa `SECURITY DEFINER` — admin-only, sem RLS interference
- **D-03:** O período é calculado no servidor: `NOW() - (period_days || ' days')::interval`

**User RPC (`get_user_analytics`):**
- **D-04:** Criar função `get_user_analytics(user_uuid uuid, period_days integer)` — retorna JSON agregado com:
  - `total_views`, `total_clicks` (exact counts, no período)
  - `views_by_day`: array de `{date, views, clicks}` para o gráfico de linha
  - `views_by_device`: array de `{device, count}` para o breakdown desktop/mobile
  - `clicks_by_button`: array de `{button_id, count}` top 10 botões mais clicados
  - `views_by_link`: array de `{link_id, slug, business_name, views}` por link do usuário
- **D-05:** A função usa `SECURITY DEFINER` com validação `user_uuid = auth.uid()` para garantir que o usuário só vê seus próprios dados
- **D-06:** `button_id` retornado é o ID bruto — o label mapping (buttonLabels/buttonLink) continua sendo feito no client com os dados dos links (que já são fetchados separadamente)

### Remoção dos Raw Fetches

**AdminAnalyticsPage.tsx:**
- **D-07:** Substituir o `Promise.all` de 4 queries (views limit 10000, clicks limit 10000, profiles, links) por `supabase.rpc("get_admin_analytics", { period_days: periodDays })`
- **D-08:** O `useMemo` de `growthChartData`, `deviceData`, `planData`, `topLinksData` são eliminados — esses cálculos vão para o servidor. O componente usa os arrays retornados diretamente.
- **D-09:** Remover imports de `eachDayOfInterval`, `startOfDay`, `subDays` que não serão mais usados

**AnalyticsPage.tsx:**
- **D-10:** Substituir o `Promise.all` de 4 queries (views limit 5000, clicks limit 5000, + 2 count queries) por `supabase.rpc("get_user_analytics", { user_uuid: user.id, period_days: periodDays })`
- **D-11:** O fetch separado de `links` para button labels PERMANECE — ainda é necessário para mapear button_id → label (dados estruturais, não analíticos). Apenas os fetches de `link_views`/`link_clicks` são substituídos.
- **D-12:** Manter o `useQuery` com `queryKey: ["analytics", user.id, period]` — apenas mudar o `queryFn`

### Migrations

- **D-13:** Criar 2 migrations em `supabase/migrations/`:
  - `20260326000010_create_get_admin_analytics_rpc.sql`
  - `20260326000011_create_get_user_analytics_rpc.sql`
- **D-14:** Ambas as migrations usam `CREATE OR REPLACE FUNCTION` — idempotentes
- **D-15:** Retorno das funções é `RETURNS json` — simples de consumir no client com `supabase.rpc()`

### Claude's Discretion

- Exato SQL de cada aggregate (GROUP BY, date_trunc, JOIN com profiles/links)
- Se usar `json_build_object` ou `row_to_json` para serialização
- Ordem das colunas no retorno
- Limite de `top_links` (10 ou 20 — usar 10)

</decisions>

<specifics>
## Specific Ideas

- Para `views_by_day`, usar `date_trunc('day', viewed_at)` para agrupamento — mais correto que `startsWith(dayStr)` no client
- O `get_admin_analytics` precisa JOIN com `profiles` para `new_users` e `plans_distribution`, e JOIN com `links` para `top_links`
- No client, após a migração, `data.views_by_day` substitui o `growthChartData` useMemo — o formato deve ser compatível com o que Recharts espera

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Arquivos a modificar
- `src/pages/admin/AdminAnalyticsPage.tsx` — fetch admin: 4 queries → 1 RPC
- `src/pages/AnalyticsPage.tsx` — fetch user: 4 queries → 1 RPC
- `supabase/migrations/` — criar 2 migration files com as funções SQL

### Padrões RPC existentes (referência)
- `src/hooks/use-admin.ts` — linha 31: `supabase.rpc("get_admin_users")` — padrão de chamada
- `src/hooks/use-links.ts` — linha 29: `supabase.rpc("get_user_links_with_stats")` — padrão de chamada

### Schema das tabelas (para escrever o SQL)
- `supabase/migrations/` — migrations existentes contêm o schema das tabelas `link_views`, `link_clicks`, `profiles`, `links`
- `src/integrations/supabase/types.ts` — tipos gerados: `Tables<"link_views">`, `Tables<"link_clicks">`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `use-admin.ts` padrão RPC: `supabase.rpc("nome", { param })` — mesmo padrão a usar
- `use-links.ts` `get_user_links_with_stats`: exemplo de RPC com SECURITY DEFINER no projeto

### Established Patterns
- Migrations com `CREATE OR REPLACE FUNCTION` — já usado em `get_admin_users`, etc.
- `RETURNS json` para RPCs que retornam dados compostos — padrão no projeto
- `useQuery` com `queryKey: ["key", deps]` — não mudar a estrutura do hook

### Integration Points
- `AdminAnalyticsPage.tsx` usa `useMemo` extensivamente para agregar dados — serão removidos
- `AnalyticsPage.tsx` mantém fetch de `links` (para button labels) separado do analytics fetch
- Ambas as páginas já têm `period` state + `periodDays` computed — apenas o `queryFn` muda

</code_context>

<deferred>
## Deferred Ideas

- Analytics por referrer (UTM source) — backlog
- Export de dados CSV — backlog
- Real-time analytics com Supabase Realtime — fora do escopo v1.0
- Analytics de A/B testing (métricas de CTR) — Phase 9

</deferred>

---

*Phase: 04-analytics-rpc*
*Context gathered: 2026-03-24*
