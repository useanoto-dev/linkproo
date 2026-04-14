-- Função que retorna o limite de links para um plano
CREATE OR REPLACE FUNCTION get_plan_link_limit(p_plan TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE p_plan
    WHEN 'business' THEN 999999
    WHEN 'pro' THEN 50
    ELSE 3 -- free
  END;
END;
$$;

-- Recria a policy de INSERT em links combinando a restrição de ownership
-- já existente (user_id = auth.uid()) com o novo limite do plano.
-- A policy anterior "Users can create own links" tinha apenas WITH CHECK (user_id = auth.uid()).
DROP POLICY IF EXISTS "Users can create own links" ON public.links;

CREATE POLICY "Users can create own links"
  ON public.links
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND
    (SELECT COUNT(*) FROM links WHERE user_id = auth.uid())
    <
    get_plan_link_limit(
      COALESCE(
        (SELECT plan FROM profiles WHERE user_id = auth.uid()),
        'free'
      )
    )
  );
