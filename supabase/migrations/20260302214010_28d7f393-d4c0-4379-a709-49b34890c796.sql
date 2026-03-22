
-- ========================================
-- 1. PROFILES TABLE
-- ========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  company TEXT DEFAULT '',
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. LINKS TABLE
-- ========================================
CREATE TABLE public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  business_name TEXT NOT NULL DEFAULT '',
  tagline TEXT DEFAULT '',
  hero_image TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  background_color TEXT DEFAULT 'from-gray-50 to-white',
  text_color TEXT DEFAULT 'text-white',
  accent_color TEXT DEFAULT '#f59e0b',
  font_family TEXT DEFAULT 'Inter',
  buttons JSONB DEFAULT '[]'::jsonb,
  badges JSONB DEFAULT '[]'::jsonb,
  floating_emojis JSONB DEFAULT '[]'::jsonb,
  blocks JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_links_slug ON public.links (slug);
CREATE INDEX idx_links_user_id ON public.links (user_id);

-- ========================================
-- 3. LINK_CLICKS TABLE (analytics)
-- ========================================
CREATE TABLE public.link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer TEXT DEFAULT '',
  country TEXT DEFAULT '',
  device TEXT DEFAULT ''
);

ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_link_clicks_link_id ON public.link_clicks (link_id);
CREATE INDEX idx_link_clicks_clicked_at ON public.link_clicks (clicked_at);

-- ========================================
-- 4. LINK_VIEWS TABLE (page views)
-- ========================================
CREATE TABLE public.link_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer TEXT DEFAULT '',
  country TEXT DEFAULT '',
  device TEXT DEFAULT ''
);

ALTER TABLE public.link_views ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_link_views_link_id ON public.link_views (link_id);
CREATE INDEX idx_link_views_viewed_at ON public.link_views (viewed_at);

-- ========================================
-- 5. SECURITY DEFINER HELPER FUNCTIONS
-- ========================================
CREATE OR REPLACE FUNCTION public.is_link_owner(_link_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.links
    WHERE id = _link_id AND user_id = auth.uid()
  );
$$;

-- ========================================
-- 6. RLS POLICIES
-- ========================================

-- PROFILES: owner only
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (user_id = auth.uid());

-- LINKS: owner for CRUD, public read by slug (via anon)
CREATE POLICY "Users can view own links"
  ON public.links FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Public can view active links"
  ON public.links FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Users can create own links"
  ON public.links FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own links"
  ON public.links FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own links"
  ON public.links FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- LINK_CLICKS: anyone can insert, only owner can read
CREATE POLICY "Anyone can insert clicks"
  ON public.link_clicks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Link owner can view clicks"
  ON public.link_clicks FOR SELECT TO authenticated
  USING (public.is_link_owner(link_id));

-- LINK_VIEWS: anyone can insert, only owner can read
CREATE POLICY "Anyone can insert views"
  ON public.link_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Link owner can view views"
  ON public.link_views FOR SELECT TO authenticated
  USING (public.is_link_owner(link_id));

-- ========================================
-- 7. UPDATED_AT TRIGGER
-- ========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========================================
-- 8. AUTO-CREATE PROFILE ON SIGNUP
-- ========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
