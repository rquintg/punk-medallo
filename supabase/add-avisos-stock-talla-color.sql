-- Avisos de stock: talla y color opcionales para avisos por combinación específica
alter table public.avisos_stock add column if not exists talla text null;
alter table public.avisos_stock add column if not exists color text null;