-- ============================================================
-- AutoProd — Script Completo de Inicialização
-- Copie e cole este script integralmente no SQL Editor do Supabase
-- ============================================================

-- 1. EXTENSÕES e SCHEMA
create extension if not exists "uuid-ossp";

-- 2. TABELAS
-- Users (vinculado ao auth.users)
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  matricula   text not null unique,
  nome        text not null,
  tipo        text not null default 'operator' check (tipo in ('admin', 'operator')),
  cargo       text, -- Cargo/Função personalizada (ex: Administrativo da Noite)
  created_at  timestamptz not null default now()
);

-- Employees
create table if not exists public.employees (
  id          uuid primary key default uuid_generate_v4(),
  nome        text not null,
  ativo       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Productions
create table if not exists public.productions (
  id          uuid primary key default uuid_generate_v4(),
  vin         text not null,
  employee_id uuid not null references public.employees(id) on delete restrict,
  versao      text not null check (versao in ('L3 Exclusive', 'L2 Advanced')),
  timestamp   timestamptz not null default now()
);

-- Settings
create table if not exists public.settings (
  id            uuid primary key default uuid_generate_v4(),
  meta          integer not null default 90 check (meta > 0),
  turno_inicio  text not null default '16:48',
  turno_fim     text not null default '02:00',
  hora_extra    text not null default '04:00',
  updated_at    timestamptz not null default now()
);

-- Daily Resets
create table if not exists public.daily_resets (
  id        uuid primary key default uuid_generate_v4(),
  reset_at  timestamptz not null default now()
);

-- 3.ÍNDICES E CONSTRAINTS
create unique index if not exists productions_vin_unique on public.productions(vin);
create index if not exists productions_timestamp_idx on public.productions(timestamp desc);
create index if not exists productions_employee_idx on public.productions(employee_id);

-- 4. TRIGGERS (Auto-update updated_at)
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists employees_updated_at on public.employees;
create trigger employees_updated_at
  before update on public.employees
  for each row execute function update_updated_at();

-- 5. FUNÇÕES AUXILIARES E RLS
alter table public.users enable row level security;
alter table public.employees enable row level security;
alter table public.productions enable row level security;
alter table public.settings enable row level security;
alter table public.daily_resets enable row level security;

-- Admin Helpers
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.users where id = auth.uid() and tipo = 'admin');
$$;

create or replace function public.current_user_tipo()
returns text language sql security definer stable as $$
  select tipo from public.users where id = auth.uid();
$$;

-- Políticas USERS
drop policy if exists "Users can read own data" on public.users;
create policy "Users can read own data" on public.users for select using (auth.uid() = id);

drop policy if exists "Admins can manage users" on public.users;
create policy "Admins can manage users" on public.users for all using (public.is_admin());

-- Políticas EMPLOYEES
drop policy if exists "Any authenticated user can read employees" on public.employees;
create policy "Any authenticated user can read employees" on public.employees for select to authenticated using (true);

drop policy if exists "Only admins can manage employees" on public.employees;
create policy "Only admins can manage employees" on public.employees for all to authenticated using (public.is_admin());

-- Políticas PRODUCTIONS
drop policy if exists "Any authenticated user can read productions" on public.productions;
create policy "Any authenticated user can read productions" on public.productions for select to authenticated using (true);

drop policy if exists "Any authenticated user can insert productions" on public.productions;
create policy "Any authenticated user can insert productions" on public.productions for insert to authenticated with check (true);

drop policy if exists "Only admins can delete productions" on public.productions;
create policy "Only admins can delete productions" on public.productions for delete to authenticated using (public.is_admin());

-- Políticas SETTINGS
drop policy if exists "Any authenticated user can read settings" on public.settings;
create policy "Any authenticated user can read settings" on public.settings for select to authenticated using (true);

drop policy if exists "Only admins can update settings" on public.settings;
create policy "Only admins can update settings" on public.settings for update to authenticated using (public.is_admin());

-- Políticas DAILY_RESETS
drop policy if exists "Authenticated can read resets" on public.daily_resets;
create policy "Authenticated can read resets" on public.daily_resets for select to authenticated using (true);


-- 6. VIEWS (Dashboard)
drop view if exists public.today_ranking;
create or replace view public.today_ranking as
select
  p.employee_id,
  e.nome as employee_nome,
  e.ativo,
  count(*)::int as quantidade,
  round(count(*) * 100.0 / nullif(sum(count(*)) over (), 0), 1) as percentual
from public.productions p
join public.employees e on e.id = p.employee_id
where p.timestamp >= current_date::timestamptz
  and p.timestamp < (current_date + interval '1 day')::timestamptz
group by p.employee_id, e.nome, e.ativo
order by quantidade desc;

grant select on public.today_ranking to authenticated;
grant select on public.today_ranking to anon;

drop view if exists public.hourly_production_today;
create or replace view public.hourly_production_today as
select
  extract(hour from timestamp)::int as hora,
  count(*)::int as quantidade
from public.productions
where timestamp >= current_date::timestamptz
  and timestamp < (current_date + interval '1 day')::timestamptz
group by hora
order by hora;

grant select on public.hourly_production_today to authenticated;
grant select on public.hourly_production_today to anon;


-- 7. FUNCTIONS (RPC)
-- Register VIN
create or replace function public.register_vin(p_vin text, p_employee_id uuid, p_versao text)
returns json language plpgsql security definer as $$
declare
  v_new_id uuid;
begin
  if p_versao not in ('L3 Exclusive', 'L2 Advanced') then
    return json_build_object('success', false, 'error', 'Versão inválida');
  end if;
  begin
    insert into public.productions (vin, employee_id, versao)
    values (upper(trim(p_vin)), p_employee_id, p_versao)
    returning id into v_new_id;
  exception
    when unique_violation then
      return json_build_object('success', false, 'error', 'VIN já registrado');
  end;
  return json_build_object('success', true, 'id', v_new_id);
end;
$$;
grant execute on function public.register_vin to authenticated;

-- Daily Stats
create or replace function public.daily_stats()
returns json language sql security definer stable as $$
  select json_build_object(
    'total_hoje', (select count(*) from public.productions where timestamp >= current_date),
    'settings',   (select row_to_json(s) from public.settings s limit 1),
    'ultimo_vin', (
      select row_to_json(p) from (
        select pr.vin, e.nome as employee_nome, pr.versao, pr.timestamp
        from public.productions pr
        join public.employees e on e.id = pr.employee_id
        where pr.timestamp >= current_date::timestamptz
          and pr.timestamp < (current_date + interval '1 day')::timestamptz
        order by pr.timestamp desc limit 1
      ) p
    )
  );
$$;
grant execute on function public.daily_stats to authenticated;

-- Daily Reset Log
create or replace function public.daily_reset()
returns json language plpgsql security definer as $$
begin
  insert into public.daily_resets (reset_at) values (now());
  return json_build_object('success', true, 'reset_at', now());
end;
$$;
grant execute on function public.daily_reset to authenticated;

-- Monthly Report
create or replace function public.get_monthly_report(p_year integer, p_month integer)
returns table (employee_nome text, total_producao bigint, l3_exclusive bigint, l2_advanced bigint)
language sql security definer as $$
  select
    e.nome as employee_nome,
    count(p.id) as total_producao,
    count(p.id) filter (where p.versao = 'L3 Exclusive') as l3_exclusive,
    count(p.id) filter (where p.versao = 'L2 Advanced') as l2_advanced
  from public.employees e
  left join public.productions p on p.employee_id = e.id
    and extract(year from p.timestamp) = p_year
    and extract(month from p.timestamp) = p_month
  where e.ativo = true
  group by e.id, e.nome
  order by total_producao desc;
$$;
grant execute on function public.get_monthly_report to authenticated;


-- 8. REALTIME
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'productions') then
    alter publication supabase_realtime add table public.productions;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'employees') then
    alter publication supabase_realtime add table public.employees;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'settings') then
    alter publication supabase_realtime add table public.settings;
  end if;
end $$;


-- 9. DADOS INICIAIS (SEED)
-- Configurações (Meta 90, Turno 16:48-02:00, Hora Extra até 04:00)
insert into public.settings (meta, turno_inicio, turno_fim, hora_extra)
values (90, '16:48', '02:00', '04:00')
on conflict do nothing;

-- Funcionários de exemplo
insert into public.employees (nome, ativo) values
  ('Carlos Souza',    true),
  ('Marcos Lima',     true),
  ('Ana Ferreira',    true),
  ('João Pereira',    true),
  ('Beatriz Costa',   true),
  ('Rafael Mendes',   true),
  ('Tatiane Oliveira',true),
  ('Lucas Rocha',     true)
on conflict do nothing;

-- Usuário Admin (Lucas Carvalho)
-- Observação: A criação em auth.users deve ser feita via Dashboard ou script específico do Supabase
-- Estamos aqui consolidando os dados para o perfil público
insert into public.users (id, matricula, nome, tipo, cargo)
select id, '116221', 'Lucas Carvalho', 'admin', 'Administrativo da Noite'
from auth.users where email = '116221@autoprod.internal'
on conflict (matricula) do update
set nome = excluded.nome, cargo = excluded.cargo, tipo = excluded.tipo;
