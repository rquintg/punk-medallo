-- ============================================================
-- BOLETERIA — eventos vendibles, tipos de boleta y boletas unicas
-- Ver PLAN-BOLETERIA.md. Idempotente.
-- ============================================================

-- 1) Eventos vendibles (creacion manual desde admin)
create table if not exists eventos_boletos (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  descripcion text,
  lugar text not null,
  fecha_evento timestamptz not null,
  hora_puertas text,
  edad_minima integer,
  imagen_url text,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- 2) Tipos de boleta (1..N por evento: General, VIP...)
create table if not exists tipos_boleta (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references eventos_boletos(id) on delete cascade,
  nombre text not null,
  precio integer not null check (precio > 0),
  cantidad_total integer not null check (cantidad_total > 0),
  orden integer not null default 0,
  activo boolean not null default true
);

-- 3) Boletas: unidad unica e intransferible
create table if not exists boletas (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,          -- PM-TKT-XXXXXX (legible)
  firma text not null,                  -- HMAC(codigo, TICKET_SECRET)
  pedido_id uuid not null references pedidos(id) on delete cascade,
  tipo_id uuid not null references tipos_boleta(id),
  evento_id uuid not null references eventos_boletos(id),
  titular_nombre text not null,
  titular_email text not null,
  usuario_id uuid references auth.users(id) on delete set null,
  estado text not null default 'valida' check (estado in ('valida','usada','anulada')),
  escaneada_en timestamptz,
  escaneada_por uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 4) Items de pedido pueden ser boletas (producto_id ya era nullable)
alter table pedido_items add column if not exists tipo_boleta_id uuid references tipos_boleta(id) on delete set null;
alter table pedido_items add column if not exists evento_id uuid references eventos_boletos(id) on delete set null;

-- 5) Indices de consulta frecuente
create index if not exists idx_tipos_evento on tipos_boleta(evento_id);
create index if not exists idx_boletas_tipo on boletas(tipo_id);
create index if not exists idx_boletas_evento_estado on boletas(evento_id, estado);
create index if not exists idx_boletas_usuario on boletas(usuario_id);
create index if not exists idx_pedido_items_tipo_boleta on pedido_items(tipo_boleta_id);

-- 6) Anti-overbooking a nivel BD: COUNT(activas) <= cantidad_total incluso con
--    pagos simultaneos aprobandose al mismo tiempo (deferrable = al commit).
create or replace function check_capacidad_boletas() returns trigger as $$
declare
  activas integer;
  tope integer;
begin
  select count(*) into activas from boletas where tipo_id = new.tipo_id and estado <> 'anulada';
  select cantidad_total into tope from tipos_boleta where id = new.tipo_id;
  if tope is null or activas > tope then
    raise exception 'Capacidad agotada para el tipo de boleta %', new.tipo_id;
  end if;
  return new;
end $$ language plpgsql;

drop trigger if exists trg_capacidad_boletas on boletas;
create constraint trigger trg_capacidad_boletas
  after insert on boletas
  deferrable initially deferred
  for each row execute function check_capacidad_boletas();

-- 7) RLS: lectura publica de catalogo; escrituras SOLO service role (actions);
--    boletas visibles solo para su dueno (ademas del service role que bypasea RLS).
alter table eventos_boletos enable row level security;
drop policy if exists "eventos public read" on eventos_boletos;
create policy "eventos public read" on eventos_boletos for select using (true);

alter table tipos_boleta enable row level security;
drop policy if exists "tipos public read" on tipos_boleta;
create policy "tipos public read" on tipos_boleta for select using (true);

alter table boletas enable row level security;
drop policy if exists "boletas owner read" on boletas;
create policy "boletas owner read" on boletas for select using (auth.uid() = usuario_id);
