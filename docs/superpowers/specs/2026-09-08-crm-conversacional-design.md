# CRM Conversacional v1.0 — Design

## Objetivo

Construir um CRM interno multi-tenant para gestão de leads recebidos por webhook n8n, com autenticação Supabase, dashboards Kanban/Lista, permissões por role, auditoria completa e painel financeiro.

## Arquitetura

O Supabase Auth será a fonte de identidade. A tabela `public.users` armazenará workspace, role e perfil do usuário autenticado. Server Actions e Route Handlers do Next.js executarão operações protegidas; o cliente usará apenas a chave pública. Toda consulta será filtrada por workspace e reforçada por RLS.

Além das tabelas do PRD, o sistema terá `pipeline_columns`, `dashboard_permissions` e `lead_assignments`, necessários para colunas configuráveis, dashboards por User e atribuição Owner/User. Leads terão `pipeline_column` e `position` para ordenação do Kanban.

## Fluxos

- Login: `supabase.auth.signInWithPassword`; sem cadastro público.
- Admin Master/Owner: criação de usuário via Admin API no servidor, definição de role e workspace.
- Troca de senha: usuário informa senha atual; Admin Master redefine via Admin API.
- Entrada n8n: POST `/api/webhook`, segredo opcional, validação dos 13 campos, primeira coluna do workspace.
- Alteração de lead: cada campo alterado gera uma linha em `audit_log`; drag-and-drop registra mudança de coluna e posição.
- Financeiro: métricas agregadas sobre `valor_contrato`, `valor_divida` e `status_pagamento`, respeitando filtros globais.

## Segurança e erros

Segredos administrativos nunca serão enviados ao browser. Payloads externos serão validados com Zod. Rotas retornarão códigos HTTP sem vazar detalhes internos. RLS bloqueará acesso entre workspaces; `audit_log` não terá policies de update/delete.

## Testes

Testes unitários cobrirão validação de payload, permissões, métricas e normalização de movimentações. Lint, typecheck e build serão executados a cada marco; testes de integração do webhook usarão ambiente Supabase configurado.
