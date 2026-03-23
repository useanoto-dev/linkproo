-- Add slug format validation at DB level (per D-11)
-- Validates: (a) regex ^[a-z0-9]+(-[a-z0-9]+)*$ (b) length 3-50 chars
-- Mirrors client-side validateSlug() in src/lib/slug-utils.ts

DO $$ BEGIN
  -- Safety check: abort if invalid slugs exist in the table
  IF EXISTS (
    SELECT 1 FROM public.links
    WHERE slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
       OR length(slug) < 3
       OR length(slug) > 50
  ) THEN
    RAISE NOTICE 'WARNING: Found slugs that do not match format constraint. Skipping constraint creation.';
    RETURN;
  END IF;

  -- Drop if exists (idempotent)
  ALTER TABLE public.links DROP CONSTRAINT IF EXISTS links_slug_valid_format;

  -- Add format + length constraint
  ALTER TABLE public.links
  ADD CONSTRAINT links_slug_valid_format
  CHECK (
    length(slug) >= 3
    AND length(slug) <= 50
    AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  );
END $$;

COMMENT ON CONSTRAINT links_slug_valid_format ON public.links IS
  'Validates slug format: lowercase alphanumeric with hyphens, 3-50 chars. Mirrors client-side validateSlug() in slug-utils.ts.';
