# Editor Upgrade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevar o editor do Sistema Link PRO a nível fullstack premium — novos blocos de conversão e mídia, sidebar com categorias/busca, layout 3 colunas fixo, e badge por botão.

**Architecture:** Cada novo block type segue o mesmo padrão existente: (1) tipo declarado em `smart-link.ts`, (2) editor em `BlockEditor.tsx`, (3) renderer em `BlockRenderer.tsx`. O layout do editor é refatorado de drawer overlay para 3 colunas fixas persistentes em `LinkEditor.tsx`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Framer Motion, @dnd-kit, shadcn/ui, Lucide React

---

## File Map

| File | Action | Responsabilidade |
|------|--------|-----------------|
| `src/types/smart-link.ts` | Modify | Adicionar novos BlockType + interfaces |
| `src/components/editor/ElementsSidebar.tsx` | Modify | Categorias + busca |
| `src/components/editor/BlockEditor.tsx` | Modify | Editors para novos blocks |
| `src/components/preview/BlockRenderer.tsx` | Modify | Renderers para novos blocks |
| `src/pages/LinkEditor.tsx` | Modify | Layout 3 colunas fixas |
| `src/components/editor/ButtonBlockEditor.tsx` | Modify | Badge por botão |

---

## Task 1: Novos tipos em smart-link.ts

**Files:**
- Modify: `src/types/smart-link.ts`

- [ ] **Adicionar novos BlockType e interfaces**

```typescript
// Em smart-link.ts, substituir a linha do BlockType:
export type BlockType =
  | 'hero' | 'info' | 'button' | 'image-button' | 'badges'
  | 'text' | 'separator' | 'cta' | 'image' | 'header'
  | 'spacer' | 'video' | 'countdown' | 'faq' | 'gallery'
  // NOVOS:
  | 'testimonial' | 'stats' | 'product' | 'email-capture'
  | 'spotify' | 'map' | 'carousel' | 'banner';

// Adicionar interfaces novas antes de LinkBlock:

export interface StatItem {
  id: string;
  value: string;
  label: string;
}

export interface CarouselSlide {
  id: string;
  url: string;
  caption?: string;
}

// Em LinkBlock, adicionar campos novos:
export interface LinkBlock {
  // ... campos existentes mantidos ...
  // Testimonial
  testimonialName?: string;
  testimonialRole?: string;
  testimonialAvatar?: string;
  testimonialRating?: number; // 1-5
  // Stats
  statItems?: StatItem[];
  // Product
  productImage?: string;
  productName?: string;
  productPrice?: string;
  productOldPrice?: string;
  productDescription?: string;
  productButtonLabel?: string;
  productButtonUrl?: string;
  // Email Capture
  emailPlaceholder?: string;
  emailButtonLabel?: string;
  emailSuccessMessage?: string;
  // Spotify
  spotifyUrl?: string;
  spotifyCompact?: boolean;
  // Map
  mapUrl?: string;
  mapHeight?: number;
  // Carousel
  carouselSlides?: CarouselSlide[];
  carouselAutoplay?: boolean;
  // Banner
  bannerBg?: string;
  bannerTag?: string;
}

// Em SmartLinkButton, adicionar:
export interface SmartLinkButton {
  // ... campos existentes ...
  badgeLabel?: string;      // texto do badge ex: "NOVO", "🔥"
  badgeColor?: string;      // cor do badge ex: "#ef4444"
}
```

- [ ] **Commit**

```bash
git add src/types/smart-link.ts
git commit -m "feat: add 8 new block types and badge field to button types"
```

---

## Task 2: ElementsSidebar com categorias e busca

**Files:**
- Modify: `src/components/editor/ElementsSidebar.tsx`

- [ ] **Substituir o conteúdo do arquivo**

```tsx
import {
  MousePointerClick, Type, Award, Minus, MessageSquare, Image,
  Heading, Space, Video, Timer, HelpCircle, Images, ImagePlus,
  Star, BarChart3, ShoppingBag, Mail, Music, MapPin, GalleryHorizontal,
  Megaphone, Search
} from "lucide-react";
import { BlockType } from "@/types/smart-link";
import { motion } from "framer-motion";
import { useState } from "react";

interface ElementsSidebarProps {
  onAddBlock: (type: BlockType) => void;
}

const categories = [
  {
    label: "Links",
    color: "text-blue-400",
    items: [
      { type: "button" as BlockType, label: "Botão Visual", icon: MousePointerClick },
      { type: "image-button" as BlockType, label: "Botão Imagem", icon: ImagePlus },
    ],
  },
  {
    label: "Conteúdo",
    color: "text-purple-400",
    items: [
      { type: "header" as BlockType, label: "Título", icon: Heading },
      { type: "text" as BlockType, label: "Texto", icon: Type },
      { type: "image" as BlockType, label: "Imagem", icon: Image },
      { type: "video" as BlockType, label: "Vídeo", icon: Video },
      { type: "gallery" as BlockType, label: "Galeria", icon: Images },
      { type: "carousel" as BlockType, label: "Carrossel", icon: GalleryHorizontal },
    ],
  },
  {
    label: "Conversão",
    color: "text-green-400",
    items: [
      { type: "cta" as BlockType, label: "CTA", icon: MessageSquare },
      { type: "countdown" as BlockType, label: "Countdown", icon: Timer },
      { type: "testimonial" as BlockType, label: "Depoimento", icon: Star },
      { type: "stats" as BlockType, label: "Números/Stats", icon: BarChart3 },
      { type: "product" as BlockType, label: "Produto", icon: ShoppingBag },
      { type: "email-capture" as BlockType, label: "Captura Email", icon: Mail },
      { type: "banner" as BlockType, label: "Banner Promo", icon: Megaphone },
    ],
  },
  {
    label: "Mídia & Social",
    color: "text-orange-400",
    items: [
      { type: "spotify" as BlockType, label: "Spotify", icon: Music },
      { type: "map" as BlockType, label: "Mapa", icon: MapPin },
      { type: "faq" as BlockType, label: "FAQ", icon: HelpCircle },
      { type: "badges" as BlockType, label: "Badges", icon: Award },
    ],
  },
  {
    label: "Layout",
    color: "text-gray-400",
    items: [
      { type: "spacer" as BlockType, label: "Espaçador", icon: Space },
      { type: "separator" as BlockType, label: "Separador", icon: Minus },
    ],
  },
];

export function ElementsSidebar({ onAddBlock }: ElementsSidebarProps) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? categories.map(cat => ({
        ...cat,
        items: cat.items.filter(el =>
          el.label.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(cat => cat.items.length > 0)
    : categories;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar elemento..."
          className="w-full h-8 pl-8 pr-3 text-xs bg-secondary border border-border rounded-lg outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Categories */}
      {filtered.map((cat, ci) => (
        <div key={cat.label}>
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${cat.color}`}>
            {cat.label}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {cat.items.map((el, i) => (
              <motion.button
                key={el.type}
                onClick={() => onAddBlock(el.type)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (ci * 0.05) + (i * 0.02) }}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/40 hover:bg-secondary transition-all group text-left"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shrink-0">
                  <el.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[11px] font-medium text-foreground leading-tight">{el.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add src/components/editor/ElementsSidebar.tsx
git commit -m "feat: sidebar with categories and search filter"
```

---

## Task 3: Block Testimonial — editor + renderer

**Files:**
- Modify: `src/components/editor/BlockEditor.tsx` (dentro do SortableBlock, adicionar case)
- Modify: `src/components/preview/BlockRenderer.tsx`

- [ ] **Adicionar editor de Testimonial em BlockEditor.tsx** (dentro do `<div className="p-4 space-y-3">` no SortableBlock, após o último bloco `if`)

```tsx
{block.type === "testimonial" && (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Nome</Label>
        <Input
          value={block.testimonialName || ""}
          onChange={e => onUpdate(block.id, { testimonialName: e.target.value })}
          placeholder="Maria Silva"
          className="text-sm h-9"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Cargo / Empresa</Label>
        <Input
          value={block.testimonialRole || ""}
          onChange={e => onUpdate(block.id, { testimonialRole: e.target.value })}
          placeholder="CEO, Empresa X"
          className="text-sm h-9"
        />
      </div>
    </div>
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Depoimento</Label>
      <Textarea
        value={block.content || ""}
        onChange={e => onUpdate(block.id, { content: e.target.value })}
        placeholder="Produto incrível, mudou minha vida..."
        className="text-sm min-h-[70px]"
      />
    </div>
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Avaliação (estrelas)</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onUpdate(block.id, { testimonialRating: n })}
            className={`text-xl transition-transform hover:scale-110 ${n <= (block.testimonialRating ?? 5) ? "opacity-100" : "opacity-30"}`}
          >
            ⭐
          </button>
        ))}
      </div>
    </div>
    <ImageUploader
      value={block.testimonialAvatar || ""}
      onChange={url => onUpdate(block.id, { testimonialAvatar: url })}
      aspectRatio={1}
      label="Foto (opcional)"
      compact
    />
  </div>
)}
```

- [ ] **Adicionar renderer de Testimonial em BlockRenderer.tsx** (antes do `return null`)

```tsx
if (block.type === "testimonial" && block.content) {
  const stars = block.testimonialRating ?? 5;
  return (
    <motion.div className="px-4 py-2"
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
      <div
        className={`rounded-2xl p-4 shadow-sm ${dark ? "bg-white/8 backdrop-blur-sm border border-white/10" : "bg-white border border-gray-100 shadow-md"}`}
      >
        <div className="flex gap-0.5 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={`text-sm ${i < stars ? "opacity-100" : "opacity-20"}`}>⭐</span>
          ))}
        </div>
        <p className={`text-xs leading-relaxed italic mb-3 ${subtextClass}`}>"{block.content}"</p>
        <div className="flex items-center gap-2">
          {block.testimonialAvatar ? (
            <img src={block.testimonialAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: accent }}>
              {(block.testimonialName || "?")[0].toUpperCase()}
            </div>
          )}
          <div>
            {block.testimonialName && <p className={`text-xs font-semibold ${textClass}`}>{block.testimonialName}</p>}
            {block.testimonialRole && <p className={`text-[10px] ${subtextClass}`}>{block.testimonialRole}</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Adicionar "testimonial" no labels do SortableBlock**

```tsx
// Em BlockEditor.tsx, no objeto labels dentro de SortableBlock, adicionar:
testimonial: "Depoimento",
stats: "Números/Stats",
product: "Produto",
"email-capture": "Captura Email",
spotify: "Spotify",
map: "Mapa",
carousel: "Carrossel",
banner: "Banner Promo",
```

- [ ] **Commit**

```bash
git add src/components/editor/BlockEditor.tsx src/components/preview/BlockRenderer.tsx
git commit -m "feat: add Testimonial block with editor and renderer"
```

---

## Task 4: Block Stats/Números — editor + renderer

**Files:**
- Modify: `src/components/editor/BlockEditor.tsx`
- Modify: `src/components/preview/BlockRenderer.tsx`

- [ ] **Adicionar editor de Stats em BlockEditor.tsx**

```tsx
{block.type === "stats" && (
  <div className="space-y-3">
    <p className="text-[10px] text-muted-foreground">Ex: "10k" + "Clientes", "4.9★" + "Avaliação"</p>
    {(block.statItems || []).map((stat, si) => (
      <div key={stat.id} className="flex gap-2 items-center">
        <Input
          value={stat.value}
          onChange={e => {
            const items = (block.statItems || []).map(s => s.id === stat.id ? { ...s, value: e.target.value } : s);
            onUpdate(block.id, { statItems: items });
          }}
          placeholder="10k"
          className="text-sm h-8 w-20 text-center font-bold"
        />
        <Input
          value={stat.label}
          onChange={e => {
            const items = (block.statItems || []).map(s => s.id === stat.id ? { ...s, label: e.target.value } : s);
            onUpdate(block.id, { statItems: items });
          }}
          placeholder="Clientes"
          className="text-sm h-8 flex-1"
        />
        <button
          onClick={() => onUpdate(block.id, { statItems: (block.statItems || []).filter(s => s.id !== stat.id) })}
          className="p-1.5 text-destructive/60 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    ))}
    <button
      onClick={() => {
        const newItem = { id: `stat-${Date.now()}`, value: "", label: "" };
        onUpdate(block.id, { statItems: [...(block.statItems || []), newItem] });
      }}
      className="w-full py-2 rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
    >
      + Adicionar stat
    </button>
  </div>
)}
```

- [ ] **Adicionar renderer de Stats em BlockRenderer.tsx**

```tsx
if (block.type === "stats" && block.statItems && block.statItems.length > 0) {
  return (
    <motion.div className="px-4 py-3"
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
      <div className={`flex justify-around gap-2 rounded-2xl p-4 ${dark ? "bg-white/8 border border-white/10" : "bg-white border border-gray-100 shadow-sm"}`}>
        {block.statItems.map((stat, si) => (
          <motion.div key={stat.id} className="text-center"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + si * 0.08 }}>
            <div className="text-xl font-black" style={{ color: accent }}>{stat.value}</div>
            <div className={`text-[10px] font-medium mt-0.5 ${subtextClass}`}>{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
```

- [ ] **Commit**

```bash
git add src/components/editor/BlockEditor.tsx src/components/preview/BlockRenderer.tsx
git commit -m "feat: add Stats/Numbers block with editor and renderer"
```

---

## Task 5: Block Produto — editor + renderer

**Files:**
- Modify: `src/components/editor/BlockEditor.tsx`
- Modify: `src/components/preview/BlockRenderer.tsx`

- [ ] **Adicionar editor de Produto em BlockEditor.tsx**

```tsx
{block.type === "product" && (
  <div className="space-y-3">
    <ImageUploader
      value={block.productImage || ""}
      onChange={url => onUpdate(block.id, { productImage: url })}
      aspectRatio={4 / 3}
      label="Imagem do produto"
    />
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Nome do Produto</Label>
      <Input
        value={block.productName || ""}
        onChange={e => onUpdate(block.id, { productName: e.target.value })}
        placeholder="Camiseta Premium"
        className="text-sm h-9"
      />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Preço</Label>
        <Input
          value={block.productPrice || ""}
          onChange={e => onUpdate(block.id, { productPrice: e.target.value })}
          placeholder="R$ 89,90"
          className="text-sm h-9"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Preço antigo (riscado)</Label>
        <Input
          value={block.productOldPrice || ""}
          onChange={e => onUpdate(block.id, { productOldPrice: e.target.value })}
          placeholder="R$ 129,90"
          className="text-sm h-9"
        />
      </div>
    </div>
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Descrição curta</Label>
      <Textarea
        value={block.productDescription || ""}
        onChange={e => onUpdate(block.id, { productDescription: e.target.value })}
        placeholder="Material 100% algodão..."
        className="text-sm min-h-[50px]"
      />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Texto do botão</Label>
        <Input
          value={block.productButtonLabel || ""}
          onChange={e => onUpdate(block.id, { productButtonLabel: e.target.value })}
          placeholder="Comprar agora"
          className="text-sm h-9"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Link do botão</Label>
        <Input
          value={block.productButtonUrl || ""}
          onChange={e => onUpdate(block.id, { productButtonUrl: e.target.value })}
          placeholder="https://..."
          className="text-sm h-9 font-mono"
        />
      </div>
    </div>
  </div>
)}
```

- [ ] **Adicionar renderer de Produto em BlockRenderer.tsx**

```tsx
if (block.type === "product" && block.productName) {
  return (
    <motion.div className="px-4 py-2"
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
      <div className={`rounded-2xl overflow-hidden shadow-md ${dark ? "bg-white/8 border border-white/10" : "bg-white border border-gray-100"}`}>
        {block.productImage && (
          <img src={block.productImage} alt="" className="w-full h-40 object-cover" />
        )}
        <div className="p-3 space-y-2">
          <p className={`font-bold text-sm ${textClass}`}>{block.productName}</p>
          {block.productDescription && (
            <p className={`text-[11px] leading-relaxed ${subtextClass}`}>{block.productDescription}</p>
          )}
          <div className="flex items-center gap-2">
            {block.productOldPrice && (
              <span className={`text-xs line-through ${subtextClass} opacity-60`}>{block.productOldPrice}</span>
            )}
            {block.productPrice && (
              <span className="text-base font-black" style={{ color: accent }}>{block.productPrice}</span>
            )}
          </div>
          {block.productButtonLabel && (
            <a
              href={block.productButtonUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { if (!isNewLink) recordClick(linkId, block.id); }}
              className="block w-full py-2.5 rounded-xl text-center text-xs font-bold text-white shadow-md active:scale-95 transition-transform"
              style={{ background: accent }}
            >
              {block.productButtonLabel}
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Commit**

```bash
git add src/components/editor/BlockEditor.tsx src/components/preview/BlockRenderer.tsx
git commit -m "feat: add Product Card block with editor and renderer"
```

---

## Task 6: Block Email Capture — editor + renderer

**Files:**
- Modify: `src/components/editor/BlockEditor.tsx`
- Modify: `src/components/preview/BlockRenderer.tsx`

- [ ] **Adicionar editor em BlockEditor.tsx**

```tsx
{block.type === "email-capture" && (
  <div className="space-y-3">
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Título</Label>
      <Input
        value={block.content || ""}
        onChange={e => onUpdate(block.id, { content: e.target.value })}
        placeholder="Receba novidades exclusivas"
        className="text-sm h-9"
      />
    </div>
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Placeholder do campo</Label>
      <Input
        value={block.emailPlaceholder || ""}
        onChange={e => onUpdate(block.id, { emailPlaceholder: e.target.value })}
        placeholder="seu@email.com"
        className="text-sm h-9"
      />
    </div>
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Texto do botão</Label>
      <Input
        value={block.emailButtonLabel || ""}
        onChange={e => onUpdate(block.id, { emailButtonLabel: e.target.value })}
        placeholder="Quero receber!"
        className="text-sm h-9"
      />
    </div>
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Mensagem de sucesso</Label>
      <Input
        value={block.emailSuccessMessage || ""}
        onChange={e => onUpdate(block.id, { emailSuccessMessage: e.target.value })}
        placeholder="Obrigado! Em breve você receberá nossas novidades."
        className="text-sm h-9"
      />
    </div>
  </div>
)}
```

- [ ] **Adicionar renderer em BlockRenderer.tsx** (precisa de state local — usar componente separado)

Criar o componente inline no topo do arquivo (após os imports):

```tsx
const EmailCaptureBlock = memo(function EmailCaptureBlock({
  block, accent, dark, textClass, subtextClass, delay
}: Pick<BlockRendererProps, 'block' | 'accent' | 'dark' | 'textClass' | 'subtextClass' | 'delay'>) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <motion.div className="px-4 py-2"
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className={`rounded-2xl p-4 text-center ${dark ? "bg-white/8 border border-white/10" : "bg-white border border-gray-100 shadow-sm"}`}>
          <div className="text-2xl mb-1">✅</div>
          <p className={`text-xs font-medium ${textClass}`}>
            {block.emailSuccessMessage || "Obrigado! Em breve você receberá nossas novidades."}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="px-4 py-2"
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
      <div className={`rounded-2xl p-4 space-y-2 ${dark ? "bg-white/8 border border-white/10" : "bg-white border border-gray-100 shadow-sm"}`}>
        {block.content && <p className={`text-xs font-semibold text-center ${textClass}`}>{block.content}</p>}
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={block.emailPlaceholder || "seu@email.com"}
          className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${dark ? "bg-white/10 border-white/20 text-white placeholder:text-white/40" : "bg-gray-50 border-gray-200 text-gray-800 placeholder:text-gray-400"}`}
        />
        <button
          onClick={() => email.includes("@") && setSubmitted(true)}
          className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition-transform"
          style={{ background: accent }}
        >
          {block.emailButtonLabel || "Quero receber!"}
        </button>
      </div>
    </motion.div>
  );
});
```

Adicionar também no `useState` import no topo do BlockRenderer.tsx e usar o componente:

```tsx
// Adicionar import no topo:
import { memo, useState } from "react";

// Adicionar no renderer, antes do return null:
if (block.type === "email-capture") {
  return <EmailCaptureBlock block={block} accent={accent} dark={dark}
    textClass={textClass} subtextClass={subtextClass} delay={delay} />;
}
```

- [ ] **Commit**

```bash
git add src/components/editor/BlockEditor.tsx src/components/preview/BlockRenderer.tsx
git commit -m "feat: add Email Capture block with editor and renderer"
```

---

## Task 7: Block Spotify — editor + renderer

**Files:**
- Modify: `src/components/editor/BlockEditor.tsx`
- Modify: `src/components/preview/BlockRenderer.tsx`

- [ ] **Adicionar editor em BlockEditor.tsx**

```tsx
{block.type === "spotify" && (
  <div className="space-y-3">
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">URL do Spotify</Label>
      <Input
        value={block.spotifyUrl || ""}
        onChange={e => onUpdate(block.id, { spotifyUrl: e.target.value })}
        placeholder="https://open.spotify.com/track/..."
        className="text-sm h-9 font-mono"
      />
      <p className="text-[10px] text-muted-foreground">Cole o link de música, playlist ou álbum</p>
    </div>
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={`spotify-compact-${block.id}`}
        checked={block.spotifyCompact ?? false}
        onChange={e => onUpdate(block.id, { spotifyCompact: e.target.checked })}
        className="rounded"
      />
      <Label htmlFor={`spotify-compact-${block.id}`} className="text-xs text-muted-foreground cursor-pointer">
        Modo compacto (altura menor)
      </Label>
    </div>
  </div>
)}
```

- [ ] **Adicionar helper no preview-utils.ts**

```tsx
// Em src/components/preview/preview-utils.ts, adicionar:
export function getSpotifyEmbedUrl(url: string): string | null {
  // https://open.spotify.com/track/ID → https://open.spotify.com/embed/track/ID
  const match = url.match(/open\.spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator`;
}
```

- [ ] **Adicionar renderer em BlockRenderer.tsx**

```tsx
// Import no topo:
import { getVideoEmbedUrl, getSpotifyEmbedUrl } from "./preview-utils";

// Renderer:
if (block.type === "spotify" && block.spotifyUrl) {
  const embedUrl = getSpotifyEmbedUrl(block.spotifyUrl);
  if (!embedUrl) return null;
  const height = block.spotifyCompact ? 80 : 152;
  return (
    <motion.div className="px-4 py-2"
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
      <iframe
        src={embedUrl}
        width="100%"
        height={height}
        style={{ borderRadius: 16 }}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </motion.div>
  );
}
```

- [ ] **Commit**

```bash
git add src/components/editor/BlockEditor.tsx src/components/preview/BlockRenderer.tsx src/components/preview/preview-utils.ts
git commit -m "feat: add Spotify embed block with editor and renderer"
```

---

## Task 8: Block Mapa — editor + renderer

**Files:**
- Modify: `src/components/editor/BlockEditor.tsx`
- Modify: `src/components/preview/BlockRenderer.tsx`

- [ ] **Adicionar editor em BlockEditor.tsx**

```tsx
{block.type === "map" && (
  <div className="space-y-3">
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">URL do Google Maps (embed)</Label>
      <Textarea
        value={block.mapUrl || ""}
        onChange={e => onUpdate(block.id, { mapUrl: e.target.value })}
        placeholder="https://www.google.com/maps/embed?pb=..."
        className="text-sm min-h-[60px] font-mono"
      />
      <p className="text-[10px] text-muted-foreground">
        Google Maps → Compartilhar → Incorporar mapa → copie a URL do src=""
      </p>
    </div>
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Altura: {block.mapHeight ?? 220}px</Label>
      <Slider
        value={[block.mapHeight ?? 220]}
        onValueChange={([v]) => onUpdate(block.id, { mapHeight: v })}
        min={150}
        max={400}
        step={10}
      />
    </div>
  </div>
)}
```

- [ ] **Adicionar renderer em BlockRenderer.tsx**

```tsx
if (block.type === "map" && block.mapUrl) {
  return (
    <motion.div className="px-4 py-2"
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
      <div className="rounded-2xl overflow-hidden shadow-md" style={{ height: block.mapHeight ?? 220 }}>
        <iframe
          src={block.mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </motion.div>
  );
}
```

- [ ] **Commit**

```bash
git add src/components/editor/BlockEditor.tsx src/components/preview/BlockRenderer.tsx
git commit -m "feat: add Map embed block with editor and renderer"
```

---

## Task 9: Block Carrossel — editor + renderer

**Files:**
- Modify: `src/components/editor/BlockEditor.tsx`
- Modify: `src/components/preview/BlockRenderer.tsx`

- [ ] **Adicionar editor em BlockEditor.tsx**

```tsx
{block.type === "carousel" && (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      {(block.carouselSlides || []).map((slide) => (
        <div key={slide.id} className="relative group rounded-lg overflow-hidden border border-border/40">
          <img src={slide.url} alt="" className="w-full h-16 object-cover" />
          <button
            onClick={() => onUpdate(block.id, { carouselSlides: (block.carouselSlides || []).filter(s => s.id !== slide.id) })}
            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-3.5 w-3.5 text-white" />
          </button>
        </div>
      ))}
    </div>
    <ImageUploader
      value=""
      onChange={url => {
        const newSlide: CarouselSlide = { id: `slide-${Date.now()}`, url };
        onUpdate(block.id, { carouselSlides: [...(block.carouselSlides || []), newSlide] });
      }}
      aspectRatio={16 / 9}
      label="Adicionar slide"
      compact
    />
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        id={`carousel-auto-${block.id}`}
        checked={block.carouselAutoplay ?? true}
        onChange={e => onUpdate(block.id, { carouselAutoplay: e.target.checked })}
      />
      <Label htmlFor={`carousel-auto-${block.id}`} className="text-xs text-muted-foreground cursor-pointer">
        Autoplay
      </Label>
    </div>
  </div>
)}
```

- [ ] **Adicionar renderer em BlockRenderer.tsx** (componente com state)

```tsx
const CarouselBlock = memo(function CarouselBlock({
  block, delay
}: Pick<BlockRendererProps, 'block' | 'delay'>) {
  const [idx, setIdx] = useState(0);
  const slides = block.carouselSlides || [];

  useEffect(() => {
    if (!block.carouselAutoplay || slides.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 3000);
    return () => clearInterval(t);
  }, [slides.length, block.carouselAutoplay]);

  if (!slides.length) return null;

  return (
    <motion.div className="px-4 py-2"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}>
      <div className="relative rounded-2xl overflow-hidden shadow-md" style={{ aspectRatio: "16/9" }}>
        {slides.map((slide, i) => (
          <motion.img
            key={slide.id}
            src={slide.url}
            alt={slide.caption || ""}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: i === idx ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          />
        ))}
        {slides.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? "bg-white w-3" : "bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
});

// Adicionar no renderer, antes do return null:
if (block.type === "carousel") {
  return <CarouselBlock block={block} delay={delay} />;
}
```

Adicionar `useEffect` no import do topo do BlockRenderer.tsx.

- [ ] **Commit**

```bash
git add src/components/editor/BlockEditor.tsx src/components/preview/BlockRenderer.tsx
git commit -m "feat: add Carousel block with autoplay and editor"
```

---

## Task 10: Block Banner Promo — editor + renderer

**Files:**
- Modify: `src/components/editor/BlockEditor.tsx`
- Modify: `src/components/preview/BlockRenderer.tsx`

- [ ] **Adicionar editor em BlockEditor.tsx**

```tsx
{block.type === "banner" && (
  <div className="space-y-3">
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Tag / Etiqueta (ex: 🔥 OFERTA)</Label>
      <Input
        value={block.bannerTag || ""}
        onChange={e => onUpdate(block.id, { bannerTag: e.target.value })}
        placeholder="🔥 OFERTA ESPECIAL"
        className="text-sm h-9"
      />
    </div>
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Título</Label>
      <Input
        value={block.content || ""}
        onChange={e => onUpdate(block.id, { content: e.target.value })}
        placeholder="50% OFF em todo o site"
        className="text-sm h-9"
      />
    </div>
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Subtítulo</Label>
      <Input
        value={block.subtitle || ""}
        onChange={e => onUpdate(block.id, { subtitle: e.target.value })}
        placeholder="Somente hoje, não perca!"
        className="text-sm h-9"
      />
    </div>
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Cor de fundo (hex)</Label>
      <div className="flex gap-2">
        <input
          type="color"
          value={block.bannerBg || "#6366f1"}
          onChange={e => onUpdate(block.id, { bannerBg: e.target.value })}
          className="w-10 h-9 rounded-lg border border-border cursor-pointer"
        />
        <Input
          value={block.bannerBg || "#6366f1"}
          onChange={e => onUpdate(block.id, { bannerBg: e.target.value })}
          className="text-sm h-9 font-mono flex-1"
        />
      </div>
    </div>
  </div>
)}
```

- [ ] **Adicionar renderer em BlockRenderer.tsx**

```tsx
if (block.type === "banner" && block.content) {
  const bg = block.bannerBg || accent;
  return (
    <motion.div className="px-4 py-2"
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, duration: 0.4 }}>
      <div
        className="rounded-2xl p-4 text-center shadow-lg relative overflow-hidden"
        style={{ background: bg }}
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent pointer-events-none" />
        {block.bannerTag && (
          <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold mb-2">
            {block.bannerTag}
          </span>
        )}
        <p className="text-white font-black text-base leading-tight">{block.content}</p>
        {block.subtitle && (
          <p className="text-white/80 text-xs mt-1">{block.subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
```

- [ ] **Commit**

```bash
git add src/components/editor/BlockEditor.tsx src/components/preview/BlockRenderer.tsx
git commit -m "feat: add Banner Promo block with editor and renderer"
```

---

## Task 11: Badge por botão em ButtonBlockEditor

**Files:**
- Modify: `src/components/editor/ButtonBlockEditor.tsx`
- Modify: `src/components/SmartLinkPreview.tsx` (renderer do botão)

- [ ] **Adicionar campo de badge no editor** (dentro do `<div className="p-4 space-y-4 ...">` em ButtonBlockEditor, após o campo de emoji)

```tsx
{/* Badge do botão */}
<div className="space-y-2">
  <Label className="text-[11px] font-medium text-muted-foreground">Badge (aparece no canto do botão)</Label>
  <div className="flex gap-2">
    <Input
      value={button.badgeLabel || ""}
      onChange={e => onUpdate(button.id, { badgeLabel: e.target.value })}
      placeholder="NOVO · 🔥 · GRÁTIS"
      className="text-sm h-9 flex-1"
    />
    <input
      type="color"
      value={button.badgeColor || "#ef4444"}
      onChange={e => onUpdate(button.id, { badgeColor: e.target.value })}
      className="w-10 h-9 rounded-xl border border-border cursor-pointer"
      title="Cor do badge"
    />
  </div>
  <p className="text-[10px] text-muted-foreground">Deixe vazio para esconder. Aparece no canto superior direito.</p>
</div>
```

- [ ] **Renderizar badge no preview do botão** em SmartLinkPreview.tsx

Localizar onde os botões são renderizados (procurar por `button.label` ou `gradientColor`) e adicionar o badge:

```tsx
{/* dentro do elemento do botão, adicionar badge overlay */}
{button.badgeLabel && (
  <span
    className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-white text-[9px] font-black shadow-md z-20 leading-none"
    style={{ background: button.badgeColor || "#ef4444" }}
  >
    {button.badgeLabel}
  </span>
)}
```

- [ ] **Commit**

```bash
git add src/components/editor/ButtonBlockEditor.tsx src/components/SmartLinkPreview.tsx
git commit -m "feat: add configurable badge per button with color picker"
```

---

## Task 12: addBlock default content para novos tipos

**Files:**
- Modify: `src/pages/LinkEditor.tsx`

- [ ] **Atualizar a função `addBlock` para inicializar campos dos novos tipos**

```tsx
// Em LinkEditor.tsx, na função addBlock, expandir o objeto de inicialização:
} else {
  updateLink({
    blocks: [
      ...link.blocks,
      {
        id: Date.now().toString(),
        type,
        order: nextOrder,
        content: "",
        subtitle: "",
        badges: type === "badges" ? [] : undefined,
        height: type === "spacer" ? 24 : undefined,
        borderRadius: type === "image" ? 12 : undefined,
        videoUrl: type === "video" ? "" : undefined,
        // Novos tipos:
        testimonialRating: type === "testimonial" ? 5 : undefined,
        statItems: type === "stats" ? [
          { id: `stat-${Date.now()}-1`, value: "10k", label: "Clientes" },
          { id: `stat-${Date.now()}-2`, value: "4.9★", label: "Avaliação" },
          { id: `stat-${Date.now()}-3`, value: "100%", label: "Satisfação" },
        ] : undefined,
        emailPlaceholder: type === "email-capture" ? "seu@email.com" : undefined,
        emailButtonLabel: type === "email-capture" ? "Quero receber!" : undefined,
        spotifyCompact: type === "spotify" ? false : undefined,
        mapHeight: type === "map" ? 220 : undefined,
        carouselSlides: type === "carousel" ? [] : undefined,
        carouselAutoplay: type === "carousel" ? true : undefined,
        bannerBg: type === "banner" ? "#6366f1" : undefined,
      },
    ],
  });
}
```

Também atualizar o objeto `names`:

```tsx
const names: Record<string, string> = {
  button: "Botão Visual", "image-button": "Botão Imagem", text: "Texto",
  badges: "Badges", cta: "CTA", separator: "Separador", image: "Imagem",
  header: "Título", spacer: "Espaçador", video: "Vídeo", hero: "Hero",
  info: "Info", countdown: "Countdown", faq: "FAQ", gallery: "Galeria",
  testimonial: "Depoimento", stats: "Números/Stats", product: "Produto",
  "email-capture": "Captura Email", spotify: "Spotify", map: "Mapa",
  carousel: "Carrossel", banner: "Banner Promo",
};
```

- [ ] **Commit**

```bash
git add src/pages/LinkEditor.tsx
git commit -m "feat: initialize new block types with sensible defaults"
```

---

## Task 13: Import do CarouselSlide no BlockEditor

**Files:**
- Modify: `src/components/editor/BlockEditor.tsx`

- [ ] **Adicionar CarouselSlide ao import de tipos no topo do BlockEditor.tsx**

```tsx
import { SmartLink, SmartLinkButton, LinkBlock, BlockType, FaqItem, GalleryImage, SubPage, CarouselSlide, StatItem } from "@/types/smart-link";
```

- [ ] **Commit**

```bash
git add src/components/editor/BlockEditor.tsx
git commit -m "chore: fix imports for new block type interfaces"
```

---

## Task 14: Teste visual final

- [ ] **Subir o dev server**

```bash
npm run dev
```

- [ ] **Checklist de verificação:**
  - [ ] Sidebar abre → categorias visíveis: Links, Conteúdo, Conversão, Mídia & Social, Layout
  - [ ] Campo de busca filtra elementos em tempo real
  - [ ] Clicar em "Depoimento" → bloco aparece no editor com campos corretos
  - [ ] Clicar em "Números/Stats" → bloco com 3 stats default pré-populados
  - [ ] Clicar em "Produto" → campos de imagem, preço, botão funcionais
  - [ ] Clicar em "Captura Email" → formulário com campo de email e botão
  - [ ] Clicar em "Spotify" → campo de URL + preview renderiza embed
  - [ ] Clicar em "Mapa" → campo de URL de embed + height slider
  - [ ] Clicar em "Carrossel" → adicionar slides + autoplay toggle
  - [ ] Clicar em "Banner Promo" → tag, título, subtítulo, color picker de fundo
  - [ ] Botão → campo "Badge" → badge aparece no preview no canto do botão
  - [ ] Drag & drop entre todos os tipos funciona
  - [ ] Preview mobile mostra todos os novos blocos corretamente

- [ ] **Commit final**

```bash
git add -A
git commit -m "feat: complete editor upgrade — 8 new blocks, sidebar categories, badge per button"
```

---

## Resumo de blocos adicionados

| Bloco | Categoria | Casos de uso |
|-------|-----------|-------------|
| Depoimento | Conversão | Social proof, avaliações |
| Números/Stats | Conversão | "10k clientes", "4.9 estrelas" |
| Produto | Conversão | E-commerce, cardápio, catálogo |
| Captura Email | Conversão | Newsletter, lead capture |
| Banner Promo | Conversão | Promoções, avisos urgentes |
| Spotify | Mídia | Música, podcasts |
| Mapa | Mídia | Localização de negócios |
| Carrossel | Mídia | Portfolio, lookbook, galeria avançada |
