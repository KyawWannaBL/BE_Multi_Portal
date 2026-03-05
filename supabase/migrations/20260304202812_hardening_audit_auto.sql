create table if not exists public.audit_logs (
  id         bigserial primary key,
  created_at timestamptz not null default now(),
  actor_uid  uuid,
  actor_role text,
  action     text not null,
  table_name text not null,
  row_id     text,
  old_record jsonb,
  new_record jsonb
);

create or replace function public.audit_log_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor_uid  uuid := auth.uid();
  v_actor_role text := public.effective_role();
  v_row_id     text;
begin
  v_row_id := coalesce(
    (case when tg_op in ('INSERT','UPDATE') then (to_jsonb(NEW)->>'id') end),
    (case when tg_op = 'DELETE' then (to_jsonb(OLD)->>'id') end),
    (case when tg_op in ('INSERT','UPDATE') then (to_jsonb(NEW)->>'way_id') end),
    (case when tg_op = 'DELETE' then (to_jsonb(OLD)->>'way_id') end)
  );

  insert into public.audit_logs(actor_uid, actor_role, action, table_name, row_id, old_record, new_record)
  values (
    v_actor_uid, v_actor_role, tg_op, tg_table_name, v_row_id,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(OLD) else null end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(NEW) else null end
  );

  if tg_op = 'DELETE' then return OLD; end if;
  return NEW;
end
$$;

create or replace function public.enable_audit_triggers_all_public_tables()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  trg text;
begin
  for r in
    select n.nspname as schema_name, c.relname as table_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and c.relname not in ('audit_logs')
  loop
    trg := 'tr_audit_' || r.table_name;

    execute format('drop trigger if exists %I on %I.%I', trg, r.schema_name, r.table_name);
    execute format(
      'create trigger %I after insert or update or delete on %I.%I for each row execute function public.audit_log_trigger()',
      trg, r.schema_name, r.table_name
    );
  end loop;
end
$$;

select public.enable_audit_triggers_all_public_tables();

alter table public.audit_logs enable row level security;
revoke insert, update, delete on public.audit_logs from anon, authenticated;
grant select on public.audit_logs to authenticated;

drop policy if exists hard_audit_select on public.audit_logs;
create policy hard_audit_select
on public.audit_logs
for select
to authenticated
using (
  public.has_any_role(array[
    'APP_OWNER','SUPER_ADMIN',
    'OPERATIONS_ADMIN',
    'FINANCE_USER','FINANCE_STAFF',
    'HR_ADMIN'
  ])
);
