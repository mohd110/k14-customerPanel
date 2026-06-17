-- ============================================================
-- 004 — Payment screenshot upload (replaces the UTR text entry)
-- Customers now upload a screenshot of their advance payment instead
-- of typing a UPI reference. The image lives in Storage; its URL is
-- saved on the order. (A future step can add restaurant authorization
-- of these screenshots.)
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- ── Order column for the uploaded proof ─────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- ── Storage bucket for the screenshots ──────────────────────
-- Public read so the dashboard can render the image via its URL.
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Logged-in customers can upload; anyone can read (public bucket).
DROP POLICY IF EXISTS "payment_proofs_insert_auth" ON storage.objects;
CREATE POLICY "payment_proofs_insert_auth"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "payment_proofs_read_all" ON storage.objects;
CREATE POLICY "payment_proofs_read_all"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-proofs');
