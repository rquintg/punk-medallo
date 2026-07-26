-- Crear tipo enum para tallas (si no existe)
DO $$ BEGIN
  CREATE TYPE talla_enum AS ENUM ('S', 'M', 'L', 'XL');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Crear tabla de variantes
CREATE TABLE IF NOT EXISTS producto_variantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  talla talla_enum,
  color TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(producto_id, talla, color)
);

-- Agregar columna variante_id a pedido_items (nullable)
ALTER TABLE pedido_items ADD COLUMN IF NOT EXISTS variante_id UUID REFERENCES producto_variantes(id);

-- Index para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_producto_variantes_producto_id ON producto_variantes(producto_id);

-- RLS: habilitar en producto_variantes
ALTER TABLE producto_variantes ENABLE ROW LEVEL SECURITY;

-- Política: cualquiera puede leer variantes (es catálogo público)
CREATE POLICY "Variantes: select público" ON producto_variantes
  FOR SELECT USING (true);

-- Política: solo service_role puede insertar/update/delete (desde backend admin)
CREATE POLICY "Variantes: insert admin" ON producto_variantes
  FOR INSERT WITH CHECK (auth.jwt() IS NOT NULL AND auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Variantes: update admin" ON producto_variantes
  FOR UPDATE USING (auth.jwt() IS NOT NULL AND auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Variantes: delete admin" ON producto_variantes
  FOR DELETE USING (auth.jwt() IS NOT NULL AND auth.jwt()->>'role' = 'service_role');

-- Política en pedido_items: permitir variante_id en inserts (coincide con política existente)
-- Nota: las policies existentes en pedido_items ya permiten INSERT si usuario_id = auth.uid() o es NULL (guest)
-- No necesitamos cambiarlas, solo asegurar que variante_id se puede insertar
