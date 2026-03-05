-- Britium Enterprise - Supabase RLS Policy Templates
-- IMPORTANT:
-- 1) Review and adjust role names + linking columns to match your production schema.
-- 2) These are templates (safe defaults), not a one-click production guarantee.
-- 3) Run in Supabase SQL Editor (or via migrations).

-- =========
-- Helpers
-- =========
create or replace function public.current_app_role()
returns text
language sql
stable
as $$
  select coalesce((select p.role::text from public.profiles p where p.id = auth.uid()), 'CUSTOMER');
$$;

create or replace function public.is_internal_staff()
returns boolean
language sql
stable
as $$
  select public.current_app_role() in (
    'APP_OWNER','SYS','SUPER_ADMIN',
    'OPERATIONS_ADMIN','SUPERVISOR','WAREHOUSE_MANAGER','SUBSTATION_MANAGER',
    'CUSTOMER_SERVICE','FINANCE_USER','FINANCE_STAFF','MARKETING_ADMIN','HR_ADMIN',
    'STAFF','DATA_ENTRY','RIDER','DRIVER','HELPER'
  );
$$;

create or replace function public.auth_email()
returns text
language sql
stable
as $$
  -- Supabase JWT commonly includes "email" claim.
  select coalesce(auth.jwt() ->> 'email', '');
$$;

-- =========
-- Shipments
-- =========
alter table public.shipments enable row level security;

-- Internal staff: read all shipments
drop policy if exists shipments_internal_select on public.shipments;
create policy shipments_internal_select
on public.shipments for select
using (public.is_internal_staff());

-- Merchant: read own shipments by merchants.email -> shipments.merchant_id FK
-- NOTE: Adjust if you store merchant linkage differently.
drop policy if exists shipments_merchant_select on public.shipments;
create policy shipments_merchant_select
on public.shipments for select
using (
  public.current_app_role() = 'MERCHANT'
  and exists (
    select 1 from public.merchants m
    where m.id = shipments.merchant_id
      and m.email = public.auth_email()
  )
);

-- Merchant: create own shipments (merchant_id must match)
drop policy if exists shipments_merchant_insert on public.shipments;
create policy shipments_merchant_insert
on public.shipments for insert
with check (
  public.current_app_role() = 'MERCHANT'
  and exists (
    select 1 from public.merchants m
    where m.id = shipments.merchant_id
      and m.email = public.auth_email()
  )
);

-- Customer: read shipments by customers.email -> receiver_phone match
-- NOTE: Adjust if customer linking differs.
drop policy if exists shipments_customer_select on public.shipments;
create policy shipments_customer_select
on public.shipments for select
using (
  public.current_app_role() = 'CUSTOMER'
  and exists (
    select 1 from public.customers c
    where c.email = public.auth_email()
      and c.phone = shipments.receiver_phone
  )
);

-- Execution staff: read assigned shipments (public.users linkage by email)
drop policy if exists shipments_execution_select on public.shipments;
create policy shipments_execution_select
on public.shipments for select
using (
  public.current_app_role() in ('RIDER','DRIVER','HELPER')
  and exists (
    select 1 from public.users u
    where u.email = public.auth_email()
      and u.id = shipments.assigned_rider_id
  )
);

-- Execution staff: update status of assigned shipments
drop policy if exists shipments_execution_update on public.shipments;
create policy shipments_execution_update
on public.shipments for update
using (
  public.current_app_role() in ('RIDER','DRIVER','HELPER')
  and exists (
    select 1 from public.users u
    where u.email = public.auth_email()
      and u.id = shipments.assigned_rider_id
  )
)
with check (
  public.current_app_role() in ('RIDER','DRIVER','HELPER')
  and exists (
    select 1 from public.users u
    where u.email = public.auth_email()
      and u.id = shipments.assigned_rider_id
  )
);

-- Ops/Supervisor/Warehouse: update shipments
drop policy if exists shipments_ops_update on public.shipments;
create policy shipments_ops_update
on public.shipments for update
using (public.current_app_role() in ('APP_OWNER','SYS','SUPER_ADMIN','OPERATIONS_ADMIN','SUPERVISOR','WAREHOUSE_MANAGER','SUBSTATION_MANAGER','STAFF','DATA_ENTRY','CUSTOMER_SERVICE'))
with check (public.current_app_role() in ('APP_OWNER','SYS','SUPER_ADMIN','OPERATIONS_ADMIN','SUPERVISOR','WAREHOUSE_MANAGER','SUBSTATION_MANAGER','STAFF','DATA_ENTRY','CUSTOMER_SERVICE'));

-- =========
-- Shipment tracking
-- =========
alter table public.shipment_tracking enable row level security;

-- Read tracking entries if user can read the shipment
drop policy if exists tracking_select on public.shipment_tracking;
create policy tracking_select
on public.shipment_tracking for select
using (
  exists (
    select 1 from public.shipments s
    where s.id = shipment_tracking.shipment_id
      and (
        public.is_internal_staff()
        or (public.current_app_role() = 'MERCHANT' and exists (select 1 from public.merchants m where m.id = s.merchant_id and m.email = public.auth_email()))
        or (public.current_app_role() = 'CUSTOMER' and exists (select 1 from public.customers c where c.email = public.auth_email() and c.phone = s.receiver_phone))
        or (public.current_app_role() in ('RIDER','DRIVER','HELPER') and exists (select 1 from public.users u where u.email = public.auth_email() and u.id = s.assigned_rider_id))
      )
  )
);

-- Insert tracking entries (internal staff + execution staff + support)
drop policy if exists tracking_insert on public.shipment_tracking;
create policy tracking_insert
on public.shipment_tracking for insert
with check (
  public.current_app_role() in (
    'APP_OWNER','SYS','SUPER_ADMIN',
    'OPERATIONS_ADMIN','SUPERVISOR','WAREHOUSE_MANAGER','SUBSTATION_MANAGER',
    'CUSTOMER_SERVICE','STAFF','DATA_ENTRY',
    'RIDER','DRIVER','HELPER'
  )
);

-- =========
-- Finance
-- =========
alter table public.invoices enable row level security;
alter table public.financial_transactions enable row level security;

drop policy if exists invoices_finance_select on public.invoices;
create policy invoices_finance_select
on public.invoices for select
using (public.current_app_role() in ('APP_OWNER','SYS','SUPER_ADMIN','FINANCE_USER','FINANCE_STAFF'));

drop policy if exists invoices_finance_write on public.invoices;
create policy invoices_finance_write
on public.invoices for insert
with check (public.current_app_role() in ('APP_OWNER','SYS','SUPER_ADMIN','FINANCE_USER','FINANCE_STAFF'));

drop policy if exists tx_finance_select on public.financial_transactions;
create policy tx_finance_select
on public.financial_transactions for select
using (public.current_app_role() in ('APP_OWNER','SYS','SUPER_ADMIN','FINANCE_USER','FINANCE_STAFF'));

drop policy if exists tx_finance_insert on public.financial_transactions;
create policy tx_finance_insert
on public.financial_transactions for insert
with check (public.current_app_role() in ('APP_OWNER','SYS','SUPER_ADMIN','FINANCE_USER','FINANCE_STAFF'));

-- =========
-- Marketing / HR
-- =========
alter table public.marketing_campaigns enable row level security;
alter table public.employees enable row level security;

drop policy if exists marketing_select on public.marketing_campaigns;
create policy marketing_select
on public.marketing_campaigns for select
using (public.current_app_role() in ('APP_OWNER','SYS','SUPER_ADMIN','MARKETING_ADMIN'));

drop policy if exists employees_select on public.employees;
create policy employees_select
on public.employees for select
using (public.current_app_role() in ('APP_OWNER','SYS','SUPER_ADMIN','HR_ADMIN'));

-- =========
-- End
-- =========
