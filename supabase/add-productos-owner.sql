-- Aislamiento por propietario para rol publicador (bandas externas)
-- super_admin y admin ven/gestionan todo; publicador solo lo propio.

alter table productos add column if not exists owner_id uuid references auth.users(id) on delete set null;

create index if not exists idx_productos_owner on productos(owner_id);

-- RLS opcional (refuerzo, pero el filtrado real es server-side en getSupabaseAdmin)
-- Si RLS está activo, permitimos que publicador lea solo lo suyo; super_admin/admin bypass via service_role
-- No sobrescribe políticas existentes si ya existen.

-- Nota: asignar owner_id automaticamente en insert desde actions (auth.uid()).
-- Para productos existentes, owner_id queda null => visible solo para super_admin/admin.
