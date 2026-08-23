-- Modo revive: cuando el directo termina, muestra la transmision como replay
insert into tienda_config (key, valor, valor_text, tipo)
values ('live_revive', true, '', 'boolean')
on conflict (key) do nothing;
