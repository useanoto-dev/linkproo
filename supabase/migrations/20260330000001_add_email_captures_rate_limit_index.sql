-- Migration: add composite index on email_captures for rate limit trigger performance
--
-- The rate limit trigger on email_captures executes:
--   SELECT COUNT(*) FROM public.email_captures
--   WHERE link_id = NEW.link_id AND captured_at > now() - interval '1 hour';
--
-- Without this index, Postgres uses the existing single-column idx on link_id and then
-- filters the resulting rows by captured_at with a seq scan on that subset.
-- The composite index (link_id, captured_at DESC) allows the planner to satisfy both
-- predicates with a single index range scan, avoiding the extra filter pass.

CREATE INDEX IF NOT EXISTS idx_email_captures_link_captured
  ON public.email_captures (link_id, captured_at DESC);
