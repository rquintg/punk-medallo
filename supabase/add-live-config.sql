-- Transmision en vivo (temporal, toggle desde /admin/tienda)
-- live_url acepta cualquier link de YouTube o Facebook; el embed lo arma el codigo.
insert into tienda_config (key, valor, valor_text, tipo) values
  ('mostrar_live', true, '', 'boolean'),
  ('live_url', true, '', 'text')
on conflict (key) do nothing;
