import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { leadUpdateSchema, webhookLeadSchema } from "@/lib/domain/validation";

const payloadSchema = z.object({ workspace_id: z.string().uuid().optional(), lead: webhookLeadSchema.optional() }).and(webhookLeadSchema.partial());

export async function POST(request: Request) {
  if (process.env.N8N_WEBHOOK_SECRET && request.headers.get("x-webhook-secret") !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Payload inválido", details: parsed.error.flatten() }, { status: 400 });
  const admin = createAdminClient();
  const workspaceId = parsed.data.workspace_id;
  if (!workspaceId) return NextResponse.json({ error: "workspace_id é obrigatório" }, { status: 400 });
  const { data: firstColumn } = await admin.from("pipeline_columns").select("nome").eq("workspace_id", workspaceId).order("position").limit(1).single();
  const lead = parsed.data.lead ?? parsed.data;
  const { data, error } = await admin.from("leads").insert({ ...lead, workspace_id: workspaceId, pipeline_column: firstColumn?.nome ?? "new" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, status: "created" }, { status: 201 });
}

const updatePayloadSchema = z.object({
  workspace_id: z.string().uuid("workspace_id inválido"),
  id: z.string().uuid("id inválido").optional(),
  telefone: z.string().trim().min(1).optional(),
  update: leadUpdateSchema.refine((value) => Object.keys(value).length > 0, "Informe ao menos um campo em update"),
}).refine((value) => value.id || value.telefone, "Informe id ou telefone para localizar o lead");

export async function PATCH(request: Request) {
  if (!process.env.N8N_WEBHOOK_SECRET || request.headers.get("x-webhook-secret") !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const parsed = updatePayloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Payload inválido", details: parsed.error.flatten() }, { status: 400 });
  const { workspace_id, id, telefone, update } = parsed.data;
  const admin = createAdminClient();
  let find = admin.from("leads").select("*").eq("workspace_id", workspace_id);
  find = id ? find.eq("id", id) : find.eq("telefone", telefone!);
  const { data: matches, error: findError } = await find.limit(2);
  if (findError) return NextResponse.json({ error: findError.message }, { status: 500 });
  if (!matches?.length) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
  if (matches.length > 1) return NextResponse.json({ error: "Mais de um lead com esse telefone; use o id" }, { status: 409 });
  const oldLead = matches[0];
  const { data, error } = await admin.from("leads").update(update).eq("id", oldLead.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const changes = Object.entries(update).filter(([field, value]) => String(oldLead[field]) !== String(value));
  if (changes.length) await admin.from("audit_log").insert(changes.map(([campo, valor]) => ({ workspace_id, lead_id: oldLead.id, user_id: null, acao: "update", campo, valor_antigo: oldLead[campo], valor_novo: valor })));
  return NextResponse.json({ id: data.id, status: "updated" });
}
