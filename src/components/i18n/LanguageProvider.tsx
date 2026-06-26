"use client";

import * as React from "react";
import { translations, LanguageCode } from "@/lib/translations";

interface LanguageContextType {
  locale: LanguageCode;
  setLocale: (locale: LanguageCode) => void;
  t: (key: keyof typeof translations["en"]) => string;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax`;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<LanguageCode>("en");

  React.useEffect(() => {
    const cookieLocale = getCookie("locale") as LanguageCode | undefined;
    const localLocale = localStorage.getItem("locale") as LanguageCode | undefined;
    const initialLocale = cookieLocale || localLocale || "en";

    if (translations[initialLocale]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(initialLocale);
    }
  }, []);

  const changeLocale = React.useCallback((newLocale: LanguageCode) => {
    if (translations[newLocale]) {
      setLocaleState(newLocale);
      setCookie("locale", newLocale);
      localStorage.setItem("locale", newLocale);
      window.dispatchEvent(new Event("locale-change"));
    }
  }, []);

  React.useEffect(() => {
    const handleLocaleChange = () => {
      const currentLocale = (getCookie("locale") || localStorage.getItem("locale") || "en") as LanguageCode;
      if (translations[currentLocale] && currentLocale !== locale) {
        setLocaleState(currentLocale);
      }
    };

    window.addEventListener("locale-change", handleLocaleChange);
    window.addEventListener("storage", handleLocaleChange);

    return () => {
      window.removeEventListener("locale-change", handleLocaleChange);
      window.removeEventListener("storage", handleLocaleChange);
    };
  }, [locale]);

  const t = React.useCallback((key: keyof typeof translations["en"]) => {
    const langDict = (translations[locale] || translations["en"]) as any;
    return langDict[key] || translations["en"][key] || String(key);
  }, [locale]);

  const contextValue = React.useMemo(() => ({
    locale,
    setLocale: changeLocale,
    t
  }), [locale, changeLocale, t]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
