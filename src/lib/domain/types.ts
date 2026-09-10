import type { Role, Temperature, PaymentStatus } from "./constants";

export type LeadInput = {
  nome: string;
  telefone: string;
  fonte_contato?: string | null;
  temperatura?: Temperature | null;
  valor_divida?: number | null;
  cnpj?: string | null;
  prioridade?: string | null;
  email?: string | null;
  follow_up?: string | null;
  valor_contrato?: number | null;
  data_assinatura?: string | null;
  data_chegada?: string | null;
  data_vencimento?: string | null;
  status_pagamento?: PaymentStatus | null;
  pipeline_column?: string;
  position?: number;
};

export type Lead = LeadInput & {
  id: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
};

export type AppUser = {
  id: string;
  workspace_id: string;
  nome?: string | null;
  email: string;
  role: Role;
  ativo?: boolean;
};
