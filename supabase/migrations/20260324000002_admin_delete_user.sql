-- RPC para admin deletar um usuário
-- SECURITY DEFINER: roda como postgres (superuser) para acessar auth.users

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

  -- Deleta da tabela de auth — cascata apaga profiles, links, fingerprints, etc.
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

-- Garante que apenas usuários autenticados podem chamar a função
REVOKE ALL ON FUNCTION public.admin_delete_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;
