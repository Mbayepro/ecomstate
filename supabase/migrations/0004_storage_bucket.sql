-- ============================================================================
-- ECOMSATE — BUCKET SUPABASE STORAGE & SYNCHRONISATION MULTI-APPAREILS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-assets',
  'store-assets',
  true,
  5242880, -- 5 Mo max par image
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/json']
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

-- Table de synchronisation temps réel multi-appareils (Téléphones & PC)
CREATE TABLE IF NOT EXISTS public.platform_cloud_state (
  id TEXT PRIMARY KEY,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_cloud_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_cloud_state_read" ON public.platform_cloud_state;
CREATE POLICY "platform_cloud_state_read"
  ON public.platform_cloud_state FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "platform_cloud_state_write" ON public.platform_cloud_state;
CREATE POLICY "platform_cloud_state_write"
  ON public.platform_cloud_state FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "platform_cloud_state_update" ON public.platform_cloud_state;
CREATE POLICY "platform_cloud_state_update"
  ON public.platform_cloud_state FOR UPDATE
  USING (true);
