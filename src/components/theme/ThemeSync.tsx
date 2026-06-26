"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

export default function ThemeSync() {
  const pathname = usePathname();

  React.useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, [pathname]);

  return null;
}
