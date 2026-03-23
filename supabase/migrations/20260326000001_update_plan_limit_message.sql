-- Update plan limit trigger function with correct PT-BR message (per D-06, D-07)
-- The trigger check_link_limit_trigger already exists — only replacing the function body.
-- Changes: business=9999, admin=9999, message updated to "Faca upgrade para criar mais links"

CREATE OR REPLACE FUNCTION public.check_link_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  user_plan     TEXT;
  max_links     INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count
    FROM public.links WHERE user_id = NEW.user_id;

  SELECT COALESCE(plan, 'free') INTO user_plan
    FROM public.profiles WHERE user_id = NEW.user_id;

  max_links := CASE user_plan
    WHEN 'free'     THEN 3
    WHEN 'pro'      THEN 50
    WHEN 'business' THEN 9999
    WHEN 'admin'    THEN 9999
    ELSE 3
  END;

  IF current_count >= max_links THEN
    RAISE EXCEPTION 'Limite de links atingido para o plano %. Faca upgrade para criar mais links.', user_plan;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.check_link_limit() IS
  'Enforces plan-based link limits atomically via BEFORE INSERT trigger. Limits: free=3, pro=50, business/admin=9999.';
