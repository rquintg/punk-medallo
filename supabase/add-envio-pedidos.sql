-- Agrega columna envio a pedidos (costo de envío en COP, 0 = gratis)
alter table public.pedidos add column if not exists envio integer not null default 0;
