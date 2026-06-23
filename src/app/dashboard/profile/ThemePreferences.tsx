"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ThemePreferences() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  const setThemeMode = (mode: "light" | "dark") => {
    setTheme(mode);
    localStorage.setItem("theme", mode);
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
      <div>
        <h2 className="text-sm font-bold text-[#6771ab] uppercase tracking-widest">
          App Theme Preferences
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Choose how the WedPlanAI dashboard appears on your device.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <button
          type="button"
          onClick={() => setThemeMode("light")}
          className="flex items-center justify-center gap-3 p-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-[#6771ab] dark:bg-[#eef0f7] dark:text-[#2d336b] selector-light"
          style={theme === "light" ? { borderColor: "#6771ab", backgroundColor: "#eef0f7", color: "#2d336b" } : undefined}
        >
          <Sun className="h-5 w-5 text-amber-500 shrink-0" />
          <span>Light Mode</span>
        </button>

        <button
          type="button"
          onClick={() => setThemeMode("dark")}
          className="flex items-center justify-center gap-3 p-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer border-slate-200 bg-white text-slate-600 hover:bg-slate-50 selector-dark"
          style={theme === "dark" ? { borderColor: "#6771ab", backgroundColor: "#1e293b", color: "#ffffff" } : undefined}
        >
          <Moon className="h-5 w-5 text-indigo-400 shrink-0" />
          <span>Dark Mode</span>
        </button>
      </div>
    </Card>
  );
}
