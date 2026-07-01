-- ============================================================
-- Migration 010: Add Biryani Box and Sherrmal for Kabacchi
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

DO $$
DECLARE
  kabacchi_id UUID;
  biryani_id UUID := gen_random_uuid();
  sherrmal_id UUID := gen_random_uuid();
BEGIN
  -- 1. Fetch store id for 'kabacchi'
  SELECT id INTO kabacchi_id FROM public.stores WHERE slug = 'kabacchi';

  IF kabacchi_id IS NULL THEN
    RAISE EXCEPTION 'Store with slug "kabacchi" not found. Please ensure stores are seeded.';
  END IF;

  -- 2. Insert Products
  INSERT INTO public.products (id, store_id, name, description, price, is_available, stock, created_at)
  VALUES
    (
      biryani_id,
      kabacchi_id,
      'Biryani Box',
      'Fragrant basmati rice slow-cooked with tender chicken, whole spices, and caramelized onions. Served in a single-serve box with raita.',
      180,
      TRUE,
      100,
      NOW()
    ),
    (
      sherrmal_id,
      kabacchi_id,
      'Sherrmal',
      'Traditional Mughlai saffron-flavored sweet flatbread, baked to a golden brown in a clay tandoor. Ideal with korma.',
      50,
      TRUE,
      150,
      NOW() + INTERVAL '1 second'
    )
  ON CONFLICT (id) DO NOTHING;

  -- 3. Seed product availability through 31 Aug 2026
  INSERT INTO public.product_availability (product_id, available_date)
  SELECT p_id, d::date
  FROM (
    VALUES (biryani_id), (sherrmal_id)
  ) AS t(p_id)
  CROSS JOIN generate_series(
    CURRENT_DATE + 1,
    DATE '2026-08-31',
    INTERVAL '1 day'
  ) AS d
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Successfully added Biryani Box and Sherrmal products for Kabacchi store.';
END $$;
