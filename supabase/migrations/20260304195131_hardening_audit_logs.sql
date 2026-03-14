-- Hardening: audit logs + triggers (shipments, shipment_tracking, invoices, financial_transactions)
-- Note: triggers run with table owner privileges; we lock direct writes via GRANT/REVOKE + RLS.

create table if not exists public.audit_logs (
  id            bigserial primary key,
  created_at    timestamptz not null default now(),
  actor_uid     uuid,
  actor_role    text,
  action        text not null, -- INSERT/UPDATE/DELETE
  table_name    text not null,
  row_id        text,
  old_record    jsonb,
  new_record    jsonb
);

comment on table public.audit_logs is
'Audit logs for writes. Inserted by triggers. Direct client writes should be blocked by grants + RLS.';

create or replace function public.audit_log_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor_uid uuid := auth.uid();
  v_actor_role text := public.effective_role();
  v_row_id text;
begin
  -- Try common primary key shapes
  v_row_id := coalesce(
    (case when tg_op in ('INSERT','UPDATE') then (to_jsonb(NEW)->>'id') end),
    (case when tg_op = 'DELETE' then (to_jsonb(OLD)->>'id') end),
    (case when tg_op in ('INSERT','UPDATE') then (to_jsonb(NEW)->>'way_id') end),
    (case when tg_op = 'DELETE' then (to_jsonb(OLD)->>'way_id') end),
    null
  );

  insert into public.audit_logs(actor_uid, actor_role, action, table_name, row_id, old_record, new_record)
  values (
    v_actor_uid,
    v_actor_role,
    tg_op,
    tg_table_name,
    v_row_id,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(OLD) else null end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(NEW) else null end
  );

  if tg_op = 'DELETE' then
    return OLD;
  end if;
  return NEW;
end
$$;

-- Attach triggers (safe if tables exist; skip if they don't)
do $$
begin
  if to_regclass('public.shipments') is not null then
    execute 'drop trigger if exists tr_audit_shipments on public.shipments';
    execute 'create trigger tr_audit_shipments after insert or update or delete on public.shipments
             for each row execute function public.audit_log_trigger()';
  end if;

  if to_regclass('public.shipment_tracking') is not null then
    execute 'drop trigger if exists tr_audit_shipment_tracking on public.shipment_tracking';
    execute 'create trigger tr_audit_shipment_tracking after insert or update or delete on public.shipment_tracking
             for each row execute function public.audit_log_trigger()';
  end if;

  if to_regclass('public.invoices') is not null then
    execute 'drop trigger if exists tr_audit_invoices on public.invoices';
    execute 'create trigger tr_audit_invoices after insert or update or delete on public.invoices
             for each row execute function public.audit_log_trigger()';
  end if;

  if to_regclass('public.financial_transactions') is not null then
    execute 'drop trigger if exists tr_audit_financial_transactions on public.financial_transactions';
    execute 'create trigger tr_audit_financial_transactions after insert or update or delete on public.financial_transactions
             for each row execute function public.audit_log_trigger()';
  end if;
end $$;
