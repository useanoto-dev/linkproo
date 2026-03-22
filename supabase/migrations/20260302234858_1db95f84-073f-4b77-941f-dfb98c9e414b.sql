-- Drop the restrictive SELECT policies and recreate as permissive
DROP POLICY IF EXISTS "Public can view active links" ON public.links;
DROP POLICY IF EXISTS "Users can view own links" ON public.links;
DROP POLICY IF EXISTS "Users can create own links" ON public.links;
DROP POLICY IF EXISTS "Users can update own links" ON public.links;
DROP POLICY IF EXISTS "Users can delete own links" ON public.links;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Public can view active links"
ON public.links FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can view own links"
ON public.links FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create own links"
ON public.links FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own links"
ON public.links FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own links"
ON public.links FOR DELETE
TO authenticated
USING (user_id = auth.uid());