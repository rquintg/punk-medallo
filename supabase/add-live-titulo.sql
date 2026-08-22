-- Titulo personalizado de la transmision en vivo (vacio = "En vivo ahora")
insert into tienda_config (key, valor, valor_text, tipo)
values ('live_titulo', true, '', 'text')
on conflict (key) do nothing;
