
-- Create public storage bucket for link images
INSERT INTO storage.buckets (id, name, public) VALUES ('link-images', 'link-images', true);

-- Anyone can view images (public bucket)
CREATE POLICY "Public can view link images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'link-images');

-- Authenticated users can upload to their own folder
CREATE POLICY "Users can upload link images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'link-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can update their own images
CREATE POLICY "Users can update own link images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'link-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own images
CREATE POLICY "Users can delete own link images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'link-images' AND auth.uid()::text = (storage.foldername(name))[1]);
