-- 2026-03-05: Enterprise Supply Chain Schema Final Repair
-- EN: Adds actual_delivery_time to shipments and repairs dependent views.
-- MY: shipments ဇယားတွင် actual_delivery_time ထည့်သွင်းပြီး View များကို ပြင်ဆင်ခြင်း။

begin;

-- 1. HARDENING: Ensure all required columns exist on the shipments table
DO $$ 
BEGIN 
  -- Add way_id if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shipments' AND column_name='way_id') THEN
    ALTER TABLE public.shipments ADD COLUMN way_id TEXT;
  END IF;
  
  -- Add cod_amount if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shipments' AND column_name='cod_amount') THEN
    ALTER TABLE public.shipments ADD COLUMN cod_amount NUMERIC DEFAULT 0;
  END IF;

  -- Add actual_delivery_time if missing (Fixes current error)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shipments' AND column_name='actual_delivery_time') THEN
    ALTER TABLE public.shipments ADD COLUMN actual_delivery_time TIMESTAMPTZ;
  END IF;
END $$;

-- 2. RE-ORDER: Ensure Finance tables exist before creating views
create table if not exists public.finance_deposits (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  amount numeric not null default 0,
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED'))
);

create table if not exists public.cod_collections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  shipment_id uuid not null,
  way_id text not null,
  amount numeric not null,
  deposit_id uuid references public.finance_deposits(id) on delete set null,
  status text not null default 'COLLECTED' check (status in ('COLLECTED','DEPOSITED','DISPUTED'))
);

-- 3. FINAL FIX: Repair the Finance COD View
create or replace view public.finance_cod_pending_v as
select
  s.id as shipment_id,
  s.way_id,
  s.cod_amount,
  s.actual_delivery_time, -- Now verified to exist
  coalesce(cc.status, 'UNCOLLECTED') as cod_status,
  cc.deposit_id
from public.shipments s
left join public.cod_collections cc on cc.shipment_id = s.id
where coalesce(s.cod_amount, 0) > 0
  and s.actual_delivery_time is not null; -- Filters for completed deliveries

commit;