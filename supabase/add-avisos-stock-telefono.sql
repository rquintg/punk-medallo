-- Avisos de stock: teléfono (WhatsApp) opcional por aviso
alter table public.avisos_stock add column if not exists telefono text null;