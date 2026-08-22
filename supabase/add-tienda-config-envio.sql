-- Fase A: config tienda ampliada (envio, COD, catalogo, stock)
-- Extiende tienda_config para soportar numeros y texto (valor_text para municipios)
-- Mantiene compat con instalacion previa (boolean valor).

-- 1) Columnas tipadas (si no existen)
alter table tienda_config add column if not exists valor_text text;
alter table tienda_config add column if not exists tipo text check (tipo in ('boolean','number','text')) default 'boolean';

-- 2) Keys nuevas (idempotente)
insert into tienda_config (key, valor, valor_text, tipo) values
  ('envio_gratis_umbral', true, '150000', 'number'),
  ('envio_tarifa_antioquia', true, '10000', 'number'),
  ('envio_tarifa_centro', true, '15000', 'number'),
  ('envio_tarifa_resto', true, '20000', 'number'),
  ('cod_recargo', true, '5000', 'number'),
  ('cod_municipios', true, 'medellin,bello,itagui,envigado,sabaneta', 'text'),
  ('mas_pedidos_dias', true, '30', 'number'),
  ('mas_pedidos_limit', true, '4', 'number'),
  ('stock_bajo_umbral', true, '10', 'number'),
  ('page_size', true, '12', 'number')
on conflict (key) do nothing;

-- 3) RLS: solo super_admin escribe (lectura publica)
drop policy if exists "tienda_config admin manage" on tienda_config;
create policy "tienda_config admin manage" on tienda_config
  for all using (
    exists (select 1 from perfiles where id = auth.uid() and rol = 'super_admin')
  ) with check (
    exists (select 1 from perfiles where id = auth.uid() and rol = 'super_admin')
  );

-- Re-afirmar public read
drop policy if exists "tienda_config public read" on tienda_config;
create policy "tienda_config public read" on tienda_config
  for select using (true);
