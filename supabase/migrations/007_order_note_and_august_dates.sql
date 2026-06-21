-- ============================================================
-- 007 — Optional order note + extend menu dates through August
-- 1. Adds an optional free-text note to each order (customer
--    instructions captured at checkout).
-- 2. Extends per-date menu availability for every offered product
--    through 31 Aug, so the customer can book any date up to then.
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor).
-- ============================================================

-- ── Optional order note ─────────────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS note TEXT;

-- ── Extend availability through end of August ───────────────
-- Make every currently-available product bookable for each date
-- from tomorrow through 2026-08-31 (idempotent).
INSERT INTO public.product_availability (product_id, available_date)
SELECT p.id, d::date
FROM public.products p
CROSS JOIN generate_series(
  CURRENT_DATE + 1,
  DATE '2026-08-31',
  INTERVAL '1 day'
) AS d
WHERE p.is_available = TRUE
ON CONFLICT DO NOTHING;
