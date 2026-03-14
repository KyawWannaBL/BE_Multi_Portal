create table if not exists public.audit_logs (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  user_id uuid null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.audit_logs enable row level security;

-- authenticated users can read their own audit events
drop policy if exists audit_read_own on public.audit_logs;
create policy audit_read_own
on public.audit_logs for select
to authenticated
using (user_id = auth.uid());

-- IMPORTANT: no INSERT policy -> clients cannot write audit logs (Edge Functions use service role)

-- Profiles hardening (assumes profiles exists)
alter table public.profiles add column if not exists must_change_password boolean not null default false;
alter table public.profiles add column if not exists role text;
alter table public.profiles add column if not exists permissions text[];

alter table public.profiles enable row level security;

drop policy if exists profiles_read_own on public.profiles;
create policy profiles_read_own
on public.profiles for select
to authenticated
using (id = auth.uid());

-- IMPORTANT: no UPDATE policy for must_change_password here -> rotation handled by Edge Function with service role
