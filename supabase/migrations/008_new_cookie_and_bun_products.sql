-- ============================================================
-- 008 — Finalize the menu to the 29/06–31/07 price list
-- The new price list is the single source of truth, so this:
--   1. Reprices the kept items to their list MRP (no markup).
--   2. Removes items no longer on the list (Aloo Patties, Oats
--      Cookies, and the generic Jeera/Ajwain Cookies that are
--      now split into Butter / Delicious tiers).
--   3. Adds the new items (cookie tiers, sweet cookies, Bun
--      Maska, 120 g Namak Para).
--
-- Customer price = the price list MRP. photo_url is left NULL on
-- new items — real photos get uploaded later.
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor).
-- ============================================================

-- ── 1. Reprice kept items to list MRP + new Single Pack photos ─
-- photo_url points to the Single Pack crop; the menu card also shows a
-- Bulk Packaging slide via src/lib/product-gallery.ts.
UPDATE public.products SET price = 10, photo_url = '/products/vanilla-muffin-single.jpg' WHERE id = 'a1000000-0000-4000-8000-000000000001'; -- Vanilla Muffin
UPDATE public.products SET price = 60, photo_url = '/products/dry-cake-single.jpg'       WHERE id = 'a1000000-0000-4000-8000-000000000002'; -- Dry Cake
UPDATE public.products SET price = 40, photo_url = '/products/khari-jeera-single.jpg'    WHERE id = 'a1000000-0000-4000-8000-000000000003'; -- Khari (Jeera)
UPDATE public.products SET price = 40, photo_url = '/products/khari-ajwain-single.jpg'   WHERE id = 'a1000000-0000-4000-8000-000000000004'; -- Khari (Ajwain)
UPDATE public.products SET price = 55, photo_url = '/products/mathri-single.jpg'         WHERE id = 'a1000000-0000-4000-8000-000000000009'; -- Mathri
UPDATE public.products SET price = 55, photo_url = '/products/namak-para-single.jpg'     WHERE id = 'a1000000-0000-4000-8000-00000000000a'; -- Namak Para (200 g)

-- ── 2. Remove items no longer on the price list ─────────────
-- order_items FK is ON DELETE SET NULL and product_availability is
-- ON DELETE CASCADE (see migration 006), so this is safe — past
-- orders keep their item snapshots and stale availability clears.
DELETE FROM public.products WHERE id IN (
  'a1000000-0000-4000-8000-000000000005', -- Aloo Patties
  'a1000000-0000-4000-8000-000000000006', -- Jeera Cookies (generic → Butter/Delicious)
  'a1000000-0000-4000-8000-000000000007', -- Ajwain Cookies (generic → Butter/Delicious)
  'a1000000-0000-4000-8000-000000000008'  -- Oats Cookies
);

-- ── 3. Seed the new products (MRP pricing + Single Pack photos) ─
INSERT INTO public.products (id, name, description, price, photo_url, is_available, stock, created_at) VALUES
  ('a1000000-0000-4000-8000-00000000000b', 'Butter Jeera Cookies',
   'Rich, melt-in-mouth butter cookies studded with roasted cumin. 200 g.',
   60, '/products/butter-jeera-cookies-single.jpg', TRUE, 200, NOW() + INTERVAL '11 second'),

  ('a1000000-0000-4000-8000-00000000000c', 'Delicious Jeera Cookies',
   'Crisp, lightly buttery cumin cookies — an everyday tea-time favourite. 200 g.',
   50, '/products/delicious-jeera-cookies-single.jpg', TRUE, 200, NOW() + INTERVAL '12 second'),

  ('a1000000-0000-4000-8000-00000000000d', 'Butter Ajwain Cookies',
   'Rich butter cookies flecked with carom (ajwain) seeds. 200 g.',
   60, '/products/butter-ajwain-cookies-single.jpg', TRUE, 200, NOW() + INTERVAL '13 second'),

  ('a1000000-0000-4000-8000-00000000000e', 'Delicious Ajwain Cookies',
   'Crisp, savoury-sweet ajwain cookies with a delicate crumb. 200 g.',
   50, '/products/delicious-ajwain-cookies-single.jpg', TRUE, 200, NOW() + INTERVAL '14 second'),

  ('a1000000-0000-4000-8000-00000000000f', 'Butter Sweet Cookies',
   'Classic rich butter shortbread cookies, golden and sweet. 200 g.',
   70, '/products/butter-sweet-cookies-single.jpg', TRUE, 200, NOW() + INTERVAL '15 second'),

  ('a1000000-0000-4000-8000-000000000010', 'Delicious Sweet Cookies',
   'Light, crumbly sweet cookies — perfect with chai. 200 g.',
   60, '/products/delicious-sweet-cookies-single.jpg', TRUE, 200, NOW() + INTERVAL '16 second'),

  ('a1000000-0000-4000-8000-000000000011', 'Bun Maska',
   'Soft, fluffy milk bun topped with candied tutti-frutti. 75 g.',
   25, '/products/bun-maska-single.jpg', TRUE, 200, NOW() + INTERVAL '17 second'),

  ('a1000000-0000-4000-8000-000000000012', 'Namak Para (Small)',
   'Crunchy fried savoury namak para — a classic tea-time nibble. 120 g.',
   40, '/products/namak-para-small-single.jpg', TRUE, 200, NOW() + INTERVAL '18 second')
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  price       = EXCLUDED.price,
  photo_url   = EXCLUDED.photo_url,
  is_available = EXCLUDED.is_available,
  stock       = EXCLUDED.stock;

-- ── 4. Make the new items bookable for every date through 31 Aug
-- Matches the menu's date gating (tomorrow → end of August).
INSERT INTO public.product_availability (product_id, available_date)
SELECT p.id, d::date
FROM public.products p
CROSS JOIN generate_series(
  CURRENT_DATE + 1,
  DATE '2026-08-31',
  INTERVAL '1 day'
) AS d
WHERE p.id IN (
  'a1000000-0000-4000-8000-00000000000b',
  'a1000000-0000-4000-8000-00000000000c',
  'a1000000-0000-4000-8000-00000000000d',
  'a1000000-0000-4000-8000-00000000000e',
  'a1000000-0000-4000-8000-00000000000f',
  'a1000000-0000-4000-8000-000000000010',
  'a1000000-0000-4000-8000-000000000011',
  'a1000000-0000-4000-8000-000000000012'
)
ON CONFLICT DO NOTHING;
