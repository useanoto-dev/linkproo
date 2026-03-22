# Banner Opacity Controls + Logo Sem Moldura — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar controles de opacidade (imagem + overlay) para o banner hero no ThemePanel, e remover a moldura forçada do upload de logo.

**Architecture:** Novos campos opcionais `heroImageOpacity`, `heroOverlayOpacity`, `heroOverlayColor` são adicionados ao tipo `SmartLink`, persistidos via migration Supabase, mapeados em `link-mappers.ts`, expostos como sliders no `ThemePanel.tsx` e aplicados visualmente no `SmartLinkPreview.tsx`. A logo tem seu `aspectRatio` e classes de exibição ajustados para aceitar qualquer formato.

**Tech Stack:** TypeScript, React, Tailwind CSS, Supabase (PostgreSQL)

---

## File Map

| Arquivo | Operação | Responsabilidade |
|---------|----------|-----------------|
| `src/types/smart-link.ts` | Modify | +3 campos tipados em SmartLink |
| `supabase/migrations/20260322000002_add_hero_opacity.sql` | Create | Migration com 3 novas colunas |
| `src/integrations/supabase/types.ts` | Modify | Refletir novas colunas no tipo Row/Insert/Update |
| `src/lib/link-mappers.ts` | Modify | Map snake_case ↔ camelCase dos 3 campos |
| `src/components/editor/ThemePanel.tsx` | Modify | UI: 2 sliders + seletor cor overlay + fix logo |
| `src/components/SmartLinkPreview.tsx` | Modify | Aplicar opacity/overlay na hero; object-contain na logo |

---

### Task 1: Adicionar campos ao tipo SmartLink

**Files:**
- Modify: `src/types/smart-link.ts:193-232`

- [ ] **Step 1: Adicionar os 3 campos à interface SmartLink**

Após a linha `heroFocalPoint?: HeroFocalPoint;` (linha ~207), inserir:

```typescript
  /** Opacity of the hero image itself (10–100, default 100) */
  heroImageOpacity?: number;
  /** Opacity of the overlay on top of hero image (0–80, default 0) */
  heroOverlayOpacity?: number;
  /** Color of the overlay: "dark" | "light" | hex string (default "dark") */
  heroOverlayColor?: string;
```

- [ ] **Step 2: Verificar que o TypeScript compila sem erros**

```bash
npx tsc --noEmit
```
Expected: zero erros relacionados aos campos novos.

- [ ] **Step 3: Commit**

```bash
git add src/types/smart-link.ts
git commit -m "feat: add heroImageOpacity, heroOverlayOpacity, heroOverlayColor to SmartLink type"
```

---

### Task 2: Migration Supabase

**Files:**
- Create: `supabase/migrations/20260322000002_add_hero_opacity.sql`

- [ ] **Step 1: Criar arquivo de migration**

```sql
-- Add hero banner opacity controls
ALTER TABLE links ADD COLUMN IF NOT EXISTS hero_image_opacity integer;
ALTER TABLE links ADD COLUMN IF NOT EXISTS hero_overlay_opacity integer;
ALTER TABLE links ADD COLUMN IF NOT EXISTS hero_overlay_color text;
```

- [ ] **Step 2: Aplicar migration via Supabase CLI (ou via dashboard SQL editor)**

```bash
npx supabase db push
```
Ou executar o SQL diretamente no Supabase Dashboard > SQL Editor.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260322000002_add_hero_opacity.sql
git commit -m "feat: migration add hero_image_opacity, hero_overlay_opacity, hero_overlay_color columns"
```

---

### Task 3: Atualizar tipos Supabase gerados

**Files:**
- Modify: `src/integrations/supabase/types.ts`

- [ ] **Step 1: Adicionar campos nas 3 seções do tipo links (Row, Insert, Update)**

Buscar as seções `Tables["links"]["Row"]`, `Tables["links"]["Insert"]` e `Tables["links"]["Update"]` e adicionar em cada uma (após `hero_image`):

Em **Row** (campo obrigatório com null):
```typescript
hero_image_opacity: number | null
hero_overlay_opacity: number | null
hero_overlay_color: string | null
```

Em **Insert** e **Update** (campos opcionais):
```typescript
hero_image_opacity?: number | null
hero_overlay_opacity?: number | null
hero_overlay_color?: string | null
```

- [ ] **Step 2: Verificar compilação**

```bash
npx tsc --noEmit
```
Expected: zero erros.

- [ ] **Step 3: Commit**

```bash
git add src/integrations/supabase/types.ts
git commit -m "feat: add hero opacity columns to Supabase generated types"
```

---

### Task 4: Mapear campos em link-mappers.ts

**Files:**
- Modify: `src/lib/link-mappers.ts`

- [ ] **Step 1: Adicionar ao rowToSmartLink (após heroImageHeight)**

Após `heroImageHeight: row.hero_image_height || undefined,`, inserir:

```typescript
heroImageOpacity: row.hero_image_opacity ?? undefined,
heroOverlayOpacity: row.hero_overlay_opacity ?? undefined,
heroOverlayColor: row.hero_overlay_color ?? undefined,
```

- [ ] **Step 2: Adicionar ao smartLinkToRow (após hero_image_height)**

Após `hero_image_height: link.heroImageHeight || null,`, inserir:

```typescript
hero_image_opacity: link.heroImageOpacity ?? null,
hero_overlay_opacity: link.heroOverlayOpacity ?? null,
hero_overlay_color: link.heroOverlayColor ?? null,
```

- [ ] **Step 3: Verificar compilação**

```bash
npx tsc --noEmit
```
Expected: zero erros.

- [ ] **Step 4: Commit**

```bash
git add src/lib/link-mappers.ts
git commit -m "feat: map heroImageOpacity/heroOverlayOpacity/heroOverlayColor in link-mappers"
```

---

### Task 5: UI — Sliders de opacidade no ThemePanel

**Files:**
- Modify: `src/components/editor/ThemePanel.tsx`

- [ ] **Step 1: Adicionar sliders após o focal point picker (linha ~212)**

Dentro do bloco `{link.heroImage && ( ... )}`, após o fechamento do `<div>` do Ponto Focal (após linha ~212), inserir os dois sliders e o seletor de cor:

```tsx
          {/* Image opacity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium text-muted-foreground">Opacidade da Imagem</Label>
              <span className="text-[11px] font-mono text-foreground tabular-nums">
                {link.heroImageOpacity ?? 100}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={link.heroImageOpacity ?? 100}
              onChange={(e) => onUpdateLink({ heroImageOpacity: Number(e.target.value) })}
              className="w-full h-1.5 accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>10%</span><span>100%</span>
            </div>
          </div>

          {/* Overlay opacity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-medium text-muted-foreground">Overlay sobre a imagem</Label>
              <span className="text-[11px] font-mono text-foreground tabular-nums">
                {link.heroOverlayOpacity ?? 0}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={80}
              step={5}
              value={link.heroOverlayOpacity ?? 0}
              onChange={(e) => onUpdateLink({ heroOverlayOpacity: Number(e.target.value) })}
              className="w-full h-1.5 accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground">
              <span>0%</span><span>80%</span>
            </div>
          </div>

          {/* Overlay color — only visible when overlay > 0 */}
          {(link.heroOverlayOpacity ?? 0) > 0 && (
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-muted-foreground">Cor do Overlay</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {([
                  { value: 'dark',  label: 'Escuro',      preview: '#000000' },
                  { value: 'light', label: 'Claro',        preview: '#ffffff' },
                  { value: 'custom', label: 'Personalizado', preview: null },
                ] as const).map((opt) => {
                  const current = link.heroOverlayColor ?? 'dark';
                  const isCustom = opt.value === 'custom';
                  const active = isCustom
                    ? current !== 'dark' && current !== 'light'
                    : current === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        if (isCustom) onUpdateLink({ heroOverlayColor: '#ff0000' });
                        else onUpdateLink({ heroOverlayColor: opt.value });
                      }}
                      className={`flex flex-col items-center py-1.5 px-1 rounded-lg border text-[10px] font-medium transition-all gap-1 ${
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/50 bg-secondary/30 text-muted-foreground hover:border-border'
                      }`}
                    >
                      {opt.preview ? (
                        <span
                          className="w-4 h-4 rounded-full border border-border/40 inline-block"
                          style={{ backgroundColor: opt.preview }}
                        />
                      ) : (
                        <input
                          type="color"
                          className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
                          value={active ? current : '#ff0000'}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onUpdateLink({ heroOverlayColor: e.target.value })}
                        />
                      )}
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
```

- [ ] **Step 2: Verificar no browser que os sliders aparecem ao adicionar uma imagem**

Abrir o editor, ir em Tema, adicionar imagem banner — os 3 controles devem aparecer abaixo do Ponto Focal.

- [ ] **Step 3: Commit**

```bash
git add src/components/editor/ThemePanel.tsx
git commit -m "feat: add hero image opacity and overlay sliders to ThemePanel"
```

---

### Task 6: Fix logo — remover moldura e crop

**Files:**
- Modify: `src/components/editor/ThemePanel.tsx`
- Modify: `src/components/SmartLinkPreview.tsx`

- [ ] **Step 1: Remover aspectRatio do ImageUploader da logo em ThemePanel.tsx**

Localizar (linha ~217-222):
```tsx
      <ImageUploader
        value={link.logoUrl}
        onChange={(url) => onUpdateLink({ logoUrl: url })}
        aspectRatio={1}
        label="Logo"
      />
```

Substituir por:
```tsx
      <ImageUploader
        value={link.logoUrl}
        onChange={(url) => onUpdateLink({ logoUrl: url })}
        label="Logo"
      />
```

- [ ] **Step 2: Corrigir exibição da logo no SmartLinkPreview.tsx**

Localizar (linha ~223):
```tsx
<img src={link.logoUrl} alt="Logo" className="w-14 h-14 rounded-2xl object-cover shadow-xl ring-2 ring-white/20" />
```

Substituir por:
```tsx
<img src={link.logoUrl} alt="Logo" className="max-w-[80px] max-h-[80px] object-contain drop-shadow-xl" />
```

Isso remove a moldura quadrada fixa (`w-14 h-14 rounded-2xl`), o ring e o `object-cover` que cortava a imagem, usando `object-contain` com tamanho máximo flexível.

- [ ] **Step 3: Verificar visualmente no preview**

Testar com logos horizontais, verticais e quadrados — todos devem exibir sem corte.

- [ ] **Step 4: Commit**

```bash
git add src/components/editor/ThemePanel.tsx src/components/SmartLinkPreview.tsx
git commit -m "feat: remove forced crop from logo uploader and fix logo display to object-contain"
```

---

### Task 7: Aplicar opacity e overlay no SmartLinkPreview

**Files:**
- Modify: `src/components/SmartLinkPreview.tsx`

- [ ] **Step 1: Aplicar heroImageOpacity na tag `<img>` do hero**

Localizar o bloco da hero image no preview (linha ~188-199):
```tsx
<img
  src={link.heroImage}
  alt={link.businessName}
  className="w-full"
  style={{
    height:         heightPx ?? 'auto',
    maxHeight:      heightPx ? undefined : '24rem',
    objectFit,
    objectPosition: objectPos,
    display:        'block',
  }}
/>
```

Substituir por:
```tsx
<img
  src={link.heroImage}
  alt={link.businessName}
  className="w-full"
  style={{
    height:         heightPx ?? 'auto',
    maxHeight:      heightPx ? undefined : '24rem',
    objectFit,
    objectPosition: objectPos,
    display:        'block',
    opacity:        (link.heroImageOpacity ?? 100) / 100,
  }}
/>
{/* Overlay layer */}
{(link.heroOverlayOpacity ?? 0) > 0 && (() => {
  const color = link.heroOverlayColor ?? 'dark';
  const bg = color === 'dark' ? '#000000' : color === 'light' ? '#ffffff' : color;
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundColor: bg,
        opacity: (link.heroOverlayOpacity ?? 0) / 100,
      }}
    />
  );
})()}
```

**Atenção:** o elemento pai `<motion.div>` que contém a `<img>` já deve ter `position: relative` (ou adicionar `className="relative"`) para que o overlay posicionado absolutamente funcione corretamente.

- [ ] **Step 2: Garantir que o wrapper da hero tem `relative`**

Localizar o `<motion.div>` que envolve a hero image (linha ~183-205) e garantir que tem `className` com `relative`. Se não tiver, adicionar `relative` às classes existentes.

- [ ] **Step 3: Testar no browser**

- Adicionar banner hero, mover slider de opacidade da imagem → imagem fica transparente em tempo real
- Adicionar overlay → camada aparece sobre a imagem
- Trocar cor do overlay → muda instantaneamente
- Valores devem persistir após salvar e recarregar a página

- [ ] **Step 4: Commit**

```bash
git add src/components/SmartLinkPreview.tsx
git commit -m "feat: apply heroImageOpacity and heroOverlay to SmartLinkPreview hero section"
```

---

## Checklist Final

- [ ] `heroImageOpacity` afeta visualmente a imagem em tempo real no preview
- [ ] `heroOverlayOpacity` exibe layer colorido sobre a imagem em tempo real
- [ ] Seletor de cor do overlay só aparece quando overlay > 0%
- [ ] Logo exibe sem moldura/crop, preservando proporções originais
- [ ] Valores são salvos e restaurados do Supabase corretamente
- [ ] Links existentes não quebram (todos os campos são nullable/optional com defaults)
- [ ] `npx tsc --noEmit` passa sem erros
