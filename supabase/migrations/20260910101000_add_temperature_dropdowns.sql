alter table public.custom_dropdowns drop constraint if exists custom_dropdowns_tipo_check;
alter table public.custom_dropdowns add constraint custom_dropdowns_tipo_check check (tipo in ('fonte_contato', 'follow_up', 'temperatura', 'status_pagamento'));
