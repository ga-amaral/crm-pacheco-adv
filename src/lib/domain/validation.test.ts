import { describe, expect, it } from "vitest";
import { leadSchema, leadUpdateSchema, webhookLeadSchema } from "./validation";

describe("lead validation", () => {
  it("rejects a lead without required name and phone", () => {
    const result = leadSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("requires the seven mandatory lead fields", () => {
    const result = leadSchema.safeParse({ nome: "Maria", telefone: "11999999999" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid temperature and email", () => {
    const result = leadSchema.safeParse({
      nome: "Maria",
      telefone: "11999999999",
      fonte_contato: "Indicação",
      valor_divida: 1000,
      cnpj: "12345678000100",
      prioridade: "Alta",
      temperatura: "Unknown",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("accepts the webhook payload with the required fields", () => {
    const result = webhookLeadSchema.safeParse({
      nome: "Maria",
      telefone: "11999999999",
      fonte_contato: "Indicação",
      valor_divida: 1000,
      cnpj: "12345678000100",
      prioridade: "Alta",
      email: "maria@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("does not allow data arrival to be changed in lead updates", () => {
    const result = leadUpdateSchema.safeParse({ data_chegada: "2026-09-09" });

    expect(result.success).toBe(false);
  });

  it("converts empty optional form values to null", () => {
    const result = leadSchema.safeParse({
      nome: "Maria",
      telefone: "11999999999",
      fonte_contato: "Indicação",
      valor_divida: "1000",
      cnpj: "12345678000100",
      prioridade: "Alta",
      email: "maria@example.com",
      temperatura: "",
      follow_up: "",
      valor_contrato: "",
      data_assinatura: "",
      data_vencimento: "",
      status_pagamento: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data_assinatura).toBeNull();
      expect(result.data.data_vencimento).toBeNull();
    }
  });
});
