import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { webhookLeadSchema } from "@/lib/domain/validation";

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
