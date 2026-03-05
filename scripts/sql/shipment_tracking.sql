-- EN: Shipment tracking events (geofence / arrival / exception)
-- MY: Shipment tracking event များ (geofence / ရောက်ရှိ / exception)

create table if not exists public.shipment_tracking (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid null,
  way_id text null,
  event_type text not null,
  stop_index integer null,
  stop_label text null,
  lat double precision null,
  lng double precision null,
  accuracy real null,
  event_at timestamptz not null default now(),
  actor_id uuid null references auth.users(id) on delete set null,
  actor_role text null,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists shipment_tracking_way_id_idx on public.shipment_tracking (way_id);
create index if not exists shipment_tracking_shipment_id_idx on public.shipment_tracking (shipment_id);
create index if not exists shipment_tracking_event_at_idx on public.shipment_tracking (event_at desc);

alter table public.shipment_tracking enable row level security;

-- EN: Allow authenticated insert (events are append-only).
-- MY: Authenticated user အား insert ခွင့်ပြု (event တွေ append-only)
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='shipment_tracking' and policyname='shipment_tracking_insert') then
    create policy shipment_tracking_insert on public.shipment_tracking
      for insert to authenticated
      with check (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='shipment_tracking' and policyname='shipment_tracking_select') then
    create policy shipment_tracking_select on public.shipment_tracking
      for select to authenticated
      using (true);
  end if;
end $$;
