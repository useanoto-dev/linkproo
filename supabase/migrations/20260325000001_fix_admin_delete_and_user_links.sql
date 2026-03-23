-- ─────────────────────────────────────────────────────────────────
-- 1. Corrige admin_delete_user
--    Apaga explicitamente todas as tabelas públicas antes de tentar
--    remover o registro de auth.users, o que é mais seguro em
--    ambientes Supabase cloud onde a permissão em auth.users varia.
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Somente admin pode executar
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Permission denied: admin role required';
  END IF;

  -- Impede auto-delete do próprio admin
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account via admin panel';
  END IF;

  -- Apaga dados públicos explicitamente (cascata nas FK já cuida dos filhos)
  DELETE FROM public.device_fingerprints WHERE user_id = target_user_id;
  DELETE FROM public.lesson_progress     WHERE user_id = target_user_id;
  DELETE FROM public.user_roles          WHERE user_id = target_user_id;
  DELETE FROM public.links               WHERE user_id = target_user_id;
  DELETE FROM public.profiles            WHERE user_id = target_user_id;

  -- Remove o usuário do auth (requer postgres/service_role)
  -- Em Supabase cloud o postgres possui SUPERUSER e pode acessar auth.users
  DELETE FROM auth.users WHERE id = target_user_id;

EXCEPTION
  WHEN insufficient_privilege THEN
    -- Se a plataforma restringir acesso direto a auth.users,
    -- os dados públicos já foram removidos — lança erro informativo
    RAISE EXCEPTION 'Dados do usuário removidos, mas a conta de autenticação precisa ser excluída manualmente no painel do Supabase (auth.users — insufficient_privilege).';
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;


-- ─────────────────────────────────────────────────────────────────
-- 2. Atualiza get_admin_users para incluir contagem de links
-- ─────────────────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS public.get_admin_users();

CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE(
  id                    uuid,
  user_id               uuid,
  email                 text,
  display_name          text,
  avatar_url            text,
  company               text,
  plan                  text,
  created_at            timestamptz,
  last_sign_in_at       timestamptz,
  duplicate_device_count integer,
  link_count            integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.user_id,
    COALESCE(u.email, '')   AS email,
    p.display_name,
    p.avatar_url,
    p.company,
    p.plan,
    p.created_at,
    u.last_sign_in_at,

    COALESCE((
      SELECT COUNT(DISTINCT df2.user_id)::integer
      FROM public.device_fingerprints df1
      JOIN public.device_fingerprints df2
        ON df1.fingerprint = df2.fingerprint
       AND df2.user_id <> p.user_id
      WHERE df1.user_id = p.user_id
    ), 0) AS duplicate_device_count,

    COALESCE((
      SELECT COUNT(*)::integer
      FROM public.links l
      WHERE l.user_id = p.user_id
    ), 0) AS link_count

  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.user_id
  WHERE has_role(auth.uid(), 'admin'::app_role)
  ORDER BY u.last_sign_in_at DESC NULLS LAST;
$$;


-- ─────────────────────────────────────────────────────────────────
-- 3. Nova função: retorna links de um usuário específico (admin)
-- ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_user_links_admin(_user_id uuid)
RETURNS TABLE(
  id           uuid,
  slug         text,
  business_name text,
  is_active    boolean,
  created_at   timestamptz,
  button_count integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    l.id,
    l.slug,
    l.business_name,
    l.is_active,
    l.created_at,
    COALESCE(jsonb_array_length(l.buttons), 0)::integer AS button_count
  FROM public.links l
  WHERE l.user_id = _user_id
    AND has_role(auth.uid(), 'admin'::app_role)
  ORDER BY l.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_links_admin(uuid) TO authenticated;
