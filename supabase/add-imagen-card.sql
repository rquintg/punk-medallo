-- Imagen cuadrada para la card de /boletas (fallback a imagen_url si es null)
alter table eventos_boletos add column if not exists imagen_card_url text;
