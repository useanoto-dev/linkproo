
-- 1. Fix RLS on link_clicks: validate link_id exists before insert
DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.link_clicks;
CREATE POLICY "Anyone can insert clicks"
  ON public.link_clicks
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.links WHERE id = link_id AND is_active = true)
  );

-- 2. Fix RLS on link_views: validate link_id exists before insert
DROP POLICY IF EXISTS "Anyone can insert views" ON public.link_views;
CREATE POLICY "Anyone can insert views"
  ON public.link_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.links WHERE id = link_id AND is_active = true)
  );

-- 3. Add unique constraint on slug if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'links_slug_key'
  ) THEN
    ALTER TABLE public.links ADD CONSTRAINT links_slug_key UNIQUE (slug);
  END IF;
END $$;

-- 4. Create function to check link count for plan enforcement
CREATE OR REPLACE FUNCTION public.check_link_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  user_plan TEXT;
  max_links INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count FROM public.links WHERE user_id = NEW.user_id;
  SELECT COALESCE(plan, 'free') INTO user_plan FROM public.profiles WHERE user_id = NEW.user_id;
  
  max_links := CASE user_plan
    WHEN 'free' THEN 3
    WHEN 'pro' THEN 50
    WHEN 'business' THEN 999
    ELSE 3
  END;
  
  IF current_count >= max_links THEN
    RAISE EXCEPTION 'Limite de links atingido para o plano %. Máximo: %', user_plan, max_links;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 5. Create trigger for link limit
DROP TRIGGER IF EXISTS check_link_limit_trigger ON public.links;
CREATE TRIGGER check_link_limit_trigger
  BEFORE INSERT ON public.links
  FOR EACH ROW
  EXECUTE FUNCTION public.check_link_limit();
