-- ============================================================
-- 018 — "product-photos" storage bucket
--
-- Same bucket the dashboard's Add-dish photo upload writes to. New dishes
-- store the uploaded file's public URL in products.photo_url, which the
-- customer menu renders (item.photo_url) for stores without a gallery map.
--
-- Public bucket: authenticated users can upload, anyone can read.
-- Idempotent — mirrors dashboard migration 013. Run once in either project
-- (both repos share one Supabase project). Run in the Supabase SQL Editor.
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-photos', 'product-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "product_photos_insert_auth" ON storage.objects;
CREATE POLICY "product_photos_insert_auth"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-photos');

DROP POLICY IF EXISTS "product_photos_read_all" ON storage.objects;
CREATE POLICY "product_photos_read_all"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-photos');
