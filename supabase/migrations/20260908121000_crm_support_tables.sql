create table if not exists public.pipeline_columns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  nome text not null,
  cor text not null default '#64748b' check (cor ~* '^#[0-9a-f]{6}$'),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (workspace_id, nome)
);

create table if not exists public.dashboard_permissions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  dashboard text not null check (dashboard in ('leads', 'finance')),
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id, dashboard)
);

create table if not exists public.lead_assignments (
  lead_id uuid primary key references public.leads(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists pipeline_columns_workspace_position_idx on public.pipeline_columns(workspace_id, position);
create index if not exists lead_assignments_workspace_user_idx on public.lead_assignments(workspace_id, user_id);

alter table public.pipeline_columns enable row level security;
alter table public.dashboard_permissions enable row level security;
alter table public.lead_assignments enable row level security;

drop policy if exists pipeline_columns_select_workspace on public.pipeline_columns;
create policy pipeline_columns_select_workspace on public.pipeline_columns for select to authenticated
using (public.is_workspace_member(workspace_id));
drop policy if exists pipeline_columns_insert_owner on public.pipeline_columns;
create policy pipeline_columns_insert_owner on public.pipeline_columns for insert to authenticated
with check (public.has_workspace_role(workspace_id, array['Admin Master', 'Owner']));
drop policy if exists pipeline_columns_update_owner on public.pipeline_columns;
create policy pipeline_columns_update_owner on public.pipeline_columns for update to authenticated
using (public.has_workspace_role(workspace_id, array['Admin Master', 'Owner']))
with check (public.has_workspace_role(workspace_id, array['Admin Master', 'Owner']));
drop policy if exists pipeline_columns_delete_owner on public.pipeline_columns;
create policy pipeline_columns_delete_owner on public.pipeline_columns for delete to authenticated
using (public.has_workspace_role(workspace_id, array['Admin Master', 'Owner']));

drop policy if exists dashboard_permissions_select_workspace on public.dashboard_permissions;
create policy dashboard_permissions_select_workspace on public.dashboard_permissions for select to authenticated
using (public.is_workspace_member(workspace_id));
drop policy if exists dashboard_permissions_write_owner on public.dashboard_permissions;
create policy dashboard_permissions_write_owner on public.dashboard_permissions for all to authenticated
using (public.has_workspace_role(workspace_id, array['Admin Master', 'Owner']))
with check (public.has_workspace_role(workspace_id, array['Admin Master', 'Owner']));

drop policy if exists lead_assignments_select_workspace on public.lead_assignments;
create policy lead_assignments_select_workspace on public.lead_assignments for select to authenticated
using (public.is_workspace_member(workspace_id));
drop policy if exists lead_assignments_write_owner on public.lead_assignments;
create policy lead_assignments_write_owner on public.lead_assignments for all to authenticated
using (public.has_workspace_role(workspace_id, array['Admin Master', 'Owner']))
with check (public.has_workspace_role(workspace_id, array['Admin Master', 'Owner']));

create or replace function public.ensure_default_pipeline_columns(target_workspace_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.pipeline_columns (workspace_id, nome, cor, position)
  values
    (target_workspace_id, 'Novos', '#2563eb', 0),
    (target_workspace_id, 'Em contato', '#f59e0b', 1),
    (target_workspace_id, 'Proposta', '#8b5cf6', 2),
    (target_workspace_id, 'Fechados', '#16a34a', 3)
  on conflict (workspace_id, nome) do nothing;
end;
$$;
