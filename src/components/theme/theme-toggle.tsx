"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { normalizeTheme, Theme } from "@/lib/theme";

const STORAGE_KEY = "crm-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(normalizeTheme(window.localStorage.getItem(STORAGE_KEY)));
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  }

  return <button type="button" onClick={toggle} aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"} title={theme === "dark" ? "Tema claro" : "Tema escuro"} className="grid size-9 place-items-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">{theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}</button>;
}
