-- ============================================================
-- 015 — Super-admin can create / edit stores from the dashboard
--
-- Until now `stores` had only a public SELECT policy (009_stores.sql),
-- so the admin panel could read outlets but never add one. This lets
-- the marketplace super-admin (a 'restaurant'/'bakery' staff account
-- whose profile has NO store_id) INSERT and UPDATE stores.
--
-- Store-scoped staff (profiles.store_id = <uuid>) are NOT affected and
-- still cannot create stores. Additive & idempotent.
-- Run this in your Supabase SQL Editor (same project as the apps).
-- ============================================================

-- Helper: is the caller the marketplace super-admin?
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('restaurant', 'bakery')
      AND p.store_id IS NULL
  );
$$;

-- Super-admin may create new outlets.
DROP POLICY IF EXISTS "stores_insert_super" ON public.stores;
CREATE POLICY "stores_insert_super" ON public.stores FOR INSERT
  WITH CHECK (public.is_super_admin());

-- Super-admin may edit existing outlets.
DROP POLICY IF EXISTS "stores_update_super" ON public.stores;
CREATE POLICY "stores_update_super" ON public.stores FOR UPDATE
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
