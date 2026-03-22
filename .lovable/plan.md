

## Analise Honesta do Projeto + Plano de Melhorias

### Problemas Identificados (Análise Sincera)

**1. Elementos insuficientes e amadores**
- Apenas 5 tipos de blocos (button, text, badges, cta, separator). Faltam: Imagem standalone, Vídeo embed, Mapa, Contador, Galeria, Espaçamento customizável, Header/Título decorativo
- Não há controle de posição da imagem no botão (esquerda/direita)
- Não há controle de opacidade da imagem

**2. Hero image cortada no seco**
- A imagem hero usa `bg-gradient-to-t from-black/60` fixo. Deveria usar a cor de fundo selecionada para fazer uma transição suave, não preto

**3. Fontes não funcionam de verdade**
- O `ThemePanel` carrega fontes via Google Fonts e o preview usa `fontFamily`, mas o preview pode não estar aplicando corretamente porque a fonte precisa estar carregada antes de renderizar

**4. Página pública não busca links do localStorage**
- `PublicLinkPage.tsx` só procura em `mockLinks`, nunca nos links salvos pelo usuário

**5. Marca d'água (footer "Feito pela LinkPro") não se adapta**
- Usa sempre `bg-white text-gray-700`, invisível em fundos claros e feio em fundos escuros

**6. BlockEditor duplica campos**
- O `BlockEditor` tem inputs de "URL da Imagem Hero" e "URL do Logo" que duplicam o que já existe no `ThemePanel`

**7. Tipo SmartLinkButton limitado**
- Não tem `imagePosition` (left/right), `imageOpacity` (0-100), nem controle de tamanho da imagem

### O Que Vamos Fazer

**Fase 1: Novos Elementos + Controles Avançados**

Adicionar novos tipos de bloco ao sistema:
- `image` — Imagem standalone com controle de arredondamento
- `header` — Título decorativo com ícone
- `spacer` — Espaçamento customizável (altura ajustável)
- `video` — Embed de YouTube/Vimeo

Expandir o `SmartLinkButton` com:
- `imagePosition`: "left" | "right" (posição da imagem no card)
- `imageOpacity`: number (0 a 100, controle de transparência)
- `imageSize`: number (porcentagem da largura ocupada pela imagem)

Atualizar `ElementsSidebar` com os novos elementos e ícones melhores.

**Fase 2: Hero com Gradiente Dinâmico**

No `SmartLinkPreview`, substituir o gradiente fixo `from-black/60` por um gradiente que usa a cor de fundo selecionada. Para presets do Tailwind, extrair a cor dominante; para custom colors, usar diretamente o valor hex.

**Fase 3: Controles de Imagem no ButtonBlockEditor**

Adicionar ao editor de cada botão:
- Toggle "Imagem à Esquerda / Direita"
- Slider de opacidade (0-100%)
- Slider de tamanho da imagem (30-70% da largura)

Atualizar o preview para respeitar esses valores.

**Fase 4: Marca d'Água Adaptativa**

O footer "Feito pela LinkPro" detecta se o fundo é claro ou escuro e adapta cores automaticamente (branco com texto escuro em fundos claros, escuro com texto claro em fundos escuros).

**Fase 5: Correções Estruturais**

- Remover campos duplicados de Hero/Logo do `BlockEditor` (já estão no ThemePanel)
- `PublicLinkPage` buscar também do localStorage
- Adicionar novos BlockTypes ao `smart-link.ts`: `image`, `header`, `spacer`, `video`
- Expandir `LinkBlock` com campos: `imageUrl`, `height`, `videoUrl`

### Arquivos a Modificar

- `src/types/smart-link.ts` — novos tipos e campos
- `src/components/editor/ElementsSidebar.tsx` — novos elementos
- `src/components/editor/ButtonBlockEditor.tsx` — controles de imagem (posição, opacidade, tamanho)
- `src/components/editor/BlockEditor.tsx` — remover duplicatas, renderizar novos blocos
- `src/components/SmartLinkPreview.tsx` — hero gradient dinâmico, novos blocos, footer adaptativo, image position/opacity
- `src/pages/PublicLinkPage.tsx` — buscar links do localStorage
- `src/pages/LinkEditor.tsx` — suportar novos tipos no `addBlock`

