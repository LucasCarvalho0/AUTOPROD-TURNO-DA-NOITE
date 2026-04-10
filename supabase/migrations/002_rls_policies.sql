-- ============================================================
-- AutoProd — Migration 002: RLS refinements + helper functions
-- ============================================================

-- -------------------------------------------------------
-- Helper: is current user an admin?
-- -------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid()
      and tipo = 'admin'
  );
$$;

-- -------------------------------------------------------
-- Helper: get current user's tipo
-- -------------------------------------------------------
create or replace function public.current_user_tipo()
returns text
language sql
security definer
stable
as $$
  select tipo from public.users where id = auth.uid();
$$;

-- -------------------------------------------------------
-- PRODUCTIONS — allow any authenticated user to insert
-- but only admins can delete
-- -------------------------------------------------------
drop policy if exists "Authenticated users can insert productions" on public.productions;
drop policy if exists "Authenticated users can read productions"  on public.productions;

create policy "Any authenticated user can read productions"
  on public.productions for select
  to authenticated
  using (true);

create policy "Any authenticated user can insert productions"
  on public.productions for insert
  to authenticated
  with check (true);

create policy "Only admins can delete productions"
  on public.productions for delete
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------
-- EMPLOYEES — any auth user reads, only admins write
-- -------------------------------------------------------
drop policy if exists "Authenticated users can manage employees" on public.employees;
drop policy if exists "Authenticated users can read employees"   on public.employees;

create policy "Any authenticated user can read employees"
  on public.employees for select
  to authenticated
  using (true);

create policy "Only admins can insert employees"
  on public.employees for insert
  to authenticated
  with check (public.is_admin());

create policy "Only admins can update employees"
  on public.employees for update
  to authenticated
  using (public.is_admin());

create policy "Only admins can delete employees"
  on public.employees for delete
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------
-- SETTINGS — any auth user reads, only admins update
-- -------------------------------------------------------
drop policy if exists "Admins can update settings"          on public.settings;
drop policy if exists "Authenticated users can read settings" on public.settings;

create policy "Any authenticated user can read settings"
  on public.settings for select
  to authenticated
  using (true);

create policy "Only admins can update settings"
  on public.settings for update
  to authenticated
  using (public.is_admin());

-- -------------------------------------------------------
-- View: today_ranking
-- Facilita queries do dashboard sem calcular no cliente
-- -------------------------------------------------------
create or replace view public.today_ranking as
select
  p.employee_id,
  e.nome as employee_nome,
  e.ativo,
  count(*)::int as quantidade,
  round(count(*) * 100.0 / sum(count(*)) over (), 1) as percentual
from public.productions p
join public.employees e on e.id = p.employee_id
where p.timestamp >= current_date::timestamptz
  and p.timestamp <  (current_date + interval '1 day')::timestamptz
group by p.employee_id, e.nome, e.ativo
order by quantidade desc;

-- -------------------------------------------------------
-- View: hourly_production_today
-- Produção por hora para o gráfico do dashboard
-- -------------------------------------------------------
create or replace view public.hourly_production_today as
select
  extract(hour from timestamp)::int as hora,
  count(*)::int as quantidade
from public.productions
where timestamp >= current_date::timestamptz
  and timestamp <  (current_date + interval '1 day')::timestamptz
group by hora
order by hora;

-- -------------------------------------------------------
-- Function: register_vin (atomic — evita race condition de VIN duplicado)
-- Chame via RPC: supabase.rpc('register_vin', { vin, employee_id, versao })
-- -------------------------------------------------------
create or replace function public.register_vin(
  p_vin         text,
  p_employee_id uuid,
  p_versao      text
)
returns json
language plpgsql
security definer
as $$
declare
  v_existing_id uuid;
  v_new_id      uuid;
begin
  -- Validate versao
  if p_versao not in ('L3 Exclusive', 'L2 Advanced') then
    return json_build_object('success', false, 'error', 'Versão inválida');
  end if;

  -- Check VIN length
  if length(trim(p_vin)) < 10 then
    return json_build_object('success', false, 'error', 'VIN muito curto');
  end if;

  -- Atomic duplicate check + insert
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

-- Grant execute to authenticated users
grant execute on function public.register_vin to authenticated;

-- -------------------------------------------------------
-- Function: daily_stats
-- Stats rápidas do dia para o dashboard
-- -------------------------------------------------------
create or replace function public.daily_stats()
returns json
language sql
security definer
stable
as $$
  select json_build_object(
    'total_hoje',      (
      select count(*) from public.productions
      where timestamp >= current_date::timestamptz
    ),
    'settings',        (
      select row_to_json(s) from public.settings s limit 1
    ),
    'ultimo_vin',      (
      select row_to_json(p)
      from (
        select pr.vin, e.nome as employee_nome, pr.versao, pr.timestamp
        from public.productions pr
        join public.employees e on e.id = pr.employee_id
        where pr.timestamp >= current_date::timestamptz
        order by pr.timestamp desc
        limit 1
      ) p
    )
  );
$$;

grant execute on function public.daily_stats to authenticated;
