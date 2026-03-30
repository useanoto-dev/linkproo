# Roadmap: Sistema Link PRO

## Milestone: v1.0 — Silicon Valley Quality Overhaul

**Goal:** Transformar o Sistema Link PRO de MVP funcional em produto de qualidade Silicon Valley — design premium, performance, seguranca e features que convertem.

**Start:** 2026-03-23
**Phases:** 10

---

### Phase 1: Design System & TypeScript Foundation
**Directory:** `phases/01-design-system/`
**Goal:** Estabelecer o alicerce visual e de codigo -- design tokens consistentes, glassmorphism, dark mode real e TypeScript strict sem `as any`. Tudo o que vem depois depende disso.
**Plans:** 3/3 plans complete

Plans:
- [x] 01-01-PLAN.md -- Design tokens: backdropBlur, --glass-bg/--glass-border tokens, glass-subtle utility
- [x] 01-02-PLAN.md -- TypeScript strict:true, SmartLinkRow type, rowToSmartLink/LinkEditor typing
- [x] 01-03-PLAN.md -- Eliminate remaining 10 as-any across 5 files, resolve strictNullChecks

**Deliverables:**
- Design tokens em CSS variables (cores, espacamento, border-radius, shadows)
- Glassmorphism utility classes no Tailwind config
- Dark mode real (nao apenas classe `dark:`) com tokens semanticos
- `tsconfig.json` com `strict: true`
- `rowToSmartLink` tipado corretamente
- Todos os `as any` eliminados do codebase

**Requires:** --

---

### Phase 2: Security Hardening
**Directory:** `phases/02-security/`
**Goal:** Fechar todas as brechas de seguranca e conformidade identificadas no mapeamento -- plan limits atomicos, slugs reservados, CSP no iframe e disclosure LGPD do fingerprint.
**Plans:** 2/3 plans executed

Plans:
- [x] 02-01-PLAN.md -- protect.ts scoped to PublicLinkPage with cleanup + CSP sandbox on all 5 iframes
- [x] 02-02-PLAN.md -- DB migrations: plan limit trigger message update + slug format/reserved constraints
- [x] 02-03-PLAN.md -- LGPD fingerprint disclosure in SettingsPage + privacy footer link

**Deliverables:**
- Postgres trigger para enforcar plan limits atomicamente (sem race condition)
- Lista de slugs reservados (api, admin, app, login, etc.) com validacao no cadastro
- `protect.ts` escopado apenas ao `PublicLinkPage` (remover de rotas admin/editor)
- CSP header no iframe do editor
- Disclosure LGPD para device fingerprinting (banner ou texto na politica)

**Requires:** Phase 1 (TypeScript foundation)

---

### Phase 3: BlockEditor Refactor
**Directory:** `phases/03-block-editor-refactor/`
**Goal:** Quebrar o monolito de 1944 linhas do BlockEditor.tsx em editores por tipo de bloco -- performance, manutenibilidade e bundle splitting.
**Plans:** 3/3 plans complete

Plans:
- [x] 03-01-PLAN.md -- Extract constants, utilities, TextBlockEditor, LayoutBlockEditor
- [x] 03-02-PLAN.md -- Extract MediaBlockEditor, InteractiveBlockEditor, ListBlockEditor
- [x] 03-03-PLAN.md -- Rewrite BlockEditor.tsx as orchestrator with lazy loading

**Deliverables:**
- `BlockEditor.tsx` <= 300 linhas (orquestrador apenas)
- Editor components por tipo: `TextBlockEditor`, `ImageBlockEditor`, `ButtonBlockEditor`, `SocialBlockEditor`, `VideoBlockEditor`, etc.
- Lazy loading de editors (code splitting por tipo)
- Zero regressao no undo/redo e auto-save

**Requires:** Phase 1 (TypeScript foundation)

---

### Phase 4: Analytics RPC Migration
**Directory:** `phases/04-analytics-rpc/`
**Goal:** Migrar analytics de fetch client-side de 5000 linhas para RPC server-side no Supabase -- performance, seguranca e escalabilidade.
**Plans:** 2/2 plans complete

Plans:
- [x] 04-01-PLAN.md -- SQL migrations: get_admin_analytics + get_user_analytics RPC functions
- [x] 04-02-PLAN.md -- Client rewrite: AdminAnalyticsPage + AnalyticsPage consume RPCs, remove useMemos

**Deliverables:**
- Supabase RPC functions para agregacao de analytics (views, clicks, por dispositivo, por periodo)
- Dashboard de analytics consome apenas dados agregados (nao raw rows)
- Remocao do fetch de `select * limit 5000` no client
- Filtros de periodo (7d, 30d, 90d) processados no server

**Requires:** Phase 2 (security hardening)

---

### Phase 5: Animations & Motion System
**Directory:** `phases/05-animations/`
**Goal:** Implementar micro-animacoes e transicoes com Framer Motion em todo o sistema -- editor, dashboard e paginas publicas ganham vida.
**Plans:** 4/4 plans complete

Plans:
- [x] 05-01-PLAN.md -- Route transitions: PageTransition component + AnimatePresence in App.tsx
- [x] 05-02-PLAN.md -- Skeleton loaders: AdminDashboardPage, VideoaulasPage, SupportPage
- [x] 05-03-PLAN.md -- Empty states animated: LinksPage, AnalyticsPage, Dashboard
- [x] 05-04-PLAN.md -- DragOverlay for SortableList + SmartLinkCard hover micro-animation

**Deliverables:**
- Transicoes de rota com `AnimatePresence` (fade + slide)
- Micro-animacoes em botoes, cards e interacoes do editor
- Drag-and-drop do editor com feedback visual animado
- Skeleton loaders em todos os pontos de loading (editor, dashboard, analytics)
- Empty states ilustrados com animacao (sem blocos, sem analytics, etc.)
- Animacoes de entrada staggered por bloco nas paginas publicas

**Requires:** Phase 1 (design tokens), Phase 3 (editor refactor para animar componentes menores)

---

### Phase 6: Landing Page
**Directory:** `phases/06-landing-page/`
**Goal:** Criar landing page de conversao com demo animada do produto, social proof e CTA claro -- primeira impressao que impressiona e converte.

**Deliverables:**
- Hero com demo animada do editor (mockup ou gravacao loop)
- Secao de features com animacoes de scroll (Framer Motion scroll-triggered)
- Social proof (depoimentos, logos de clientes ou metricas)
- Secao de planos com CTA de upgrade
- SEO on-page (meta, OG, structured data)
- Mobile-first e responsivo

**Requires:** Phase 1 (design system), Phase 5 (animations)

---

### Phase 7: Payments Integration
**Directory:** `phases/07-payments/`
**Goal:** Implementar pagamento real para upgrade de planos -- Stripe como primeira opcao (melhor SDK), com fluxo completo de checkout, webhook e ativacao de plano.

**Deliverables:**
- Stripe instalado e configurado (ou Pagar.me como alternativa BR)
- Checkout de upgrade de plano (Free -> Pro -> Business)
- Webhook handler para ativacao/cancelamento de plano
- Pagina de sucesso e cancelamento de pagamento
- Portal do cliente para gestao de assinatura
- Plano atualizado no Supabase apos pagamento confirmado

**Requires:** Phase 2 (plan limits atomicos antes de cobrar), Phase 4 (analytics RPC estavel)

---

### Phase 8: Custom Domains
**Directory:** `phases/08-custom-domains/`
**Goal:** Implementar custom domains para planos Pro/Business -- UI completa de configuracao, verificacao DNS e roteamento.

**Deliverables:**
- UI de configuracao de dominio customizado no dashboard
- Verificacao de DNS (TXT record ou CNAME)
- Roteamento no edge/Vercel para dominios verificados
- Status de verificacao em tempo real
- Dominio bloqueado para plano Free (upgrade prompt)

**Requires:** Phase 7 (payments -- feature paga)

---

### Phase 9: Advanced Features
**Directory:** `phases/09-advanced-features/`
**Goal:** Implementar features avancadas de conversao -- agendamento de blocos e WhatsApp button com mensagem configuravel.
**Plans:** 2/2 plans complete

Plans:
- [x] 09-01-SUMMARY.md -- WhatsApp message field: `whatsappMessage` in type + editor UI + generateUrl update
- [x] 09-02-SUMMARY.md -- Block scheduling: `visibleFrom`/`visibleUntil` in type + editor UI + BlockRenderer visibility check

**Deliverables:**
- WhatsApp button com mensagem pre-preenchida configuravel no editor
- Agendamento de blocos por data/hora de inicio e fim (visibilidade condicional)

**Requires:** Phase 3 (editor refactor), Phase 4 (analytics RPC)

---

### Phase 10: Test Coverage
**Directory:** `phases/10-test-coverage/`
**Goal:** Cobrir editor, hooks criticos e rotas publicas com testes -- garantir que o v1.0 nao regride.
**Plans:** 2/4 plans executed

Plans:
- [x] 10-01-PLAN.md -- Coverage infra (@vitest/coverage-v8, vite.config.ts test block) + autosave-subscriber tests
- [x] 10-02-PLAN.md -- editor-store comprehensive tests (setLink skipHistory, updateLink, setUI, autosave mutations)
- [ ] 10-03-PLAN.md -- PublicLinkPage component tests + coverage threshold verification
- [ ] 10-04-PLAN.md -- use-block-operations integration tests (add, insert, remove, reorder + undo)

**Deliverables:**
- Testes unitarios para hooks: `useEditor`, `useAutoSave`, `useUndo`
- Testes de integracao para BlockEditor (adicionar, reordenar, deletar bloco)
- Testes de rotas publicas (`/{slug}` -- not found, plano, blocks rendering)
- Testes de plan limit enforcement
- CI passa com cobertura >= 70% nos arquivos criticos

**Requires:** Phase 3 (editor refactor -- testar componentes menores), Phase 9 (features completas antes de testar)

---

## Phase Summary

| # | Phase | Priority | Depends On |
|---|-------|----------|-----------|
| 1 | 3/3 | Complete   | 2026-03-23 |
| 2 | 3/3 | Complete   | 2026-03-26 |
| 3 | 3/3 | Complete   | 2026-03-24 |
| 4 | 2/2 | Complete   | 2026-03-25 |
| 5 | 4/4 | Complete   | 2026-03-25 |
| 6 | Landing Page | High | 1, 5 |
| 7 | Payments | High | 2, 4 |
| 8 | Custom Domains | Medium | 7 |
| 9 | 2/2 | Complete   | 2026-03-26 |
| 10 | 2/4 | In Progress|  |

---

*Last updated: 2026-03-29 -- Phase 10 planned (3 plans, 2 waves)*
