-- A7: CHECK constraint no banco para slugs reservados
-- (complementa a validação client-side em slug-utils.ts)

ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_slug_not_reserved;

ALTER TABLE public.links
ADD CONSTRAINT links_slug_not_reserved
CHECK (
  slug NOT IN (
    'admin', 'auth', 'api', 'dashboard', 'links', 'settings',
    'analytics', 'plans', 'suporte', 'support', 'reset-password',
    'login', 'signup', 'register', 'logout', 'profile', 'billing',
    'pricing', 'help', 'docs', 'blog', 'about', 'contact',
    'terms', 'privacy', 'status', 'app', 'www', 'mail', 'ftp',
    'static', 'assets', 'public', 'favicon', 'robots', 'sitemap'
  )
);

COMMENT ON CONSTRAINT links_slug_not_reserved ON public.links IS
  'Impede slugs que colidem com rotas do sistema. Validação também existe no client-side (slug-utils.ts).';
