import { describe, expect, it } from "vitest";
import { formatBRL, getPriorityLabel, getPriorityTone, getSourceTone, LEAD_SOURCES, summarizeFinance } from "./finance";

describe("finance summaries", () => {
  it("formats decimal values in Brazilian currency", () => {
    expect(formatBRL(1234.5)).toContain("R$");
    expect(formatBRL(1234.5)).toContain("1.234,50");
  });

  it("calculates payment counts and conversion rate", () => {
    const summary = summarizeFinance([
      { valor_contrato: 1000.5, valor_divida: 200, status_pagamento: "Pago", pipeline_column: "Fechados" },
      { valor_contrato: 500.25, valor_divida: 300, status_pagamento: "Pendente", pipeline_column: "Proposta" },
    ]);
    expect(summary.paidCount).toBe(1);
    expect(summary.pendingCount).toBe(1);
    expect(summary.conversionRate).toBe(50);
    expect(summary.totalRevenue).toBe(1000.5);
  });

  it("provides the standard lead sources", () => {
    expect(LEAD_SOURCES).toEqual(["Instagram", "Facebook", "Google", "Site", "TikTok", "YouTube", "Indicação"]);
  });

  it("normalizes priorities and assigns visual tones", () => {
    expect(getPriorityLabel("urgente")).toBe("Urgência");
    expect(getPriorityTone("Alta")).toContain("orange");
    expect(getPriorityTone("Média")).toContain("blue");
  });

  it("assigns a color to every standard source", () => {
    for (const source of LEAD_SOURCES) expect(getSourceTone(source)).toContain("bg-");
  });
});
