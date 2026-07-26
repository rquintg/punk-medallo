-- Agregar campos de envío adicionales a la tabla pedidos
ALTER TABLE public.pedidos
  ADD COLUMN IF NOT EXISTS departamento text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS barrio text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS notas text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS recordatorio_abandono boolean NOT NULL DEFAULT false;

-- Actualizamos registros existentes para que tengan el departamento correcto
-- basado en el valor hardcodeado que se usaba antes (Antioquia)
UPDATE public.pedidos
SET departamento = 'Antioquia'
WHERE departamento = '';
