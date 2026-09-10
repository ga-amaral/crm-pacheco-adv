-- Torna obrigatórios os campos definidos para o cadastro de leads.
-- Execute somente depois de corrigir eventuais leads antigos incompletos.

do $$
begin
  if exists (
    select 1 from public.leads
    where nullif(trim(nome), '') is null
       or nullif(trim(telefone), '') is null
       or nullif(trim(fonte_contato), '') is null
       or valor_divida is null
       or nullif(trim(cnpj), '') is null
       or nullif(trim(prioridade), '') is null
       or nullif(trim(email), '') is null
  ) then
    raise exception 'Existem leads antigos sem os campos obrigatórios. Corrija-os antes de executar esta migration.';
  end if;
end;
$$;

alter table public.leads alter column nome set not null;
alter table public.leads alter column telefone set not null;
alter table public.leads alter column fonte_contato set not null;
alter table public.leads alter column valor_divida set not null;
alter table public.leads alter column cnpj set not null;
alter table public.leads alter column prioridade set not null;
alter table public.leads alter column email set not null;
