-- 2026-03-05: shipment approvals workflow
-- Adds a minimal approval table used by Supervisor portal.

begin;

create table if not exists public.shipment_approvals (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  requested_by uuid null references public.users(id),
  reviewed_by uuid null references public.users(id),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz null,
  notes text null
);

create index if not exists shipment_approvals_shipment_id_idx on public.shipment_approvals(shipment_id);
create index if not exists shipment_approvals_status_idx on public.shipment_approvals(status);

commit;
