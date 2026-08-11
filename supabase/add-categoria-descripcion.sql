-- Agrega columna descripcion a categorias (para SEO de páginas de categoría)
alter table public.categorias add column if not exists descripcion text;
