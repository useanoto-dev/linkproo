-- Atualiza get_admin_users para incluir:
--   duplicate_device_count: quantas outras contas compartilham o mesmo dispositivo
--   device_fingerprints: array dos fingerprints do usuário (para debug)

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
  duplicate_device_count integer
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

    -- Conta quantas OUTRAS contas distintas compartilham qualquer fingerprint com este usuário
    COALESCE((
      SELECT COUNT(DISTINCT df2.user_id)::integer
      FROM public.device_fingerprints df1
      JOIN public.device_fingerprints df2
        ON df1.fingerprint = df2.fingerprint
       AND df2.user_id <> p.user_id
      WHERE df1.user_id = p.user_id
    ), 0) AS duplicate_device_count

  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.user_id
  WHERE has_role(auth.uid(), 'admin'::app_role)
  ORDER BY u.last_sign_in_at DESC NULLS LAST;
$$;
