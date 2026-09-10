import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { leadSchema } from "@/lib/domain/validation";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  let requestQuery = supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (query) requestQuery = requestQuery.or(`nome.ilike.%${query}%,telefone.ilike.%${query}%,email.ilike.%${query}%`);
  const { data, error } = await requestQuery;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const parsed = leadSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { data: profile } = await supabase.from("users").select("workspace_id").eq("id", user.id).single();
  if (!profile) return NextResponse.json({ error: "Perfil não configurado" }, { status: 403 });
  const { data, error } = await supabase.from("leads").insert({ ...parsed.data, workspace_id: profile.workspace_id, pipeline_column: parsed.data.pipeline_column ?? "Novos" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (!Array.isArray(body.ids) || body.ids.length === 0 || body.ids.some((id: unknown) => typeof id !== "string")) return NextResponse.json({ error: "Selecione ao menos um lead" }, { status: 400 });
  const { error } = await supabase.from("leads").delete().in("id", body.ids);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: body.ids.length });
}
