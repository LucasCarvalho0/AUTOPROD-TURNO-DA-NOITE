-- ============================================================
-- AutoProd — Schema inicial
-- Executar via: supabase db push
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- Autenticação via Supabase Auth + dados do usuário
-- ============================================================
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  matricula   text not null unique,
  nome        text not null,
  tipo        text not null default 'operator' check (tipo in ('admin', 'operator')),
  created_at  timestamptz not null default now()
);

-- RLS
alter table public.users enable row level security;

create policy "Users can read own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Admins can manage users"
  on public.users for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and tipo = 'admin'
    )
  );

-- ============================================================
-- EMPLOYEES TABLE
-- Funcionários do chão de fábrica
-- ============================================================
create table if not exists public.employees (
  id          uuid primary key default uuid_generate_v4(),
  nome        text not null,
  ativo       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger employees_updated_at
  before update on public.employees
  for each row execute function update_updated_at();

-- RLS
alter table public.employees enable row level security;

create policy "Authenticated users can read employees"
  on public.employees for select
  to authenticated
  using (true);

create policy "Authenticated users can manage employees"
  on public.employees for all
  to authenticated
  using (true);

-- ============================================================
-- PRODUCTIONS TABLE
-- Cada VIN bipado
-- ============================================================
create table if not exists public.productions (
  id          uuid primary key default uuid_generate_v4(),
  vin         text not null,
  employee_id uuid not null references public.employees(id) on delete restrict,
  versao      text not null check (versao in ('L3 Exclusive', 'L2 Advanced')),
  timestamp   timestamptz not null default now()
);

-- Unique VIN constraint
create unique index if not exists productions_vin_unique on public.productions(vin);

-- Index for date-range queries
create index if not exists productions_timestamp_idx on public.productions(timestamp desc);
create index if not exists productions_employee_idx on public.productions(employee_id);

-- RLS
alter table public.productions enable row level security;

create policy "Authenticated users can read productions"
  on public.productions for select
  to authenticated
  using (true);

create policy "Authenticated users can insert productions"
  on public.productions for insert
  to authenticated
  with check (true);

-- ============================================================
-- SETTINGS TABLE
-- Configurações do turno (única linha)
-- ============================================================
create table if not exists public.settings (
  id            uuid primary key default uuid_generate_v4(),
  meta          integer not null default 90 check (meta > 0),
  turno_inicio  text not null default '06:00',
  turno_fim     text not null default '16:48',
  hora_extra    text not null default '19:00',
  updated_at    timestamptz not null default now()
);

-- RLS
alter table public.settings enable row level security;

create policy "Authenticated users can read settings"
  on public.settings for select
  to authenticated
  using (true);

create policy "Admins can update settings"
  on public.settings for update
  to authenticated
  using (true);

-- ============================================================
-- DAILY RESETS LOG TABLE
-- Registro dos resets diários automáticos
-- ============================================================
create table if not exists public.daily_resets (
  id        uuid primary key default uuid_generate_v4(),
  reset_at  timestamptz not null default now()
);

alter table public.daily_resets enable row level security;

create policy "Authenticated can read resets"
  on public.daily_resets for select
  to authenticated
  using (true);

-- ============================================================
-- REALTIME
-- Habilitar realtime nas tabelas necessárias
-- ============================================================
alter publication supabase_realtime add table public.productions;
alter publication supabase_realtime add table public.employees;
alter publication supabase_realtime add table public.settings;
