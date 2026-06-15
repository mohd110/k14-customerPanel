-- Allow anyone (incl. the app's anon key) to READ products.
-- This is a policy only — it does NOT add any columns.
-- Run in Supabase Dashboard → SQL Editor.

alter table public.products enable row level security;

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read"
  on public.products
  for select
  using (true);
