-- ─────────────────────────────────────────────────────────────────
-- Bootstrap admin account for felipedublin@gmail.com
-- This migration runs in two modes:
--   1. If the user already exists in auth.users → inserts role immediately
--   2. If the user signs up later → trigger auto-grants the role
-- ─────────────────────────────────────────────────────────────────

-- Grant admin to existing account (no-op if user doesn't exist yet)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'felipedublin@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- ─── Auto-grant trigger ────────────────────────────────────────────
-- Ensures that even if the account is created after this migration,
-- the admin role is granted automatically on first signup.

CREATE OR REPLACE FUNCTION public.auto_grant_admin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'felipedublin@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users (fires after every new signup)
DROP TRIGGER IF EXISTS trg_auto_grant_admin ON auth.users;
CREATE TRIGGER trg_auto_grant_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_grant_admin_on_signup();
