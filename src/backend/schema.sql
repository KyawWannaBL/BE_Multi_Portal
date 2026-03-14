-- Enterprise delivery workflow schema
create extension if not exists "uuid-ossp";

create table if not exists privileges (
  code text primary key,
  label_en text not null,
  label_my text,
  module text not null
);

create table if not exists roles (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists role_privileges (
  role_id uuid not null references roles(id) on delete cascade,
  privilege_code text not null references privileges(code) on delete cascade,
  primary key (role_id, privilege_code)
);

create table if not exists warehouses (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  name text not null,
  branch_code text,
  address text,
  lat double precision,
  lng double precision,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists deliveries (
  id uuid primary key default uuid_generate_v4(),
  tracking_no text not null unique,
  external_order_no text,
  qr_code_value text,
  merchant_id uuid,
  merchant_name text not null,
  merchant_phone text,
  merchant_address text,
  receiver_name text not null,
  receiver_phone text,
  receiver_address text,
  township text,
  service_level text,
  payment_mode text,
  cod_amount numeric(14,2) not null default 0,
  workflow_state text not null default 'DRAFT',
  fragile boolean not null default false,
  temperature_sensitive boolean not null default false,
  requires_warehouse_check boolean not null default true,
  pickup_window text,
  delivery_window text,
  special_note text,
  version_no integer not null default 1,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists delivery_parcels (
  id uuid primary key default uuid_generate_v4(),
  delivery_id uuid not null references deliveries(id) on delete cascade,
  line_no integer not null,
  sku text,
  description text,
  qty integer not null default 1,
  weight_kg numeric(10,3) not null default 0,
  declared_value numeric(14,2) not null default 0,
  barcode_value text,
  qr_value text,
  created_at timestamptz not null default now()
);

create table if not exists delivery_assignments (
  id uuid primary key default uuid_generate_v4(),
  delivery_id uuid not null references deliveries(id) on delete cascade,
  rider_id uuid,
  rider_name text,
  batch_id uuid,
  assigned_by uuid,
  assigned_at timestamptz not null default now(),
  status text not null default 'ACTIVE'
);

create table if not exists route_batches (
  id uuid primary key default uuid_generate_v4(),
  batch_code text not null unique,
  warehouse_id uuid references warehouses(id),
  rider_id uuid,
  rider_name text,
  route_status text not null default 'PLANNED',
  planned_stop_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists workflow_events (
  id uuid primary key default uuid_generate_v4(),
  delivery_id uuid not null references deliveries(id) on delete cascade,
  event_type text not null,
  from_state text,
  to_state text,
  actor_id uuid,
  actor_name text,
  actor_role text,
  actor_branch text,
  lat double precision,
  lng double precision,
  reason text,
  event_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_workflow_events_delivery_id on workflow_events(delivery_id, created_at desc);

create table if not exists delivery_evidence (
  id uuid primary key default uuid_generate_v4(),
  delivery_id uuid not null references deliveries(id) on delete cascade,
  event_id uuid references workflow_events(id) on delete set null,
  evidence_type text not null,
  storage_bucket text not null,
  storage_path text not null,
  file_name text,
  mime_type text,
  width integer,
  height integer,
  blur_score numeric(8,2),
  brightness_score numeric(8,2),
  contrast_score numeric(8,2),
  quality_score numeric(8,2),
  guidance jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists delivery_signatures (
  id uuid primary key default uuid_generate_v4(),
  delivery_id uuid not null references deliveries(id) on delete cascade,
  event_id uuid references workflow_events(id) on delete set null,
  signer_name text,
  signer_role text,
  signed_at timestamptz not null default now(),
  signature_bucket text not null,
  signature_path text not null,
  signature_metadata jsonb not null default '{}'::jsonb
);

create table if not exists ocr_extractions (
  id uuid primary key default uuid_generate_v4(),
  delivery_id uuid references deliveries(id) on delete set null,
  evidence_id uuid references delivery_evidence(id) on delete set null,
  engine_name text not null,
  raw_text text,
  structured_rows jsonb not null default '[]'::jsonb,
  confidence numeric(5,2),
  review_status text not null default 'PENDING_REVIEW',
  created_at timestamptz not null default now()
);

create table if not exists live_route_points (
  id uuid primary key default uuid_generate_v4(),
  batch_id uuid references route_batches(id) on delete cascade,
  rider_id uuid,
  lat double precision not null,
  lng double precision not null,
  heading numeric(8,2),
  speed_kmh numeric(8,2),
  accuracy_m numeric(8,2),
  recorded_at timestamptz not null default now()
);

create index if not exists idx_live_route_points_batch_time on live_route_points(batch_id, recorded_at desc);

create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  actor_id uuid,
  actor_name text,
  actor_role text,
  before_data jsonb,
  after_data jsonb,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
