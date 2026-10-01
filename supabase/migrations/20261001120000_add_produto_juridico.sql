alter table public.leads add column if not exists produto_juridico text;
alter table public.leads drop constraint if exists leads_produto_juridico_check;
alter table public.leads add constraint leads_produto_juridico_check check (produto_juridico is null or produto_juridico in ('Superendividamento', 'DBA', 'RCPCC', 'Transação Tributária'));
