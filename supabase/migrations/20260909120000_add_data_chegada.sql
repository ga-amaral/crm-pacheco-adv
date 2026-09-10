alter table public.leads add column if not exists data_chegada date;

update public.leads
set data_chegada = created_at::date
where data_chegada is null;

alter table public.leads alter column data_chegada set default current_date;
alter table public.leads alter column data_chegada set not null;

create or replace function public.prevent_data_chegada_update()
returns trigger
language plpgsql
as $$
begin
  if new.data_chegada is distinct from old.data_chegada then
    raise exception 'data_chegada é imutável';
  end if;
  return new;
end;
$$;

drop trigger if exists leads_data_chegada_immutable on public.leads;
create trigger leads_data_chegada_immutable
before update on public.leads
for each row execute function public.prevent_data_chegada_update();
