-- Enable RLS (idempotent)
do $$
begin
  if to_regclass('public.shipments') is not null then
    execute 'alter table public.shipments enable row level security';
  end if;
  if to_regclass('public.shipment_tracking') is not null then
    execute 'alter table public.shipment_tracking enable row level security';
  end if;
  if to_regclass('public.approvals') is not null then
    execute 'alter table public.approvals enable row level security';
  end if;
  if to_regclass('public.invoices') is not null then
    execute 'alter table public.invoices enable row level security';
  end if;
  if to_regclass('public.financial_transactions') is not null then
    execute 'alter table public.financial_transactions enable row level security';
  end if;
  if to_regclass('public.employees') is not null then
    execute 'alter table public.employees enable row level security';
  end if;
  if to_regclass('public.support_tickets') is not null then
    execute 'alter table public.support_tickets enable row level security';
  end if;
end $$;

-- SHIPMENTS
drop policy if exists hard_shipments_select on public.shipments;
create policy hard_shipments_select
on public.shipments
for select
to authenticated
using (
  -- Merchant sees own
  (public.has_role('MERCHANT') and merchant_id = public.current_merchant_id())
  or
  -- Customer sees by phone match (no PII beyond their own)
  (public.has_role('CUSTOMER') and receiver_phone = public.current_customer_phone())
  or
  -- Ops/Admin roles see all
  public.has_any_role(array['APP_OWNER','SUPER_ADMIN','OPERATIONS_ADMIN','SUPERVISOR','WAREHOUSE_MANAGER','SUBSTATION_MANAGER','STAFF','DATA_ENTRY'])
  or
  -- Execution sees assigned
  (public.has_any_role(array['RIDER','DRIVER','HELPER']) and assigned_rider_id = public.current_public_user_id())
);

drop policy if exists hard_shipments_insert on public.shipments;
create policy hard_shipments_insert
on public.shipments
for insert
to authenticated
with check (
  public.has_role('MERCHANT') and merchant_id = public.current_merchant_id()
);

drop policy if exists hard_shipments_update_ops on public.shipments;
create policy hard_shipments_update_ops
on public.shipments
for update
to authenticated
using (
  public.has_any_role(array['APP_OWNER','SUPER_ADMIN','OPERATIONS_ADMIN','SUPERVISOR','WAREHOUSE_MANAGER','SUBSTATION_MANAGER','STAFF','DATA_ENTRY'])
  or (public.has_any_role(array['RIDER','DRIVER','HELPER']) and assigned_rider_id = public.current_public_user_id())
)
with check (
  public.has_any_role(array['APP_OWNER','SUPER_ADMIN','OPERATIONS_ADMIN','SUPERVISOR','WAREHOUSE_MANAGER','SUBSTATION_MANAGER','STAFF','DATA_ENTRY'])
  or (public.has_any_role(array['RIDER','DRIVER','HELPER']) and assigned_rider_id = public.current_public_user_id())
);

-- TRACKING
drop policy if exists hard_tracking_select on public.shipment_tracking;
create policy hard_tracking_select
on public.shipment_tracking
for select
to authenticated
using (
  public.has_any_role(array['APP_OWNER','SUPER_ADMIN','OPERATIONS_ADMIN','SUPERVISOR','WAREHOUSE_MANAGER','SUBSTATION_MANAGER','STAFF','DATA_ENTRY'])
  or exists (
    select 1 from public.shipments s
    where s.id = shipment_tracking.shipment_id
      and public.has_role('MERCHANT')
      and s.merchant_id = public.current_merchant_id()
  )
  or exists (
    select 1 from public.shipments s
    where s.id = shipment_tracking.shipment_id
      and public.has_role('CUSTOMER')
      and s.receiver_phone = public.current_customer_phone()
      and shipment_tracking.is_customer_visible = true
  )
  or exists (
    select 1 from public.shipments s
    where s.id = shipment_tracking.shipment_id
      and public.has_any_role(array['RIDER','DRIVER','HELPER'])
      and s.assigned_rider_id = public.current_public_user_id()
  )
);

drop policy if exists hard_tracking_insert on public.shipment_tracking;
create policy hard_tracking_insert
on public.shipment_tracking
for insert
to authenticated
with check (
  public.has_any_role(array['APP_OWNER','SUPER_ADMIN','OPERATIONS_ADMIN','SUPERVISOR','WAREHOUSE_MANAGER','SUBSTATION_MANAGER','STAFF','DATA_ENTRY'])
  or exists (
    select 1 from public.shipments s
    where s.id = shipment_tracking.shipment_id
      and public.has_any_role(array['RIDER','DRIVER','HELPER'])
      and s.assigned_rider_id = public.current_public_user_id()
  )
);

-- APPROVALS (shipment workflow)
drop policy if exists hard_approvals_select on public.approvals;
create policy hard_approvals_select
on public.approvals
for select
to authenticated
using (
  public.has_any_role(array['APP_OWNER','SUPER_ADMIN','OPERATIONS_ADMIN','SUPERVISOR'])
  or exists (
    select 1 from public.shipments s
    where s.id = approvals.entity_id
      and public.has_role('MERCHANT')
      and s.merchant_id = public.current_merchant_id()
  )
);

drop policy if exists hard_approvals_update on public.approvals;
create policy hard_approvals_update
on public.approvals
for update
to authenticated
using (public.has_any_role(array['APP_OWNER','SUPER_ADMIN','OPERATIONS_ADMIN','SUPERVISOR']))
with check (public.has_any_role(array['APP_OWNER','SUPER_ADMIN','OPERATIONS_ADMIN','SUPERVISOR']));

-- FINANCE
drop policy if exists hard_invoices_finance on public.invoices;
create policy hard_invoices_finance
on public.invoices
for all
to authenticated
using (public.has_any_role(array['APP_OWNER','SUPER_ADMIN','FINANCE_USER','FINANCE_STAFF']))
with check (public.has_any_role(array['APP_OWNER','SUPER_ADMIN','FINANCE_USER','FINANCE_STAFF']));

drop policy if exists hard_fin_tx_finance on public.financial_transactions;
create policy hard_fin_tx_finance
on public.financial_transactions
for all
to authenticated
using (public.has_any_role(array['APP_OWNER','SUPER_ADMIN','FINANCE_USER','FINANCE_STAFF']))
with check (public.has_any_role(array['APP_OWNER','SUPER_ADMIN','FINANCE_USER','FINANCE_STAFF']));

-- HR
drop policy if exists hard_employees_hr on public.employees;
create policy hard_employees_hr
on public.employees
for all
to authenticated
using (public.has_any_role(array['APP_OWNER','SUPER_ADMIN','HR_ADMIN']))
with check (public.has_any_role(array['APP_OWNER','SUPER_ADMIN','HR_ADMIN']));

-- SUPPORT
drop policy if exists hard_support_tickets_support on public.support_tickets;
create policy hard_support_tickets_support
on public.support_tickets
for all
to authenticated
using (public.has_any_role(array['APP_OWNER','SUPER_ADMIN','CUSTOMER_SERVICE']))
with check (public.has_any_role(array['APP_OWNER','SUPER_ADMIN','CUSTOMER_SERVICE']));
