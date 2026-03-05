-- Clean up the temporary dummy tables we made earlier
drop table if exists public.users_enhanced cascade;
drop table if exists public.admin_users_2026_02_04_16_00 cascade;

-- Create a clean, modernized view using ONLY the new architecture
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

  -- Nullify the old legacy IDs so the app doesn't crash if it asks for them
  null::uuid as user_enhanced_id,
  null::uuid as admin_user_id,

  -- Clean role resolution from our new users table
  u.role::text as primary_role
from me
left join public.users u on u.id = me.auth_user_id
left join public.merchants m on m.user_id = me.auth_user_id
left join public.customers c on lower(c.email) = me.email;
