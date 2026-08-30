-- Visibilidad de Tienda y Boletería desde admin/tienda (toggle)
-- Mismo patrón que add-tienda-config.sql (key text PK, valor boolean, valor_text text, tipo text)
insert into tienda_config (key, valor, valor_text, tipo)
values
  ('tienda_activa', true, 'true', 'boolean'),
  ('boleteria_activa', true, 'true', 'boolean')
on conflict (key) do nothing;
