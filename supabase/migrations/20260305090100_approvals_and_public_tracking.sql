-- approvals table for shipment approvals (matches your ApprovalQueue intent)
create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null default 'shipment',
  entity_id uuid not null references public.shipments(id) on delete cascade,
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.approvals is 'Workflow approvals (shipments).';

-- Public tracking RPC (no PII leakage)
create or replace function public.public_track_shipment(p_way_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  s record;
begin
  select
    sh.id, sh.way_id, sh.status, sh.estimated_delivery, sh.receiver_city, sh.receiver_state, sh.created_at
  into s
  from public.shipments sh
  where sh.way_id = p_way_id
  limit 1;

  if s.id is null then
    return jsonb_build_object('found', false);
  end if;

  return jsonb_build_object(
    'found', true,
    'shipment', jsonb_build_object(
      'id', s.id,
      'way_id', s.way_id,
      'status', s.status,
      'estimated_delivery', s.estimated_delivery,
      'receiver_city', s.receiver_city,
      'receiver_state', s.receiver_state,
      'created_at', s.created_at
    ),
    'tracking', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'timestamp', t.timestamp,
          'status', t.status,
          'location', t.location,
          'notes', t.notes
        )
        order by t.timestamp asc
      )
      from public.shipment_tracking t
      where t.shipment_id = s.id
        and t.is_customer_visible = true
    ), '[]'::jsonb)
  );
end
$$;

revoke all on function public.public_track_shipment(text) from public;
grant execute on function public.public_track_shipment(text) to anon, authenticated;
