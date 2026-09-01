alter table eventos_boletos add column if not exists owner_id uuid references auth.users(id) on delete set null;
create index if not exists idx_eventos_boletos_owner on eventos_boletos(owner_id);
