create table if not exists public.barrel_measurements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid null,
  barrel_uuid uuid null,
  barrel_number text null,
  source_table text null,
  source_key text null,
  measurement_type text not null default 'angels_share',
  measured_at timestamptz not null default now(),
  before_volume_l numeric null,
  before_abv_percent numeric null,
  after_volume_l numeric null,
  after_abv_percent numeric null,
  volume_loss_l numeric null,
  volume_loss_percent numeric null,
  lal_before numeric null,
  lal_after numeric null,
  lal_loss numeric null,
  summary text null,
  created_at timestamptz not null default now()
);

create index if not exists barrel_measurements_barrel_uuid_idx on public.barrel_measurements(barrel_uuid);
create index if not exists barrel_measurements_barrel_number_idx on public.barrel_measurements(barrel_number);
create index if not exists barrel_measurements_measured_at_idx on public.barrel_measurements(measured_at);
