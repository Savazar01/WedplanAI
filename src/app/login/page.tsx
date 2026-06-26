import { db } from "@/db/client";
import { users } from "@/db/schema";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import LoginFormClient from "./LoginFormClient";
import { Suspense } from "react";
import { getLocaleServer } from "@/lib/i18n-server";
import { translations } from "@/lib/translations";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const existingUsers = await db.select().from(users).limit(1);
  const showRegisterLink = existingUsers.length === 0;
  const locale = await getLocaleServer();
  const t = (key: string) => (translations[locale] as Record<string, string>)?.[key] || (translations["en"] as Record<string, string>)[key];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card variant="cream" className="w-full max-w-md p-8 shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-3xl font-bold text-[#6771ab] tracking-tight">{t("login.heading")}</h1>
          <p className="text-sm text-slate-500 mt-1">{t("login.subtitle")}</p>
        </div>

        <Suspense fallback={<div className="text-center text-sm py-4">Loading...</div>}>
          <LoginFormClient />
        </Suspense>

        {showRegisterLink && (
          <p className="text-center text-xs text-slate-500 mt-6 font-sans">
            {t("login.noUsersNotice")}{" "}
            <Link href="/signup" className="text-[#6771ab] font-semibold hover:underline">
              {t("login.createAccount")}
            </Link>
          </p>
        )}
      </Card>
    </div>
  );
}
