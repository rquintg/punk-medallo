-- Cupones de descuento
-- Tipos: porcentaje (con tope COP opcional), fijo (COP) y envio (envío gratis)
-- Aplicar antes de lanzar: revisar pagos contra entrega/checkout

create table if not exists public.cupones (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null check (codigo = upper(codigo)),
  tipo text not null check (tipo in ('porcentaje', 'fijo', 'envio')),
  valor integer not null check (valor > 0),
  descuento_maximo integer check (descuento_maximo is null or descuento_maximo > 0),
  monto_minimo integer not null default 0 check (monto_minimo >= 0),
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  max_usos integer check (max_usos is null or max_usos > 0),
  usos integer not null default 0 check (usos >= 0),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.cupon_redenciones (
  id uuid primary key default gen_random_uuid(),
  cupon_id uuid not null references public.cupones(id) on delete cascade,
  email text not null,
  pedido_id uuid references public.pedidos(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (cupon_id, email)
);

-- Histórico por pedido (inmutable aunque el cupón se borre/cambie)
alter table public.pedidos
  add column if not exists cupon_id uuid references public.cupones(id) on delete set null,
  add column if not exists cupon_codigo text,
  add column if not exists descuento integer not null default 0;

-- RLS: lectura pública del catálogo de cupones (datos no sensibles);
-- escrituras solo vía service role (app/admin).
alter table public.cupones enable row level security;
alter table public.cupon_redenciones enable row level security;

drop policy if exists "cupones select publico" on public.cupones;
create policy "cupones select publico" on public.cupones
  for select using (true);

-- Reserva atómica de un uso (evita carreras en picos de tráfico):
-- solo consume si está activo, dentro de vigencia y con cupo disponible.
create or replace function public.consumir_cupon(p_cupon_id uuid)
returns boolean
language plpgsql
as $$
declare
  v_ok boolean;
begin
  update public.cupones set usos = usos + 1
  where id = p_cupon_id
    and activo
    and (max_usos is null or usos < max_usos)
    and (fecha_inicio is null or fecha_inicio <= now())
    and (fecha_fin is null or fecha_fin >= now())
  returning true into v_ok;
  return coalesce(v_ok, false);
end $$;

create or replace function public.liberar_cupon(p_cupon_id uuid)
returns void
language plpgsql
as $$
begin
  update public.cupones set usos = greatest(usos - 1, 0)
  where id = p_cupon_id;
end $$;