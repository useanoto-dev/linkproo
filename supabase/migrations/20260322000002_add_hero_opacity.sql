-- Add hero banner opacity controls
ALTER TABLE links ADD COLUMN IF NOT EXISTS hero_image_opacity integer;
ALTER TABLE links ADD COLUMN IF NOT EXISTS hero_overlay_opacity integer;
ALTER TABLE links ADD COLUMN IF NOT EXISTS hero_overlay_color text;
