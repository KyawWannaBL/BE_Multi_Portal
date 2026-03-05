-- EN: Courier live location table (with route metrics)
-- MY: Courier လက်ရှိတည်နေရာ + လမ်းကြောင်း metric များ

create table if not exists public.courier_locations (
  user_id uuid primary key references auth.users(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  heading real,
  speed real,
  accuracy real,
  remaining_meters double precision,
  eta_seconds integer,
  next_stop_index integer,
  next_stop_eta timestamptz,
  route_id text,
  updated_at timestamptz not null default now()
);

-- Add columns if existing table was created earlier
alter table public.courier_locations add column if not exists remaining_meters double precision;
alter table public.courier_locations add column if not exists eta_seconds integer;
alter table public.courier_locations add column if not exists next_stop_index integer;
alter table public.courier_locations add column if not exists next_stop_eta timestamptz;
alter table public.courier_locations add column if not exists route_id text;

alter table public.courier_locations replica identity full;

alter table public.courier_locations enable row level security;

-- EN: Couriers can upsert their own row.
-- MY: Courier သည် သူ့ row ကိုသာ upsert/update လုပ်နိုင်သည်။
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='courier_locations' and policyname='courier_locations_select') then
    create policy courier_locations_select on public.courier_locations
      for select to authenticated
      using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='courier_locations' and policyname='courier_locations_upsert_own') then
    create policy courier_locations_upsert_own on public.courier_locations
      for insert to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='courier_locations' and policyname='courier_locations_update_own') then
    create policy courier_locations_update_own on public.courier_locations
      for update to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;
