# Link PRO

Plataforma de links inteligentes construída com React + Vite + Supabase.

## Getting Started

```bash
npm install
npm run dev
npm run build
```

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Supabase (banco, auth, storage, RLS)
- Vercel (deploy)

---

## Rate Limiting — Estratégia Adotada

Como o projeto usa **Vite** (não Next.js), a Vercel não suporta middleware
nativo com lógica de rate limiting. As três opções abaixo estão documentadas;
a que está **ativa** é indicada com ✅.

---

### ✅ Opção A — Vercel Headers (ativo no vercel.json)

Adicionados em `vercel.json` para todas as rotas (`/(.*)`):

| Header | Valor | Objetivo |
|---|---|---|
| `X-Robots-Tag` | `noarchive` | Impede que crawlers cacheiem as páginas públicas |
| `X-Content-Type-Options` | `nosniff` | Bloqueia MIME-type sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Previne clickjacking em iframes de terceiros |

> Limitação: headers não bloqueiam abuso de volume (DDoS/scraping).
> Para isso, combine com as opções B ou C abaixo.

---

### ⚙️ Opção B — Rate Limiting no Supabase (configuração manual)

O Supabase permite limitar requisições por IP direto no Dashboard, sem
nenhum código adicional.

**Caminho:** Supabase Dashboard → Project → Settings → API → Rate Limiting

Valores recomendados:

| Tipo de requisição | Limite sugerido |
|---|---|
| Anonymous (visitantes de links públicos) | 100 req/min por IP |
| Authenticated (usuários logados) | 300 req/min por IP |

> Afeta todas as chamadas ao PostgREST/RPC, incluindo
> `get_public_link_with_plan` e os inserts de analytics.

---

### ⚙️ Opção C — Cloudflare como proxy (recomendado para produção)

Coloque o domínio no Cloudflare (plano gratuito já cobre o essencial):

1. **Rate Limiting Rule** (Security → WAF → Rate Limiting):
   - Expressão: `http.request.uri.path matches "^/[^/]+$"` (rotas públicas)
   - Limite: 50 requisições / 10 segundos por IP
   - Ação: `Block` ou `Challenge`

2. **Bot Fight Mode** (Security → Bots):
   - Ative o "Bot Fight Mode" (gratuito)
   - Opcionalmente ative "Super Bot Fight Mode" (plano Pro)

3. **Cache** (Caching → Configuration):
   - Browser Cache TTL: 4 horas
   - Isso reduz a carga de requisições repetidas

> Com Cloudflare na frente, o rate limiting é resolvido na borda antes
> de qualquer requisição chegar ao Supabase ou à Vercel.
