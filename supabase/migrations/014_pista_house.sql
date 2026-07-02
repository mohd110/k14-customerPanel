-- ============================================================
-- 014 — Add "Pista House" to the store list as Coming Soon
--
-- is_active = FALSE → it renders under the "Coming Soon" section on
-- /stores (locked, no menu). Idempotent via ON CONFLICT (slug).
-- Run this in your Supabase SQL Editor.
-- ============================================================

INSERT INTO public.stores (name, slug, description, short_desc, theme_color, is_active, sort_order)
VALUES (
  'Pista House',
  'pista-house',
  'Coming soon — Hyderabad''s iconic haleem, bakery, and sweets.',
  'Haleem, bakery & sweets',
  '#6b4423',
  FALSE,
  6
)
ON CONFLICT (slug) DO NOTHING;
