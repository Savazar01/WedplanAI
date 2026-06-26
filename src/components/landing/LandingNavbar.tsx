"use client";

import * as React from "react";
import Link from "next/link";
import { Sun, Moon, Globe, ChevronDown } from "lucide-react";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { languagesList, LanguageCode } from "@/lib/translations";

interface LandingNavbarProps {
  isLoggedIn: boolean;
}

export default function LandingNavbar({ isLoggedIn }: LandingNavbarProps) {
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");
  const { t, locale, setLocale } = useTranslation();

  React.useEffect(() => {
    const syncTheme = () => {
      const saved = localStorage.getItem("theme");
      if (saved === "light") {
        setTheme("light");
      } else {
        setTheme("dark");
      }
    };

    syncTheme();

    window.addEventListener("theme-change", syncTheme);
    window.addEventListener("storage", syncTheme);

    return () => {
      window.removeEventListener("theme-change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.dispatchEvent(new Event("theme-change"));
  };

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-violet-100 dark:border-slate-800 rounded-2xl shadow-lg px-6 py-3 flex items-center justify-between transition-colors duration-300">
      <Link href="/" className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://savazar.com/wp-content/uploads/2023/10/cropped-Transparent_Image_2-300x100.png"
          alt="Savazar"
          className="h-8 w-auto object-contain logo-img"
        />
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#6771ab] dark:hover:text-violet-400 transition-colors cursor-pointer">{t("features")}</a>
        <a href="#personas" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#6771ab] dark:hover:text-violet-400 transition-colors cursor-pointer">{t("personas")}</a>
        <a href="#how-it-works" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#6771ab] dark:hover:text-violet-400 transition-colors cursor-pointer">{t("howItWorks")}</a>
        <Link href="/docs" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#6771ab] dark:hover:text-violet-400 transition-colors cursor-pointer">{t("docs")}</Link>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer flex items-center justify-center"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          type="button"
        >
          {theme === "light" ? (
            <Moon className="h-4.5 w-4.5 text-slate-600" />
          ) : (
            <Sun className="h-4.5 w-4.5 text-amber-400" />
          )}
        </button>

        {/* Language Switcher */}
        <div className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
          <Globe className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400 shrink-0" />
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as LanguageCode)}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-transparent border-none focus:outline-none cursor-pointer pr-4 appearance-none"
            title={t("language")}
          >
            {languagesList.map((lang) => (
              <option key={lang.code} value={lang.code} className="dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                {lang.name}
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          </div>
        </div>

        {isLoggedIn ? (
          <Link
            href="/dashboard"
            className="px-5 py-2 rounded-xl bg-[#6771ab] dark:bg-violet-600 text-white text-sm font-semibold shadow-md hover:bg-[#566198] dark:hover:bg-violet-500 transition-all active:scale-[0.97] cursor-pointer"
          >
            {t("goToDashboard")}
          </Link>
        ) : (
          <Link
            href="/signup"
            className="px-5 py-2 rounded-xl bg-[#6771ab] dark:bg-violet-600 text-white text-sm font-semibold shadow-md hover:bg-[#566198] dark:hover:bg-violet-500 transition-all active:scale-[0.97] cursor-pointer"
          >
            {t("signIn")}
          </Link>
        )}
      </div>
    </nav>
  );
}
