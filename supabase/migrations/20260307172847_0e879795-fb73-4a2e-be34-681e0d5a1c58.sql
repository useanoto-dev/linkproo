
-- Course modules
CREATE TABLE public.course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  emoji text NOT NULL DEFAULT '📚',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Course lessons
CREATE TABLE public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  duration text NOT NULL DEFAULT '0:00',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Lesson materials (downloadable files/links)
CREATE TABLE public.lesson_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid REFERENCES public.course_lessons(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- User lesson progress (track completed lessons per user)
CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid REFERENCES public.course_lessons(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Course modules: everyone authenticated can read
CREATE POLICY "Authenticated users can view modules" ON public.course_modules FOR SELECT TO authenticated USING (true);

-- Course lessons: everyone authenticated can read
CREATE POLICY "Authenticated users can view lessons" ON public.course_lessons FOR SELECT TO authenticated USING (true);

-- Lesson materials: everyone authenticated can read
CREATE POLICY "Authenticated users can view materials" ON public.lesson_materials FOR SELECT TO authenticated USING (true);

-- Lesson progress: users manage their own progress
CREATE POLICY "Users can view own progress" ON public.lesson_progress FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own progress" ON public.lesson_progress FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own progress" ON public.lesson_progress FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Admin role type and table for future use
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admin policies for course content management
CREATE POLICY "Admins can insert modules" ON public.course_modules FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update modules" ON public.course_modules FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete modules" ON public.course_modules FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert lessons" ON public.course_lessons FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update lessons" ON public.course_lessons FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete lessons" ON public.course_lessons FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert materials" ON public.lesson_materials FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update materials" ON public.lesson_materials FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete materials" ON public.lesson_materials FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS for user_roles (only admins can see roles, but we need bootstrap)
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
