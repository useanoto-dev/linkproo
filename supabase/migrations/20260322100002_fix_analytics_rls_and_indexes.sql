-- A3: Corrigir RLS de analytics - validar que link_id pertence a link ativo
-- A4: Adicionar índices compostos para queries de analytics

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.link_clicks;
DROP POLICY IF EXISTS "Anyone can insert views" ON public.link_views;

-- Re-create with validation that link exists and is active
CREATE POLICY "Anyone can insert clicks" ON public.link_clicks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.links
      WHERE id = link_clicks.link_id
      AND is_active = true
    )
  );

CREATE POLICY "Anyone can insert views" ON public.link_views
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.links
      WHERE id = link_views.link_id
      AND is_active = true
    )
  );

-- A4: Composite indexes for common analytics queries
-- "clicks for a link ordered by time" — most common analytics query
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_clicked
  ON public.link_clicks (link_id, clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_link_views_link_viewed
  ON public.link_views (link_id, viewed_at DESC);

-- Index for device/country filtering
CREATE INDEX IF NOT EXISTS idx_link_clicks_device
  ON public.link_clicks (device) WHERE device != '';

CREATE INDEX IF NOT EXISTS idx_link_views_device
  ON public.link_views (device) WHERE device != '';
