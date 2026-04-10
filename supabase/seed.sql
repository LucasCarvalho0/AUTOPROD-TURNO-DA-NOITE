-- ============================================================
-- AutoProd — Seed Data
-- Executar após migration: supabase db reset
-- ============================================================

-- ============================================================
-- SETTINGS (única linha)
-- ============================================================
insert into public.settings (meta, turno_inicio, turno_fim, hora_extra)
values (120, '15:00', '23:48', '01:00')
on conflict do nothing;

-- ============================================================
-- EMPLOYEES (funcionários de exemplo)
-- ============================================================
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

-- ============================================================
-- ADMIN USER
-- 
-- 1. Crie o usuário no Supabase Dashboard → Authentication → Users
--    Email: 000001@autoprod.internal
--    Password: Admin@2024
--
-- 2. Copie o UUID gerado e substitua abaixo
--
-- 3. Depois execute este insert:
-- ============================================================

-- insert into public.users (id, matricula, nome, tipo)
-- values (
--   '<UUID_DO_USUARIO_CRIADO_NO_AUTH>',
--   '000001',
--   'Maria Andrade',
--   'admin'
-- );

-- ============================================================
-- SAMPLE PRODUCTIONS (para testes)
-- Descomente se quiser dados de demonstração
-- ============================================================

-- do $$
-- declare
--   emp_id uuid;
--   vins text[] := array[
--     '1HGBH41JXMN109186','3VWFE21C04M000001','9BWZZZ377VT004251',
--     'JH4KA7650LC015691','2T1KR32E58C709892','WVGZZZ1KZAM189748',
--     '5GAKRDED5CJ396099','1FTFW1ET5DFC10312','JN1AZ4EH5FM730841',
--     'KMHCN46C28U268291'
--   ];
--   versions text[] := array['L3 Exclusive','L2 Advanced'];
--   v text;
-- begin
--   foreach v in array vins loop
--     select id into emp_id from public.employees order by random() limit 1;
--     insert into public.productions (vin, employee_id, versao, timestamp)
--     values (
--       v, emp_id,
--       versions[1 + floor(random()*2)::int],
--       now() - (random() * interval '8 hours')
--     );
--   end loop;
-- end $$;
