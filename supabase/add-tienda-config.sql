-- Config de secciones visibles en /tienda (grid Ofertas y Lo mas pedido)
-- Solo oculta el grid en catalogo; /tienda/ofertas y ?sort=mas-vendidos siguen funcionando.
create table if not exists tienda_config (
  key text primary key,
  valor boolean not null,
  updated_at timestamptz default now()
);

insert into tienda_config (key, valor) values
  ('mostrar_mas_pedidos', true),
  ('mostrar_ofertas', true)
on conflict (key) do nothing;

alter table tienda_config enable row level security;

drop policy if exists "tienda_config public read" on tienda_config;
create policy "tienda_config public read" on tienda_config
  for select using (true);

drop policy if exists "tienda_config admin manage" on tienda_config;
create policy "tienda_config admin manage" on tienda_config
  for all using (
    exists (select 1 from perfiles where id = auth.uid() and rol in ('super_admin','admin'))
  ) with check (
    exists (select 1 from perfiles where id = auth.uid() and rol in ('super_admin','admin'))
  );

-- Indices para ranking 30d (no bloqueante si ya existen)
create index if not exists idx_pedido_items_pedido_id on pedido_items(pedido_id);
create index if not exists idx_pedidos_estado_created on pedidos(estado, created_at);
