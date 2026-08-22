-- Logo configurable desde /admin/tienda (Configuración → Marca)
-- Vacío = usa el default local (/images/Logo-Punk-Medallo-2024 Blanco.png).
insert into tienda_config (key, valor, valor_text, tipo)
values ('logo_url', true, '', 'text')
on conflict (key) do nothing;
