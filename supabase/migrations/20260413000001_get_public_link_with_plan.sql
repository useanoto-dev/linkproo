-- Retorna o link público + plano do dono em uma única chamada RPC.
-- Substitui as duas queries sequenciais em usePublicLink:
--   1. SELECT * FROM links WHERE slug = ...
--   2. get_link_owner_plan(user_id)
--
-- SECURITY DEFINER: executa como owner do DB para poder ler profiles
-- sem expor dados sensíveis — só retorna os campos do link e o plano.
-- STABLE: não modifica dados; permite cache pelo query planner.

CREATE OR REPLACE FUNCTION public.get_public_link_with_plan(p_slug TEXT)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'link',       row_to_json(l.*),
    'owner_plan', COALESCE(p.plan, 'free')
  )
  INTO result
  FROM public.links l
  LEFT JOIN public.profiles p ON p.user_id = l.user_id
  WHERE l.slug = p_slug
    AND l.is_active = true
  LIMIT 1;

  RETURN result;
END;
$$;

-- Permite chamada por qualquer role (inclusive anon — página pública)
GRANT EXECUTE ON FUNCTION public.get_public_link_with_plan(TEXT) TO anon, authenticated;
