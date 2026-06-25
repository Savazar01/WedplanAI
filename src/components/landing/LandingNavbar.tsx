"use client";

import * as React from "react";
import Link from "next/link";
import { Sun, Moon } from "lucide-react";

interface LandingNavbarProps {
  isLoggedIn: boolean;
}

export default function LandingNavbar({ isLoggedIn }: LandingNavbarProps) {
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");

  React.useEffect(() => {
    const saved = localStorage.getItem("theme");
    setTimeout(() => {
      if (saved === "dark" || !saved) {
        setTheme("dark");
      } else {
        setTheme("light");
      }
    }, 0);
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
        <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#6771ab] dark:hover:text-violet-400 transition-colors cursor-pointer">Features</a>
        <a href="#personas" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#6771ab] dark:hover:text-violet-400 transition-colors cursor-pointer">Personas</a>
        <a href="#how-it-works" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#6771ab] dark:hover:text-violet-400 transition-colors cursor-pointer">How It Works</a>
        <Link href="/docs" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#6771ab] dark:hover:text-violet-400 transition-colors cursor-pointer">Docs</Link>
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

        {isLoggedIn ? (
          <Link
            href="/dashboard"
            className="px-5 py-2 rounded-xl bg-[#6771ab] dark:bg-violet-600 text-white text-sm font-semibold shadow-md hover:bg-[#566198] dark:hover:bg-violet-500 transition-all active:scale-[0.97] cursor-pointer"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            href="/signup"
            className="px-5 py-2 rounded-xl bg-[#6771ab] dark:bg-violet-600 text-white text-sm font-semibold shadow-md hover:bg-[#566198] dark:hover:bg-violet-500 transition-all active:scale-[0.97] cursor-pointer"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
