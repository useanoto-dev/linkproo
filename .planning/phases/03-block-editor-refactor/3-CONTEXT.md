# Phase 3: BlockEditor Refactor — Context

**Gathered:** 2026-03-24
**Status:** Ready for planning
**Mode:** --auto (Claude defaults)

<domain>
## Phase Boundary

Quebrar `BlockEditor.tsx` (1944 linhas) em componentes menores por grupo de tipo de bloco. O objetivo é orquestrador ≤300 linhas, lazy loading dos editores por grupo, zero regressão em undo/redo e auto-save.

Fora do escopo: novas features de bloco, mudanças no design visual, performance de runtime além do code splitting.

</domain>

<decisions>
## Implementation Decisions

### Estratégia de Split — Grupos por Afinidade

O `SortableBlock` (linhas 209-1467, 1258 linhas) contém rendering condicional por `block.type`. A divisão é por grupos de afinidade semântica, não um arquivo por tipo:

- **D-01:** Criar `src/components/editor/blocks/` como diretório de editores de bloco
- **D-02:** Dividir em 6 grupos de editores:
  1. `TextBlockEditor` — tipos: `text`, `cta`, `header` (conteúdo textual)
  2. `MediaBlockEditor` — tipos: `image`, `video`, `spotify`, `map`, `html`, `carousel` (mídia e embed)
  3. `LayoutBlockEditor` — tipos: `spacer`, `separator`, `banner` (layout e decoração)
  4. `InteractiveBlockEditor` — tipos: `image-button`, `animated-button`, `email-capture`, `countdown`, `badges` (interação e conversão)
  5. `ListBlockEditor` — tipos: `faq`, `gallery`, `testimonial`, `stats`, `product`, `contacts` (listas e coleções)
  6. Qualquer tipo não mapeado → fallback `null` (não quebra)

- **D-03:** Cada editor de grupo recebe as mesmas props que `SortableBlock` recebe hoje: `block: LinkBlock`, `onUpdate`, `pages?: SubPage[]`, plus `textareaRef?: RefObject<HTMLTextAreaElement>` e `applyTextFormat` onde necessário
- **D-04:** `SortableBlock` vira um dispatcher: mantém o shell (drag handle, header, collapse/expand, botões de ação) e renderiza o editor de grupo correto baseado em `block.type`

### Lazy Loading

- **D-05:** Usar `React.lazy()` + `Suspense` para cada grupo de editor
- **D-06:** Fallback do `Suspense`: `<div className="p-3 animate-pulse h-20 bg-muted/30 rounded" />` — skeleton simples, sem componente externo
- **D-07:** Os lazy imports ficam no topo de `BlockEditor.tsx` (fora do componente), não dentro do render
- **D-08:** NÃO lazy-load o `SortableBlock` em si — apenas os editores internos por grupo

### Orquestrador ≤300 linhas

O `BlockEditor.tsx` principal (linhas 1518-1944, ~426 linhas) já está próximo do alvo. O que precisa sair:

- **D-09:** Mover constantes `BLOCK_LABELS`, `ANIM_STYLE_OPTIONS`, `BUSINESS_NAME_SIZE_OPTIONS` e similares para `src/components/editor/blocks/constants.ts`
- **D-10:** Mover `getUnifiedItems` e `getUnifiedItemsForMode` para `src/components/editor/blocks/unified-items.ts`
- **D-11:** `SortableButton`, `SortableBlock`, `SortableItem` permanecem em `BlockEditor.tsx` por enquanto — se ainda necessário para atingir ≤300 linhas, mover `SortableButton` para `src/components/editor/blocks/SortableButton.tsx`
- **D-12:** Meta final: `BlockEditor.tsx` ≤300 linhas contendo apenas: lazy imports dos grupos, `SortableBlock` dispatcher, `SortableItem`, `BlockEditor` principal

### Zero Regressão — Undo/Redo e Auto-save

- **D-13:** Nenhuma lógica de estado é alterada — apenas mover JSX de render para componentes filhos
- **D-14:** O `onUpdate` callback é passado diretamente aos editores — não criar wrappers intermediários que interceptem chamadas
- **D-15:** `textareaRef` e `applyTextFormat` (usados apenas por `TextBlockEditor`) são criados no `SortableBlock` e passados como prop — não criar novo estado
- **D-16:** Após o refactor, rodar os testes existentes em `src/test/` para confirmar zero regressão — `npx vitest run`

### Claude's Discretion

- Nomes exatos dos arquivos dentro de `src/components/editor/blocks/`
- Se `SortableButton` precisa ser movido (depende da contagem de linhas após os outros moves)
- Ordem de migração dos grupos (pode ser qualquer ordem)
- Se criar `index.ts` barrel no diretório `blocks/`

</decisions>

<specifics>
## Specific Ideas

- O `SortableBlock` dispatcher deve usar um `switch(block.type)` ou mapeamento `Record<BlockType, component>` para routing — switch é mais legível aqui
- Manter `memo()` em todos os componentes de editor de grupo (performance igual ou melhor)
- Importar `LinkBlock`, `SubPage` do `@/types/smart-link` nos editores de grupo — não re-exportar

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Arquivo principal
- `src/components/editor/BlockEditor.tsx` — monolito completo (1944 linhas); estrutura:
  - Linhas 1-145: imports e constantes
  - Linhas 147-175: funções utilitárias `getUnifiedItems`, `getUnifiedItemsForMode`
  - Linhas 176-208: `SortableButton`
  - Linhas 209-1467: `SortableBlock` (o monolito interno — tudo que precisa ser extraído)
  - Linhas 1468-1517: `SortableItem`
  - Linhas 1518-1944: `BlockEditor` principal

### Tipos
- `src/types/smart-link.ts` — `LinkBlock`, `BlockType`, `SubPage` e todos os tipos de bloco
- `src/components/editor/ButtonBlockEditor.tsx` — exemplo de editor já extraído (590 linhas)

### Testes a preservar
- `src/test/` — todos os arquivos de teste devem passar após o refactor

### Componentes que importam BlockEditor
- `src/pages/LinkEditor.tsx` — consumidor principal
- `src/components/editor/SubPageEditor.tsx` — usa BlockEditor para sub-páginas

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ButtonBlockEditor.tsx`: padrão estabelecido para editor extraído — memo(), props interface, mesmo estilo
- `src/components/editor/blocks/` ainda não existe — criar nesta fase

### Established Patterns
- Editores extraídos usam `memo()` para performance
- Props: `block`, `onUpdate`, callbacks específicos
- Imports de UI de `@/components/ui/*`
- Imports de tipos de `@/types/smart-link`

### Integration Points
- `SortableBlock` é o único consumidor do conteúdo de bloco — split acontece dentro dele
- `BlockEditor` principal não chama editores diretamente — passa por `SortableBlock`
- `useUndo`, `useAutoSave` vivem em `LinkEditor.tsx` e `use-links.ts` — não tocados neste refactor

</code_context>

<deferred>
## Deferred Ideas

- Animações de transição entre blocos — Phase 5
- Virtualização da lista de blocos (react-virtual) — backlog se lista ficar lenta
- Editor inline no preview — fora do escopo v1.0

</deferred>

---

*Phase: 03-block-editor-refactor*
*Context gathered: 2026-03-24*
