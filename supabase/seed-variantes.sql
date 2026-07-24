-- Seed: poblar producto_variantes desde datos legacy de productos
-- Idempotente: solo inserta si no existen variantes para el producto

DO $$
DECLARE
  rec RECORD;
  talla text;
  color text;
  stock_por_variante int;
  stock_restante int;
  variantes_count int;
BEGIN
  FOR rec IN
    SELECT id, tallas_disponibles, colores_disponibles, stock
    FROM productos
    WHERE (
      array_length(tallas_disponibles, 1) > 0 OR
      array_length(colores_disponibles, 1) > 0
    )
    AND NOT EXISTS (
      SELECT 1 FROM producto_variantes WHERE producto_id = productos.id LIMIT 1
    )
  LOOP
    -- Producto con tallas Y colores: crear combinaciones
    IF rec.tallas_disponibles IS NOT NULL AND array_length(rec.tallas_disponibles, 1) > 0
       AND rec.colores_disponibles IS NOT NULL AND array_length(rec.colores_disponibles, 1) > 0
    THEN
      variantes_count := array_length(rec.tallas_disponibles, 1) * array_length(rec.colores_disponibles, 1);
      stock_por_variante := rec.stock / variantes_count;
      stock_restante := rec.stock - (stock_por_variante * variantes_count);

      FOREACH talla IN ARRAY rec.tallas_disponibles
      LOOP
        FOREACH color IN ARRAY rec.colores_disponibles
        LOOP
          INSERT INTO producto_variantes (producto_id, talla, color, stock, sku)
          VALUES (
            rec.id,
            talla,
            color,
            stock_por_variante + CASE WHEN stock_restante > 0 THEN stock_restante - (stock_restante - 1) ELSE 0 END,
            rec.id || '-' || talla || '-' || regexp_replace(lower(color), '[^a-z0-9]', '', 'g')
          );
          IF stock_restante > 0 THEN
            stock_restante := stock_restante - 1;
          END IF;
        END LOOP;
      END LOOP;

    -- Solo tallas
    ELSIF rec.tallas_disponibles IS NOT NULL AND array_length(rec.tallas_disponibles, 1) > 0 THEN
      variantes_count := array_length(rec.tallas_disponibles, 1);
      stock_por_variante := rec.stock / variantes_count;
      stock_restante := rec.stock - (stock_por_variante * variantes_count);

      FOREACH talla IN ARRAY rec.tallas_disponibles
      LOOP
        INSERT INTO producto_variantes (producto_id, talla, color, stock, sku)
        VALUES (
          rec.id,
          talla,
          NULL,
          stock_por_variante + CASE WHEN stock_restante > 0 THEN 1 ELSE 0 END,
          rec.id || '-' || talla
        );
        IF stock_restante > 0 THEN
          stock_restante := stock_restante - 1;
        END IF;
      END LOOP;

    -- Solo colores
    ELSIF rec.colores_disponibles IS NOT NULL AND array_length(rec.colores_disponibles, 1) > 0 THEN
      variantes_count := array_length(rec.colores_disponibles, 1);
      stock_por_variante := rec.stock / variantes_count;
      stock_restante := rec.stock - (stock_por_variante * variantes_count);

      FOREACH color IN ARRAY rec.colores_disponibles
      LOOP
        INSERT INTO producto_variantes (producto_id, talla, color, stock, sku)
        VALUES (
          rec.id,
          NULL,
          color,
          stock_por_variante + CASE WHEN stock_restante > 0 THEN 1 ELSE 0 END,
          rec.id || '-' || regexp_replace(lower(color), '[^a-z0-9]', '', 'g')
        );
        IF stock_restante > 0 THEN
          stock_restante := stock_restante - 1;
        END IF;
      END LOOP;
    END IF;
  END LOOP;
END $$;
