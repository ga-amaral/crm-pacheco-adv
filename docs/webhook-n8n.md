# Webhook para criar leads via n8n

Use o node **HTTP Request** do n8n para enviar um lead ao CRM.

## Configuração

- **Método:** `POST`
- **URL:** `https://crm-pacheco-adv.vercel.app/api/webhook`
- **Authentication:** nenhuma, caso o segredo não esteja configurado
- **Header:** `Content-Type: application/json`
- **Header opcional:** `x-webhook-secret: SEU_N8N_WEBHOOK_SECRET`

Se a variável `N8N_WEBHOOK_SECRET` estiver configurada na Vercel, o header `x-webhook-secret` é obrigatório e deve conter o mesmo valor.

## Corpo da requisição

Substitua `SEU_WORKSPACE_ID` pelo UUID do workspace no Supabase.

```json
{
  "workspace_id": "SEU_WORKSPACE_ID",
  "nome": "Maria da Silva",
  "telefone": "(11) 99999-9999",
  "fonte_contato": "Instagram",
  "temperatura": "Warm",
  "valor_divida": 12500.75,
  "cnpj": "12.345.678/0001-90",
  "prioridade": "Alta",
  "email": "maria@example.com",
  "follow_up": "Retornar na próxima semana",
  "valor_contrato": 3500.50,
  "data_assinatura": null,
  "data_vencimento": "2026-10-15",
  "status_pagamento": "Pendente"
}
```

O lead será criado automaticamente na primeira coluna do pipeline do workspace.

## Exemplo em cURL

```bash
curl -X POST "https://crm-pacheco-adv.vercel.app/api/webhook" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: SEU_N8N_WEBHOOK_SECRET" \
  -d '{
    "workspace_id": "SEU_WORKSPACE_ID",
    "nome": "Maria da Silva",
    "telefone": "(11) 99999-9999",
    "fonte_contato": "Instagram",
    "temperatura": "Warm",
    "valor_divida": 12500.75,
    "cnpj": "12.345.678/0001-90",
    "prioridade": "Alta",
    "email": "maria@example.com",
    "status_pagamento": "Pendente"
  }'
```

## Resposta de sucesso

Status HTTP `201`:

```json
{
  "id": "ID_DO_LEAD_CRIADO",
  "status": "created"
}
```

## Observações

- `workspace_id` é obrigatório e precisa ser um UUID válido.
- `nome`, `telefone`, `fonte_contato`, `valor_divida`, `cnpj`, `prioridade` e `email` são obrigatórios.
- Valores financeiros aceitam casas decimais e devem ser enviados como número, usando ponto decimal.
- Temperaturas aceitas: `Cold`, `Warm` e `Hot`.
- Status de pagamento aceitos: `Pendente`, `Pago`, `Atrasado` e `Cancelado`.
- Em caso de erro, consulte o status HTTP e o campo `error` da resposta.

---

# Webhook para atualizar leads via n8n

- **Método:** `PATCH`
- **URL:** `https://crm-pacheco-adv.vercel.app/api/webhook`
- **Headers:** `Content-Type: application/json` e `x-webhook-secret: SEU_N8N_WEBHOOK_SECRET` (**obrigatório** para atualizar; sem o segredo configurado na Vercel a rota recusa a chamada)

O lead é localizado por `id` **ou** por `telefone` (dentro do `workspace_id`). Os campos a alterar vão dentro de `update`; só o que for enviado é modificado.

```json
{
  "workspace_id": "SEU_WORKSPACE_ID",
  "telefone": "(11) 99999-9999",
  "update": {
    "produto_juridico": "DBA"
  }
}
```

- `produto_juridico` aceita: `Superendividamento`, `DBA`, `RCPCC`, `Transação Tributária` e `CC` (ou `null` para limpar).
- `update` aceita os mesmos campos do cadastro, incluindo `pipeline_column`.
- Respostas: `200` `{ "id": "...", "status": "updated" }`, `400` payload inválido, `401` segredo incorreto, `404` lead não encontrado, `409` mais de um lead com o telefone (use o `id`).
- As alterações são registradas no histórico (`audit_log`) sem usuário associado.

```bash
curl -X PATCH "https://crm-pacheco-adv.vercel.app/api/webhook"   -H "Content-Type: application/json"   -H "x-webhook-secret: SEU_N8N_WEBHOOK_SECRET"   -d '{"workspace_id":"SEU_WORKSPACE_ID","id":"ID_DO_LEAD","update":{"produto_juridico":"RCPCC"}}'
```
