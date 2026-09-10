import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const body = await request.json().catch(() => null); if (!body?.newPassword || body.newPassword.length < 8) return NextResponse.json({ error: "A nova senha deve ter pelo menos 8 caracteres." }, { status: 400 });
  if (body.currentPassword) { const check = await supabase.auth.signInWithPassword({ email: user.email!, password: body.currentPassword }); if (check.error) return NextResponse.json({ error: "Senha atual inválida." }, { status: 400 }); }
  const { error } = await supabase.auth.updateUser({ password: body.newPassword }); if (error) return NextResponse.json({ error: error.message }, { status: 500 }); return NextResponse.json({ status: "updated" });
}
