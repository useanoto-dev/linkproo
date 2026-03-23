# Sistema Link PRO

## What This Is

Plataforma SaaS de smart links para negócios brasileiros — cria páginas de link estilo Linktree/Bio.link com editor visual drag-and-drop, 27+ tipos de blocos, 28+ categorias de templates prontos, analytics de views/clicks, efeitos animados de fundo e suporte a sub-páginas. Usuários criam e publicam páginas em `/{slug}` sem código.

## Core Value

Qualquer negócio brasileiro deve conseguir criar uma página de link profissional e bonita em menos de 5 minutos — sem conhecimento técnico, com resultado que impressiona.

## Requirements

### Validated

<!-- Shipped and confirmed — inferred from existing codebase (brownfield init) -->

- ✓ Autenticação com email/senha, reset de senha — v0 (pré-GSD)
- ✓ Editor visual com drag-and-drop, 27+ tipos de blocos — v0
- ✓ 28+ categorias de templates por segmento (pizzaria, saúde, beleza, etc.) — v0
- ✓ Efeitos animados de fundo (snow, bubbles, fireflies, matrix, stars, HTML) — v0
- ✓ Analytics de views e clicks com dados de dispositivo — v0
- ✓ Painel admin (usuários, analytics, suporte, videoaulas) — v0
- ✓ Planos Free/Pro/Business com limites de links e features — v0
- ✓ Sub-páginas (páginas internas dentro de um link) — v0
- ✓ Preview mobile com device frames no editor — v0
- ✓ Upload e crop de imagens (hero, logo, avatar) — v0
- ✓ Undo/redo no editor (50 estados) — v0
- ✓ Auto-save com debounce — v0
- ✓ Marca d'água por plano no preview público — v0
- ✓ Dark/light mode — v0
- ✓ QR code gerado por link — v0
- ✓ OG meta via Edge Function — v0
- ✓ Device fingerprinting para admin — v0

### Active

<!-- v1.0 milestone — Quality Overhaul Silicon Valley Level -->

- [ ] Design system premium com glassmorphism, tokens consistentes e dark mode real
- [ ] Micro-animações e transições de página com Framer Motion em todo o sistema
- [ ] Skeleton loaders e empty states ilustrados em todos os flows
- [ ] Landing page com demo animada do produto e social proof
- [ ] Páginas públicas com animações de entrada staggered por bloco
- [ ] BlockEditor.tsx refatorado em editores por tipo de bloco (performance)
- [ ] Analytics server-side via RPC (remover fetch de 5000 linhas client-side)
- [ ] Integração de pagamento (Stripe ou Pagar.me) para upgrade de planos
- [ ] Custom domains implementado para Pro/Business
- [ ] A/B testing de botões com métricas de conversão
- [ ] Agendamento de blocos por data/hora
- [ ] WhatsApp button com mensagem pré-preenchida configurável
- [ ] Hardening de segurança: slugs reservados, plan limits atômicos, CSP iframe
- [ ] TypeScript strict: eliminar todos `as any`, tipar `rowToSmartLink`
- [ ] Cobertura de testes para editor, hooks e rotas públicas

### Out of Scope

| Feature | Reason |
|---------|--------|
| App mobile nativo | Web-first; PWA é suficiente para v1.0 |
| Chat em tempo real entre usuário e visitante | Complexidade alta, não é core value |
| Multi-idioma completo | Plataforma é PT-BR first |
| Video hosting próprio | Custo de storage/bandwidth; integração com YouTube/Vimeo suficiente |
| Marketplace de templates pagos | Fase futura após validar crescimento |

## Context

**Codebase:** React 18 + TypeScript + Vite + Tailwind + shadcn/ui + Supabase. Framer Motion já instalado (v12.34). dnd-kit para drag-and-drop. Recharts para gráficos. Vercel deploy.

**Pontos críticos identificados no mapeamento:**
- `BlockEditor.tsx` tem 1944 linhas (monolito — priority split)
- Analytics faz fetch de até 5000 linhas no client (priority RPC)
- Pagamento não está implementado (só UI estática)
- Custom domains é stub sem UI
- `protect.ts` bloqueia DevTools para todos os usuários incluindo admins
- Plan limits não são atômicos (race condition possível)
- Device fingerprint coleta dados sem disclosure LGPD

**Mercado:** Brasil — linguagem PT-BR, planos em R$, preferência por WhatsApp, contexto de pequenos negócios locais.

## Constraints

- **Tech Stack**: React + Supabase + Vercel — sem trocar stack, apenas evoluir
- **Compatibilidade**: Todos os links existentes e dados de usuários devem ser preservados em qualquer migração
- **Performance**: Páginas públicas devem ter LCP < 2.5s (Core Web Vitals)
- **Segurança**: LGPD compliance obrigatório para dados de fingerprint
- **Planos**: Lógica de planos deve continuar sendo enforçada server-side

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Supabase como único backend | BaaS completo para equipe pequena; auth + DB + storage + edge functions | ✓ Good |
| dnd-kit para drag-and-drop | Mais flexível que react-dnd; suporte ativo | ✓ Good |
| shadcn/ui como base de componentes | Customizável, sem lock-in, Radix UI headless | ✓ Good |
| Framer Motion para animações | Já instalado, API madura, perfeito para micro-interactions | — Pending (subutilizado) |
| `strict: false` no TypeScript | Decisão de conveniência que criou `as any` espalhados | ⚠️ Revisit |
| protect.ts aplicado globalmente | Proteção de conteúdo mas bloqueia admins | ⚠️ Revisit |

## Evolution

Este documento evolui a cada transição de fase e milestone.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-23 — brownfield initialization + milestone v1.0 start*
