-- Descuento directo por producto (% entero 0-100)
alter table productos add column if not exists descuento integer not null default 0 check (descuento between 0 and 100);