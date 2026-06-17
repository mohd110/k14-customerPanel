-- ============================================================
-- 003 — Per-date menu availability
-- The customer menu is now offered per delivery date: a product
-- only shows on dates it has been marked available for.
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- ── Join table: which products are available on which dates ──
CREATE TABLE IF NOT EXISTS public.product_availability (
  product_id     UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  available_date DATE NOT NULL,
  PRIMARY KEY (product_id, available_date)
);

-- Fast lookup of "everything available on date X".
CREATE INDEX IF NOT EXISTS product_availability_date_idx
  ON public.product_availability (available_date);

-- ── Row Level Security ──────────────────────────────────────
ALTER TABLE public.product_availability ENABLE ROW LEVEL SECURITY;

-- Everyone can read availability (same as products).
DROP POLICY IF EXISTS "product_availability_select_all" ON public.product_availability;
CREATE POLICY "product_availability_select_all"
  ON public.product_availability FOR SELECT USING (true);

-- Only restaurant accounts can manage availability.
DROP POLICY IF EXISTS "product_availability_write_restaurant" ON public.product_availability;
CREATE POLICY "product_availability_write_restaurant"
  ON public.product_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'restaurant'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'restaurant'
    )
  );

-- ── Seed ────────────────────────────────────────────────────
-- Make every existing product available for the next 14 days
-- (starting tomorrow) so the menu isn't empty out of the box.
INSERT INTO public.product_availability (product_id, available_date)
SELECT p.id, d::date
FROM public.products p
CROSS JOIN generate_series(
  CURRENT_DATE + 1,
  CURRENT_DATE + 14,
  INTERVAL '1 day'
) AS d
ON CONFLICT DO NOTHING;
