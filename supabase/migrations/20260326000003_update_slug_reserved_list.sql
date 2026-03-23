-- Update reserved slugs list to match client-side RESERVED_SLUGS in slug-utils.ts (per D-12)
-- Adding missing entries: smtp, pop, imap, null, undefined, true, false
-- Previous migration (20260322100005) had 31 slugs; this brings total to 38

ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_slug_not_reserved;

ALTER TABLE public.links
ADD CONSTRAINT links_slug_not_reserved
CHECK (
  slug NOT IN (
    -- Rotas do sistema
    'admin', 'auth', 'api', 'dashboard', 'links', 'settings',
    'analytics', 'plans', 'suporte', 'support', 'reset-password',
    'login', 'signup', 'register', 'logout', 'profile', 'billing',
    'pricing', 'help', 'docs', 'blog', 'about', 'contact',
    'terms', 'privacy', 'status',
    -- Domínios/subdomínios comuns
    'app', 'www', 'mail', 'ftp', 'smtp', 'pop', 'imap',
    -- Arquivos estáticos
    'static', 'assets', 'public', 'favicon', 'robots', 'sitemap',
    -- Palavras reservadas web
    'null', 'undefined', 'true', 'false'
  )
);

COMMENT ON CONSTRAINT links_slug_not_reserved ON public.links IS
  'Prevents system-reserved slugs from being used. List synchronized with RESERVED_SLUGS in src/lib/slug-utils.ts.';
