# Phase 2: Security Hardening — Research

**Researched:** 2026-03-23
**Domain:** PostgreSQL triggers, React useEffect cleanup, iframe sandbox, LGPD compliance
**Confidence:** HIGH — all findings verified against live codebase

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**protect.ts — Escopo ao PublicLinkPage**
- D-01: Remover `initProtection()` de `src/main.tsx` completamente
- D-02: Chamar `initProtection()` dentro de `src/pages/PublicLinkPage.tsx` via `useEffect` com cleanup
- D-03: A função `initProtection()` deve retornar uma cleanup function (retornar função que remove todos os event listeners)
- D-04: A proteção não se aplica a admins autenticados navegando em páginas públicas — escopo é apenas `/:slug` e `/:slug/:pageSlug`

**Plan Limits — Trigger Postgres Atômico**
- D-05: Criar migration Supabase com function PL/pgSQL + trigger `BEFORE INSERT ON links`
- D-06: Trigger function deve: (1) buscar `profiles.plan` do `NEW.user_id`, (2) contar links existentes, (3) comparar com limites (free=3, pro=50, business=NULL/sem limite), (4) `RAISE EXCEPTION` se excedido
- D-07: Hardcode no trigger é aceitável para v1.0 (free=3, pro=50, business=9999)
- D-08: Manter check client-side em `use-links.ts` como UX optimization — não é fonte de verdade
- D-09: Nome da migration: `add_plan_limit_trigger` — em `supabase/migrations/` com timestamp atual

**Slugs Reservados — Enforcement DB-Level**
- D-10: Adicionar `CHECK` constraint na coluna `slug` via migration Supabase
- D-11: Constraint deve validar: (a) formato regex `^[a-z0-9]+(-[a-z0-9]+)*$`, (b) comprimento 3-50 chars, (c) `NOT IN` com lista reservada
- D-12: `RESERVED_SLUGS` do client é source of truth — copiar mesma lista para migration DB
- D-13: Adicionar `UNIQUE` index na coluna `slug` se não existir

**CSP — Iframes Seguros**
- D-14: `BgHtmlEffect.tsx`: adicionar `allow=""` (empty permissions policy) e `referrerpolicy="no-referrer"`
- D-15: `BlockRenderer.tsx` video embed: adicionar `sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"` + `allow="autoplay; encrypted-media; picture-in-picture"` + `referrerpolicy="no-referrer-when-downgrade"`
- D-16: `LessonPlayer.tsx` iframe: mesmos atributos que D-15
- D-17: NÃO adicionar `allow-same-origin` ao `BgHtmlEffect` — HTML do usuário não deve acessar DOM pai

**LGPD — Disclosure de Fingerprinting**
- D-18: Disclosure em `src/pages/SettingsPage.tsx` — texto simples em seção de segurança/privacidade
- D-19: Se não existir seção adequada, adicionar seção nova na SettingsPage
- D-20: Não adicionar banner de consent pop-up — base legal é legítimo interesse (anti-fraude)
- D-21: Adicionar link "Política de Privacidade" no footer do `DashboardLayout.tsx`

### Claude's Discretion
- Exato texto legal da disclosure LGPD (manter simples e claro em PT-BR)
- Nomes das migration files (usar timestamp atual)
- Ordem de execução das tasks dentro de cada plan
- Se criar `PrivacySection` component ou inline no settings

### Deferred Ideas (OUT OF SCOPE)
- Rate limiting em criação de links/slugs
- Pentest completo / OWASP scan
- Consent management platform (CMP) para cookies
- Audit log de ações admin
</user_constraints>

---

## Summary

Esta fase fecha 5 brechas de segurança identificadas no codebase. A análise do código-fonte revela que **duas das 5 brechas já têm migrations parciais existentes** que precisam ser revisadas antes de duplicar trabalho: `20260322100005_add_slug_reserved_constraint.sql` já implementa o `NOT IN` de slugs reservados, e `20260304145650_eab359af...sql` já contém o trigger `check_link_limit_trigger`. As tasks devem verificar se essas migrations já estão aplicadas no banco e decidir se devem ser substituídas ou complementadas.

As 3 brechas restantes (protect.ts escopo, iframe sandbox, LGPD disclosure) são mudanças puramente no código frontend — sem migrations necessárias. O `protect.ts` tem 4 event listeners registrados com arrow functions anônimas, o que torna `removeEventListener` impossível sem refactor para named functions. A `SettingsPage.tsx` encerra na linha 247 com apenas duas seções (Perfil e Empresa) seguidas do botão Salvar — há espaço para adicionar uma terceira seção de Privacidade/Segurança antes do botão.

**Primary recommendation:** Executar em ordem — (1) verificar migrations existentes, (2) criar/atualizar migration para plan limits com mensagem PT-BR correta, (3) verificar constraint de slug, (4) refatorar protect.ts para named functions + cleanup, (5) adicionar sandbox aos iframes, (6) adicionar disclosure LGPD na SettingsPage.

---

## Critical Pre-Work: Migrations Already Partially Exist

### ALERTA: Plan Limit Trigger — Já Existe

**Arquivo:** `supabase/migrations/20260304145650_eab359af-bf37-447f-a0da-a47d1d479084.sql`

Já contém:
```sql
CREATE OR REPLACE FUNCTION public.check_link_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
...
  max_links := CASE user_plan
    WHEN 'free' THEN 3
    WHEN 'pro' THEN 50
    WHEN 'business' THEN 999
    ELSE 3
  END;
  IF current_count >= max_links THEN
    RAISE EXCEPTION 'Limite de links atingido para o plano %. Máximo: %', user_plan, max_links;
  END IF;
```

**Diferenças vs. D-06/D-07:**
- Mensagem não inclui "Faça upgrade para criar mais links" (CONTEXT especifica mensagem diferente)
- Usa `999` para business (CONTEXT diz `9999` — divergência menor, irrelevante funcionalmente)
- Mensagem de erro usa formato `%` (positional) vs. o formato pedido em PT-BR no CONTEXT

**Ação:** Criar nova migration que usa `CREATE OR REPLACE FUNCTION` para atualizar a função existente com a mensagem correta. O trigger já existe (`check_link_limit_trigger`) — não recriar.

### ALERTA: Slug Reserved Constraint — Já Existe

**Arquivo:** `supabase/migrations/20260322100005_add_slug_reserved_constraint.sql`

Já contém o `CHECK links_slug_not_reserved` com `NOT IN (...)`.

**Diferenças vs. D-10/D-11/D-12:**
- Não inclui constraint de formato regex `^[a-z0-9]+(-[a-z0-9]+)*$` (D-11a)
- Não inclui constraint de comprimento 3-50 chars (D-11b) — pode estar em outro lugar
- Faltam alguns slugs da lista client: `smtp`, `pop`, `imap`, `null`, `undefined`, `true`, `false`
- Constraint chamada `links_slug_not_reserved` (mesmo nome do CONTEXT — ok)

**Ação:** Criar migration com `links_slug_valid_format` (formato regex + comprimento) e atualizar `links_slug_not_reserved` com a lista completa do client.

### ALERTA: UNIQUE index em slug — Já Existe

**Arquivo:** `supabase/migrations/20260304145650_eab359af-bf37-447f-a0da-a47d1d479084.sql`

```sql
ALTER TABLE public.links ADD CONSTRAINT links_slug_key UNIQUE (slug);
```

D-13 está satisfeito. Não recriar.

---

## Architecture Patterns

### Pattern 1: protect.ts — Refactor para Named Functions com Cleanup

**Problema atual:** `initProtection()` usa arrow functions anônimas em todos os `addEventListener` — impossível fazer `removeEventListener` porque referências não são preservadas.

**Estado atual (protect.ts):**
```typescript
// PROBLEMA: arrow functions anônimas — não podem ser removidas
document.addEventListener("contextmenu", (e) => { ... });       // anônima
document.addEventListener("keydown", (e) => { ... }, true);     // anônima
document.addEventListener("dragstart", (e) => { ... });         // anônima
document.addEventListener("selectstart", (e) => { ... });       // anônima
```

**Refactor necessário — padrão de named functions:**
```typescript
// Source: MDN EventTarget.removeEventListener — requer mesma referência de função
export function initProtection(): () => void {
  function onContextMenu(e: MouseEvent) { e.preventDefault(); showProtectToast(); }
  function onKeyDown(e: KeyboardEvent) { /* ... bloqueia F12 etc ... */ }
  function onDragStart(e: DragEvent) { /* ... bloqueia IMG drag ... */ }
  function onSelectStart(e: Event) { /* ... bloqueia IMG select ... */ }

  document.addEventListener("contextmenu", onContextMenu);
  document.addEventListener("keydown", onKeyDown, true);  // capture=true mantido
  document.addEventListener("dragstart", onDragStart);
  document.addEventListener("selectstart", onSelectStart);

  // Retorna cleanup function — mesmas referências, mesmas opções (capture=true)
  return () => {
    document.removeEventListener("contextmenu", onContextMenu);
    document.removeEventListener("keydown", onKeyDown, true);  // capture deve ser igual
    document.removeEventListener("dragstart", onDragStart);
    document.removeEventListener("selectstart", onSelectStart);
  };
}
```

**CRÍTICO sobre capture flag:** `removeEventListener` exige que o terceiro argumento `capture` seja idêntico ao do `addEventListener`. O listener `keydown` usa `true` (capture phase) — o `removeEventListener` correspondente deve também passar `true`.

**Uso em PublicLinkPage.tsx:**
```typescript
// Padrão React useEffect com cleanup
useEffect(() => {
  const cleanup = initProtection();
  return cleanup;  // chamado quando componente desmonta
}, []);
```

**toastTimeout — módulo-level state:** A variável `toastTimeout` é module-level (`let toastTimeout`). Se `initProtection` for chamado múltiplas vezes (navegação SPA), o debounce funciona corretamente pois é compartilhado. Não há bug aqui.

**`_protect-style` style tag:** O `getElementById("_protect-style")` já protege contra injeção dupla — safe para múltiplos mounts.

### Pattern 2: Postgres Trigger — Atualização da Função Existente

**O trigger já existe.** A migration nova deve apenas atualizar a função com mensagem PT-BR corrigida:

```sql
-- Migration: 20260323XXXXXX_update_plan_limit_message.sql
CREATE OR REPLACE FUNCTION public.check_link_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  user_plan     TEXT;
  max_links     INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count
    FROM public.links WHERE user_id = NEW.user_id;

  SELECT COALESCE(plan, 'free') INTO user_plan
    FROM public.profiles WHERE user_id = NEW.user_id;

  max_links := CASE user_plan
    WHEN 'free'     THEN 3
    WHEN 'pro'      THEN 50
    WHEN 'business' THEN 9999
    WHEN 'admin'    THEN 9999
    ELSE 3
  END;

  IF current_count >= max_links THEN
    RAISE EXCEPTION 'Limite de links atingido para o plano %. Faça upgrade para criar mais links.', user_plan;
  END IF;

  RETURN NEW;
END;
$$;
-- O trigger check_link_limit_trigger já existe — não recriar
```

**Como o erro chega ao client:** O Supabase retorna erros de trigger como `PostgrestError` com `message` = texto do `RAISE EXCEPTION`. O `useSaveLink` em `use-links.ts` já tem `onError: (err: Error) => toast.error(err.message)` — o texto PT-BR aparecerá no toast automaticamente.

**Race condition eliminada:** O trigger roda dentro da transação de INSERT — atomicamente. Dois INSERTs simultâneos executam o `COUNT(*)` antes de cada INSERT confirmar, então ambos veem o count correto e apenas um passará se estiver no limite.

### Pattern 3: Slug Constraints — Migrations Adicionais

**Constraint de formato (nova — não existe):**
```sql
-- Nome: links_slug_valid_format (conforme CONTEXT specifics)
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_slug_valid_format;
ALTER TABLE public.links
ADD CONSTRAINT links_slug_valid_format
CHECK (
  length(slug) >= 3
  AND length(slug) <= 50
  AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
);
```

**NOTA PostgreSQL:** O operador `~` é case-sensitive em Postgres. O regex `^[a-z0-9]+(-[a-z0-9]+)*$` é correto para validar slugs lowercase.

**Constraint de reservados — atualizar lista completa:**

A lista no DB atual está incompleta vs. `slug-utils.ts`. A lista completa do client:
```
'admin', 'auth', 'api', 'dashboard', 'links', 'settings',
'analytics', 'plans', 'suporte', 'support', 'reset-password',
'login', 'signup', 'register', 'logout', 'profile', 'billing',
'pricing', 'help', 'docs', 'blog', 'about', 'contact',
'terms', 'privacy', 'status',
'app', 'www', 'mail', 'ftp', 'smtp', 'pop', 'imap',
'static', 'assets', 'public', 'favicon', 'robots', 'sitemap',
'null', 'undefined', 'true', 'false'
```

**Itens faltando na migration DB atual:** `smtp`, `pop`, `imap`, `null`, `undefined`, `true`, `false`

**Migration para atualizar:**
```sql
ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_slug_not_reserved;
ALTER TABLE public.links
ADD CONSTRAINT links_slug_not_reserved
CHECK (
  slug NOT IN (
    'admin', 'auth', 'api', 'dashboard', 'links', 'settings',
    'analytics', 'plans', 'suporte', 'support', 'reset-password',
    'login', 'signup', 'register', 'logout', 'profile', 'billing',
    'pricing', 'help', 'docs', 'blog', 'about', 'contact',
    'terms', 'privacy', 'status', 'app', 'www', 'mail', 'ftp',
    'smtp', 'pop', 'imap',
    'static', 'assets', 'public', 'favicon', 'robots', 'sitemap',
    'null', 'undefined', 'true', 'false'
  )
);
```

### Pattern 4: iframe Sandbox — Atributos Exatos

**BgHtmlEffect.tsx — estado atual:**
```tsx
<iframe sandbox="allow-scripts" .../>
```

**BgHtmlEffect.tsx — estado alvo (D-14 + D-17):**
```tsx
<iframe
  sandbox="allow-scripts"
  allow=""
  referrerPolicy="no-referrer"
  ...
/>
```

**Por que NÃO adicionar `allow-same-origin`:** Com `sandbox="allow-scripts allow-same-origin"`, o iframe poderia acessar `window.parent`, ler cookies do domínio pai e fazer requests autenticados. O HTML vem de input do usuário — vetor de ataque XSS escalado.

**BlockRenderer.tsx — video iframe (linha 256), estado atual:**
```tsx
<iframe src={embedUrl}
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen />
```

**BlockRenderer.tsx — video iframe, estado alvo (D-15):**
```tsx
<iframe
  src={embedUrl}
  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
  allow="autoplay; encrypted-media; picture-in-picture"
  referrerPolicy="no-referrer-when-downgrade"
  allowFullScreen
/>
```

**NOTA sobre `allow-same-origin` em vídeos externos:** YouTube/Vimeo REQUEREM `allow-same-origin` para funcionar — sem ele o player não consegue carregar recursos do próprio domínio. Diferente do BgHtmlEffect (D-17), aqui `allow-same-origin` é necessário e seguro pois o `src` é de domínio externo (não `srcdoc` com conteúdo do usuário).

**BlockRenderer.tsx — spotify iframe (linha 483), estado atual:**
```tsx
<iframe src={embedUrl} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" />
```

**Estado alvo — mesmos atributos de video (Spotify também é embed externo):**
```tsx
<iframe
  src={embedUrl}
  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
  allow="autoplay; encrypted-media; picture-in-picture"
  referrerPolicy="no-referrer-when-downgrade"
  ...
/>
```

**BlockRenderer.tsx — map iframe (linha 515), estado atual:**
```tsx
<iframe src={embedUrl} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
```

Google Maps já tem `referrerPolicy="no-referrer-when-downgrade"`. Adicionar apenas `sandbox`:
```tsx
<iframe
  src={embedUrl}
  sandbox="allow-scripts allow-same-origin allow-popups"
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
/>
```

**LessonPlayer.tsx — iframe (linha 29-35), estado atual:**
```tsx
<iframe
  src={lesson.video_url}
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen />
```

**Estado alvo (D-16):**
```tsx
<iframe
  src={lesson.video_url}
  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
  allow="autoplay; encrypted-media; picture-in-picture"
  referrerPolicy="no-referrer-when-downgrade"
  allowFullScreen
/>
```

**NOTA sobre `accelerometer` e `gyroscope` em `allow`:** Removendo esses atributos de `allow` não quebra o player de vídeo — são permissões de hardware que YouTube/Vimeo não requerem para funcionar. Simplificar para o mínimo necessário.

### Pattern 5: LGPD Disclosure — SettingsPage.tsx

**Estado atual da SettingsPage:** 247 linhas, duas seções (Perfil + Empresa) + botão Salvar. A estrutura `max-w-2xl mx-auto space-y-6` é extensível — basta adicionar um novo `motion.div` no `space-y-6`.

**Dados coletados pelo fingerprint (`device-fingerprint.ts`):**
- `navigator.userAgent`
- `navigator.language` / `navigator.languages`
- `screen.width`, `screen.height`, `screen.colorDepth`, `screen.pixelDepth`
- `Intl.DateTimeFormat().resolvedOptions().timeZone` (fuso horário)
- `navigator.hardwareConcurrency`, `navigator.maxTouchPoints`
- `navigator.userAgentData.platform` / `navigator.platform`
- Canvas fingerprint (rendering GPU/driver)
- WebGL renderer info

**Texto de disclosure PT-BR (Claude's Discretion — D-18):**
```
Para proteger sua conta contra acesso não autorizado, coletamos um
identificador técnico do dispositivo que inclui: informações do navegador
(userAgent, idioma, fuso horário), resolução de tela e características
gráficas (canvas, WebGL). Esses dados são usados exclusivamente para
segurança da conta (base legal: legítimo interesse, Art. 7º, IX da LGPD)
e não são compartilhados com terceiros para fins publicitários.
```

**Posicionamento:** Nova seção `motion.div` com ícone Shield, título "Privacidade e Segurança", inserida ANTES do botão Salvar (que é o último elemento do `space-y-6`).

**Footer DashboardLayout.tsx — estado atual:**
O componente `DashboardLayout` não tem footer — o `SidebarFooter` está no `AppSidebar` (separado). O `DashboardLayout.tsx` encerra com `</SidebarProvider>`. Adicionar footer no `DashboardLayout` main area ou confiar no link no AppSidebar.

**Opção mais simples (D-21):** Adicionar um `<footer>` com texto e link dentro do `<main>` do DashboardLayout, abaixo do `{children}`, com estilo discreto (`text-xs text-muted-foreground text-center p-4`).

---

## Migration Timestamp Format

**Formato observado nas migrations existentes:**
- Antigas: `YYYYMMDDHHMMSS_uuid.sql` (ex: `20260302214010_28d7f393.sql`)
- Recentes (após 20260321): `YYYYMMDDNNNNNN_descricao.sql` com sequencial como `000001`, `000002`, etc.
- Mais recentes (20260325): `20260325000001_descricao.sql`

**Para as migrations desta fase (data atual: 2026-03-23, mas migrations recentes chegam a 20260325):**
Usar `20260323XXXXXX_nome.sql` — mas verificar último número para não colidir. O mais seguro é usar um offset após o último existente.

**Último migration existente:** `20260325000001_fix_admin_delete_and_user_links.sql`

**Sugestão de nomes para novas migrations:**
```
20260323200001_update_plan_limit_message.sql    (atualiza função existente)
20260323200002_add_slug_format_constraint.sql   (nova constraint de formato)
20260323200003_update_slug_reserved_list.sql    (completa lista reservada)
```

**ALTERNATIVA mais segura (evita colisão com 20260325):**
```
20260326000001_update_plan_limit_message.sql
20260326000002_add_slug_format_constraint.sql
20260326000003_update_slug_reserved_list.sql
```

---

## Standard Stack

Não há novas dependências necessárias para esta fase. Todas as mudanças são:
- SQL/PL/pgSQL no Supabase (já instalado)
- TypeScript no código React existente
- Atributos HTML em JSX existente

| O que usar | Versão | Já instalado |
|-----------|--------|--------------|
| Supabase migrations | CLI já configurado | Sim |
| React useEffect | 18.x | Sim |
| Shield icon (Lucide) | importar de `lucide-react` | Sim |
| motion.div (Framer Motion) | 11.x | Sim — usado no SettingsPage |

---

## Don't Hand-Roll

| Problema | Não construir | Usar | Por que |
|---------|--------------|------|---------|
| Atomic plan enforcement | Client-side check em Promise.all | Postgres BEFORE INSERT trigger | Race condition — dois requests simultâneos burlam client-side |
| Slug format validation | Regex apenas no client | CHECK constraint DB + regex client | Client bypassed por API direta / Supabase dashboard |
| iframe security | CSP headers do servidor | sandbox + allow attributes | Vite/SPA não tem servidor para injetar headers; atributos HTML são equivalentes por iframe |
| Event listener cleanup | Flag global ou setTimeout | Named function references + removeEventListener | Único modo garantido de remover listeners específicos |

---

## Common Pitfalls

### Pitfall 1: removeEventListener com Arrow Function Anônima
**O que dá errado:** `document.removeEventListener("keydown", (e) => {...})` não remove o listener — cria nova referência de função, nunca igual à anterior.
**Por que acontece:** Arrow functions são criadas como novos objetos a cada execução. `addEventListener` registra a referência, `removeEventListener` compara por referência (não por conteúdo).
**Como evitar:** Declarar funções com `function` ou `const` FORA do `addEventListener`, passar a referência para ambos.
**Sinais de alerta:** Listeners acumulando em navegações SPA (verificar DevTools > Event Listeners).

### Pitfall 2: capture flag inconsistente no removeEventListener
**O que dá errado:** `addEventListener("keydown", fn, true)` + `removeEventListener("keydown", fn)` (sem `true`) não remove o listener.
**Por que acontece:** O terceiro argumento `useCapture` faz parte da identidade do listener. Listeners em capture e bubble phases são registros distintos.
**Como evitar:** Usar o mesmo valor de `capture` em ambos. Em `protect.ts`, o `keydown` usa `true` (capture) — o `removeEventListener` também deve usar `true`.

### Pitfall 3: CHECK constraint com regex — colisão em slugs existentes
**O que dá errado:** Adicionar `CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')` falha se existirem slugs no banco que não passam no regex (ex: slugs com uppercase, underscores, etc.).
**Como evitar:** Antes de `ADD CONSTRAINT`, verificar: `SELECT slug FROM links WHERE slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$';`. Se houver resultados, a migration precisa limpar/normalizar antes.
**Migration defensiva:**
```sql
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.links WHERE slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$') THEN
    RAISE EXCEPTION 'Existem slugs inválidos no banco. Normalizar antes de adicionar constraint.';
  END IF;
END $$;
ALTER TABLE public.links ADD CONSTRAINT links_slug_valid_format CHECK (...);
```

### Pitfall 4: sandbox quebra players de vídeo externos
**O que dá errado:** Adicionar `sandbox="allow-scripts"` (sem `allow-same-origin`) ao iframe de YouTube/Vimeo bloqueia o player — os scripts do player precisam acessar recursos do próprio domínio youtube.com.
**Como evitar:** Iframes de embeds externos (YouTube, Vimeo, Spotify, Maps) precisam de `allow-same-origin`. Apenas `BgHtmlEffect` (srcdoc com conteúdo de usuário) deve ficar sem `allow-same-origin`.
**Regra:** `srcdoc` + conteúdo do usuário = sem `allow-same-origin`. `src` externo confiável = com `allow-same-origin`.

### Pitfall 5: DuplicateLink bypassa o trigger de plan limit
**O que dá errado:** `useDuplicateLink` em `use-links.ts` (linha 214) faz INSERT direto sem check client-side de plan limit. Mas o trigger DB roda no INSERT — então o trigger PEGA automaticamente.
**Comportamento atual:** Se usuário no plano free tem 3 links e tenta duplicar, o trigger vai RAISE EXCEPTION, o erro vem como `PostgrestError` para o `onError` do mutation que já faz `toast.error(err.message)`.
**Não é bug** — o trigger fecha essa brecha automaticamente. Nenhuma ação adicional necessária.

### Pitfall 6: SettingsPage não tem `import { Shield }` de lucide-react
**O que dá errado:** Adicionar ícone Shield sem importar causa erro de compilação.
**Como evitar:** Adicionar `Shield` ao import existente de lucide-react na SettingsPage. Atualmente importa: `User, Building2, Save, Loader2, Camera`.

---

## Code Examples

### Exemplo 1: initProtection() com cleanup (refator completo)
```typescript
// src/lib/protect.ts — refatorado
let toastTimeout: ReturnType<typeof setTimeout> | null = null;

function showProtectToast() {
  if (toastTimeout) return;
  toastTimeout = setTimeout(() => { toastTimeout = null; }, 2000);
  // ... (corpo idêntico ao atual)
}

export function initProtection(): () => void {
  function onContextMenu(e: MouseEvent) {
    e.preventDefault();
    showProtectToast();
  }

  function onKeyDown(e: KeyboardEvent) {
    const ctrl = e.ctrlKey || e.metaKey;
    const blocked =
      e.key === "F12" ||
      (ctrl && e.shiftKey && ["I","J","C"].includes(e.key.toUpperCase())) ||
      (ctrl && e.key.toUpperCase() === "U") ||
      (ctrl && e.key.toUpperCase() === "S") ||
      (ctrl && e.shiftKey && e.key.toUpperCase() === "S") ||
      (e.key === "F5" && ctrl) ||
      e.key === "PrintScreen";

    if (blocked) {
      e.preventDefault();
      e.stopImmediatePropagation();
      showProtectToast();
    }
  }

  function onDragStart(e: DragEvent) {
    if ((e.target as HTMLElement).tagName === "IMG") {
      e.preventDefault();
    }
  }

  function onSelectStart(e: Event) {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "IMG") e.preventDefault();
  }

  document.addEventListener("contextmenu", onContextMenu);
  document.addEventListener("keydown", onKeyDown, true);  // capture phase
  document.addEventListener("dragstart", onDragStart);
  document.addEventListener("selectstart", onSelectStart);

  return () => {
    document.removeEventListener("contextmenu", onContextMenu);
    document.removeEventListener("keydown", onKeyDown, true);  // mesmo capture=true
    document.removeEventListener("dragstart", onDragStart);
    document.removeEventListener("selectstart", onSelectStart);
  };
}
```

### Exemplo 2: useEffect em PublicLinkPage.tsx
```typescript
// Adicionar em PublicLinkPage.tsx — após os imports existentes
import { initProtection } from "@/lib/protect";

// Dentro do componente, com os outros useEffects:
useEffect(() => {
  const cleanup = initProtection();
  return cleanup;
}, []);
```

### Exemplo 3: Seção LGPD em SettingsPage.tsx
```tsx
// Nova motion.div inserida antes do botão Salvar, dentro do space-y-6
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.15 }}
  className="rounded-xl border border-border bg-card p-5 space-y-3"
>
  <div className="flex items-center gap-2 mb-1">
    <Shield className="h-4 w-4 text-primary" />
    <h2 className="text-sm font-semibold text-foreground">Privacidade e Segurança</h2>
  </div>
  <p className="text-xs text-muted-foreground leading-relaxed">
    Para proteger sua conta contra acesso não autorizado, coletamos um identificador
    técnico do dispositivo que inclui informações do navegador (userAgent, idioma,
    fuso horário), resolução de tela e características gráficas (canvas, WebGL).
    Esses dados são usados exclusivamente para segurança da conta (base legal:
    legítimo interesse, Art. 7º, IX da LGPD) e não são compartilhados com terceiros
    para fins publicitários.
  </p>
  <a
    href="/privacy"
    className="text-xs text-primary hover:underline"
    target="_blank"
    rel="noopener noreferrer"
  >
    Consultar Política de Privacidade →
  </a>
</motion.div>
```

### Exemplo 4: Footer no DashboardLayout.tsx
```tsx
// Adicionar dentro do <main> antes de </div> de fechamento, após {children}
<footer className="mt-auto pt-6 pb-2 px-4 text-center">
  <a
    href="/privacy"
    target="_blank"
    rel="noopener noreferrer"
    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
  >
    Política de Privacidade
  </a>
</footer>
```

---

## Validation Architecture

Não há arquivo `config.json` em `.planning/` — tratar `nyquist_validation` como habilitado.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Nenhum detectado no projeto (sem vitest.config, jest.config, pytest.ini) |
| Config file | Nenhum |
| Quick run command | `npx tsc --noEmit` (TypeScript compile check) |
| Full suite command | `npx tsc --noEmit` |

### Phase Requirements — Test Map
| Req | Behavior | Test Type | Automated Command | File Exists? |
|-----|----------|-----------|-------------------|-------------|
| D-03 | initProtection() retorna cleanup function | manual-only | `npx tsc --noEmit` (type check) | N/A |
| D-05/D-06 | Trigger bloqueia INSERT ao atingir limite | manual-only | Supabase dashboard / psql | N/A |
| D-10/D-11 | CHECK constraints rejeitam slugs inválidos | manual-only | Supabase dashboard / psql | N/A |
| D-14/D-15/D-16 | iframes têm sandbox correto | manual-only | Inspeção DOM no browser | N/A |
| D-18/D-21 | Disclosure aparece em SettingsPage | manual-only | Visual no browser | N/A |

**Justificativa manual-only:** Projeto não tem framework de testes configurado. Mudanças são principalmente atributos HTML, SQL, e refactor de event listeners — verificáveis via tsc, inspeção DOM e testes manuais.

### Wave 0 Gaps
Não há gaps de infraestrutura de testes — nenhum novo framework é necessário para esta fase. A verificação será via:
1. `npx tsc --noEmit` — garante que o refactor de `initProtection()` não quebra tipagem
2. Inspeção visual no browser — sandbox attributes, disclosure text
3. Teste manual de criação de link ao limite — trigger error message

---

## Open Questions

1. **Migrations já aplicadas no banco remoto?**
   - O que sabemos: `20260304145650` (trigger) e `20260322100005` (slug reserved) existem como arquivos
   - O que é incerto: se foram aplicadas no Supabase cloud (podem estar apenas locais)
   - Recomendação: Planner deve criar migrations como `CREATE OR REPLACE` / `DROP IF EXISTS` + `ADD` — idempotentes, safe para re-executar

2. **`/privacy` rota existe?**
   - O que sabemos: Links na disclosure e footer apontam para `/privacy`
   - O que é incerto: Se existe uma página de privacidade no projeto
   - Recomendação: Se não existir, usar `href="#"` temporariamente ou link externo — criar `/privacy` está fora do escopo desta fase

3. **BlockRenderer tem mais iframes além de video, spotify, map?**
   - Verificado: 3 tipos de iframe em BlockRenderer (video linha 256, spotify linha 483, map linha 515)
   - Verificado: LessonPlayer tem 1 iframe (linha 29)
   - Verificado: BgHtmlEffect tem 1 iframe (linha 44)
   - Total: 5 iframes a atualizar

---

## Sources

### Primary (HIGH confidence)
- Leitura direta de `src/lib/protect.ts` — 104 linhas, 4 addEventListener com arrow functions anônimas
- Leitura direta de `supabase/migrations/20260304145650_eab359af...sql` — trigger existente com função `check_link_limit`
- Leitura direta de `supabase/migrations/20260322100005_add_slug_reserved_constraint.sql` — constraint existente (lista incompleta)
- Leitura direta de `src/components/preview/BlockRenderer.tsx` — iframes nas linhas 256, 483, 515
- Leitura direta de `src/components/course/LessonPlayer.tsx` — iframe na linha 29
- Leitura direta de `src/components/BgHtmlEffect.tsx` — iframe com `sandbox="allow-scripts"` apenas
- Leitura direta de `src/pages/SettingsPage.tsx` — 247 linhas, sem seção de privacidade
- Leitura direta de `src/components/DashboardLayout.tsx` — sem footer
- Leitura direta de `src/lib/device-fingerprint.ts` — lista completa de dados coletados
- MDN Web Docs (conhecimento verificado): `removeEventListener` exige mesma referência de função e mesmo `useCapture`

### Secondary (MEDIUM confidence)
- PostgreSQL docs: operador `~` para regex em CHECK constraints — padrão documentado
- LGPD Art. 7º, IX (legítimo interesse) — base legal correta para fingerprinting anti-fraude

---

## Metadata

**Confidence breakdown:**
- protect.ts refactor: HIGH — código analisado linha a linha, padrão de named functions é bem estabelecido
- Migrations existentes: HIGH — leitura direta dos arquivos SQL
- iframe sandbox attributes: HIGH — atributos verificados no código atual, semântica sandbox documentada
- LGPD disclosure: MEDIUM — texto legal em PT-BR é julgamento, não verificável tecnicamente
- Migration timestamp: HIGH — padrão observado nos arquivos existentes

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (estável — sem dependências de versão voláteis)

---

## RESEARCH COMPLETE
