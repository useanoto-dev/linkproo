
-- ============================================================
-- PHASE 1: Fix all RLS policies to PERMISSIVE (OR logic)
-- ============================================================

-- ── LINKS TABLE ──
DROP POLICY IF EXISTS "Public can view active links" ON public.links;
DROP POLICY IF EXISTS "Users can view own links" ON public.links;
DROP POLICY IF EXISTS "Users can create own links" ON public.links;
DROP POLICY IF EXISTS "Users can update own links" ON public.links;
DROP POLICY IF EXISTS "Users can delete own links" ON public.links;
DROP POLICY IF EXISTS "Admins can view all links" ON public.links;

CREATE POLICY "Public can view active links" ON public.links FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view own links" ON public.links FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own links" ON public.links FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own links" ON public.links FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own links" ON public.links FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Admins can view all links" ON public.links FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ── PROFILES TABLE ──
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE USING (user_id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- ── LINK_VIEWS TABLE ──
DROP POLICY IF EXISTS "Link owner can view views" ON public.link_views;
DROP POLICY IF EXISTS "Anyone can insert views" ON public.link_views;

CREATE POLICY "Link owner can view views" ON public.link_views FOR SELECT USING (public.is_link_owner(link_id));
CREATE POLICY "Anyone can insert views" ON public.link_views FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.links WHERE id = link_views.link_id AND is_active = true));
CREATE POLICY "Admins can view all views" ON public.link_views FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ── LINK_CLICKS TABLE ──
DROP POLICY IF EXISTS "Link owner can view clicks" ON public.link_clicks;
DROP POLICY IF EXISTS "Anyone can insert clicks" ON public.link_clicks;

CREATE POLICY "Link owner can view clicks" ON public.link_clicks FOR SELECT USING (public.is_link_owner(link_id));
CREATE POLICY "Anyone can insert clicks" ON public.link_clicks FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.links WHERE id = link_clicks.link_id AND is_active = true));
CREATE POLICY "Admins can view all clicks" ON public.link_clicks FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ── USER_ROLES TABLE ──
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid());

-- ── COURSE MODULES ──
DROP POLICY IF EXISTS "Authenticated users can view modules" ON public.course_modules;
DROP POLICY IF EXISTS "Admins can insert modules" ON public.course_modules;
DROP POLICY IF EXISTS "Admins can update modules" ON public.course_modules;
DROP POLICY IF EXISTS "Admins can delete modules" ON public.course_modules;

CREATE POLICY "Authenticated users can view modules" ON public.course_modules FOR SELECT USING (true);
CREATE POLICY "Admins can insert modules" ON public.course_modules FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update modules" ON public.course_modules FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete modules" ON public.course_modules FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- ── COURSE LESSONS ──
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON public.course_lessons;
DROP POLICY IF EXISTS "Admins can insert lessons" ON public.course_lessons;
DROP POLICY IF EXISTS "Admins can update lessons" ON public.course_lessons;
DROP POLICY IF EXISTS "Admins can delete lessons" ON public.course_lessons;

CREATE POLICY "Authenticated users can view lessons" ON public.course_lessons FOR SELECT USING (true);
CREATE POLICY "Admins can insert lessons" ON public.course_lessons FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update lessons" ON public.course_lessons FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete lessons" ON public.course_lessons FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- ── LESSON MATERIALS ──
DROP POLICY IF EXISTS "Authenticated users can view materials" ON public.lesson_materials;
DROP POLICY IF EXISTS "Admins can insert materials" ON public.lesson_materials;
DROP POLICY IF EXISTS "Admins can update materials" ON public.lesson_materials;
DROP POLICY IF EXISTS "Admins can delete materials" ON public.lesson_materials;

CREATE POLICY "Authenticated users can view materials" ON public.lesson_materials FOR SELECT USING (true);
CREATE POLICY "Admins can insert materials" ON public.lesson_materials FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update materials" ON public.lesson_materials FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete materials" ON public.lesson_materials FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- ── LESSON PROGRESS ──
DROP POLICY IF EXISTS "Users can view own progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON public.lesson_progress;

CREATE POLICY "Users can view own progress" ON public.lesson_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own progress" ON public.lesson_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own progress" ON public.lesson_progress FOR DELETE USING (user_id = auth.uid());

-- ── SUPPORT FAQS ──
DROP POLICY IF EXISTS "Anyone can view FAQs" ON public.support_faqs;
DROP POLICY IF EXISTS "Admins can insert FAQs" ON public.support_faqs;
DROP POLICY IF EXISTS "Admins can update FAQs" ON public.support_faqs;
DROP POLICY IF EXISTS "Admins can delete FAQs" ON public.support_faqs;

CREATE POLICY "Anyone can view FAQs" ON public.support_faqs FOR SELECT USING (true);
CREATE POLICY "Admins can insert FAQs" ON public.support_faqs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update FAQs" ON public.support_faqs FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete FAQs" ON public.support_faqs FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- ── SUPPORT CONTACTS ──
DROP POLICY IF EXISTS "Anyone can view contacts" ON public.support_contacts;
DROP POLICY IF EXISTS "Admins can insert contacts" ON public.support_contacts;
DROP POLICY IF EXISTS "Admins can update contacts" ON public.support_contacts;
DROP POLICY IF EXISTS "Admins can delete contacts" ON public.support_contacts;

CREATE POLICY "Anyone can view contacts" ON public.support_contacts FOR SELECT USING (true);
CREATE POLICY "Admins can insert contacts" ON public.support_contacts FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update contacts" ON public.support_contacts FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete contacts" ON public.support_contacts FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- PHASE 2: Create RPC for links with aggregated counts
-- Eliminates N+1 queries
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_links_with_stats()
RETURNS TABLE (
  id uuid,
  slug text,
  business_name text,
  tagline text,
  hero_image text,
  logo_url text,
  background_color text,
  text_color text,
  accent_color text,
  font_family text,
  title_size integer,
  entry_animation text,
  snow_effect jsonb,
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
    l.id, l.slug, l.business_name, l.tagline, l.hero_image, l.logo_url,
    l.background_color, l.text_color, l.accent_color, l.font_family,
    l.title_size, l.entry_animation, l.snow_effect,
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
