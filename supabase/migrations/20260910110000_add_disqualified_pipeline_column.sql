-- Adiciona a etapa de leads desqualificados aos workspaces existentes e futuros.
insert into public.pipeline_columns (workspace_id, nome, cor, position)
select w.id, 'Desqualificados', '#64748b', 4
from public.workspaces w
on conflict (workspace_id, nome) do nothing;

create or replace function public.ensure_default_pipeline_columns(target_workspace_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.pipeline_columns (workspace_id, nome, cor, position)
  values
    (target_workspace_id, 'Novos', '#2563eb', 0),
    (target_workspace_id, 'Em contato', '#f59e0b', 1),
    (target_workspace_id, 'Proposta', '#8b5cf6', 2),
    (target_workspace_id, 'Fechados', '#16a34a', 3),
    (target_workspace_id, 'Desqualificados', '#64748b', 4)
  on conflict (workspace_id, nome) do nothing;
end;
$$;
