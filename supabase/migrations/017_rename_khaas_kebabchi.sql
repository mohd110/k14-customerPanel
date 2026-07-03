-- ============================================================
-- 017 — Rebrand the biryani/kebab store → "Khaas Kebabchi"
-- The store may still be on its original slug ('kabacchi') if migration
-- 012 was never applied, so match either spelling. Sets the canonical
-- slug to 'kebabchi' and the name to 'Khaas Kebabchi'.
-- Idempotent. Run this in your Supabase SQL Editor.
-- ============================================================

UPDATE public.stores
SET name = 'Khaas Kebabchi',
    slug = 'kebabchi'
WHERE slug IN ('kabacchi', 'kebabchi');
