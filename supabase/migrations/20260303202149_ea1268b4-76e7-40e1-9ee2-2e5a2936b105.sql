-- Add animation settings columns to links table
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS entry_animation text DEFAULT 'fade-up';
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS snow_effect jsonb DEFAULT null;