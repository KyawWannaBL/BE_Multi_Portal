-- RLS verification queries (run with psql)
-- 1) Find public tables with RLS disabled
select
  n.nspname as schema,
  c.relname as table,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as force_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname='public'
  and c.relkind='r'
  and c.relname not like 'supabase_%'
order by rls_enabled asc, table;

-- 2) Policies summary
select schemaname, tablename, policyname, permissive, roles, cmd
from pg_policies
where schemaname='public'
order by tablename, policyname;

-- 3) Quick “role claim mismatch” check (returns NULL when mismatch)
select
  auth.uid() as uid,
  public.jwt_claim('app_role') as jwt_app_role,
  public.db_role() as db_role,
  public.effective_role() as effective_role;
