-- Add bg_effects column to store all new background effects as JSONB
ALTER TABLE links ADD COLUMN IF NOT EXISTS bg_effects JSONB DEFAULT NULL;
