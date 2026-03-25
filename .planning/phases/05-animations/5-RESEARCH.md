# Phase 5: Animations & Motion System - Research

**Researched:** 2026-03-25
**Domain:** Framer Motion v12 + dnd-kit DragOverlay + React Router v6 route transitions + skeleton loaders
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Route Transitions**
- D-01: Adicionar `AnimatePresence mode="wait"` em `App.tsx`, wrapping `<Routes>` com `useLocation` como key. Cada página recebe um wrapper `<motion.div>` com `initial/animate/exit`.
- D-02: Transition padrão: `fade + slide-up` — `initial: { opacity: 0, y: 8 }`, `animate: { opacity: 1, y: 0 }`, `exit: { opacity: 0, y: -4 }`, `duration: 0.2s ease-out`.
- D-03: Páginas públicas (`/:slug`) ficam **fora** da transição de rota — elas já têm animações de entrada por bloco via `getEntryVariants`.
- D-04: Wrapper de transição deve ser um componente `PageTransition` reutilizável que envolve o conteúdo de cada page.

**Skeleton Loaders**
- D-05: Auditar todos os pages com `isLoading` e garantir skeleton em todos. Pages confirmadas sem skeleton: `AdminDashboardPage` (stats + users cards), `SupportPage` (tickets), `VideoaulasPage` (lista de videoaulas), `Dashboard` (links counter cards).
- D-06: Skeletons devem ter `animate-pulse` (já no shadcn/ui Skeleton) e respeitar o layout exato dos elementos — mesmas dimensões e `border-radius` do conteúdo real.
- D-07: `LinkEditor` quando carregando link: já tem `PageLoader` mas não tem skeleton dos painéis — adicionar skeleton do painel esquerdo + preview placeholder.

**Empty States Animados**
- D-08: Empty states usam Lucide icon (48px) + heading + subtext + optional CTA. Sem biblioteca externa de ilustrações — consistente com shadcn/ui.
- D-09: Animação de entrada do empty state: `fade-up` com `initial: { opacity: 0, y: 16 }`, `animate: { opacity: 1, y: 0 }`, `duration: 0.4s`.
- D-10: Pages que precisam de empty state melhorado: `LinksPage`, `AnalyticsPage`, `Dashboard` template search.
- D-11: Ícone do empty state recebe animação `float` sutil (`y: [0, -6, 0]`, `repeat: Infinity`, `duration: 3s`) — não usa emoji, usa `lucide-react`.

**Drag-and-Drop Visual Feedback**
- D-12: Adicionar `DragOverlay` do `@dnd-kit/core` ao `SortableList`. O item arrastado fica com opacity 0.4 na posição original; o overlay flutua com sombra elevada (`shadow-2xl`).
- D-13: Overlay usa `motion.div` com `scale: 1.02` e `boxShadow` elevado — sinaliza que está sendo movido.
- D-14: Item de destino (drop zone) tem feedback: `ring-2 ring-primary` já existente — manter, adicionar transição de cor suave.
- D-15: Estado de drag detectado via `useDndMonitor` ou `onDragStart`/`onDragEnd` callbacks já existentes.

**Editor Micro-Animações**
- D-16: Botão "Adicionar Bloco": `whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.97 }}`.
- D-17: `SmartLinkCard` na LinksPage: padronizar `whileHover={{ y: -2, transition: { duration: 0.15 } }}`.
- D-18: Blocos ao serem adicionados: manter e garantir AnimatePresence wrapper em todos os tipos de bloco no SortableList.
- D-19: Não adicionar animações nos inputs/formulários do editor — prejudica usabilidade ao digitar.

### Claude's Discretion

- Exato breakpoint de timing entre as animações de rota (se usar `delay` no animate)
- Qual Lucide icon específico para cada empty state
- Se o `PageTransition` wrapper é HOC ou componente filho
- Valor exato de `y` nas route transitions (8px é baseline, ajustar se parecer exagerado)

### Deferred Ideas (OUT OF SCOPE)

- Animações na landing page — Phase 6 (depende desta phase)
- Confetti/celebração ao publicar primeiro link — backlog
- Lottie animations para empty states — complexidade desnecessária para v1.0
- Page transitions específicas por tipo de rota (ex: slide-left para editor) — backlog, fade+up é suficiente
</user_constraints>

---

## Summary

Framer Motion v12 está instalado no projeto (`^12.34.3`) e **não tem breaking changes** em relação à API v11 — o pacote `framer-motion` continua funcionando como alias do novo nome `motion`. `AnimatePresence mode="wait"`, `motion.div`, `whileHover`, e `whileTap` têm API idêntica. O projeto já usa Framer Motion extensamente (28+ usos de `motion`, `AnimatePresence` importado em 11 arquivos), então esta fase é de completar e uniformizar padrões existentes, não introduzir tecnologia nova.

A adição de `AnimatePresence` às rotas requer extrair `useLocation` dentro do `BrowserRouter` — o componente que gerencia as routes precisa estar dentro do router para usar o hook. O padrão correto é envolver `<Routes location={location} key={location.pathname}>` com `<AnimatePresence mode="wait">`. A decisão D-04 de criar um `PageTransition` component filho (não HOC) é a abordagem mais limpa com React Router v6.

Para o `DragOverlay` do dnd-kit, o overlay renderiza em um portal separado (fora do fluxo normal do DOM), portanto `motion.div` dentro dele funciona sem interferência do dnd-kit. O item dragged na lista original precisa ter opacity reduzida via CSS/estilo inline ao detectar drag ativo — isso é feito tracking o `activeId` no state do `DndContext`.

**Primary recommendation:** Implementar em ordem: (1) PageTransition component + route transitions, (2) skeletons faltantes, (3) empty states animados, (4) DragOverlay com motion.div, (5) verificar cobertura de `getEntryVariants` nos blocks novos adicionados na Phase 03.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| framer-motion | ^12.34.3 (já instalado) | Animações declarativas — motion.div, AnimatePresence, whileHover/Tap | Já o padrão do projeto; API madura, SSR-safe |
| @dnd-kit/core | ^6.3.1 (já instalado) | DragOverlay para feedback visual de arrastar | Já em uso no SortableList |
| react-router-dom | ^6.30.1 (já instalado) | useLocation para key de AnimatePresence | Já em uso, requer apenas hook adicional |
| @/components/ui/skeleton | já instalado (shadcn/ui) | Skeleton com animate-pulse built-in | Já usado em 6 pages, consistente |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | já instalado | Ícones para empty states (48px) | Todos os empty states — sem biblioteca externa |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| framer-motion motion.div no DragOverlay | CSS transform inline | motion.div é mais declarativo e consistente com o resto do projeto |
| Lucide icons nos empty states | Lottie / Heroicons / SVG customizado | Lucide já é a biblioteca de ícones do projeto; Lottie = complexidade desnecessária (D-08 locked) |

**Installation:** Nenhuma instalação necessária — toda a stack já está no projeto.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── PageTransition.tsx       # novo — wrapper reutilizável de rota
│   └── ui/
│       └── skeleton.tsx         # já existe — reutilizar
├── pages/
│   ├── Dashboard.tsx            # adicionar skeleton nos counter cards
│   ├── LinksPage.tsx            # upgrade empty state com animação
│   ├── AnalyticsPage.tsx        # adicionar empty state animado
│   ├── VideoaulasPage.tsx       # trocar Loader2 por skeleton estrutural
│   ├── SupportPage.tsx          # trocar Loader2 por skeleton estrutural
│   └── admin/
│       └── AdminDashboardPage.tsx # trocar Loader2 por skeleton grid
├── components/editor/blocks/
│   └── SortableList.tsx         # adicionar DragOverlay + activeId tracking
└── App.tsx                      # adicionar AnimatePresence + useLocation
```

### Pattern 1: PageTransition Component (componente filho, não HOC)

**What:** Wrapper `motion.div` com `initial/animate/exit` que cada page envolve seu conteúdo. Reutilizável sem props obrigatórias.
**When to use:** Todos os pages dentro de rotas protegidas e públicas de app (exceto `PublicLinkPage` — D-03).
**Example:**
```tsx
// src/components/PageTransition.tsx
// Source: Pattern verificado em múltiplas fontes oficiais React Router v6 + Framer Motion
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

### Pattern 2: AnimatePresence em App.tsx com useLocation

**What:** `useLocation` extraído num componente filho dentro de `BrowserRouter` para que o hook funcione. O `location.pathname` serve como key para detectar mudança de rota.
**When to use:** Uma vez, em `App.tsx` ou num componente `AppRoutes` extraído de App.tsx.

```tsx
// Dentro de BrowserRouter — requer componente filho para usar useLocation
// Source: react-router-dom v6 docs + framer-motion AnimatePresence docs
function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ... rotas existentes ... */}
        {/* PublicLinkPage NÃO recebe PageTransition — D-03 */}
        <Route path="/:slug/:pageSlug" element={<PublicLinkPage />} />
        <Route path="/:slug" element={<PublicLinkPage />} />
      </Routes>
    </AnimatePresence>
  );
}
```

**Constraint crítica:** `useLocation` só funciona dentro de `BrowserRouter`. A solução é extrair `<Routes>` para um componente filho `AppRoutes` dentro do `BrowserRouter`, como já é feito com `HomeRoute` e `HomeContent`.

### Pattern 3: DragOverlay com motion.div

**What:** `DragOverlay` do dnd-kit renderiza em portal. Tracking de `activeId` via `onDragStart`/`onDragEnd`. Item original recebe `opacity-40` quando está sendo arrastado.
**When to use:** Dentro do `DndContext` em `SortableList.tsx`.

```tsx
// Source: dnd-kit DragOverlay docs + framer-motion motion.div
import { DragOverlay } from "@dnd-kit/core";
import { motion } from "framer-motion";

// No DndContext:
<DndContext
  sensors={sensors}
  onDragStart={(event) => setActiveId(String(event.active.id))}
  onDragEnd={(event) => { setActiveId(null); handleDragEnd(event); }}
>
  <SortableContext ...>
    {unifiedItems.map((item) => (
      <div
        key={item.id}
        style={{ opacity: activeId === item.id ? 0.4 : 1 }}
        className="transition-opacity duration-150"
      >
        <SortableItem ... />
      </div>
    ))}
  </SortableContext>

  <DragOverlay>
    {activeId ? (
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: 1.02 }}
        className="shadow-2xl rounded-xl"
        style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.25)" }}
      >
        {/* renderiza o mesmo item — busca por activeId */}
        <SortableItem ... />
      </motion.div>
    ) : null}
  </DragOverlay>
</DndContext>
```

### Pattern 4: Empty State Animado com Float

**What:** `motion.div` para fade-up do container + `motion.div` com `animate={{ y: [0, -6, 0] }}` no ícone para float.
**When to use:** Todos os empty states listados em D-10.

```tsx
// Source: framer-motion keyframes + lucide-react
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
  className="flex flex-col items-center justify-center py-20 text-center"
>
  <motion.div
    animate={{ y: [0, -6, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4"
  >
    <InboxIcon className="h-8 w-8 text-muted-foreground" />
  </motion.div>
  <h3 className="font-semibold text-foreground mb-1">...</h3>
  <p className="text-sm text-muted-foreground mb-4">...</p>
</motion.div>
```

### Pattern 5: Skeleton Estrutural (substituindo Loader2)

**What:** Substituir o bloco `if (isLoading) return <Loader2>` por skeletons que replicam o layout real — mesma quantidade de cards, mesmas dimensões.
**When to use:** `AdminDashboardPage`, `VideoaulasPage`, `SupportPage`, e `LinkEditor` painel esquerdo.

```tsx
// Source: shadcn/ui Skeleton docs — animate-pulse é built-in
import { Skeleton } from "@/components/ui/skeleton";

// Grid de 4 stat cards (AdminDashboardPage):
if (statsLoading) {
  return (
    <DashboardLayout title="Painel Admin">
      <div className="space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl border border-border/50 bg-card">
              <Skeleton className="h-10 w-10 rounded-xl mb-3" />
              <Skeleton className="h-7 w-20 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
        {/* recent users rows */}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/50">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-20 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
```

### Anti-Patterns to Avoid

- **Animar inputs/formulários do editor:** Qualquer `whileHover` ou transição em campos de texto prejudica usabilidade ao digitar (D-19 locked).
- **Usar `mode="sync"` ou sem mode no AnimatePresence de route:** Causa flash de dois componentes sobrepostos. Usar `mode="wait"` obrigatoriamente.
- **Colocar AnimatePresence fora do BrowserRouter mas usar useLocation fora dele:** `useLocation` lança erro se usado fora de um Router context. A solução é o componente filho `AppRoutes`.
- **DragOverlay sem portal awareness:** DragOverlay já renderiza em portal — não envolve em outro portal ou Suspense, causa conflito.
- **`initial={false}` em AnimatePresence de route:** Remove animação de entrada no primeiro render — não usar, a entrada deve ser animada.
- **Keyframe array em `y` sem `ease: "easeInOut"`:** Sem ease, o float do ícone parece mecânico. Sempre especificar ease em keyframe animations.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Portal para DragOverlay | Portal manual com createPortal | `DragOverlay` de @dnd-kit/core | DragOverlay já resolve z-index, pointer events e rendering fora do fluxo; createPortal manual perde o context do DndContext |
| Skeleton shimmer | CSS animation personalizada | `Skeleton` de @/components/ui/skeleton | animate-pulse já incluído; dimensões e border-radius são configurados via className, não CSS custom |
| Detectar rota ativa para key do AnimatePresence | Hash da URL, pathname manual | `useLocation().pathname` do react-router-dom | pathname já inclui todos os segments; hash ou search podem divergir |
| Float animation de ícone | CSS @keyframes + Tailwind animate | `motion.div` com keyframe array `y: [0, -6, 0]` | framer-motion já instalado; CSS @keyframes requer estender tailwind.config |

**Key insight:** Esta fase é quase inteiramente reutilização dos padrões já estabelecidos no projeto — o trabalho é aplicar consistentemente o que já existe, não inventar novas soluções.

---

## Common Pitfalls

### Pitfall 1: useLocation fora do Router context
**What goes wrong:** `useLocation` em `App.tsx` no nível do JSX fora do `<BrowserRouter>` causa erro `useLocation() may be used only in the context of a <Router> component`.
**Why it happens:** Em App.tsx, `<BrowserRouter>` é declarado no return — qualquer hook chamado no componente App roda antes do BrowserRouter montar.
**How to avoid:** Extrair `<Routes>` para um componente filho `AppRoutes` que fica dentro de `<BrowserRouter>` e usa `useLocation` ali.
**Warning signs:** Erro no console durante dev: "useLocation() may be used only in the context of a Router component".

### Pitfall 2: Suspense + AnimatePresence interação inesperada
**What goes wrong:** Com lazy-loaded pages, quando a rota muda, o Suspense pode mostrar o fallback `<PageLoader>` enquanto o `AnimatePresence` ainda aguarda o `exit` do componente anterior — resultando em flash do loader entre animações.
**Why it happens:** `mode="wait"` espera o exit do anterior, mas o Suspense pode interromper com o fallback durante o carregamento do novo chunk.
**How to avoid:** O `<Suspense fallback={<PageLoader />}>` em App.tsx deve envolver o `AppRoutes` todo, não as Routes individualmente. O key no AnimatePresence deve ser `location.pathname` (já planeja). Testar manualmente com network throttling.
**Warning signs:** Flash do spinner entre páginas durante transição.

### Pitfall 3: DragOverlay renderizando item sem contexto de dnd-kit
**What goes wrong:** O item renderizado dentro de `DragOverlay` não tem o `useSortable` ativo — os listeners de drag não estão conectados. Tentar usar o mesmo `SortableItem` dentro do overlay causa hydration mismatch ou referências null.
**Why it happens:** `DragOverlay` renderiza fora do `SortableContext`. `useSortable` precisa de um contexto ativo para funcionar.
**How to avoid:** Criar um componente de "display only" separado para o overlay — sem `useSortable`, apenas rendering do conteúdo visual. Ou criar um `DragItemPreview` que recebe apenas os dados (não o item sortable completo).
**Warning signs:** Erros de ref null no console ao iniciar drag.

### Pitfall 4: Múltiplos `AnimatePresence` nested causando exit duplo
**What goes wrong:** Se um componente pai e um filho ambos têm `AnimatePresence`, o exit animation pode ser triggado duas vezes ou o filho nunca desmonta.
**Why it happens:** `AnimatePresence` controla o ciclo de mount/unmount. Dois wrappers nested podem conflitar.
**How to avoid:** O `AnimatePresence` de route fica apenas em `AppRoutes`. Os `AnimatePresence` internos (como o expand/collapse do SortableList) continuam independentes — eles animam collapse/expand, não unmount de rota.
**Warning signs:** Animações de saída sendo cortadas ou executadas duas vezes.

### Pitfall 5: `getEntryVariants` não cobrir blocks adicionados na Phase 03
**What goes wrong:** Blocos adicionados na Phase 03 (editores por tipo) podem não ter `entryVariants` aplicados em `SmartLinkPreview`, aparecendo sem animação de entrada nas páginas públicas.
**Why it happens:** `getEntryVariants` é chamado por `SmartLinkPreview` e `PublicLinkPage` com `itemDelay` baseado no índice. Se um novo tipo de block foi adicionado ao render path sem passar pelo wrapper `motion.div` com `entryVariants`, fica sem animação.
**How to avoid:** Verificar em `SmartLinkPreview.tsx` e `BlockRenderer.tsx` que todos os block types passam pelo wrapper de `entryVariants`. Checar especificamente os types adicionados na Phase 03.
**Warning signs:** Alguns blocks aparecem instantaneamente (sem fade) nas páginas públicas enquanto outros têm animação.

---

## Code Examples

Verified patterns from official sources and existing codebase:

### Padrão de expand/collapse existente no SortableList (HIGH confidence)
```tsx
// Source: src/components/editor/blocks/SortableList.tsx (linha 114-124) — existente
<AnimatePresence initial={false}>
  {open && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      {/* content */}
    </motion.div>
  )}
</AnimatePresence>
```

### getEntryVariants — sistema existente de stagger (HIGH confidence)
```tsx
// Source: src/components/preview/preview-utils.ts (linha 104-121) — existente
export function getEntryVariants(anim: EntryAnimation, delay: number) {
  const base = { delay, duration: 0.5 };
  switch (anim) {
    case "fade-up":
    default:
      return {
        initial: { opacity: 0, y: 25, scale: 0.92 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { ...base, type: "spring", stiffness: 180, damping: 20 }
      };
  }
}
```

### whileHover padrão estabelecido em ButtonPreview (HIGH confidence)
```tsx
// Source: src/components/preview/ButtonPreview.tsx — existente (pill style)
<motion.a
  whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
  // card style:
  // whileHover={{ scale: 1.04, y: -3, transition: { duration: 0.2 } }}
>
```

### Padrão de micro-animação para duração do projeto
```tsx
// Source: src/components/editor/blocks/SortableList.tsx — estabelecido
transition={{ duration: 0.18, ease: "easeInOut" }} // micro-interações do editor
transition={{ duration: 0.2, ease: "easeOut" }}    // hover states
transition={{ duration: 0.4, ease: "easeOut" }}    // empty state fade-up (D-09)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `exitBeforeEnter` prop no AnimatePresence | `mode="wait"` | Framer Motion v10 (2023) | exitBeforeEnter throws error em v10+ — usar mode="wait" |
| `import { motion } from "framer-motion"` | `import { motion } from "motion/react"` | Motion v12 (2024) | framer-motion ainda funciona como alias — sem breaking change para este projeto |
| DragOverlay sem feedback visual | DragOverlay com scale + shadow | dnd-kit v6+ suporta | Experiência de drag muito melhorada |

**Deprecated/outdated:**
- `exitBeforeEnter` prop no AnimatePresence: removido em v10, substituído por `mode="wait"`
- `positionTransition` em motion.div: substituído por `layout` prop (não relevante para esta fase)

---

## Open Questions

1. **Suspense + AnimatePresence com lazy-loaded pages**
   - What we know: Projeto usa `React.lazy` em todos os pages. Suspense com fallback `PageLoader` envolve `<Routes>`.
   - What's unclear: Em conexões lentas, o Suspense fallback pode interromper visualmente a route transition animation.
   - Recommendation: Aceitar o comportamento atual para v1.0 — a animação de saída ocorre antes do chunk carregar. Testar em dev com network throttling. Se causar flash, aumentar chunk priority com `/* webpackPrefetch: true */` comments.

2. **DragOverlay item preview: mesmo componente ou display-only?**
   - What we know: `SortableItem` chama `useSortable` internamente, o que não funciona dentro de `DragOverlay` (fora do SortableContext).
   - What's unclear: Nível de fidelidade visual desejado no overlay.
   - Recommendation: Criar um `DragItemPreview` simples que renderiza apenas o header do block (label + ícone de grip) — o conteúdo completo não precisa ser visível durante drag.

---

## Validation Architecture

**nyquist_validation:** não configurado em `.planning/config.json` — tratar como habilitado.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.2.4 + @testing-library/react 16.0.0 |
| Config file | `vitest.config.ts` (raiz do projeto) |
| Quick run command | `npm test -- --reporter=verbose src/test/` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

As animações são primariamente visuais e interativas. A maioria das verificações desta fase são smoke tests de renderização e testes manuais — automação cobre apenas lógica de componente.

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ANIM-01 | `PageTransition` renderiza children sem crashes | unit | `npm test -- src/test/page-transition.test.tsx -t "renders"` | ❌ Wave 0 |
| ANIM-02 | `getEntryVariants` retorna variants corretos para cada tipo | unit | `npm test -- src/test/preview-utils.test.ts -t "getEntryVariants"` | ❌ Wave 0 (arquivo preview-utils.test.ts) |
| ANIM-03 | Empty state animado renderiza com Lucide icon e texto | unit | `npm test -- src/test/empty-state.test.tsx` | ❌ Wave 0 |
| ANIM-04 | Route transition animation não ocorre em PublicLinkPage | manual | Verificação visual em browser | N/A — manual only |
| ANIM-05 | DragOverlay aparece ao iniciar drag no SortableList | manual | Verificação visual — drag não é simulável via jsdom | N/A — manual only |
| ANIM-06 | Skeleton nos 4 pages confirmados (AdminDashboard, Support, Videoaulas, Dashboard) | smoke | `npm test -- src/test/skeleton-coverage.test.tsx` | ❌ Wave 0 |

**Justificativa para manual-only:** Framer Motion requer browser environment para animações reais. jsdom não suporta `requestAnimationFrame` e `getBoundingClientRect` adequadamente para testar animações visuais. Os testes automatizados cobrem apenas estrutura de renderização (children presentes, classes corretas) — não interpolação de valores animados.

### Sampling Rate
- **Per task commit:** `npm test -- src/test/page-transition.test.tsx src/test/empty-state.test.tsx`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green antes do `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/test/page-transition.test.tsx` — verifica que PageTransition renderiza children, aceita className
- [ ] `src/test/empty-state.test.tsx` — verifica que empty state renderiza ícone, heading, CTA
- [ ] `src/test/skeleton-coverage.test.tsx` — smoke: AdminDashboardPage com `isLoading=true` mostra Skeleton, não Loader2
- [ ] `src/test/preview-utils.test.ts` — ampliar com testes para todos os 5 tipos de EntryAnimation em `getEntryVariants`

---

## Sources

### Primary (HIGH confidence)
- Codebase local — `src/components/editor/blocks/SortableList.tsx` — padrões de AnimatePresence e DndContext existentes
- Codebase local — `src/components/preview/preview-utils.ts` — `getEntryVariants` implementation
- Codebase local — `src/components/preview/ButtonPreview.tsx` — padrões de whileHover/whileTap estabelecidos
- Codebase local — `src/App.tsx` — estrutura atual de rotas (sem AnimatePresence)
- [motion.dev/docs/react-upgrade-guide](https://motion.dev/docs/react-upgrade-guide) — confirmação: v12 sem breaking changes, framer-motion alias ainda válido

### Secondary (MEDIUM confidence)
- [react-router discussions #10411](https://github.com/remix-run/react-router/discussions/10411) — padrão de AnimatePresence + useLocation com React Router v6, verificado com docs oficiais
- [dnd-kit issues #605, #969](https://github.com/clauderic/dnd-kit/issues/605) — confirmação de limitações do DragOverlay com framer-motion; requer display-only component

### Tertiary (LOW confidence)
- WebSearch results sobre framer-motion page transitions — padrões gerais consistentes com implementação verificada acima

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — tudo já instalado e em uso no projeto, sem instalações novas
- Architecture: HIGH — padrões extraídos diretamente do codebase + docs oficiais motion.dev
- Pitfalls: HIGH para useLocation/router e AnimatePresence; MEDIUM para DragOverlay display-only (confirmado em issues mas sem exemplo completo)
- Validation: HIGH — vitest.config.ts e test setup existentes inspecionados diretamente

**Research date:** 2026-03-25
**Valid until:** 2026-06-25 (APIs estáveis; Framer Motion v12 sem roadmap de breaking changes anunciado)
