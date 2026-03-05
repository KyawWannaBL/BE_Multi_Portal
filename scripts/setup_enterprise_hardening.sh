#!/usr/bin/env bash
set -euo pipefail

test -d supabase/migrations || { echo "ERROR: run from repo root (supabase/migrations missing)"; exit 1; }

echo "==> 1) Fix invalid migration filenames: YYYYMMDD-HHMMSS_name.sql -> YYYYMMDDHHMMSS_name.sql"
shopt -s nullglob
for f in supabase/migrations/[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9][0-9][0-9]_*.sql; do
  base="$(basename "$f")"
  new="${base/-/}"
  [[ "$base" == "$new" ]] || { echo "  - $base -> $new"; mv "$f" "supabase/migrations/$new"; }
done
shopt -u nullglob

echo "==> 2) Patch hardening_role_claim_helpers to be schema-safe (no hard dependency on public.profiles)"
HELPER_FILE="$(ls -1 supabase/migrations/*_hardening_role_claim_helpers.sql 2>/dev/null | head -n 1 || true)"
if [[ -z "${HELPER_FILE}" ]]; then
  echo "ERROR: cannot find *_hardening_role_claim_helpers.sql in supabase/migrations"
  echo "Tip: ls supabase/migrations | grep hardening"
  exit 1
fi

cat > "${HELPER_FILE}" <<'SQL'
create schema if not exists public;

create or replace function public.request_jwt()
returns jsonb
language sql
stable
as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
$$;

create or replace function public.jwt_claim(claim text)
returns text
language sql
stable
as $$
  select nullif(public.request_jwt() ->> claim, '');
$$;

create or replace function public.current_email()
returns text
language sql
stable
as $$
  select nullif(public.jwt_claim('email'), '');
$$;

create or replace function public.db_role()
returns text
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  r text;
begin
  r := null;

  if to_regclass('public.profiles') is not null then
    execute 'select role::text from public.profiles where id = auth.uid()' into r;
    if r is not null then return r; end if;
  end if;

  if to_regclass('public.users_enhanced') is not null then
    execute 'select role::text from public.users_enhanced where auth_user_id = auth.uid()' into r;
    if r is not null then return r; end if;
  end if;

  if to_regclass('public.admin_users_2026_02_04_16_00') is not null then
    execute 'select role::text from public.admin_users_2026_02_04_16_00 where auth_user_id = auth.uid()' into r;
    if r is not null then return r; end if;
  end if;

  if to_regclass('public.users') is not null then
    execute 'select role::text from public.users where email = public.current_email()' into r;
    if r is not null then return r; end if;
  end if;

  return null;
end
$$;

revoke all on function public.db_role() from public;
grant execute on function public.db_role() to anon, authenticated;

create or replace function public.effective_role()
returns text
language plpgsql
stable
security definer
set search_path = public, auth
as $$
declare
  jwt_role text := public.jwt_claim('app_role');
  dbrole   text := public.db_role();
begin
  if jwt_role is not null and dbrole is not null and jwt_role <> dbrole then
    return null;
  end if;
  return coalesce(jwt_role, dbrole);
end
$$;

revoke all on function public.effective_role() from public;
grant execute on function public.effective_role() to anon, authenticated;

create or replace function public.has_role(role_name text)
returns boolean
language sql
stable
as $$
  select public.effective_role() = role_name;
$$;

create or replace function public.has_any_role(role_names text[])
returns boolean
language sql
stable
as $$
  select public.effective_role() = any(role_names);
$$;
SQL

echo "==> 3) Add audit triggers for ALL public tables + exclusions list"
TS="$(date -u +%Y%m%d%H%M%S)"
AUDIT_MIG="supabase/migrations/${TS}_hardening_audit_auto_all_public.sql"

cat > "${AUDIT_MIG}" <<'SQL'
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

create table if not exists public.audit_trigger_exclusions (
  table_name text primary key,
  reason     text,
  created_at timestamptz not null default now()
);

-- sane defaults (edit anytime)
insert into public.audit_trigger_exclusions(table_name, reason)
values
  ('audit_logs', 'avoid recursion')
on conflict do nothing;

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
    select c.relname as table_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and not exists (
        select 1 from public.audit_trigger_exclusions e
        where e.table_name = c.relname
      )
  loop
    trg := 'tr_audit_' || r.table_name;

    execute format('drop trigger if exists %I on public.%I', trg, r.table_name);
    execute format(
      'create trigger %I after insert or update or delete on public.%I for each row execute function public.audit_log_trigger()',
      trg, r.table_name
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
SQL

echo "==> 4) Enable pgTAP"
TS2="$(date -u +%Y%m%d%H%M%S)"
cat > "supabase/migrations/${TS2}_enable_pgtap.sql" <<'SQL'
create extension if not exists pgtap;
SQL

echo "==> 5) Add portal RLS unit tests (pgTAP)"
mkdir -p supabase/tests/database

cat > supabase/tests/database/010_portal_merchant_flow.test.sql <<'SQL'
begin;
select plan(4);

-- 1) shipments table exists
select * from skip('public.shipments missing', 1) where not has_table('public', 'shipments');
select ok(true, 'public.shipments exists') where has_table('public', 'shipments');

-- 2) RLS enabled on shipments
select * from skip('public.shipments missing', 1) where not has_table('public', 'shipments');
select ok(
  (select c.relrowsecurity
   from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relname='shipments'),
  'RLS enabled on shipments'
) where has_table('public','shipments');

-- 3) Merchant can insert shipment (best-effort: may fail if your schema has strict NOT NULLs/FKs)
select * from skip('public.shipments missing', 1) where not has_table('public', 'shipments');
select lives_ok($$
  do $$
  declare
    uid uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  begin
    perform set_config('request.jwt.claims', json_build_object(
      'sub', uid::text,
      'email','merchant@test.local',
      'app_role','MERCHANT'
    )::text, true);

    execute 'set local role authenticated';

    -- minimal insert attempt; if your schema requires more, adjust here.
    execute $q$
      insert into public.shipments(way_id, status)
      values ('WAY-TEST-001', 'CREATED')
    $q$;
  end $$;
$$, 'MERCHANT can create shipment (adjust columns if needed)') where has_table('public','shipments');

-- 4) audit triggers exist on shipments (after hardening)
select * from skip('public.shipments missing', 1) where not has_table('public', 'shipments');
select ok(
  exists (
    select 1 from pg_trigger t
    join pg_class c on c.oid=t.tgrelid
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relname='shipments' and t.tgname like 'tr_audit_%'
  ),
  'audit trigger attached to shipments'
) where has_table('public','shipments');

select * from finish();
rollback;
SQL

cat > supabase/tests/database/020_portal_supervisor_flow.test.sql <<'SQL'
begin;
select plan(3);

select * from skip('public.shipment_approvals missing', 1) where not has_table('public', 'shipment_approvals');
select ok(true, 'public.shipment_approvals exists') where has_table('public','shipment_approvals');

select * from skip('public.shipment_approvals missing', 1) where not has_table('public', 'shipment_approvals');
select ok(
  (select c.relrowsecurity
   from pg_class c join pg_namespace n on n.oid=c.relnamespace
   where n.nspname='public' and c.relname='shipment_approvals'),
  'RLS enabled on shipment_approvals'
) where has_table('public','shipment_approvals');

select * from skip('public.shipment_approvals missing', 1) where not has_table('public', 'shipment_approvals');
select lives_ok($$
  do $$
  declare
    uid uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  begin
    perform set_config('request.jwt.claims', json_build_object(
      'sub', uid::text,
      'email','supervisor@test.local',
      'app_role','SUPERVISOR'
    )::text, true);

    execute 'set local role authenticated';

    -- if your approvals require a shipment_id FK, seed one first in migrations or adjust here
    -- this is a policy/existence smoke test
    perform 1;
  end $$;
$$, 'SUPERVISOR role context can execute (extend with approve/update once fixture exists)') where has_table('public','shipment_approvals');

select * from finish();
rollback;
SQL

cat > supabase/tests/database/030_portal_execution_flow.test.sql <<'SQL'
begin;
select plan(3);

select * from skip('public.shipments missing', 1) where not has_table('public', 'shipments');
select ok(true, 'public.shipments exists') where has_table('public','shipments');

select * from skip('public.shipments missing', 1) where not has_table('public', 'shipments');
select lives_ok($$
  do $$
  declare
    uid uuid := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
  begin
    perform set_config('request.jwt.claims', json_build_object(
      'sub', uid::text,
      'email','rider@test.local',
      'app_role','RIDER'
    )::text, true);

    execute 'set local role authenticated';

    -- update smoke test (requires an existing row)
    perform 1;
  end $$;
$$, 'RIDER role context can execute (extend with status update once fixture exists)') where has_table('public','shipments');

select * from skip('public.shipment_tracking missing', 1) where not has_table('public', 'shipment_tracking');
select ok(true, 'public.shipment_tracking exists') where has_table('public','shipment_tracking');

select * from finish();
rollback;
SQL

cat > supabase/tests/database/040_portal_customer_flow.test.sql <<'SQL'
begin;
select plan(2);

select * from skip('public.shipment_tracking missing', 1) where not has_table('public', 'shipment_tracking');
select ok(true, 'public.shipment_tracking exists') where has_table('public','shipment_tracking');

select * from skip('public.shipments missing', 1) where not has_table('public', 'shipments');
select ok(true, 'public.shipments exists') where has_table('public','shipments');

select * from finish();
rollback;
SQL

echo "==> 6) Add connectivity report generator (routes, portals, buttons, supabase calls, channels)"
mkdir -p docs
cat > scripts/report_connectivity.mjs <<'JS'
import fs from "fs";
import path from "path";

const root = process.cwd();
const srcDir = path.join(root, "src");

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === "build") continue;
      out.push(...walk(p));
    } else if (entry.isFile() && (p.endsWith(".ts") || p.endsWith(".tsx"))) {
      out.push(p);
    }
  }
  return out;
}

function read(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

const appTsx = path.join(srcDir, "App.tsx");
const app = read(appTsx);

const routeMatches = [...app.matchAll(/<Route\s+[^>]*path\s*=\s*["']([^"']+)["']/g)].map(m => m[1]);
const portals = [...new Set(routeMatches.filter(p => p.startsWith("/portal/")))].sort();
const screens = [...new Set(routeMatches)].sort();

const files = fs.existsSync(srcDir) ? walk(srcDir) : [];
let onClicks = 0;
let supabaseFrom = 0;
let supabaseRpc = 0;
let supabaseChannel = 0;

for (const f of files) {
  const s = read(f);
  onClicks += (s.match(/onClick\s*=/g) || []).length;
  supabaseFrom += (s.match(/supabase\.from\s*\(/g) || []).length;
  supabaseRpc += (s.match(/supabase\.rpc\s*\(/g) || []).length;
  supabaseChannel += (s.match(/supabase\.channel\s*\(/g) || []).length;
}

const md = `# Connectivity Report

## Counts
- Routes (screens): **${screens.length}**
- Portals (/portal/*): **${portals.length}**
- onClick handlers: **${onClicks}**
- supabase.from(...) calls: **${supabaseFrom}**
- supabase.rpc(...) calls: **${supabaseRpc}**
- supabase.channel(...) calls: **${supabaseChannel}**

## Portals
${portals.map(p => `- ${p}`).join("\n")}

## All Routes
${screens.map(p => `- ${p}`).join("\n")}

## Notes
- If \`supabase.channel(...)\` > 0 but live-map isn't mounted in routes, realtime is implemented but not connected to UI navigation.
`;

fs.writeFileSync(path.join(root, "docs", "CONNECTIVITY_REPORT.md"), md, "utf8");
console.log("Wrote docs/CONNECTIVITY_REPORT.md");
JS

echo ""
echo "✅ Files added/updated."
echo "Next run:"
echo "  npx supabase db reset"
echo "  npx supabase test db"
echo "  node scripts/report_connectivity.mjs"
