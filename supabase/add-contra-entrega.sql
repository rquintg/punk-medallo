-- Pago contra entrega: recargo por pedido (desglosado, no dentro de envio)
alter table public.pedidos add column if not exists recargo integer not null default 0;