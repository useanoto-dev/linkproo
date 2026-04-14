# 🔍 AUDITORIA DE PERFORMANCE — LinkPro

**Data:** 13/04/2026
**Stack:** React 18 + Vite 5 + Supabase + Tailwind + Framer Motion
**Deploy:** Vercel
**Build total:** 1.930 KB JS + 133 KB CSS = ~2.06 MB (sem gzip)

---

## 📊 RESUMO EXECUTIVO

Foram encontrados **19 problemas** que, combinados, fazem o sistema carregar lento no celular e no desktop. Os 3 maiores vilões são:

1. **Imagens sem otimização nenhuma** — o usuário faz upload de imagens de até 5MB sem compressão, sem resize, sem WebP, e elas são servidas pelo Supabase Storage sem CDN de imagem, sem cache headers.
2. **Animações Framer Motion infinitas rodando em JavaScript** — cada botão animado roda 3-5 loops infinitos de animação via JS (não CSS), saturando a CPU do celular.
3. **Zero headers de cache na Vercel** — sem caching de assets estáticos, o navegador re-baixa tudo a cada visita.

---

## 🚨 PROBLEMAS CRÍTICOS (Impacto Alto)

---

### PROBLEMA 1 — Imagens sem compressão/resize no upload

**Arquivo:** `src/lib/storage-utils.ts`
**Impacto:** Imagens de 2-5MB carregando em conexões 4G = 5-15 segundos por imagem

**O que está errado:**
O `uploadImage()` recebe o base64 do usuário e manda direto pro Supabase Storage sem nenhum tratamento. Não há:
- Compressão antes do upload
- Resize para largura máxima (o celular exibe no max 480px, mas a imagem pode ter 4000px)
- Conversão para WebP (30-50% menor que PNG/JPEG)

**Correção — Adicionar resize + compressão antes do upload:**

```typescript
// Em storage-utils.ts — nova função antes de uploadImage()

async function compressImage(
  dataUrl: string,
  maxWidth = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No canvas context"));
      ctx.drawImage(img, 0, 0, width, height);
      // Sempre converter para WebP se suportado
      const supportsWebP = canvas.toDataURL("image/webp").startsWith("data:image/webp");
      const format = supportsWebP ? "image/webp" : "image/jpeg";
      resolve(canvas.toDataURL(format, quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}
```

Depois, no `uploadImage()`, adicionar antes do `dataUrlToBlob`:

```typescript
// Comprimir antes de converter para blob
if (dataUrl.startsWith("data:")) {
  dataUrl = await compressImage(dataUrl, 1200, 0.82);
}
```

---

### PROBLEMA 2 — Vercel sem headers de cache

**Arquivo:** `vercel.json`
**Impacto:** Todo asset JS/CSS/imagem é re-baixado em cada visita. Zero cache.

**Correção — Substituir o vercel.json por:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*).js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*).css",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/favicon.svg",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=86400"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### PROBLEMA 3 — Animações Framer Motion infinitas em JavaScript (CPU killer)

**Arquivos:**
- `src/components/preview/ButtonPreview.tsx` — emoji com `repeat: Infinity` (y + rotate)
- `src/components/preview/AnimatedButtonBlock.tsx` — **5 animações infinitas simultâneas**: boxShadow pulse, shimmer sweep, icon float, WhatsApp badge scale, location ripples

**Impacto:** Uma página com 5-8 blocos animados = 25-40 animações infinitas JS rodando ao mesmo tempo. Celulares mid-range travam.

**Correção — Converter animações infinitas de Framer Motion para CSS puro:**

Em `ButtonPreview.tsx`, substituir o emoji animado:
```tsx
// ANTES (JS loop infinito):
<motion.span
  animate={{ y: [0, -3, 0], rotate: [0, 5, -5, 0] }}
  transition={{ duration: 3, repeat: Infinity }}
>

// DEPOIS (CSS puro, GPU-accelerated):
<span className="animate-float-emoji">
```

Adicionar no `index.css`:
```css
@keyframes float-emoji {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-3px) rotate(5deg); }
  66% { transform: translateY(0) rotate(-5deg); }
}
.animate-float-emoji {
  animation: float-emoji 3s ease-in-out infinite;
  will-change: transform;
}
```

Em `AnimatedButtonBlock.tsx`, converter o shimmer e o boxShadow:
```tsx
// ANTES:
animate={{ boxShadow: cardShadow }}
transition={{ duration: 2.5, repeat: Infinity }}

// DEPOIS: usar CSS animation
className="animate-card-glow"
```

```css
@keyframes card-glow {
  0%, 100% { box-shadow: 0 4px 16px var(--glow-color); }
  50% { box-shadow: 0 10px 32px var(--glow-color); }
}
.animate-card-glow {
  animation: card-glow 2.5s ease-in-out infinite;
  will-change: box-shadow;
}
```

**Regra geral:** Qualquer animação `repeat: Infinity` em Framer Motion DEVE ser convertida para CSS `@keyframes`. Framer Motion calcula no main thread JS. CSS animations rodam na GPU.

---

### PROBLEMA 4 — Google Fonts carregando 6 pesos por fonte

**Arquivo:** `src/components/preview/preview-utils.ts` (função `loadGoogleFont`)
**Impacto:** Cada fonte customizada carrega 6 arquivos de fonte (300, 400, 500, 600, 700, 800). Um usuário que usa Poppins baixa ~600KB só de fontes.

**Correção:**

```typescript
export function loadGoogleFont(font: string) {
  const id = `gf-${font.replace(/\s/g, "-")}`;
  if (document.getElementById(id)) return;
  const linkEl = document.createElement("link");
  linkEl.id = id;
  linkEl.rel = "stylesheet";
  // Apenas 400 e 700 — cobre 95% dos usos
  linkEl.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s/g, "+")}&:wght@400;700&display=swap`;
  document.head.appendChild(linkEl);
}
```

E no `index.html`, reduzir também:

```html
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" />
```

Remover peso 300 (nunca usado na UI) e 800 (desnecessário com 700).

---

### PROBLEMA 5 — Imagens dos botões sem lazy loading

**Arquivo:** `src/components/preview/ButtonPreview.tsx` (card style, linha da `<img>`)
**Impacto:** Todos os botões com imagem carregam TODAS as imagens de uma vez, mesmo as que estão fora da tela.

**Correção — Adicionar `loading="lazy"` nos botões:**

```tsx
<img
  src={btn.imageUrl}
  alt=""
  loading="lazy"              // ← ADICIONAR
  decoding="async"            // ← ADICIONAR
  onError={() => setBtnImgError(true)}
  className={`absolute ${imgPos === "left" ? "left-0" : "right-0"} top-0 h-full object-cover`}
  // ... rest of style
/>
```

---

### PROBLEMA 6 — Carousel carrega TODAS as imagens de uma vez

**Arquivo:** `src/components/preview/CarouselBlock.tsx`
**Impacto:** Um carousel com 5 slides = 5 imagens de 1-3MB carregando simultâneamente.

**Correção — Carregar apenas o slide atual e os adjacentes:**

```tsx
{slides.map((slide, i) => {
  // Só renderizar imagens do slide atual e adjacentes
  const shouldRender = Math.abs(i - idx) <= 1 || 
    (i === 0 && idx === slides.length - 1) || 
    (i === slides.length - 1 && idx === 0);
    
  return (
    <motion.img
      key={slide.id}
      src={shouldRender ? slide.url : undefined}
      alt={slide.caption || `Slide ${i + 1}`}
      className="absolute inset-0 w-full h-full object-cover"
      loading="lazy"
      decoding="async"
      initial={{ opacity: 0 }}
      animate={{ opacity: i === idx ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    />
  );
})}
```

---

### PROBLEMA 7 — Falta preconnect para o Supabase

**Arquivo:** `index.html`
**Impacto:** A primeira requisição ao Supabase (API + Storage) leva ~300-500ms extra por causa de DNS lookup + TLS handshake.

**Correção — Adicionar no `<head>` do `index.html`:**

```html
<!-- Supabase API -->
<link rel="preconnect" href="https://SEU_PROJETO.supabase.co" />
<link rel="dns-prefetch" href="https://SEU_PROJETO.supabase.co" />
<!-- Supabase Storage (imagens) -->
<link rel="preconnect" href="https://SEU_PROJETO.supabase.co/storage" />
```

> Substituir `SEU_PROJETO` pelo ID do seu projeto Supabase.

---

## ⚠️ PROBLEMAS MODERADOS (Impacto Médio)

---

### PROBLEMA 8 — AnimatePresence mode="wait" trava transições

**Arquivo:** `src/App.tsx`, linha `<AnimatePresence mode="wait">`
**Impacto:** O `mode="wait"` força a animação de saída a COMPLETAR antes da nova página montar. Isso adiciona ~200-400ms de delay percebido em cada navegação.

**Correção:**

```tsx
// Trocar de "wait" para "sync" ou remover completamente
<AnimatePresence mode="sync">
```

Ou, melhor ainda, remover o AnimatePresence do AppRoutes e deixar só o Suspense:

```tsx
function AppRoutes() {
  return (
    <Routes>
      {/* rotas sem AnimatePresence */}
    </Routes>
  );
}
```

---

### PROBLEMA 9 — Templates carregado no bundle principal (280KB no source)

**Arquivo:** `src/data/templates.ts` — 284KB de dados hardcoded
**Impacto:** `templates-1042iCce.js` = 152KB no build. Carregado mesmo quando o usuário só quer ver sua página pública.

**Correção — Fazer lazy import dos templates:**

```typescript
// Em vez de import estático:
// import { templates } from "@/data/templates";

// Usar import dinâmico só quando necessário:
const loadTemplates = () => import("@/data/templates").then(m => m.templates);

// No componente que usa:
const [templates, setTemplates] = useState<LinkTemplate[]>([]);
useEffect(() => {
  loadTemplates().then(setTemplates);
}, []);
```

---

### PROBLEMA 10 — usePublicLink com staleTime: 0

**Arquivo:** `src/hooks/use-links.ts`, função `usePublicLink`
**Impacto:** `staleTime: 0` força refetch TODA vez que a página monta, mesmo se o usuário já visitou aquele slug 2 segundos atrás. Desperdiça uma requisição API + atrasa render.

**Correção:**

```typescript
export function usePublicLink(slug?: string) {
  return useQuery({
    queryKey: ["public-link", slug],
    queryFn: async () => { /* ... */ },
    enabled: !!slug,
    staleTime: 1000 * 60 * 2,    // 2 minutos de cache
    gcTime: 1000 * 60 * 10,       // 10 min no garbage collector
  });
}
```

---

### PROBLEMA 11 — BgHtmlEffect usa iframe com document.write()

**Arquivo:** `src/components/BgHtmlEffect.tsx`
**Impacto:** `document.write()` é um anti-pattern de performance que bloqueia o parser. Em celulares, isso trava o render por ~100-300ms.

**Correção — Usar `srcdoc` diretamente em vez de `document.write`:**

```tsx
// Remover o useEffect que faz document.write e usar srcdoc:
return (
  <iframe
    ref={iframeRef}
    srcDoc={srcDoc}
    sandbox="allow-scripts"
    loading="lazy"
    // ...rest
  />
);
```

Remover completamente o `useEffect` que faz `doc.open(); doc.write(); doc.close()`.

---

### PROBLEMA 12 — CSS do build com 134KB (Tailwind sem purge otimizado)

**Arquivo:** `tailwind.config.ts` + `postcss.config.js`
**Impacto:** 134KB de CSS = muitas classes Tailwind não-usadas no bundle.

**Correção — Verificar o content do tailwind.config.ts:**

```typescript
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",  // Só o necessário
  ],
  // ... rest
}
```

Verificar se não tem imports de CSS desnecessários no `index.css`. Também remover o `src/App.css` se não for usado (694 bytes).

---

### PROBLEMA 13 — Falta width/height no HeroImage (CLS)

**Arquivo:** `src/components/preview/HeroImage.tsx`
**Impacto:** A `<img>` não tem `width` e `height` HTML attributes. Isso causa Content Layout Shift (CLS) — a página "pula" quando a imagem carrega.

**Correção:**

```tsx
<img
  src={link.heroImage}
  alt={link.businessName}
  className="w-full"
  loading="eager"
  fetchPriority="high"
  decoding="async"
  width={480}                    // ← ADICIONAR
  height={heightPx}             // ← ADICIONAR  
  onError={() => setImgError(true)}
  style={{
    height: heightPx,
    objectFit,
    objectPosition: objectPos,
    display: 'block',
    opacity: (link.heroImageOpacity ?? 100) / 100,
  }}
/>
```

---

## 💡 PROBLEMAS MENORES (Impacto Baixo, mas vale corrigir)

---

### PROBLEMA 14 — Duas chamadas sequenciais no usePublicLink

**Arquivo:** `src/hooks/use-links.ts`, `usePublicLink`
**O que acontece:** Primeiro busca o link, DEPOIS faz outra chamada RPC para `get_link_owner_plan`. São 2 round-trips sequenciais.

**Correção:** Criar uma função RPC no Supabase que retorne link + plan em uma única chamada:

```sql
CREATE OR REPLACE FUNCTION get_public_link(p_slug TEXT)
RETURNS JSON AS $$
  SELECT json_build_object(
    'link', row_to_json(l),
    'plan', COALESCE((SELECT plan FROM profiles WHERE user_id = l.user_id), 'free')
  )
  FROM links l
  WHERE l.slug = p_slug AND l.is_active = true
  LIMIT 1;
$$ LANGUAGE SQL STABLE;
```

---

### PROBLEMA 15 — Index.html carrega 2 famílias de fonte no render-blocking

**Arquivo:** `index.html`
**Impacto:** O `<link rel="stylesheet" href="...fonts...">` bloqueia o render. Space Grotesk + Inter com 5 pesos cada = ~10 font files.

**Correção — Mover para carregamento não-bloqueante:**

```html
<!-- Trocar de: -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=...&display=swap" />

<!-- Para: -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@400;600;700&display=swap" media="print" onload="this.media='all'" />
```

---

### PROBLEMA 16 — Coverage folder no zip (9.4MB de lixo)

**Arquivo:** Pasta `/coverage` na raiz
**Impacto:** Não é um problema de runtime, mas se estiver no deploy ou no git, polui o projeto.

**Correção:** Adicionar no `.gitignore`:
```
coverage/
dist/
desktop.ini
```

---

### PROBLEMA 17 — `react-helmet-async` para meta tags SEO na Public Page

**Arquivo:** `src/pages/PublicLinkPage.tsx`
**Impacto:** `react-helmet-async` altera meta tags DEPOIS que o React monta. Crawlers do Google/Facebook não executam JavaScript, então as meta tags de Open Graph nunca são vistas. O compartilhamento no WhatsApp/Instagram não mostra título nem imagem.

**Correção:** Isso requer SSR (Server-Side Rendering) ou uma Vercel Edge Function que injeta as meta tags antes do HTML chegar ao navegador. Criar um `api/og/[slug].ts` na Vercel:

```typescript
// vercel: api/og/[slug].ts
export default async function handler(req, res) {
  const { slug } = req.query;
  // buscar dados do link no Supabase
  // retornar HTML com meta tags preenchidas
}
```

E adicionar rewrite no `vercel.json` para bots:
```json
{
  "source": "/:slug",
  "has": [{ "type": "header", "key": "user-agent", "value": "(facebookexternalhit|Twitterbot|WhatsApp|LinkedInBot|Googlebot)" }],
  "destination": "/api/og/:slug"
}
```

---

### PROBLEMA 18 — `protect.ts` bloqueia F12 e Ctrl+U (anti-pattern)

**Arquivo:** `src/lib/protect.ts`
**Impacto:** Não impede ninguém tecnicamente (qualquer dev contorna), mas adiciona event listeners extras no `keydown` com `stopImmediatePropagation`, o que pode interferir com acessibilidade e performance de input.

**Recomendação:** Remover ou tornar opt-in. Proteção client-side de conteúdo é teatro de segurança.

---

### PROBLEMA 19 — Supabase client sem persistência otimizada

**Arquivo:** `src/integrations/supabase/client.ts`
**Impacto menor:** O client usa `localStorage` para persistir a session. Em dispositivos com storage lento, isso pode adicionar ~50ms na inicialização.

**Sem ação necessária agora,** mas vale monitorar.

---

## 🎯 PLANO DE AÇÃO — ORDEM DE PRIORIDADE

Execute com o Claude Code nesta ordem para máximo impacto:

| # | Ação | Arquivo(s) | Impacto |
|---|------|-----------|---------|
| 1 | Compressão de imagem no upload | `storage-utils.ts` | ⭐⭐⭐⭐⭐ |
| 2 | Cache headers na Vercel | `vercel.json` | ⭐⭐⭐⭐⭐ |
| 3 | Converter animações infinitas para CSS | `ButtonPreview.tsx`, `AnimatedButtonBlock.tsx`, `index.css` | ⭐⭐⭐⭐⭐ |
| 4 | Reduzir pesos de fontes Google | `preview-utils.ts`, `index.html` | ⭐⭐⭐⭐ |
| 5 | Lazy loading em imagens de botões | `ButtonPreview.tsx` | ⭐⭐⭐⭐ |
| 6 | Lazy loading no carousel | `CarouselBlock.tsx` | ⭐⭐⭐⭐ |
| 7 | Preconnect para Supabase | `index.html` | ⭐⭐⭐ |
| 8 | Remover AnimatePresence mode="wait" | `App.tsx` | ⭐⭐⭐ |
| 9 | Lazy import dos templates | `templates.ts` + componentes que usam | ⭐⭐⭐ |
| 10 | staleTime do usePublicLink | `use-links.ts` | ⭐⭐⭐ |
| 11 | Remover document.write do BgHtml | `BgHtmlEffect.tsx` | ⭐⭐ |
| 12 | Width/height no HeroImage (CLS) | `HeroImage.tsx` | ⭐⭐ |
| 13 | Unificar query da public page | Supabase RPC + `use-links.ts` | ⭐⭐ |
| 14 | Font loading não-bloqueante | `index.html` | ⭐⭐ |
| 15 | OG tags com Edge Function | `api/og/[slug].ts` + `vercel.json` | ⭐⭐ |
| 16 | Limpar coverage do projeto | `.gitignore` | ⭐ |

---

## 📐 METAS DE PERFORMANCE (Depois das correções)

| Métrica | Atual (estimado) | Meta |
|---------|------------------|------|
| LCP (Largest Contentful Paint) | 4-8s no celular | < 2.5s |
| FID (First Input Delay) | 200-500ms | < 100ms |
| CLS (Cumulative Layout Shift) | 0.15-0.3 | < 0.1 |
| TTI (Time to Interactive) | 5-10s | < 3.5s |
| Bundle JS total | 1.930 KB | < 1.200 KB |
| Tamanho médio de imagem | 1-5 MB | < 200 KB |

---

## 🔧 COMANDO PARA O CLAUDE CODE

Cole isso no Claude Code para aplicar as correções automaticamente:

```
Leia o arquivo AUDIT_PERFORMANCE_LINKPRO.md e aplique todas as 
correções dos problemas 1 a 12 na ordem de prioridade. Para cada 
correção, faça o mínimo de mudanças necessárias sem quebrar 
funcionalidades existentes. Teste o build após cada mudança com 
"npm run build" para garantir que não quebrou nada.
```

---

*Relatório gerado por análise completa do código-fonte, build output e configurações de deploy.*
