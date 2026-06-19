-- ============================================================
-- 005 — Human order numbers
-- Every order gets a readable code in the form
--     k14/LKO/<DDMMYYYY>/OR-<serial>
-- where <DDMMYYYY> is the delivery date and <serial> is a
-- counter that resets per delivery date (OR-1, OR-2, ... each day).
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- ── Per-date serial counter ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_counters (
  date_key DATE PRIMARY KEY,
  last_seq INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.order_counters ENABLE ROW LEVEL SECURITY;
-- No direct policies: only the SECURITY DEFINER trigger below touches this table.

-- ── New columns on orders ───────────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_seq  INTEGER,
  ADD COLUMN IF NOT EXISTS order_code TEXT;

-- ── Trigger: assign the serial + code on insert ─────────────
-- SECURITY DEFINER so a customer's INSERT can bump the shared counter
-- without needing write access to order_counters.
CREATE OR REPLACE FUNCTION public.assign_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  d_key DATE;
  seq   INTEGER;
BEGIN
  -- Prefer the delivery date carried in the order payload; fall back to today.
  d_key := COALESCE(
    NULLIF(NEW.delivery_address->>'date', '')::date,
    (NEW.created_at AT TIME ZONE 'Asia/Kolkata')::date,
    CURRENT_DATE
  );

  INSERT INTO public.order_counters (date_key, last_seq)
  VALUES (d_key, 1)
  ON CONFLICT (date_key)
    DO UPDATE SET last_seq = public.order_counters.last_seq + 1
  RETURNING last_seq INTO seq;

  NEW.order_seq  := seq;
  NEW.order_code := 'k14/LKO/' || to_char(d_key, 'DDMMYYYY') || '/OR-' || seq;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_order_number ON public.orders;
CREATE TRIGGER trg_assign_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.assign_order_number();

-- ── Backfill existing orders ────────────────────────────────
-- Give already-placed orders a code too, numbered by creation order
-- within their delivery date.
WITH ranked AS (
  SELECT
    o.id,
    COALESCE(
      NULLIF(o.delivery_address->>'date', '')::date,
      (o.created_at AT TIME ZONE 'Asia/Kolkata')::date
    ) AS d_key,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(
        NULLIF(o.delivery_address->>'date', '')::date,
        (o.created_at AT TIME ZONE 'Asia/Kolkata')::date
      )
      ORDER BY o.created_at
    ) AS seq
  FROM public.orders o
  WHERE o.order_code IS NULL
)
UPDATE public.orders o
SET order_seq  = r.seq,
    order_code = 'k14/LKO/' || to_char(r.d_key, 'DDMMYYYY') || '/OR-' || r.seq
FROM ranked r
WHERE o.id = r.id;

-- Seed the counters so future inserts continue from the backfilled max.
INSERT INTO public.order_counters (date_key, last_seq)
SELECT
  COALESCE(
    NULLIF(delivery_address->>'date', '')::date,
    (created_at AT TIME ZONE 'Asia/Kolkata')::date
  ) AS date_key,
  MAX(order_seq) AS last_seq
FROM public.orders
WHERE order_seq IS NOT NULL
GROUP BY 1
ON CONFLICT (date_key) DO UPDATE SET last_seq = GREATEST(public.order_counters.last_seq, EXCLUDED.last_seq);
