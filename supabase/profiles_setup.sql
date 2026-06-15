-- Fix: orders_customer_id_fkey — ensure every auth user has a profiles row.
-- Policies + trigger + backfill only. NO new columns.
-- Run in Supabase Dashboard → SQL Editor (only needed if the app can't
-- create the profile itself due to RLS).

-- 1) Let a logged-in user create / read / update their OWN profile.
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- 2) Auto-create a profile whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''), '@', 1)),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'phone', new.phone)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3) Backfill profiles for users that already exist (fixes current accounts).
insert into public.profiles (id, role, full_name, email, phone)
select
  u.id,
  'customer',
  coalesce(u.raw_user_meta_data->>'full_name', split_part(coalesce(u.email,''), '@', 1)),
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data->>'phone', u.phone)
from auth.users u
on conflict (id) do nothing;
