-- Fix storage RLS to allow uploads in subfolders (e.g. userId/avatars/file.png)
-- The first path segment must match the authenticated user's UUID

DROP POLICY IF EXISTS "Users can upload own images" ON storage.objects;
CREATE POLICY "Users can upload own images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'link-images'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
CREATE POLICY "Users can update own images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'link-images'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'link-images'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );
