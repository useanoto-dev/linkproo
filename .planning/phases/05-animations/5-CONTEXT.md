# Phase 5: Animations & Motion System — Context

**Gathered:** 2026-03-25
**Status:** Ready for planning
**Mode:** --auto (Claude defaults)

<domain>
## Phase Boundary

Implementar micro-animações e transições com Framer Motion em todo o sistema — editor, dashboard e páginas públicas. O Framer Motion já está instalado e parcialmente em uso; esta fase uniformiza e completa o sistema de motion.

Fora do escopo: animações na landing page (Phase 6), animações de pagamento/checkout (Phase 7), novos blocos ou features de editor.

</domain>

<decisions>
## Implementation Decisions

### Route Transitions

- **D-01:** Adicionar `AnimatePresence mode="wait"` em `App.tsx`, wrapping `<Routes>` com `useLocation` como key. Cada página recebe um wrapper `<motion.div>` com `initial/animate/exit`.
- **D-02:** Transition padrão: `fade + slide-up` — `initial: { opacity: 0, y: 8 }`, `animate: { opacity: 1, y: 0 }`, `exit: { opacity: 0, y: -4 }`, `duration: 0.2s ease-out`.
- **D-03:** Páginas públicas (`/:slug`) ficam **fora** da transição de rota — elas já têm animações de entrada por bloco via `getEntryVariants`.
- **D-04:** Wrapper de transição deve ser um componente `PageTransition` reutilizável que envolve o conteúdo de cada page.

### Skeleton Loaders

- **D-05:** Auditar todos os pages com `isLoading` e garantir skeleton em todos. Pages que **faltam** skeleton confirmadas: `AdminDashboardPage` (stats + users cards), `SupportPage` (tickets), `VideoaulasPage` (lista de videoaulas), `Dashboard` (links counter cards).
- **D-06:** Skeletons devem ter `animate-pulse` (já no shadcn/ui Skeleton) e respeitar o layout exato dos elementos — mesmas dimensões e `border-radius` do conteúdo real.
- **D-07:** `LinkEditor` quando carregando link: já tem `PageLoader` mas não tem skeleton dos painéis — adicionar skeleton do painel esquerdo + preview placeholder.

### Empty States Animados

- **D-08:** Empty states usam Lucide icon (48px) + heading + subtext + optional CTA. Sem biblioteca externa de ilustrações — consistente com shadcn/ui.
- **D-09:** Animação de entrada do empty state: `fade-up` com `initial: { opacity: 0, y: 16 }`, `animate: { opacity: 1, y: 0 }`, `duration: 0.4s`.
- **D-10:** Pages que precisam de empty state melhorado:
  - `LinksPage` — "Nenhum link criado" → adicionar ícone animado + mensagem amigável + botão "Criar primeiro link"
  - `AnalyticsPage` — sem dados → "Ainda sem visitas" com ícone + text
  - `Dashboard` template search — já tem `EmptyState` básico, upgrade com animação
- **D-11:** Ícone do empty state recebe animação `float` sutil (`y: [0, -6, 0]`, `repeat: Infinity`, `duration: 3s`) — não usa emoji, usa `lucide-react`.

### Drag-and-Drop Visual Feedback

- **D-12:** Adicionar `DragOverlay` do `@dnd-kit/core` ao `SortableList`. O item arrastado fica com opacity 0.4 na posição original; o overlay flutua com sombra elevada (`shadow-2xl`).
- **D-13:** Overlay usa `motion.div` com `scale: 1.02` e `boxShadow` elevado — sinaliza que está sendo movido.
- **D-14:** Item de destino (drop zone) tem feedback: `ring-2 ring-primary` já existente — manter, adicionar transição de cor suave.
- **D-15:** Estado de drag detectado via `useDndMonitor` ou `onDragStart`/`onDragEnd` callbacks já existentes.

### Editor Micro-Animações

- **D-16:** Botão "Adicionar Bloco" (no SortableList drop zone): `whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.97 }}`.
- **D-17:** `SmartLinkCard` na LinksPage: hover lift já parcialmente feito — padronizar `whileHover={{ y: -2, transition: { duration: 0.15 } }}`.
- **D-18:** Blocos ao serem adicionados: já tem `AnimatePresence` no SortableList com `height: 0 → auto` — manter e garantir que todos os tipos de bloco passam por esse wrapper.
- **D-19:** Não adicionar animações nos inputs/formulários do editor — prejudica usabilidade ao digitar.

### Claude's Discretion

- Exato breakpoint de timing entre as animações de rota (se usar `delay` no animate)
- Qual Lucide icon específico para cada empty state
- Se o `PageTransition` wrapper é HOC ou componente filho
- Valor exato de `y` nas route transitions (8px é baseline, ajustar se parecer exagerado)

</decisions>

<specifics>
## Specific Ideas

- Buttons já têm `whileHover` e `whileTap` no `ButtonPreview.tsx` — o padrão está estabelecido, só replicar nos outros lugares
- `getEntryVariants` em `preview-utils.ts` já é o sistema de stagger das páginas públicas — não recriar, apenas garantir que todos os tipos de block passam por ele (verificar se blocks novos adicionados na phase 03 estão cobertos)
- Drag overlay deve parecer o elemento "levantado" da lista — não uma cópia simplificada

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Codebase de animações existente
- `src/components/editor/blocks/SortableList.tsx` — DndContext, AnimatePresence para expand/collapse, drop zones com feedback
- `src/components/preview/preview-utils.ts` — `getEntryVariants` — sistema de stagger para public pages
- `src/components/preview/ButtonPreview.tsx` — padrão de `whileHover`/`whileTap` estabelecido
- `src/components/SmartLinkPreview.tsx` — uso do `getEntryVariants` com itemDelay

### Routing
- `src/App.tsx` — `<Routes>` sem AnimatePresence — aqui entra a transição de rota

### Pages que precisam de skeleton/empty state
- `src/pages/admin/AdminDashboardPage.tsx` — sem skeleton
- `src/pages/VideoaulasPage.tsx` — verificar skeleton
- `src/pages/SupportPage.tsx` — verificar skeleton
- `src/pages/LinksPage.tsx` — empty state básico (linha 258-267)
- `src/pages/AnalyticsPage.tsx` — sem empty state para ausência de dados

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Skeleton` de `@/components/ui/skeleton` — já usado em 6 pages, `animate-pulse` built-in
- `getEntryVariants(anim, delay)` — retorna `{ initial, animate, transition }` para stagger — reaproveitável
- `AnimatePresence` importado em 11 arquivos — padrão estabelecido
- `motion` de `framer-motion` — 28+ usos, equipe familiarizada

### Established Patterns
- `whileHover={{ scale: 1.03 }}` no ButtonPreview — padrão de hover em elementos clicáveis
- `initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}` — padrão de reveal no SortableList
- `transition={{ duration: 0.18, ease: "easeInOut" }}` — duração padrão de micro-interações no projeto

### Integration Points
- `App.tsx` `<Routes>` — ponto de integração para route transitions
- `SortableList.tsx` `<DndContext>` — ponto de integração para `DragOverlay`
- Todos os pages com `isLoading` — pontos de integração para skeletons faltantes

</code_context>

<deferred>
## Deferred Ideas

- Animações na landing page — Phase 6 (depende desta phase)
- Confetti/celebração ao publicar primeiro link — backlog
- Lottie animations para empty states — complexidade desnecessária para v1.0
- Page transitions específicas por tipo de rota (ex: slide-left para editor) — backlog, fade+up é suficiente

</deferred>

---

*Phase: 05-animations*
*Context gathered: 2026-03-25*
