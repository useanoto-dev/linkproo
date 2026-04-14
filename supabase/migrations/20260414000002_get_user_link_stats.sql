-- Single-query RPC that replaces 3 separate round-trips in useLinkStats.
-- Returns aggregated stats for the authenticated user's links.
CREATE OR REPLACE FUNCTION get_user_link_stats()
RETURNS TABLE (
  total_views  BIGINT,
  total_clicks BIGINT,
  total_links  BIGINT,
  active_links BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(v.cnt), 0)::BIGINT                            AS total_views,
    COALESCE(SUM(c.cnt), 0)::BIGINT                            AS total_clicks,
    COUNT(l.id)::BIGINT                                        AS total_links,
    COUNT(l.id) FILTER (WHERE l.is_active = true)::BIGINT      AS active_links
  FROM links l
  LEFT JOIN (
    SELECT link_id, COUNT(*) AS cnt FROM link_views GROUP BY link_id
  ) v ON v.link_id = l.id
  LEFT JOIN (
    SELECT link_id, COUNT(*) AS cnt FROM link_clicks GROUP BY link_id
  ) c ON c.link_id = l.id
  WHERE l.user_id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION get_user_link_stats() TO authenticated;
