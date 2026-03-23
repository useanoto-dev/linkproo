-- Retorna o plano do dono de um link para ser usado na página pública.
-- SECURITY DEFINER: executa como dono do DB, contornando RLS de profiles.
-- Só expõe o campo "plan" — nenhum dado sensível.
CREATE OR REPLACE FUNCTION public.get_link_owner_plan(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(plan, 'free')
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1;
$$;

-- Permite chamada por qualquer role (inclusive anon)
GRANT EXECUTE ON FUNCTION public.get_link_owner_plan(UUID) TO anon, authenticated;
