-- ============================================================
-- Migration 009: Multi-vendor stores / outlets
-- ============================================================

CREATE TABLE IF NOT EXISTS public.stores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT NOT NULL DEFAULT '',
  short_desc    TEXT NOT NULL DEFAULT '',
  logo_url      TEXT,
  banner_url    TEXT,
  theme_color   TEXT NOT NULL DEFAULT '#10b981',  -- emerald default
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Add store_id to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_products_store ON public.products(store_id);

-- Add store_id to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_orders_store ON public.orders(store_id);

-- Seed stores
INSERT INTO public.stores (name, slug, description, short_desc, theme_color, is_active, sort_order)
VALUES
  ('K14 Bakery', 'k14-bakery', 'Freshly baked rusks, buns, biscuits, and traditional bakery delights.', 'Bakery & traditional treats', '#10b981', TRUE, 1),
  ('Kabacchi', 'kabacchi', 'Authentic Hyderabadi biryani, khreet, and rich Mughlai cuisine.', 'Biryani & Mughlai cuisine', '#b91c1c', TRUE, 2),
  ('Crockery & More', 'crockery', 'Elegant dinner sets, serving bowls, and kitchen essentials.', 'Dinner sets & kitchenware', '#7c3aed', FALSE, 3),
  ('Chai & Snacks', 'chai-snacks', 'Coming soon — chai, samosas, and evening bites.', 'Coming soon', '#000000', FALSE, 4),
  ('Fresh Juices', 'fresh-juices', 'Coming soon — fresh seasonal juices and smoothies.', 'Coming soon', '#000000', FALSE, 5)
ON CONFLICT (slug) DO NOTHING;

-- Update existing products to belong to K14 Bakery
UPDATE public.products SET store_id = (SELECT id FROM public.stores WHERE slug = 'k14-bakery')
WHERE store_id IS NULL;

-- RLS for stores
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stores_select_all" ON public.stores FOR SELECT USING (true);

-- Update products RLS if needed
DROP POLICY IF EXISTS "products_select_all" ON public.products;
CREATE POLICY "products_select_all" ON public.products FOR SELECT USING (true);

-- Add stores to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.stores;