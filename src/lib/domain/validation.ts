import { z } from "zod";
import { PAYMENT_STATUSES, TEMPERATURES } from "./constants";

const emptyToNull = (value: unknown) => value === "" ? null : value;
const nullableText = z.preprocess(emptyToNull, z.string().trim().nullable().optional());
const nullableMoney = z.preprocess((value) => value === "" ? undefined : value, z.coerce.number().min(0).nullable().optional());

export const leadSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório"),
  telefone: z.string().trim().min(1, "Telefone é obrigatório"),
  fonte_contato: z.string().trim().min(1, "Fonte de contato é obrigatória"),
  temperatura: z.preprocess(emptyToNull, z.enum(TEMPERATURES).nullable().optional()),
  valor_divida: z.preprocess((value) => value === "" ? undefined : value, z.coerce.number().min(0, "Dívida inválida")),
  cnpj: z.string().trim().min(1, "CNPJ é obrigatório"),
  prioridade: z.string().trim().min(1, "Prioridade é obrigatória"),
  email: z.string().email("E-mail inválido"),
  follow_up: nullableText,
  valor_contrato: nullableMoney,
  data_assinatura: nullableText,
  data_vencimento: nullableText,
  status_pagamento: z.preprocess(emptyToNull, z.enum(PAYMENT_STATUSES).nullable().optional()),
  pipeline_column: z.string().trim().min(1).optional(),
  position: z.coerce.number().int().min(0).optional(),
});

export const leadUpdateSchema = leadSchema.partial().strict();

export const webhookLeadSchema = leadSchema;
export type ValidatedLead = z.infer<typeof leadSchema>;
