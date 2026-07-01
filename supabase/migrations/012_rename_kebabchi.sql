-- ============================================================
-- 012 — Fix store spelling: "Kabacchi" → "Kebabchi"
-- The store was seeded as "Kabacchi" (slug 'kabacchi'); the correct
-- brand spelling is "Kebabchi". Products link by store_id (not slug),
-- so renaming the slug is safe. Idempotent.
-- Run this in your Supabase SQL Editor.
-- ============================================================

UPDATE public.stores
SET name = 'Kebabchi',
    slug = 'kebabchi'
WHERE slug = 'kabacchi';
