ALTER TABLE public.links ADD COLUMN IF NOT EXISTS canvas_mode boolean DEFAULT false;

-- Update get_user_links_with_stats to include canvas_mode
DROP FUNCTION IF EXISTS public.get_user_links_with_stats();

CREATE OR REPLACE FUNCTION public.get_user_links_with_stats()
RETURNS TABLE (
  id uuid,
  slug text,
  business_name text,
  business_name_html boolean,
  business_name_font_size integer,
  business_name_align text,
  tagline text,
  hero_image text,
  hero_image_height_px integer,
  hero_object_fit text,
  hero_focal_point jsonb,
  hero_image_opacity integer,
  hero_overlay_opacity integer,
  hero_overlay_color text,
  logo_url text,
  logo_size_px integer,
  logo_shape text,
  logo_shadow boolean,
  logo_border_color text,
  header_style text,
  banner_curve boolean,
  banner_curve_intensity integer,
  title_color text,
  tagline_color text,
  tagline_font_size integer,
  watermark_enabled boolean,
  watermark_url text,
  hide_business_name boolean,
  hide_tagline boolean,
  background_color text,
  text_color text,
  accent_color text,
  font_family text,
  title_size integer,
  entry_animation text,
  snow_effect jsonb,
  bg_effects jsonb,
  canvas_mode boolean,
  buttons jsonb,
  badges jsonb,
  floating_emojis jsonb,
  blocks jsonb,
  pages jsonb,
  is_active boolean,
  custom_domain text,
  created_at timestamptz,
  updated_at timestamptz,
  views_count bigint,
  clicks_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    l.id, l.slug,
    l.business_name,
    l.business_name_html,
    l.business_name_font_size,
    l.business_name_align,
    l.tagline,
    l.hero_image,
    l.hero_image_height_px,
    l.hero_object_fit,
    l.hero_focal_point,
    l.hero_image_opacity,
    l.hero_overlay_opacity,
    l.hero_overlay_color,
    l.logo_url,
    l.logo_size_px,
    l.logo_shape,
    l.logo_shadow,
    l.logo_border_color,
    l.header_style,
    l.banner_curve,
    l.banner_curve_intensity,
    l.title_color,
    l.tagline_color,
    l.tagline_font_size,
    l.watermark_enabled,
    l.watermark_url,
    l.hide_business_name,
    l.hide_tagline,
    l.background_color, l.text_color, l.accent_color, l.font_family,
    l.title_size, l.entry_animation, l.snow_effect,
    l.bg_effects,
    l.canvas_mode,
    l.buttons, l.badges, l.floating_emojis, l.blocks, l.pages,
    l.is_active, l.custom_domain, l.created_at, l.updated_at,
    COALESCE(v.cnt, 0) AS views_count,
    COALESCE(c.cnt, 0) AS clicks_count
  FROM public.links l
  LEFT JOIN (
    SELECT link_id, COUNT(*) AS cnt FROM public.link_views GROUP BY link_id
  ) v ON v.link_id = l.id
  LEFT JOIN (
    SELECT link_id, COUNT(*) AS cnt FROM public.link_clicks GROUP BY link_id
  ) c ON c.link_id = l.id
  WHERE l.user_id = auth.uid()
  ORDER BY l.created_at DESC;
$$;
