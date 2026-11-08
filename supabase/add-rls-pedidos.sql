-- RLS de pedidos / pedido_items (versionado; antes vivía solo en el dashboard).
--
-- Contrato:
--   * SELECT  -> solo el dueño del pedido (authenticated). `anon` no lee nada
--                (los pedidos guardan nombre, teléfono, dirección y correo).
--   * INSERT/UPDATE/DELETE -> service role desde el servidor. El checkout
--                (`/api/checkout` y `/api/boletas/checkout`) escribe con
--                service role y valida stock, precios, cupón y usuario ahí.
--
-- Contexto: el checkout de invitado fallaba con
-- `42501 new row violates row-level security policy for table "pedidos"`
-- porque `INSERT ... RETURNING` exige que la política SELECT deje ver la fila
-- nueva (anon estaba en `false`) y porque las policies `guest_*` de
-- `pedido_items` validaban pertenencia con un EXISTS sobre `pedidos`, que
-- `anon` tampoco puede leer. Esas policies se eliminan: eran inoperantes.
--
-- Idempotente. Aplicar en el SQL Editor de Supabase.

alter table public.pedidos enable row level security;
alter table public.pedido_items enable row level security;

-- ---------------------------------------------------------------------------
-- pedidos
-- ---------------------------------------------------------------------------

-- El dueño ve sus pedidos.
drop policy if exists "auth_select_own_pedidos" on public.pedidos;
create policy "auth_select_own_pedidos" on public.pedidos
  for select to authenticated
  using (usuario_id = auth.uid());

-- anon nunca lee pedidos (defensa explícita; sin política ya sería deny).
drop policy if exists "anon_select_none" on public.pedidos;
create policy "anon_select_none" on public.pedidos
  for select to anon
  using (false);

-- Sin escrituras anónimas: permitían crear pedidos falsos por PostgREST con
-- la publishable key. El checkout los crea con service role.
drop policy if exists "anon_insert_pedidos_guest" on public.pedidos;

-- Se mantiene el insert autenticado del propio pedido (un usuario solo puede
-- crear filas atribuidas a sí mismo). El flujo real usa service role.
drop policy if exists "auth_insert_own_pedidos" on public.pedidos;
create policy "auth_insert_own_pedidos" on public.pedidos
  for insert to authenticated
  with check (usuario_id = auth.uid());

-- ---------------------------------------------------------------------------
-- pedido_items
-- ---------------------------------------------------------------------------

-- Ítems visibles solo para el dueño del pedido.
drop policy if exists "Items visibles para el dueño del pedido" on public.pedido_items;
create policy "Items visibles para el dueño del pedido" on public.pedido_items
  for select to authenticated
  using (
    exists (
      select 1
      from public.pedidos p
      where p.id = pedido_items.pedido_id
        and p.usuario_id = auth.uid()
    )
  );

-- Insert autenticado solo en pedidos propios.
drop policy if exists "Items creados con el pedido" on public.pedido_items;
create policy "Items creados con el pedido" on public.pedido_items
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.pedidos p
      where p.id = pedido_items.pedido_id
        and p.usuario_id = auth.uid()
    )
  );

-- Policies de invitado: nunca podían pasar (el EXISTS corría como `anon`, que
-- no puede leer `pedidos`) y quedaban como superficie de ataque. Fuera.
drop policy if exists "guest_insert_pedido_items" on public.pedido_items;
drop policy if exists "guest_select_pedido_items" on public.pedido_items;

-- ---------------------------------------------------------------------------
-- cupon_redenciones (sin cambios, referencia)
-- ---------------------------------------------------------------------------
-- RLS habilitado y SIN políticas: solo service role escribe y lee. Por eso
-- `validarCupon()` consulta la redención por email con service role (con el
-- cliente de sesión el chequeo "1 uso por email" daría siempre null).
