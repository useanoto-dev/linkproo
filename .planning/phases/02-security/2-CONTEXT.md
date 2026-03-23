# Phase 2: Security Hardening — Context

**Gathered:** 2026-03-23
**Status:** Ready for planning
**Mode:** --auto (Claude defaults)

<domain>
## Phase Boundary

Fechar as 5 brechas de segurança e conformidade identificadas no mapeamento do codebase: plan limits atômicos via trigger Postgres, slugs reservados com enforcement DB-level, `protect.ts` escopado ao PublicLinkPage, CSP/sandbox nos iframes, e disclosure LGPD para device fingerprinting.

Fora do escopo: autenticação, rate limiting, pentest completo. Apenas as 5 brechas mapeadas.

</domain>

<decisions>
## Implementation Decisions

### protect.ts — Escopo ao PublicLinkPage

Estado atual: `initProtection()` chamado globalmente em `main.tsx` — bloqueia DevTools, right-click e Ctrl+S para TODOS os usuários, incluindo admins e desenvolvedores no editor.

- **D-01:** Remover `initProtection()` de `src/main.tsx` completamente
- **D-02:** Chamar `initProtection()` dentro de `src/pages/PublicLinkPage.tsx` via `useEffect` com cleanup — os event listeners devem ser removidos quando o componente desmonta (usuário sai da página pública)
- **D-03:** A função `initProtection()` deve retornar um cleanup function (retornar função que remove todos os event listeners) para que o `useEffect` possa fazer cleanup corretamente
- **D-04:** A proteção não se aplica a admins autenticados navegando em páginas públicas — o escopo é apenas a rota `/:slug` e `/:slug/:pageSlug`

### Plan Limits — Trigger Postgres Atômico

Estado atual: enforcement client-side em `use-links.ts` com `Promise.all([select plan, count links])` — race condition: dois requests simultâneos podem passar o limite.

- **D-05:** Criar migration Supabase com function PL/pgSQL + trigger `BEFORE INSERT ON links`
- **D-06:** A trigger function deve: (1) buscar `profiles.plan` do `NEW.user_id`, (2) contar links existentes do usuário, (3) comparar com limite do plano (free=3, pro=50, business=NULL/sem limite), (4) fazer `RAISE EXCEPTION` se excedido — o erro propaga para o cliente como Supabase error
- **D-07:** Os limites no trigger devem usar uma tabela de configuração ou hardcode — hardcode no trigger é aceitável para v1.0 (free=3, pro=50, business=9999)
- **D-08:** Manter o check client-side em `use-links.ts` como UX optimization (feedback imediato ao usuário) — mas não é a fonte de verdade de segurança
- **D-09:** Nome da migration: `add_plan_limit_trigger` — criar arquivo em `supabase/migrations/` com timestamp atual

### Slugs Reservados — Enforcement DB-Level

Estado atual: `RESERVED_SLUGS` Set e `validateSlug()` existem em `slug-utils.ts` — robusto client-side, mas sem enforcement no banco.

- **D-10:** Adicionar `CHECK` constraint na coluna `slug` da tabela `links` via migration Supabase
- **D-11:** A constraint deve validar: (a) formato regex `^[a-z0-9]+(-[a-z0-9]+)*$`, (b) comprimento 3-50 chars, (c) `NOT IN` com a lista de slugs reservados
- **D-12:** A lista `RESERVED_SLUGS` do client (`slug-utils.ts`) deve ser a source of truth — copiar a mesma lista para a migration DB. Não criar divergência entre client e DB.
- **D-13:** Adicionar também `UNIQUE` index na coluna `slug` se não existir (verificar na migration)

### CSP — Iframes Seguros

Estado atual:
- `BgHtmlEffect.tsx`: tem `sandbox="allow-scripts"` — parcialmente seguro
- `BlockRenderer.tsx` (video embed): `<iframe src={embedUrl}>` sem sandbox
- `LessonPlayer.tsx`: `<iframe>` sem sandbox

- **D-14:** `BgHtmlEffect.tsx`: adicionar `allow=""` (empty permissions policy — bloqueia camera, mic, geolocation, etc.) e `referrerpolicy="no-referrer"`
- **D-15:** `BlockRenderer.tsx` video embed iframe: adicionar `sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"` + `allow="autoplay; encrypted-media; picture-in-picture"` + `referrerpolicy="no-referrer-when-downgrade"`
- **D-16:** `LessonPlayer.tsx` iframe: mesmos atributos que D-15 (é também embed de vídeo externo)
- **D-17:** NÃO adicionar `allow-same-origin` ao `BgHtmlEffect` — o HTML do usuário não deve ter acesso ao DOM pai

### LGPD — Disclosure de Fingerprinting

Estado atual: `useDeviceFingerprint()` coleta canvas, WebGL, screen info, userAgent silenciosamente. Usuário não é informado.

- **D-18:** Adicionar disclosure na página de configurações/perfil do dashboard (não banner intrusivo) — texto simples: "Para segurança da conta, coletamos um identificador do dispositivo que inclui informações técnicas do navegador (userAgent, resolução, fuso horário). Consulte nossa política de privacidade."
- **D-19:** O disclosure deve aparecer em `src/pages/SettingsPage.tsx` ou equivalente — se não existir, adicionar na seção de segurança do dashboard onde o usuário gerencia a conta
- **D-20:** Não adicionar banner de consent pop-up — o fingerprinting é para proteção anti-fraude da conta do próprio usuário (base legal: legítimo interesse), não para rastreamento publicitário
- **D-21:** Adicionar link "Política de Privacidade" no footer do `DashboardLayout.tsx` se não existir

### Claude's Discretion

- Exato texto legal da disclosure LGPD (manter simples e claro em PT-BR)
- Nomes das migration files (usar timestamp atual)
- Ordem de execução das tasks dentro de cada plan
- Se criar `PrivacySection` component ou inline no settings

</decisions>

<specifics>
## Specific Ideas

- O trigger Postgres deve dar mensagem de erro em PT-BR: `'Limite de links atingido para o plano ' || plan_name || '. Faça upgrade para criar mais links.'`
- A constraint de slug deve ter nome descritivo: `links_slug_valid_format` e `links_slug_not_reserved`
- O `protect.ts` cleanup deve remover EXATAMENTE os mesmos listeners que foram adicionados (mesmas referências de função) — cuidado com arrow functions anônimas que não podem ser removidas com `removeEventListener`

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### protect.ts e PublicLinkPage
- `src/lib/protect.ts` — implementação atual de `initProtection()` (precisa de refactor para retornar cleanup)
- `src/main.tsx` — onde `initProtection()` é chamado hoje (remover daqui)
- `src/pages/PublicLinkPage.tsx` — destino do `useEffect(() => initProtection(), [])`
- `src/App.tsx` — rotas `/:slug` e `/:slug/:pageSlug` que mapeiam para PublicLinkPage

### Plan limits
- `src/hooks/use-links.ts` — check client-side atual (linhas ~104-115, manter como UX)
- `supabase/migrations/` — onde criar a nova migration com trigger
- `supabase/config.toml` — config do projeto Supabase local

### Slugs reservados
- `src/lib/slug-utils.ts` — `RESERVED_SLUGS` Set (source of truth para copiar para DB)
- `supabase/migrations/` — onde criar migration com CHECK constraint

### Iframes
- `src/components/BgHtmlEffect.tsx` — iframe de HTML customizado do usuário
- `src/components/preview/BlockRenderer.tsx` — iframe de embed de vídeo
- `src/components/course/LessonPlayer.tsx` — iframe de videoaula

### LGPD fingerprint
- `src/hooks/use-device-fingerprint.ts` — onde o fingerprint é coletado
- `src/lib/device-fingerprint.ts` — o que é coletado (canvas, WebGL, screen, etc.)
- `src/components/DashboardLayout.tsx` — footer do dashboard (adicionar link privacy)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `slug-utils.ts` `RESERVED_SLUGS`: lista já completa — copiar verbatim para migration SQL como array
- `use-links.ts` plan limits check: lógica de negócio já correta — apenas adicionar camada DB
- `BgHtmlEffect.tsx` `sandbox="allow-scripts"`: já existe — apenas adicionar `allow=""` e `referrerpolicy`

### Established Patterns
- Migrations em `supabase/migrations/` com prefixo timestamp ISO — seguir padrão dos arquivos existentes
- Supabase client via `@/integrations/supabase/client` — não mudar
- Componentes de página usam `useEffect` com cleanup — padrão estabelecido

### Integration Points
- `protect.ts` usa `document.addEventListener` globalmente — refactor para named functions para permitir `removeEventListener`
- `use-links.ts` `createLink` recebe erro do Supabase — o erro do trigger Postgres chegará como `error.message` do Supabase, o catch atual já trata erros genéricos
- O disclosure LGPD precisa identificar onde fica a página de settings — checar se existe `SettingsPage.tsx` ou equivalente

</code_context>

<deferred>
## Deferred Ideas

- Rate limiting em criação de links/slugs — backlog (requer middleware/edge function)
- Pentest completo / OWASP scan — fora do escopo v1.0
- Consent management platform (CMP) para cookies — não aplicável (sem cookies de rastreamento)
- Audit log de ações admin — backlog fase futura

</deferred>

---

*Phase: 02-security*
*Context gathered: 2026-03-23*
