-- Fix C1: Rate limiting + deduplication for email_captures
-- Prevents spam attacks that could fill a user's capture list with fake entries

-- 1. Rate limit trigger: max 50 captures per link per hour
CREATE OR REPLACE FUNCTION public.check_email_capture_rate_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.email_captures
  WHERE link_id = NEW.link_id
    AND captured_at > now() - interval '1 hour';

  IF recent_count >= 50 THEN
    RAISE EXCEPTION 'Rate limit exceeded for this link';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_email_capture_rate_limit
  BEFORE INSERT ON public.email_captures
  FOR EACH ROW EXECUTE FUNCTION public.check_email_capture_rate_limit();

-- 2. Unique constraint: same email can only be captured once per link
--    Client uses upsert with ignoreDuplicates to handle this gracefully
ALTER TABLE public.email_captures
  ADD CONSTRAINT email_captures_link_email_unique UNIQUE (link_id, email);
