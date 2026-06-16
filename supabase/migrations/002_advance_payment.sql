-- ============================================================
-- 40% Advance Payment — adds advance/payment tracking to orders
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- The 40% advance the customer is asked to pay up front (whole rupees).
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS advance_amount INTEGER NOT NULL DEFAULT 0
    CHECK (advance_amount >= 0);

-- Payment verification state for the advance.
--   awaiting_verification → customer says they paid, restaurant hasn't confirmed
--   paid                  → restaurant verified the UPI transfer landed
--   failed                → restaurant rejected (wrong/unreceived payment)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL
    DEFAULT 'awaiting_verification'
    CHECK (payment_status IN ('awaiting_verification', 'paid', 'failed'));

-- UPI reference / UTR number the customer enters after paying.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_ref TEXT;

-- Restaurant already has UPDATE rights via "orders_update_restaurant",
-- so it can flip payment_status to 'paid' / 'failed'. No new policy needed.
