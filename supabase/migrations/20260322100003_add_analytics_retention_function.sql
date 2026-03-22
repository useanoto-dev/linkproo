-- M10: Função de retenção de dados de analytics (não executa automaticamente)
-- Para rodar manualmente: SELECT cleanup_old_analytics(365);
-- Para agendar: usar pg_cron ou Supabase Edge Functions

CREATE OR REPLACE FUNCTION public.cleanup_old_analytics(days_to_keep INTEGER DEFAULT 730)
RETURNS TABLE(clicks_deleted BIGINT, views_deleted BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _clicks_deleted BIGINT;
  _views_deleted BIGINT;
  _cutoff TIMESTAMPTZ;
BEGIN
  _cutoff := now() - (days_to_keep || ' days')::INTERVAL;

  DELETE FROM public.link_clicks
  WHERE clicked_at < _cutoff;
  GET DIAGNOSTICS _clicks_deleted = ROW_COUNT;

  DELETE FROM public.link_views
  WHERE viewed_at < _cutoff;
  GET DIAGNOSTICS _views_deleted = ROW_COUNT;

  RETURN QUERY SELECT _clicks_deleted, _views_deleted;
END;
$$;

-- Revoke public access — only service_role can call this
REVOKE ALL ON FUNCTION public.cleanup_old_analytics FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_old_analytics TO service_role;

COMMENT ON FUNCTION public.cleanup_old_analytics IS
  'Deleta registros de analytics mais antigos que N dias (padrão: 730 = 2 anos).
   Execute manualmente: SELECT * FROM cleanup_old_analytics(730);
   Nunca é executada automaticamente.';
