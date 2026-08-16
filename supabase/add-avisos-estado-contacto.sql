-- Avisos de stock: estados de contacto en vez de borrado.
-- notificado_at = se le envió el email de stock disponible (se salta en futuros re-stock)
-- contactado_at  = el admin lo contactó manualmente por WhatsApp
alter table public.avisos_stock
  add column if not exists notificado_at timestamptz,
  add column if not exists contactado_at timestamptz;