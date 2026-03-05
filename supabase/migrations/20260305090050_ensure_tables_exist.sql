-- 1. Create missing base tables safely
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  firebase_uid text,
  email text unique,
  full_name text,
  role text default 'CUSTOMER',
  created_at timestamptz default now()
);

create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  merchant_code text unique,
  business_name text,
  contact_person text,
  phone text,
  email text,
  address text,
  city text,
  state text,
  created_at timestamptz default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text unique,
  email text,
  full_name text,
  created_at timestamptz default now()
);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  way_id text unique,
  merchant_id uuid references public.merchants(id) on delete cascade,
  sender_name text,
  sender_phone text,
  sender_address text,
  sender_city text,
  sender_state text,
  receiver_name text,
  receiver_phone text,
  receiver_address text,
  receiver_city text,
  receiver_state text,
  delivery_fee numeric default 0,
  total_amount numeric default 0,
  assigned_rider_id uuid references public.users(id) on delete set null,
  status text default 'PENDING',
  estimated_delivery timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.shipment_tracking (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid references public.shipments(id) on delete cascade,
  status text,
  location text,
  notes text,
  timestamp timestamptz default now(),
  is_customer_visible boolean default true,
  handled_by uuid references public.users(id) on delete set null
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text unique,
  customer_name text,
  invoice_date date,
  due_date date,
  total_amount numeric,
  created_at timestamptz default now()
);

create table if not exists public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_id text unique,
  transaction_type text,
  reference_type text,
  reference_id uuid,
  amount numeric,
  created_at timestamptz default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_code text unique,
  first_name text,
  last_name text,
  job_title text,
  hire_date date,
  created_at timestamptz default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text unique,
  customer_name text,
  customer_email text,
  subject text,
  description text,
  status text default 'OPEN',
  created_at timestamptz default now()
);

-- 2. FIX THE AUDIT LOGS CRASH
-- Add new columns to the old audit_logs table
alter table if exists public.audit_logs
  add column if not exists actor_uid uuid,
  add column if not exists actor_role text,
  add column if not exists action text,
  add column if not exists table_name text,
  add column if not exists row_id text,
  add column if not exists old_record jsonb,
  add column if not exists new_record jsonb;

-- Safely remove the strict 'NOT NULL' constraint from event_type so inserts don't fail
do $$
begin
  if to_regclass('public.audit_logs') is not null then
    alter table public.audit_logs alter column event_type drop not null;
  end if;
exception when others then
  -- Ignore if column doesn't exist
end $$;
