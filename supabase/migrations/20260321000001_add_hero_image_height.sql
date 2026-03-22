-- Add hero_image_height column to links table
-- Values: 'sm' | 'md' | 'lg' | 'xl' | 'auto' | NULL (defaults to 'md' in frontend)
ALTER TABLE public.links
  ADD COLUMN IF NOT EXISTS hero_image_height TEXT DEFAULT NULL;
