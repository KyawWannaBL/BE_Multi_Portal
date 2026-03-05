-- Hardening: RLS + grants for audit_logs

alter table public.audit_logs enable row level security;

-- Block direct writes from API roles (triggers can still write as owner, subject to RLS)
revoke insert, update, delete on public.audit_logs from anon, authenticated;

-- Allow read only to privileged roles; deny if role mismatch (effective_role() returns NULL)
do $$
begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='audit_logs' and policyname='hard_audit_select') then
    execute 'drop policy hard_audit_select on public.audit_logs';
  end if;

  execute $pol$
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
  $pol$;
end $$;

grant select on public.audit_logs to authenticated;
