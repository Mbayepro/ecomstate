-- ============================================================================
-- ECOMSATE — BUCKET SUPABASE STORAGE POUR PHOTOS PRODUITS, LOGOS & BANNIÈRES
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-assets',
  'store-assets',
  true,
  5242880, -- 5 Mo max par image
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "store_assets_public_read" ON storage.objects;
CREATE POLICY "store_assets_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'store-assets');

DROP POLICY IF EXISTS "store_assets_upload" ON storage.objects;
CREATE POLICY "store_assets_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'store-assets');

DROP POLICY IF EXISTS "store_assets_update" ON storage.objects;
CREATE POLICY "store_assets_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'store-assets');
