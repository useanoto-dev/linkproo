-- Add business_name_align column to control text alignment of the business name/title
ALTER TABLE links ADD COLUMN IF NOT EXISTS business_name_align TEXT DEFAULT 'center';
