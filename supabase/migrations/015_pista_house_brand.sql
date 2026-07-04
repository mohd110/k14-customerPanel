-- ============================================================
-- 015 — Pista House branding: logo + brand colour from the logo
--
-- Sets the theme_color to the logo's deep-purple background (#332445)
-- and points logo_url at the bundled asset. Safe to re-run.
-- Run this in your Supabase SQL Editor.
-- ============================================================

UPDATE public.stores
SET
  theme_color = '#332445',
  logo_url    = '/pista-house-logo.jpg'
WHERE slug = 'pista-house';
