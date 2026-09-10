import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { leadUpdateSchema } from "@/lib/domain/validation";

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const input = leadUpdateSchema.safeParse(await request.json()); if (!input.success) return NextResponse.json({ error: input.error.flatten() }, { status: 400 });
  const { data: oldLead } = await supabase.from("leads").select("*").eq("id", context.params.id).single(); if (!oldLead) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
  const { data, error } = await supabase.from("leads").update(input.data).eq("id", context.params.id).select().single(); if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const changes = Object.entries(input.data).filter(([field, value]) => String(oldLead[field]) !== String(value));
  if (changes.length) await supabase.from("audit_log").insert(changes.map(([campo, valor]) => ({ workspace_id: oldLead.workspace_id, lead_id: oldLead.id, user_id: user.id, acao: "update", campo, valor_antigo: oldLead[campo], valor_novo: valor })));
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, context: { params: { id: string } }) { const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 }); const { error } = await supabase.from("leads").delete().eq("id", context.params.id); if (error) return NextResponse.json({ error: error.message }, { status: 500 }); return new NextResponse(null, { status: 204 }); }
