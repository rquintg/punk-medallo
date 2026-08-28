-- Renombra items de boleteria existentes para incluir el evento
-- (ejecutar UNA vez si ya habia compras de boletas con nombre solo "General")
UPDATE pedido_items pi
SET nombre = ev.titulo || ' — ' || tb.nombre
FROM tipos_boleta tb
JOIN eventos_boletos ev ON ev.id = tb.evento_id
WHERE pi.tipo_boleta_id = tb.id
  AND pi.tipo_boleta_id IS NOT NULL;
