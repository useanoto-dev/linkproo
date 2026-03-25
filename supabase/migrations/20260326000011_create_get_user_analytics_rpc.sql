-- Migration: Create get_user_analytics RPC
-- Replaces client-side aggregation of up to 5,000 raw rows
-- Includes referrer_top5 to keep "Origens de Trafego" section functional

CREATE OR REPLACE FUNCTION public.get_user_analytics(user_uuid uuid, period_days integer)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  start_ts timestamptz := NOW() - (period_days || ' days')::interval;
BEGIN
  -- Security: user can only access their own data (per D-05)
  IF auth.uid() <> user_uuid THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  RETURN (
    SELECT json_build_object(
      'total_views',      (
        SELECT COUNT(*)
        FROM public.link_views lv
        JOIN public.links l ON l.id = lv.link_id
        WHERE l.user_id = user_uuid
          AND lv.viewed_at >= start_ts
      ),
      'total_clicks',     (
        SELECT COUNT(*)
        FROM public.link_clicks lc
        JOIN public.links l ON l.id = lc.link_id
        WHERE l.user_id = user_uuid
          AND lc.clicked_at >= start_ts
      ),

      'views_by_day',     (
        SELECT COALESCE(json_agg(day_row ORDER BY day_row->>'date'), '[]'::json)
        FROM (
          SELECT json_build_object(
            'date',   to_char(d.day, 'YYYY-MM-DD'),
            'views',  COALESCE(v.cnt, 0),
            'clicks', COALESCE(c.cnt, 0)
          ) AS day_row
          FROM (
            SELECT generate_series(
              date_trunc('day', start_ts),
              date_trunc('day', NOW()),
              '1 day'::interval
            ) AS day
          ) d
          LEFT JOIN (
            SELECT date_trunc('day', lv.viewed_at) AS day, COUNT(*) AS cnt
            FROM public.link_views lv
            JOIN public.links l ON l.id = lv.link_id
            WHERE l.user_id = user_uuid
              AND lv.viewed_at >= start_ts
            GROUP BY 1
          ) v ON v.day = d.day
          LEFT JOIN (
            SELECT date_trunc('day', lc.clicked_at) AS day, COUNT(*) AS cnt
            FROM public.link_clicks lc
            JOIN public.links l ON l.id = lc.link_id
            WHERE l.user_id = user_uuid
              AND lc.clicked_at >= start_ts
            GROUP BY 1
          ) c ON c.day = d.day
        ) sub
      ),

      'views_by_device',  (
        SELECT COALESCE(json_agg(json_build_object('device', device, 'count', cnt)), '[]'::json)
        FROM (
          SELECT COALESCE(lv.device, 'unknown') AS device, COUNT(*) AS cnt
          FROM public.link_views lv
          JOIN public.links l ON l.id = lv.link_id
          WHERE l.user_id = user_uuid
            AND lv.viewed_at >= start_ts
          GROUP BY 1
          ORDER BY cnt DESC
        ) sub
      ),

      'clicks_by_button', (
        SELECT COALESCE(json_agg(json_build_object('button_id', button_id, 'count', cnt)), '[]'::json)
        FROM (
          SELECT lc.button_id, COUNT(*) AS cnt
          FROM public.link_clicks lc
          JOIN public.links l ON l.id = lc.link_id
          WHERE l.user_id = user_uuid
            AND lc.clicked_at >= start_ts
            AND lc.button_id IS NOT NULL
          GROUP BY lc.button_id
          ORDER BY cnt DESC
          LIMIT 10
        ) sub
      ),

      'views_by_link',    (
        SELECT COALESCE(json_agg(json_build_object(
          'link_id',       l.id,
          'slug',          l.slug,
          'business_name', l.business_name,
          'views',         COALESCE(v.cnt, 0)
        ) ORDER BY COALESCE(v.cnt, 0) DESC), '[]'::json)
        FROM public.links l
        LEFT JOIN (
          SELECT link_id, COUNT(*) AS cnt
          FROM public.link_views
          WHERE viewed_at >= start_ts
          GROUP BY link_id
        ) v ON v.link_id = l.id
        WHERE l.user_id = user_uuid
      ),

      'referrer_top5',    (
        SELECT COALESCE(json_agg(json_build_object('referrer', ref, 'count', cnt)), '[]'::json)
        FROM (
          SELECT
            CASE
              WHEN lv.referrer IS NULL OR lv.referrer = '' THEN 'Direto'
              ELSE lv.referrer
            END AS ref,
            COUNT(*) AS cnt
          FROM public.link_views lv
          JOIN public.links l ON l.id = lv.link_id
          WHERE l.user_id = user_uuid
            AND lv.viewed_at >= start_ts
          GROUP BY ref
          ORDER BY cnt DESC
          LIMIT 5
        ) sub
      )
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_analytics(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_analytics(uuid, integer) TO authenticated;
