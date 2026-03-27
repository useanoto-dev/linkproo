-- Add bio-style header fields to links table
-- header_style: 'classic' (default) or 'bio' (avatar overlaps banner)
-- banner_curve: optional SVG wave at banner bottom in bio mode
-- logo_border_color: avatar ring color in bio mode

ALTER TABLE public.links
  ADD COLUMN IF NOT EXISTS header_style   text    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS banner_curve   boolean DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS logo_border_color text  DEFAULT NULL;

COMMENT ON COLUMN public.links.header_style IS
  'Header layout: NULL/''classic'' = logo inside content area; ''bio'' = avatar overlaps banner bottom (bio.site style)';

COMMENT ON COLUMN public.links.banner_curve IS
  'In bio mode: render SVG wave curve at banner bottom edge';

COMMENT ON COLUMN public.links.logo_border_color IS
  'In bio mode: hex color of the avatar ring/border (default #ffffff)';
