-- Seguimiento de pedidos: fechas por estado + datos de pago + tabla de avisos de stock
alter table public.pedidos add column if not exists fecha_aprobado timestamptz null;
alter table public.pedidos add column if not exists fecha_preparando timestamptz null;
alter table public.pedidos add column if not exists fecha_enviado timestamptz null;
alter table public.pedidos add column if not exists fecha_entregado timestamptz null;
alter table public.pedidos add column if not exists metodo_pago text null;
alter table public.pedidos add column if not exists referencia_pago text null;
alter table public.pedidos add column if not exists pagado_at timestamptz null;

-- Backfill: pedidos ya aprobados/enviados/entregados antes de esta migración
-- usan created_at aprox para no romper el timeline existente.
update public.pedidos
set fecha_aprobado = created_at
where estado = 'aprobado' and fecha_aprobado is null;
update public.pedidos
set fecha_aprobado = created_at
where estado in ('preparando', 'enviado', 'entregado') and fecha_aprobado is null;
update public.pedidos
set fecha_preparando = created_at
where estado in ('preparando', 'enviado', 'entregado') and fecha_preparando is null;
update public.pedidos
set fecha_enviado = created_at
where estado in ('enviado', 'entregado') and fecha_enviado is null;
update public.pedidos
set fecha_entregado = created_at
where estado = 'entregado' and fecha_entregado is null;

create table if not exists public.avisos_stock (
  id uuid primary key default gen_random_uuid(),
  producto_id text not null references public.productos(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  unique (producto_id, email)
);