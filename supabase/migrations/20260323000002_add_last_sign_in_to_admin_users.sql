-- Add last_sign_in_at to get_admin_users RPC so admin can see recently active users

CREATE OR REPLACE FUNCTION public.get_admin_users()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  email text,
  display_name text,
  avatar_url text,
  company text,
  plan text,
  created_at timestamptz,
  last_sign_in_at timestamptz
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
    p.created_at,
    u.last_sign_in_at
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.user_id
  WHERE has_role(auth.uid(), 'admin'::app_role)
  ORDER BY u.last_sign_in_at DESC NULLS LAST;
$$;
