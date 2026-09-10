alter table public.users add column if not exists nome text;
alter table public.users add column if not exists ativo boolean not null default true;
