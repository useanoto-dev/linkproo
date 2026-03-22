
-- RPC to get admin user list with emails from auth.users
CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  email text,
  display_name text,
  avatar_url text,
  company text,
  plan text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.user_id,
    COALESCE(u.email, '') AS email,
    p.display_name,
    p.avatar_url,
    p.company,
    p.plan,
    p.created_at
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.user_id
  WHERE has_role(auth.uid(), 'admin'::app_role)
  ORDER BY p.created_at DESC;
$$;

-- Fix RLS: Convert all RESTRICTIVE policies to PERMISSIVE on course tables
-- course_lessons
DROP POLICY IF EXISTS "Authenticated users can view lessons" ON public.course_lessons;
CREATE POLICY "Authenticated users can view lessons" ON public.course_lessons FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert lessons" ON public.course_lessons;
CREATE POLICY "Admins can insert lessons" ON public.course_lessons FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update lessons" ON public.course_lessons;
CREATE POLICY "Admins can update lessons" ON public.course_lessons FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete lessons" ON public.course_lessons;
CREATE POLICY "Admins can delete lessons" ON public.course_lessons FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- course_modules
DROP POLICY IF EXISTS "Authenticated users can view modules" ON public.course_modules;
CREATE POLICY "Authenticated users can view modules" ON public.course_modules FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert modules" ON public.course_modules;
CREATE POLICY "Admins can insert modules" ON public.course_modules FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update modules" ON public.course_modules;
CREATE POLICY "Admins can update modules" ON public.course_modules FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete modules" ON public.course_modules;
CREATE POLICY "Admins can delete modules" ON public.course_modules FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- lesson_materials
DROP POLICY IF EXISTS "Authenticated users can view materials" ON public.lesson_materials;
CREATE POLICY "Authenticated users can view materials" ON public.lesson_materials FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert materials" ON public.lesson_materials;
CREATE POLICY "Admins can insert materials" ON public.lesson_materials FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update materials" ON public.lesson_materials;
CREATE POLICY "Admins can update materials" ON public.lesson_materials FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete materials" ON public.lesson_materials;
CREATE POLICY "Admins can delete materials" ON public.lesson_materials FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- lesson_progress
DROP POLICY IF EXISTS "Users can view own progress" ON public.lesson_progress;
CREATE POLICY "Users can view own progress" ON public.lesson_progress FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own progress" ON public.lesson_progress;
CREATE POLICY "Users can insert own progress" ON public.lesson_progress FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own progress" ON public.lesson_progress;
CREATE POLICY "Users can delete own progress" ON public.lesson_progress FOR DELETE TO authenticated USING (user_id = auth.uid());

-- support_faqs
DROP POLICY IF EXISTS "Anyone can view FAQs" ON public.support_faqs;
CREATE POLICY "Anyone can view FAQs" ON public.support_faqs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert FAQs" ON public.support_faqs;
CREATE POLICY "Admins can insert FAQs" ON public.support_faqs FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update FAQs" ON public.support_faqs;
CREATE POLICY "Admins can update FAQs" ON public.support_faqs FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete FAQs" ON public.support_faqs;
CREATE POLICY "Admins can delete FAQs" ON public.support_faqs FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- support_contacts
DROP POLICY IF EXISTS "Anyone can view contacts" ON public.support_contacts;
CREATE POLICY "Anyone can view contacts" ON public.support_contacts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert contacts" ON public.support_contacts;
CREATE POLICY "Admins can insert contacts" ON public.support_contacts FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update contacts" ON public.support_contacts;
CREATE POLICY "Admins can update contacts" ON public.support_contacts FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete contacts" ON public.support_contacts;
CREATE POLICY "Admins can delete contacts" ON public.support_contacts FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
