-- ============================================================
-- Migration 016: Partner (store onboarding) applications
-- Captures "Become a Partner" enquiries from the customer app.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.partner_applications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name     TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  store_type     TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'new',   -- new | contacted | approved | rejected
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_applications_created ON public.partner_applications(created_at DESC);

-- RLS: anyone (incl. anonymous visitors) may submit an application;
-- reading is restricted to admins via the dashboard's service role.
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "partner_applications_insert_all"
  ON public.partner_applications
  FOR INSERT
  WITH CHECK (true);
