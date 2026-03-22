# Banner Opacity Controls + Logo Sem Moldura — Design Spec

**Date:** 2026-03-22
**Status:** Approved

---

## Objetivo

1. Adicionar controles de opacidade para o banner hero image no ThemePanel (opacidade da imagem + overlay)
2. Remover a moldura/crop forçado do upload de logo, permitindo logos em qualquer formato

---

## Funcionalidade 1: Controles de Opacidade do Banner Hero

### Campos novos em `SmartLink` (`src/types/smart-link.ts`)

```typescript
heroImageOpacity?: number;   // 10–100, default 100
heroOverlayOpacity?: number; // 0–80, default 0
heroOverlayColor?: string;   // "dark" | "light" | hex custom, default "dark"
```

### UI — ThemePanel.tsx

Na seção de banner hero (após focal point picker), adicionar:

1. **Slider "Opacidade da Imagem"**
   - Range: 10–100, step: 5, default: 100
   - Label: "Opacidade da Imagem"
   - Mostra valor atual (ex: "85%")

2. **Slider "Overlay"**
   - Range: 0–80, step: 5, default: 0
   - Label: "Overlay sobre a imagem"
   - Mostra valor atual (ex: "30%")

3. **Seletor de cor do overlay** (visível apenas quando `heroOverlayOpacity > 0`)
   - 3 opções: Escuro (dark), Claro (light), Personalizado (color picker hex)
   - Default: Escuro

### Preview — SmartLinkPreview.tsx

Na renderização da hero image:
- Aplicar `opacity: heroImageOpacity / 100` diretamente na `<img>` ou via `style`
- Renderizar `<div>` overlay por cima com:
  - `background`: preto (dark), branco (light), ou hex personalizado
  - `opacity`: `heroOverlayOpacity / 100`
  - `position: absolute`, cobre 100% da área da hero

### Supabase

Nova migration com 3 colunas na tabela `links`:
```sql
ALTER TABLE links ADD COLUMN hero_image_opacity integer;
ALTER TABLE links ADD COLUMN hero_overlay_opacity integer;
ALTER TABLE links ADD COLUMN hero_overlay_color text;
```

### Mapeamento de dados

- `useSmartLinkData.ts` / hook equivalente: mapear snake_case → camelCase nos dois sentidos
- Defaults ao ler: `heroImageOpacity ?? 100`, `heroOverlayOpacity ?? 0`, `heroOverlayColor ?? 'dark'`

---

## Funcionalidade 2: Logo Sem Moldura

### Problema atual

O `ImageUploader` da logo aplica aspect ratio fixo ou crop circular, forçando um formato específico.

### Solução

- Remover restrição de `aspectRatio` do `ImageUploader` da logo no `ThemePanel.tsx`
- Usar `object-contain` na exibição da logo no preview (`SmartLinkPreview.tsx`)
- A logo deve aceitar PNG com transparência, formatos horizontais, verticais, quadrados

### Impacto

- Apenas `ThemePanel.tsx` (uploader) e `SmartLinkPreview.tsx` (exibição)
- Sem mudança de schema — `logoUrl` já existe

---

## Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `src/types/smart-link.ts` | +3 campos hero opacity |
| `src/components/editor/ThemePanel.tsx` | +2 sliders + cor overlay + fix logo uploader |
| `src/components/preview/SmartLinkPreview.tsx` | Aplicar opacity + overlay na hero; object-contain na logo |
| `src/integrations/supabase/types.ts` | +3 campos na interface Row/Insert/Update |
| `supabase/migrations/YYYYMMDD_add_hero_opacity.sql` | Migration SQL |
| Hook de dados (useSmartLinkData ou similar) | Mapear novos campos |

---

## Critérios de Aceite

- [ ] Slider de opacidade da imagem afeta visualmente o hero no preview em tempo real
- [ ] Slider de overlay afeta visualmente o hero no preview em tempo real
- [ ] Seletor de cor do overlay só aparece quando overlay > 0%
- [ ] Logo exibe sem moldura/crop, preservando proporções originais
- [ ] Valores são salvos e restaurados corretamente do Supabase
- [ ] Sem quebra nos links existentes (novos campos são nullable com defaults)
