
-- Add custom_domain column to links table
ALTER TABLE public.links ADD COLUMN custom_domain text DEFAULT NULL;

-- Add index for domain lookups
CREATE INDEX idx_links_custom_domain ON public.links(custom_domain) WHERE custom_domain IS NOT NULL;
