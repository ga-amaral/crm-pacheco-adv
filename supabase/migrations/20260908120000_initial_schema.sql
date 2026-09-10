create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null unique,
  senha_hash text,
  role text not null check (role in ('Admin Master', 'Owner', 'User')),
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  nome text not null,
  telefone text not null,
  fonte_contato text,
  temperatura text check (temperatura in ('Cold', 'Warm', 'Hot')),
  valor_divida numeric(14, 2) check (valor_divida is null or valor_divida >= 0),
  cnpj text,
  prioridade text,
  email text,
  follow_up text,
  valor_contrato numeric(14, 2) check (valor_contrato is null or valor_contrato >= 0),
  data_chegada date not null default current_date,
  data_assinatura date,
  data_vencimento date,
  status_pagamento text check (status_pagamento in ('Pendente', 'Pago', 'Atrasado', 'Cancelado')),
  pipeline_column text not null default 'new',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_email_format check (email is null or email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  lead_id uuid not null references public.leads(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  acao text not null,
  campo text,
  valor_antigo text,
  valor_novo text,
  created_at timestamptz not null default now()
);

create table if not exists public.custom_dropdowns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  tipo text not null check (tipo in ('fonte_contato', 'follow_up', 'status_pagamento')),
  valor text not null,
  cor text not null default '#64748b' check (cor ~* '^#[0-9a-f]{6}$'),
  created_at timestamptz not null default now(),
  unique (workspace_id, tipo, valor)
);

create index if not exists leads_workspace_id_idx on public.leads(workspace_id);
create index if not exists leads_pipeline_column_idx on public.leads(workspace_id, pipeline_column, position);
create index if not exists audit_log_lead_id_idx on public.audit_log(lead_id, created_at desc);
create index if not exists custom_dropdowns_workspace_tipo_idx on public.custom_dropdowns(workspace_id, tipo);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

-- Remove policies before replacing helper functions, because policies depend on them.
drop policy if exists workspaces_select_member on public.workspaces;
drop policy if exists users_select_workspace on public.users;
drop policy if exists users_insert_admin on public.users;
drop policy if exists users_update_admin on public.users;
drop policy if exists users_delete_admin on public.users;
drop policy if exists leads_select_workspace on public.leads;
drop policy if exists leads_insert_workspace on public.leads;
drop policy if exists leads_update_workspace on public.leads;
drop policy if exists leads_delete_workspace on public.leads;
drop policy if exists audit_log_select_workspace on public.audit_log;
drop policy if exists audit_log_insert_workspace on public.audit_log;
drop policy if exists custom_dropdowns_select_workspace on public.custom_dropdowns;
drop policy if exists custom_dropdowns_insert_owner on public.custom_dropdowns;
drop policy if exists custom_dropdowns_update_owner on public.custom_dropdowns;
drop policy if exists custom_dropdowns_delete_owner on public.custom_dropdowns;

drop function if exists public.is_workspace_member(uuid);
drop function if exists public.has_workspace_role(uuid, text[]);

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and workspace_id = target_workspace_id
  );
$$;

create or replace function public.has_workspace_role(target_workspace_id uuid, allowed_roles text[])
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid()
      and workspace_id = target_workspace_id
      and role = any(allowed_roles)
  );
$$;

alter table public.workspaces enable row level security;
alter table public.users enable row level security;
alter table public.leads enable row level security;
alter table public.audit_log enable row level security;
alter table public.custom_dropdowns enable row level security;

create policy workspaces_select_member on public.workspaces
for select to authenticated
using (public.is_workspace_member(id));

create policy users_select_workspace on public.users
for select to authenticated
using (public.is_workspace_member(workspace_id));

create policy users_insert_admin on public.users
for insert to authenticated
with check (public.has_workspace_role(workspace_id, array['Admin Master', 'Owner']));

create policy users_update_admin on public.users
for update to authenticated
using (public.has_workspace_role(workspace_id, array['Admin Master', 'Owner']))
with check (public.has_workspace_role(workspace_id, array['Admin Master', 'Owner']));

create policy users_delete_admin on public.users
for delete to authenticated
using (public.has_workspace_role(workspace_id, array['Admin Master', 'Owner']));

create policy leads_select_workspace on public.leads
for select to authenticated using (public.is_workspace_member(workspace_id));

create policy leads_insert_workspace on public.leads
for insert to authenticated with check (public.is_workspace_member(workspace_id));

create policy leads_update_workspace on public.leads
for update to authenticated
using (public.is_workspace_member(workspace_id))
with check (public.is_workspace_member(workspace_id));

create policy leads_delete_workspace on public.leads
for delete to authenticated using (public.is_workspace_member(workspace_id));

create policy audit_log_select_workspace on public.audit_log
for select to authenticated using (public.is_workspace_member(workspace_id));

create policy audit_log_insert_workspace on public.audit_log
for insert to authenticated with check (public.is_workspace_member(workspace_id));

create policy custom_dropdowns_select_workspace on public.custom_dropdowns
for select to authenticated using (public.is_workspace_member(workspace_id));

create policy custom_dropdowns_insert_owner on public.custom_dropdowns
for insert to authenticated
with check (public.has_workspace_role(workspace_id, array['Admin Master', 'Owner']));

create policy custom_dropdowns_update_owner on public.custom_dropdowns
for update to authenticated
using (public.has_workspace_role(workspace_id, array['Admin Master', 'Owner']))
with check (public.has_workspace_role(workspace_id, array['Admin Master', 'Owner']));

create policy custom_dropdowns_delete_owner on public.custom_dropdowns
for delete to authenticated
using (public.has_workspace_role(workspace_id, array['Admin Master', 'Owner']));

revoke update, delete on public.audit_log from authenticated;
