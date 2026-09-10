"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export type ProfileUser = { id: string; nome?: string | null; email: string; role: string; ativo?: boolean | null };

export function UserProfileDialog({ user, onClose, onSaved }: { user: ProfileUser | null; onClose: () => void; onSaved: (user: ProfileUser) => void }) {
  const [role, setRole] = useState("User");
  const [ativo, setAtivo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (!user) return; setRole(user.role); setAtivo(user.ativo !== false); setError(""); }, [user]);
  if (!user) return null;
  const currentUser = user;
  const isAdminMaster = currentUser.role === "Admin Master";
  async function save() { setSaving(true); setError(""); const response = await fetch("/api/auth/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: currentUser.id, ...(isAdminMaster ? {} : { role }), ativo }) }); const data = await response.json().catch(() => ({})); setSaving(false); if (!response.ok) { setError(data.error || "Não foi possível salvar o perfil."); return; } onSaved(data); }
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Perfil do usuário</p><h2 className="mt-1 text-xl font-semibold text-slate-950">{user.nome || user.email}</h2></div><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Fechar"><X size={18} /></button></div><div className="mt-6 space-y-4"><div><label className="text-sm font-medium text-slate-700">Nome</label><p className="mt-1 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{user.nome || "Não informado"}</p></div><div><label className="text-sm font-medium text-slate-700">E-mail</label><p className="mt-1 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{user.email}</p></div><div><label className="text-sm font-medium text-slate-700">Tipo de usuário</label><select value={role} disabled={isAdminMaster} onChange={(event) => setRole(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 disabled:bg-slate-100"><option value="User">User</option><option value="Owner">Owner</option></select>{isAdminMaster && <p className="mt-1 text-xs text-slate-500">O Admin Master é único e não pode ser alterado.</p>}</div><label className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3 text-sm font-medium text-slate-700">Conta ativa <input type="checkbox" checked={ativo} disabled={isAdminMaster} onChange={(event) => setAtivo(event.target.checked)} className="size-4 accent-blue-600 disabled:cursor-not-allowed disabled:opacity-50" /></label>{isAdminMaster && <p className="text-xs text-slate-500">A conta do Admin Master não pode ser inativada.</p>}</div>{error && <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}<div className="mt-6 flex justify-end gap-3"><button onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">Cancelar</button>{!isAdminMaster && <button onClick={save} disabled={saving} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? "Salvando..." : "Salvar alterações"}</button>}</div></div></div>;
}
