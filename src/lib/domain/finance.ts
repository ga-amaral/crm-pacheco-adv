export type FinanceRow = { valor_contrato?: number | string | null; valor_divida?: number | string | null; status_pagamento?: string | null; pipeline_column?: string | null };
export const LEAD_SOURCES = ["Instagram", "Facebook", "Google", "Site", "TikTok", "YouTube", "Indicação"] as const;
export const PRIORITIES = ["Baixa", "Média", "Alta", "Urgência"] as const;
export function getPriorityLabel(value?: string | null) { return ({ baixa: "Baixa", media: "Média", média: "Média", alta: "Alta", urgente: "Urgência", urgência: "Urgência" } as Record<string, string>)[value?.toLowerCase() ?? ""] ?? value ?? ""; }
export function getPriorityTone(value?: string | null) { return ({ Baixa: "bg-slate-100 text-slate-600", Média: "bg-blue-100 text-blue-700", Alta: "bg-orange-100 text-orange-700", Urgência: "bg-rose-100 text-rose-700" } as Record<string, string>)[getPriorityLabel(value)] ?? "bg-slate-100 text-slate-600"; }
export function getSourceTone(value?: string | null) { return ({ Instagram: "bg-fuchsia-100 text-fuchsia-700", Facebook: "bg-indigo-100 text-indigo-700", Google: "bg-sky-100 text-sky-700", Site: "bg-violet-100 text-violet-700", TikTok: "bg-slate-200 text-slate-700", YouTube: "bg-rose-100 text-rose-700", Indicação: "bg-teal-100 text-teal-700" } as Record<string, string>)[value ?? ""] ?? "bg-slate-100 text-slate-600"; }
export function formatBRL(value: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(value); }
export function summarizeFinance(rows: FinanceRow[]) {
  const paidCount = rows.filter((row) => row.status_pagamento === "Pago").length;
  const pendingCount = rows.filter((row) => row.status_pagamento === "Pendente").length;
  const totalRevenue = rows.filter((row) => row.status_pagamento === "Pago").reduce((sum, row) => sum + Number(row.valor_contrato ?? 0), 0);
  return { paidCount, pendingCount, totalRevenue, conversionRate: rows.length ? (paidCount / rows.length) * 100 : 0 };
}
