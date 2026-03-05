-- Enterprise RLS templates (adjust to match your production role storage / identity linkage)
-- Run after migrations.

-- Helpers
create or replace function public.is_admin_role()
returns boolean
language sql
stable
as $$
  select upper(coalesce(public.current_app_role(), '')) in ('SYS','APP_OWNER','SUPER_ADMIN','SUPER_A','SUPERADMIN','SUPER_ADMIN')
     or lower(coalesce(public.current_app_role(), '')) in ('super_admin','admin','manager');
$$;

create or replace function public.is_supervisor_role()
returns boolean
language sql
stable
as $$
  select upper(coalesce(public.current_app_role(), '')) in ('SUPERVISOR')
     or lower(coalesce(public.current_app_role(), '')) = 'supervisor'
     or public.is_admin_role();
$$;

create or replace function public.is_finance_role()
returns boolean
language sql
stable
as $$
  select upper(coalesce(public.current_app_role(), '')) in ('FINANCE_USER','FINANCE_STAFF')
     or lower(coalesce(public.current_app_role(), '')) in ('accountant')
     or public.is_admin_role();
$$;

create or replace function public.is_marketing_role()
returns boolean
language sql
stable
as $$
  select upper(coalesce(public.current_app_role(), '')) in ('MARKETING_ADMIN')
     or lower(coalesce(public.current_app_role(), '')) in ('marketer')
     or public.is_admin_role();
$$;

create or replace function public.is_hr_role()
returns boolean
language sql
stable
as $$
  select upper(coalesce(public.current_app_role(), '')) in ('HR_ADMIN')
     or public.is_admin_role();
$$;

create or replace function public.is_support_role()
returns boolean
language sql
stable
as $$
  select upper(coalesce(public.current_app_role(), '')) in ('CUSTOMER_SERVICE')
     or lower(coalesce(public.current_app_role(), '')) in ('customer_service')
     or public.is_admin_role();
$$;

-- SHIPMENTS
alter table public.shipments enable row level security;

drop policy if exists shipments_select_admin on public.shipments;
create policy shipments_select_admin
on public.shipments for select
to authenticated
using (public.is_admin_role() or public.is_supervisor_role() or public.is_finance_role());

drop policy if exists shipments_select_merchant on public.shipments;
create policy shipments_select_merchant
on public.shipments for select
to authenticated
using (merchant_id = public.current_merchant_id());

drop policy if exists shipments_select_execution on public.shipments;
create policy shipments_select_execution
on public.shipments for select
to authenticated
using (assigned_rider_id = public.current_user_id());

drop policy if exists shipments_insert_merchant on public.shipments;
create policy shipments_insert_merchant
on public.shipments for insert
to authenticated
with check (merchant_id = public.current_merchant_id());

-- SHIPMENT TRACKING
alter table public.shipment_tracking enable row level security;

drop policy if exists tracking_select_allowed on public.shipment_tracking;
create policy tracking_select_allowed
on public.shipment_tracking for select
to authenticated
using (
  public.is_admin_role()
  or exists (
    select 1 from public.shipments s
    where s.id = shipment_tracking.shipment_id
      and (
        s.merchant_id = public.current_merchant_id()
        or s.assigned_rider_id = public.current_user_id()
      )
  )
);

drop policy if exists tracking_insert_allowed on public.shipment_tracking;
create policy tracking_insert_allowed
on public.shipment_tracking for insert
to authenticated
with check (
  public.is_admin_role()
  or exists (
    select 1 from public.shipments s
    where s.id = shipment_tracking.shipment_id
      and (
        s.merchant_id = public.current_merchant_id()
        or s.assigned_rider_id = public.current_user_id()
        or public.is_supervisor_role()
      )
  )
);

-- SHIPMENT APPROVALS
alter table public.shipment_approvals enable row level security;

drop policy if exists approvals_select_supervisor on public.shipment_approvals;
create policy approvals_select_supervisor
on public.shipment_approvals for select
to authenticated
using (public.is_supervisor_role());

drop policy if exists approvals_insert_merchant on public.shipment_approvals;
create policy approvals_insert_merchant
on public.shipment_approvals for insert
to authenticated
with check (
  exists (
    select 1 from public.shipments s
    where s.id = shipment_approvals.shipment_id
      and s.merchant_id = public.current_merchant_id()
  )
);

drop policy if exists approvals_update_supervisor on public.shipment_approvals;
create policy approvals_update_supervisor
on public.shipment_approvals for update
to authenticated
using (public.is_supervisor_role())
with check (public.is_supervisor_role());

-- FINANCE
alter table public.invoices enable row level security;
drop policy if exists invoices_select_finance on public.invoices;
create policy invoices_select_finance on public.invoices for select to authenticated using (public.is_finance_role());
drop policy if exists invoices_insert_finance on public.invoices;
create policy invoices_insert_finance on public.invoices for insert to authenticated with check (public.is_finance_role());

alter table public.financial_transactions enable row level security;
drop policy if exists tx_select_finance on public.financial_transactions;
create policy tx_select_finance on public.financial_transactions for select to authenticated using (public.is_finance_role());
drop policy if exists tx_insert_finance on public.financial_transactions;
create policy tx_insert_finance on public.financial_transactions for insert to authenticated with check (public.is_finance_role());

-- MARKETING
alter table public.marketing_campaigns enable row level security;
drop policy if exists mkt_select on public.marketing_campaigns;
create policy mkt_select on public.marketing_campaigns for select to authenticated using (public.is_marketing_role());
drop policy if exists mkt_insert on public.marketing_campaigns;
create policy mkt_insert on public.marketing_campaigns for insert to authenticated with check (public.is_marketing_role());

-- HR
alter table public.employees enable row level security;
drop policy if exists emp_select on public.employees;
create policy emp_select on public.employees for select to authenticated using (public.is_hr_role());

-- SUPPORT
alter table public.support_tickets enable row level security;
drop policy if exists tickets_select on public.support_tickets;
create policy tickets_select on public.support_tickets for select to authenticated using (public.is_support_role());
