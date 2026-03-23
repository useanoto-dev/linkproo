-- Fix A1: Remove auto-grant admin trigger
-- The trigger hardcodes an email in a public migration file, which is a security risk.
-- Admin role should be granted manually via Supabase Dashboard when needed.

DROP TRIGGER IF EXISTS trg_auto_grant_admin ON auth.users;
DROP FUNCTION IF EXISTS public.auto_grant_admin_on_signup();
