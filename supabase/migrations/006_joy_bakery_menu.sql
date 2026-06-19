-- ============================================================
-- 006 — Replace the menu with the Joy Bakery product list
-- Removes the old products and seeds the 10 real bakery items.
-- Customer price = wholesale price + 20% (rounded to the rupee).
-- Photos come from the bakery PDF, stored in /public/products/.
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor).
-- ============================================================

-- ── Columns the app expects (idempotent) ────────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS stock     INTEGER NOT NULL DEFAULT 0;

-- ── Let old products be removed without losing past orders ──
-- The live order_items FK was created without ON DELETE SET NULL, so it
-- blocks deleting any product an order references. Re-point it to SET NULL:
-- deleting a product then just nulls the link, and the order keeps its
-- item snapshot in delivery_address.
ALTER TABLE public.order_items ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE public.order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;

-- ── Remove the old menu ─────────────────────────────────────
-- product_availability is ON DELETE CASCADE, so old availability clears.
DELETE FROM public.products;

-- ── Seed the Joy Bakery menu ────────────────────────────────
-- price column is whole rupees. Markup = ROUND(wholesale * 1.2).
INSERT INTO public.products (id, name, description, price, photo_url, is_available, stock, created_at) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'Vanilla Muffin',
   'Soft, buttery vanilla muffin baked fresh in a fluted cup. 35 g.',
   16, '/products/vanilla-muffin.jpg', TRUE, 200, NOW() + INTERVAL '1 second'),

  ('a1000000-0000-4000-8000-000000000002', 'Dry Cake',
   'Classic tea-time dry cake — light, moist and lightly sweet. 150 g.',
   68, '/products/dry-cake.jpg', TRUE, 200, NOW() + INTERVAL '2 second'),

  ('a1000000-0000-4000-8000-000000000003', 'Khari (Jeera)',
   'Flaky, layered puff-pastry khari with roasted cumin. 250 g.',
   54, '/products/khari-jeera.jpg', TRUE, 200, NOW() + INTERVAL '3 second'),

  ('a1000000-0000-4000-8000-000000000004', 'Khari (Ajwain)',
   'Flaky, layered puff-pastry khari with carom (ajwain) seeds. 250 g.',
   52, '/products/khari-ajwain.jpg', TRUE, 200, NOW() + INTERVAL '4 second'),

  ('a1000000-0000-4000-8000-000000000005', 'Aloo Patties',
   'Crisp puff pastry stuffed with lightly spiced potato. 90 g.',
   22, '/products/aloo-patties.jpg', TRUE, 200, NOW() + INTERVAL '5 second'),

  ('a1000000-0000-4000-8000-000000000006', 'Jeera Cookies',
   'Buttery shortbread cookies studded with roasted cumin. 250 g.',
   61, '/products/jeera-cookies.jpg', TRUE, 200, NOW() + INTERVAL '6 second'),

  ('a1000000-0000-4000-8000-000000000007', 'Ajwain Cookies',
   'Savoury-sweet cookies flecked with carom (ajwain) seeds. 250 g.',
   64, '/products/ajwain-cookies.jpg', TRUE, 200, NOW() + INTERVAL '7 second'),

  ('a1000000-0000-4000-8000-000000000008', 'Oats Cookies',
   'Wholesome oats cookies, crisp and lightly sweet. 250 g.',
   66, '/products/oats-cookies.jpg', TRUE, 200, NOW() + INTERVAL '8 second'),

  ('a1000000-0000-4000-8000-000000000009', 'Mathri',
   'Crisp, flaky savoury mathri seasoned with ajwain. 200 g.',
   83, '/products/mathri.jpg', TRUE, 200, NOW() + INTERVAL '9 second'),

  ('a1000000-0000-4000-8000-00000000000a', 'Namak Para',
   'Crunchy fried savoury namak para — a classic tea-time nibble. 200 g.',
   77, '/products/namak-para.jpg', TRUE, 200, NOW() + INTERVAL '10 second')
ON CONFLICT (id) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  price       = EXCLUDED.price,
  photo_url   = EXCLUDED.photo_url,
  is_available = EXCLUDED.is_available,
  stock       = EXCLUDED.stock;

-- ── Make every new item available for the next 14 days ──────
-- (starting tomorrow, matching the menu's date gating).
INSERT INTO public.product_availability (product_id, available_date)
SELECT p.id, d::date
FROM public.products p
CROSS JOIN generate_series(CURRENT_DATE + 1, CURRENT_DATE + 14, INTERVAL '1 day') AS d
ON CONFLICT DO NOTHING;
