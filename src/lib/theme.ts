export type Theme = "light" | "dark";

export function normalizeTheme(value: string | null): Theme {
  return value === "dark" ? "dark" : "light";
}
