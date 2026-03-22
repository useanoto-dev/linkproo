ALTER TABLE public.links
  ADD COLUMN IF NOT EXISTS hide_business_name BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS hide_tagline BOOLEAN DEFAULT false;
