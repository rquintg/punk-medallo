-- Registra aceptación de políticas (cambios + privacidad) en el checkout
alter table public.pedidos add column if not exists acepta_politicas boolean not null default false;