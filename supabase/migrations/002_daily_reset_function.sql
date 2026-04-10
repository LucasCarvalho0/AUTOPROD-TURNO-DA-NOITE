-- ============================================================
-- Migration 002: Daily reset stored function + cron job
-- ============================================================

-- Stored procedure para reset diário
-- Pode ser chamado pela Edge Function ou manualmente
create or replace function public.daily_reset()
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  -- Log do reset
  insert into public.daily_resets (reset_at)
  values (now());

  -- Retornar estatísticas do dia que foi "resetado"
  select json_build_object(
    'reset_at', now(),
    'total_productions_today', (
      select count(*)
      from public.productions
      where timestamp::date = current_date
    )
  ) into result;

  return result;
end;
$$;

-- Grant para usuários autenticados chamarem a função
grant execute on function public.daily_reset() to authenticated;

-- ============================================================
-- View: today_ranking
-- Facilita queries de ranking do dia atual
-- ============================================================
create or replace view public.today_ranking as
select
  e.id as employee_id,
  e.nome,
  e.ativo,
  count(p.id) as total
from public.employees e
left join public.productions p
  on p.employee_id = e.id
  and p.timestamp::date = current_date
where e.ativo = true
group by e.id, e.nome, e.ativo
order by total desc;

-- Grant
grant select on public.today_ranking to authenticated;

-- ============================================================
-- View: hourly_production_today
-- Produção por hora do dia atual
-- ============================================================
create or replace view public.hourly_production_today as
select
  extract(hour from timestamp) as hora,
  count(*) as quantidade
from public.productions
where timestamp::date = current_date
group by hora
order by hora;

grant select on public.hourly_production_today to authenticated;

-- ============================================================
-- Function: get_monthly_report
-- Relatório mensal para exportação
-- ============================================================
create or replace function public.get_monthly_report(
  p_year  integer default extract(year from now())::integer,
  p_month integer default extract(month from now())::integer
)
returns table (
  employee_nome text,
  total_producao bigint,
  l3_exclusive   bigint,
  l2_advanced    bigint
)
language sql
security definer
as $$
  select
    e.nome as employee_nome,
    count(p.id) as total_producao,
    count(p.id) filter (where p.versao = 'L3 Exclusive') as l3_exclusive,
    count(p.id) filter (where p.versao = 'L2 Advanced')  as l2_advanced
  from public.employees e
  left join public.productions p
    on p.employee_id = e.id
    and extract(year  from p.timestamp) = p_year
    and extract(month from p.timestamp) = p_month
  where e.ativo = true
  group by e.id, e.nome
  order by total_producao desc;
$$;

grant execute on function public.get_monthly_report(integer, integer) to authenticated;
