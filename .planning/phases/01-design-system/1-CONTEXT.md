# Phase 1: Design System & TypeScript Foundation — Context

**Gathered:** 2026-03-23
**Status:** Ready for planning
**Mode:** --auto (Claude defaults)

<domain>
## Phase Boundary

Estabelecer o alicerce de código e visual do v1.0: TypeScript strict mode habilitado, `as any` eliminados, `rowToSmartLink` tipado com tipo DB real, e design tokens completados (glassmorphism, dark mode gaps fechados). Tudo que fases seguintes dependem para compilar sem erros e usar o sistema visual consistente.

Fora do escopo desta fase: animações (Phase 5), refator do BlockEditor (Phase 3), novos componentes visuais. Apenas fundação.

</domain>

<decisions>
## Implementation Decisions

### TypeScript Strictness

- **D-01:** Habilitar `strict: true` em `tsconfig.app.json` (inclui `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `noImplicitThis`)
- **D-02:** `noUnusedLocals` e `noUnusedParameters` já estão em `true` — manter
- **D-03:** Para erros de `strictNullChecks` fora dos 12 `as any` identificados, usar `// @ts-expect-error` com comentário explicativo como supressão temporária — não silenciar globalmente
- **D-04:** O objetivo é compilar limpo com `strict: true`, não necessariamente zero supressões — supressões documentadas são aceitáveis se o fix for complexo

### Eliminação de `as any`

Os 12 `as any` mapeados são:
- `ElementsSidebar.tsx` (2x) — tipar `defaults` no tipo de elemento do catálogo
- `use-user-role.ts` (1x) — Supabase `.from("user_roles" as any)` → usar tipo gerado ou cast tipado
- `AdminAnalyticsPage.tsx` (4x) — tipar os arrays de resultado Supabase
- `AdminSupportPage.tsx` (2x) — tipar payload de upsert
- `LinkEditor.tsx` (1x) — tipar `.update(row as any)`
- `slug-utils.test.ts` (2x) — mocks em testes, aceitável manter com `as unknown as X` pattern

- **D-05:** Cada `as any` removido deve ser substituído por tipo real ou `as unknown as TargetType` quando o tipo intermediário é necessário — nunca simplesmente deletado
- **D-06:** Mocks em testes (`slug-utils.test.ts`) podem usar `as unknown as ReturnType<typeof supabase.from>` — padrão de teste aceitável

### Tipagem do `rowToSmartLink`

- **D-07:** Criar tipo `SmartLinkRow` em `src/lib/link-mappers.ts` que representa a shape do DB row — baseado nos campos usados dentro de `rowToSmartLink` (não gerar da API Supabase — manter simples)
- **D-08:** O tipo deve ser `Partial<SmartLinkRow>` no parâmetro para refletir que queries diferentes retornam subsets de campos — `rowToSmartLink(row: Partial<SmartLinkRow>)`
- **D-09:** Campos opcionais no tipo devem ter `| null | undefined` onde o código já trata com `|| ""` ou `?? undefined`

### Design Tokens — Completar Gaps

O codebase já tem tokens robustos (`--surface`, `--glow`, `--glow-muted`, `--editor-*`) e utilities `.glass`, `.glass-strong`, `.nexus-card`. Os gaps identificados:

- **D-10:** Adicionar `backdropBlur` ao `theme.extend` do Tailwind para ter `backdrop-blur-sm/md/lg/xl` como classes utilitárias (atualmente apenas no CSS manual)
- **D-11:** Adicionar token `--glass-bg` e `--glass-border` ao `:root` e `.dark` para que dark mode glass seja consistente sem hardcode de rgba
- **D-12:** Dark mode não tem gaps funcionais — o sistema de `.dark` class + CSS vars está correto. Apenas verificar que `--editor-bg` e `--editor-surface` tokens dark estão aplicados onde necessário (checar se `editor-panel` usa os tokens)
- **D-13:** Adicionar variant `glass-subtle` (menos blur, mais transparente) para uso em sidebars e overlays leves

### Claude's Discretion

- Ordem de correção dos `as any` dentro da fase
- Exata forma do tipo `SmartLinkRow` (campos e optionality específicos)
- Nomes de tokens CSS específicos para glass variants
- Se criar arquivo separado para tipos do mapper ou manter inline

</decisions>

<specifics>
## Specific Ideas

- Manter identidade visual "Nexus" existente — não redesenhar, apenas completar gaps
- `rowToSmartLink` deve continuar aceitando row parcial (queries com `.select("id, slug")` são válidas)
- `backdropBlur` no Tailwind deve funcionar tanto em classes inline `backdrop-blur-md` quanto via `@apply`
- Após `strict: true`, rodar `tsc --noEmit` deve passar limpo (ou com supressões documentadas)

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### TypeScript config
- `tsconfig.app.json` — config atual com `strict: false`, flags já ativas
- `tsconfig.json` — root config com references

### Tipos e mappers
- `src/types/smart-link.ts` — `SmartLink`, `LinkBlock`, `SmartLinkButton` e todos os tipos de domínio
- `src/lib/link-mappers.ts` — `rowToSmartLink` e `smartLinkToRow` — target principal de tipagem
- `src/integrations/supabase/types.ts` — tipos gerados do Supabase (referência para shape do DB)

### Design System
- `src/index.css` — todos os tokens CSS e utilities (`.glass`, `.nexus-card`, `.glow-border`, etc.)
- `tailwind.config.ts` — tokens Tailwind, cores via CSS vars, keyframes existentes

### Arquivos com `as any` a corrigir
- `src/components/editor/ElementsSidebar.tsx` — 2x `as any` em `el.defaults`
- `src/hooks/use-user-role.ts` — 1x Supabase `.from()` cast
- `src/pages/admin/AdminAnalyticsPage.tsx` — 4x arrays Supabase
- `src/pages/admin/AdminSupportPage.tsx` — 2x upsert payload
- `src/pages/LinkEditor.tsx` — 1x `.update(row as any)`
- `src/test/slug-utils.test.ts` — 2x mocks (menor prioridade)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/index.css` `.glass`, `.glass-strong`, `.nexus-card`: já funcionam — apenas adicionar `glass-subtle` e tokens CSS para dark mode consistency
- `src/integrations/supabase/types.ts`: tem `Tables<"smart_links">` que pode ser usado como base para `SmartLinkRow`
- `src/lib/link-mappers.ts` `toJsonb<T>()`: já usa genérico tipado corretamente — padrão a seguir

### Established Patterns
- CSS vars em HSL sem `hsl()` wrapper: `--primary: 262 83% 58%` → usado como `hsl(var(--primary))` — manter padrão
- Dark mode via `.dark` class no `<html>`: correto, não mudar para `media query`
- Tailwind colors referenciam CSS vars: `primary: { DEFAULT: "hsl(var(--primary))" }` — padrão para novos tokens
- `noImplicitAny: true` já ativo: os `as any` existentes foram colocados intencionalmente para contornar tipos do Supabase

### Integration Points
- `rowToSmartLink` é chamada em 6 locais em `use-links.ts` — tipagem do parâmetro propaga para todos
- `tsconfig.app.json` `strict: true` vai surfaçar erros em todo `src/` — rodar `tsc --noEmit` antes de planejar fixes para ver volume real
- `tailwind.config.ts` `extend.backdropBlur` vai habilitar `backdrop-blur-*` classes em todos os componentes

</code_context>

<deferred>
## Deferred Ideas

- Adicionar Framer Motion variants ao design system — Phase 5 (Animations)
- Skeleton component genérico — Phase 5
- Temas de cores customizados por usuário — fora do escopo v1.0
- Storybook para documentar o design system — backlog

</deferred>

---

*Phase: 01-design-system*
*Context gathered: 2026-03-23*
