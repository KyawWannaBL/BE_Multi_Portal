-- 2026-03-05: app identity mapping helpers
-- This migration is designed for Supabase (Postgres) and is safe to run multiple times.

begin;

-- A per-session view exposing *only* the current user's linked IDs.
-- NOTE: This view uses auth.uid() + auth.jwt() and does not reference auth.users directly.
create or replace view public.app_identities as
with me as (
  select
    auth.uid() as auth_user_id,
    lower(coalesce(auth.jwt() ->> 'email', '')) as email
)
select
  me.auth_user_id,
  nullif(me.email, '') as email,

  -- Primary IDs used by the app
  u.id as user_id,
  m.id as merchant_id,
  c.id as customer_id,

  -- Extra IDs for admin/staff modules
  ue.id as user_enhanced_id,
  au.id as admin_user_id,

  -- Best-effort role resolution (text)
  coalesce(
    ue.role::text,
    au.role::text,
    p.role::text,
    u.role::text,
    null
  ) as primary_role
from me
left join public.users_enhanced ue on ue.auth_user_id = me.auth_user_id
left join public.profiles p on p.id = me.auth_user_id
left join public.admin_users_2026_02_04_16_00 au on lower(au.email) = me.email
left join public.users u on lower(u.email) = me.email
left join public.merchants m on lower(m.email) = me.email
left join public.customers c on lower(c.email) = me.email;

-- Scalar helpers (avoid composite extraction in RLS)
create or replace function public.current_user_id()
returns uuid
language sql
stable
as $$
  select user_id from public.app_identities;
$$;

create or replace function public.current_merchant_id()
returns uuid
language sql
stable
as $$
  select merchant_id from public.app_identities;
$$;

create or replace function public.current_customer_id()
returns uuid
language sql
stable
as $$
  select customer_id from public.app_identities;
$$;

-- Role helper used in RLS templates. SECURITY DEFINER so it can read role tables even when RLS is enabled.
create or replace function public.current_app_role()
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare r text;
begin
  select ue.role::text into r from public.users_enhanced ue where ue.auth_user_id = auth.uid() limit 1;
  if r is not null then return r; end if;

  select p.role::text into r from public.profiles p where p.id = auth.uid() limit 1;
  if r is not null then return r; end if;

  select au.role::text into r
  from public.admin_users_2026_02_04_16_00 au
  where lower(au.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  limit 1;

  return r;
end;
$$;

grant select on public.app_identities to authenticated;

commit;
