-- Add country field to profiles for regional filtering in admin
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT;

-- Index for admin filtering by country
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);
