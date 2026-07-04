-- ============================================================
-- Launch reset — wipe all TEST orders
-- Run this in your Supabase SQL Editor once, before going live.
--
-- Clears: orders (order_items cascade-delete automatically) and the
-- per-date serial counters, so real orders start fresh at OR-1.
-- Leaves untouched: stores, profiles, products, product_availability,
-- partner_applications.
-- ============================================================

BEGIN;

-- Delete children first — the live order_items FK does NOT cascade
-- (the CREATE TABLE IF NOT EXISTS migration never re-applied the cascade).
DELETE FROM public.order_items;
DELETE FROM public.orders;

-- Reset the human order-number serials so the first live order is OR-1.
DELETE FROM public.order_counters;

COMMIT;

-- Sanity check (should both return 0):
-- SELECT count(*) FROM public.orders;
-- SELECT count(*) FROM public.order_items;
