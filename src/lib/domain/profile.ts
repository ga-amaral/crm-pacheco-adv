export function getInitials(name?: string | null, email?: string | null) {
  const source = (name?.trim() || email?.split("@")[0] || "?").trim();
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function getTemperatureLabel(value?: string | null) {
  return ({ Cold: "Fria", Warm: "Morna", Hot: "Quente" } as Record<string, string>)[value ?? ""] ?? value ?? "";
}

export function getTemperatureTone(value?: string | null) {
  return ({ Cold: "border-blue-400", Warm: "border-amber-400", Hot: "border-red-400" } as Record<string, string>)[value ?? ""] ?? "border-slate-200";
}

export function canManageUsers(role?: string | null) {
  return role === "Admin Master" || role === "Owner";
}
