-- ============================================================
-- 013 — New BMT order-number format (null-store safe)
--
-- Was:  <PREFIX>/LKO/<DDMMYYYY>/OR-<seq>   e.g. KABACCHI/LKO/07072026/OR-1
-- Now:  BMT/<STORE3>/<DDMMYY>-<0001>       e.g. BMT/KEB/020726-0001
--
-- STORE3 = first 3 alphanumerics of the store NAME, uppercased
--   (Kebabchi → KEB, K14 Bakery → K14); falls back to BMT when the order
--   has no single store. Serial is per store per delivery date, 4-digit
--   zero-padded.
--
-- FIX: order_counters is keyed (store_id, date_key) with store_id NOT NULL,
-- so an order with a NULL store_id (mixed / store-less cart) crashed with
-- "null value in column store_id ... violates not-null constraint". We now
-- use an all-zeros sentinel store_id for those, and drop the FK on
-- order_counters.store_id so the sentinel is accepted.
-- Idempotent — safe to re-run. Run this in your Supabase SQL Editor.
-- ============================================================

-- Let the counter table hold a sentinel (non-existent) store id for
-- store-less orders without tripping the foreign key. Drop ANY FK on the
-- table (the constraint name can vary depending on how it was created).
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.order_counters'::regclass AND contype = 'f'
  LOOP
    EXECUTE format('ALTER TABLE public.order_counters DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.assign_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  d_key    DATE;
  seq      INTEGER;
  sname    TEXT;
  code3    TEXT;
  v_store  UUID;
BEGIN
  d_key := COALESCE(
    NULLIF(NEW.delivery_address->>'date', '')::date,
    (NEW.created_at AT TIME ZONE 'Asia/Kolkata')::date,
    CURRENT_DATE
  );

  -- Counter key: real store, or an all-zeros sentinel for store-less orders.
  v_store := COALESCE(NEW.store_id, '00000000-0000-0000-0000-000000000000'::uuid);

  SELECT s.name INTO sname FROM public.stores s WHERE s.id = NEW.store_id;
  -- Strip non-alphanumerics, take first 3 chars, upper-case; fall back to BMT.
  code3 := UPPER(SUBSTRING(
    regexp_replace(COALESCE(sname, 'BMT'), '[^A-Za-z0-9]', '', 'g') FROM 1 FOR 3
  ));
  code3 := COALESCE(NULLIF(code3, ''), 'BMT');

  INSERT INTO public.order_counters (store_id, date_key, last_seq)
  VALUES (v_store, d_key, 1)
  ON CONFLICT (store_id, date_key)
    DO UPDATE SET last_seq = public.order_counters.last_seq + 1
  RETURNING last_seq INTO seq;

  NEW.order_seq  := seq;
  NEW.order_code := 'BMT/' || code3 || '/' || to_char(d_key, 'DDMMYY')
                    || '-' || lpad(seq::text, 4, '0');
  RETURN NEW;
END;
$$;
