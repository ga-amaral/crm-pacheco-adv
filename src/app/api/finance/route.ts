import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { data, error } = await supabase.from("leads").select("valor_contrato, valor_divida, status_pagamento, fonte_contato, temperatura, prioridade, pipeline_column, data_chegada, data_assinatura");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const leads = data ?? [];
  const paid = leads.filter((lead) => lead.status_pagamento === "Pago");
  const expected = leads.filter((lead) => lead.status_pagamento !== "Cancelado");
  return NextResponse.json({
    totalRevenue: paid.reduce((sum, lead) => sum + Number(lead.valor_contrato ?? 0), 0),
    expectedRevenue: expected.reduce((sum, lead) => sum + Number(lead.valor_contrato ?? 0), 0),
    totalDebt: leads.reduce((sum, lead) => sum + Number(lead.valor_divida ?? 0), 0),
    averageTicket: leads.length ? leads.reduce((sum, lead) => sum + Number(lead.valor_contrato ?? 0), 0) / leads.length : 0,
    totalLeads: leads.length,
    paidCount: paid.length,
    pendingCount: leads.filter((lead) => lead.status_pagamento === "Pendente").length,
    overdueCount: leads.filter((lead) => lead.status_pagamento === "Atrasado").length,
    byStatus: group(leads, "status_pagamento"), byPipeline: group(leads, "pipeline_column"),
    bySource: group(leads, "fonte_contato"), byTemperature: group(leads, "temperatura"), byPriority: group(leads, "prioridade"),
  });
}
function group(rows: Array<Record<string, unknown>>, key: string) { return rows.reduce<Record<string, number>>((result, row) => { const value = String(row[key] ?? "Sem informação"); result[value] = (result[value] ?? 0) + 1; return result; }, {}); }
