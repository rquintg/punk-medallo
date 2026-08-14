-- Avisos de stock: permitir múltiples combinaciones por email.
-- Reemplaza la constraint unique (producto_id, email) por un índice único
-- funcional que incluye talla/color (COALESCE para manejar nulls: el aviso
-- global sin combinación es ('','') y puede coexistir con combos específicas).
alter table public.avisos_stock drop constraint if exists avisos_stock_producto_id_email_key;

create unique index if not exists avisos_stock_producto_email_combo_idx
  on public.avisos_stock (producto_id, email, coalesce(talla, ''), coalesce(color, ''));