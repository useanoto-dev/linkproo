CREATE TABLE public.email_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_block_id TEXT DEFAULT ''
);

ALTER TABLE public.email_captures ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_email_captures_link_id ON public.email_captures (link_id);
CREATE INDEX idx_email_captures_captured_at ON public.email_captures (captured_at);

-- Anyone can insert (public visitor)
CREATE POLICY "Anyone can insert email capture"
  ON public.email_captures FOR INSERT
  WITH CHECK (true);

-- Only link owner can read
CREATE POLICY "Link owner can view email captures"
  ON public.email_captures FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.links
      WHERE id = email_captures.link_id AND user_id = auth.uid()
    )
  );
