-- Migration: Create get_admin_analytics RPC
-- Replaces client-side aggregation of up to 10,000 raw rows

CREATE OR REPLACE FUNCTION public.get_admin_analytics(period_days integer)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  start_ts timestamptz := NOW() - (period_days || ' days')::interval;
BEGIN
  -- Admin-only guard (per D-02)
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Permission denied: admin role required';
  END IF;

  RETURN (
    SELECT json_build_object(
      'total_views',        (SELECT COUNT(*) FROM public.link_views  WHERE viewed_at  >= start_ts),
      'total_clicks',       (SELECT COUNT(*) FROM public.link_clicks WHERE clicked_at >= start_ts),
      'new_users',          (SELECT COUNT(*) FROM public.profiles    WHERE created_at >= start_ts),

      'views_by_day',       (
        SELECT COALESCE(json_agg(day_row ORDER BY day_row->>'date'), '[]'::json)
        FROM (
          SELECT json_build_object(
            'date',      to_char(d.day, 'YYYY-MM-DD'),
            'views',     COALESCE(v.cnt, 0),
            'clicks',    COALESCE(c.cnt, 0),
            'new_users', COALESCE(u.cnt, 0)
          ) AS day_row
          FROM (
            SELECT generate_series(
              date_trunc('day', start_ts),
              date_trunc('day', NOW()),
              '1 day'::interval
            ) AS day
          ) d
          LEFT JOIN (
            SELECT date_trunc('day', viewed_at) AS day, COUNT(*) AS cnt
            FROM public.link_views
            WHERE viewed_at >= start_ts
            GROUP BY 1
          ) v ON v.day = d.day
          LEFT JOIN (
            SELECT date_trunc('day', clicked_at) AS day, COUNT(*) AS cnt
            FROM public.link_clicks
            WHERE clicked_at >= start_ts
            GROUP BY 1
          ) c ON c.day = d.day
          LEFT JOIN (
            SELECT date_trunc('day', created_at) AS day, COUNT(*) AS cnt
            FROM public.profiles
            WHERE created_at >= start_ts
            GROUP BY 1
          ) u ON u.day = d.day
        ) sub
      ),

      'views_by_device',    (
        SELECT COALESCE(json_agg(json_build_object('device', device, 'count', cnt)), '[]'::json)
        FROM (
          SELECT COALESCE(device, 'unknown') AS device, COUNT(*) AS cnt
          FROM public.link_views
          WHERE viewed_at >= start_ts
          GROUP BY 1
          ORDER BY cnt DESC
        ) sub
      ),

      'top_links',          (
        SELECT COALESCE(json_agg(row ORDER BY (row->>'views')::int DESC), '[]'::json)
        FROM (
          SELECT json_build_object(
            'link_id',       l.id,
            'business_name', l.business_name,
            'slug',          l.slug,
            'views',         COALESCE(v.cnt, 0),
            'clicks',        COALESCE(c.cnt, 0)
          ) AS row
          FROM public.links l
          LEFT JOIN (
            SELECT link_id, COUNT(*) AS cnt
            FROM public.link_views
            WHERE viewed_at >= start_ts
            GROUP BY link_id
          ) v ON v.link_id = l.id
          LEFT JOIN (
            SELECT link_id, COUNT(*) AS cnt
            FROM public.link_clicks
            WHERE clicked_at >= start_ts
            GROUP BY link_id
          ) c ON c.link_id = l.id
          ORDER BY COALESCE(v.cnt, 0) DESC
          LIMIT 10
        ) sub
      ),

      'plans_distribution', (
        SELECT COALESCE(json_agg(json_build_object('plan', plan, 'count', cnt)), '[]'::json)
        FROM (
          SELECT COALESCE(plan, 'free') AS plan, COUNT(*) AS cnt
          FROM public.profiles
          GROUP BY 1
          ORDER BY cnt DESC
        ) sub
      )
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_analytics(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_analytics(integer) TO authenticated;
