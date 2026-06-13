import { db } from "@/db/client";
import { users } from "@/db/schema";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import LoginFormClient from "./LoginFormClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const existingUsers = await db.select().from(users).limit(1);
  const showRegisterLink = existingUsers.length === 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card variant="cream" className="w-full max-w-md p-8 shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-3xl font-bold text-[#6771ab] tracking-tight">Savazar.com</h1>
          <p className="text-sm text-slate-500 mt-1">Wedding Event Planner</p>
        </div>

        <Suspense fallback={<div className="text-center text-sm py-4">Loading...</div>}>
          <LoginFormClient />
        </Suspense>

        {showRegisterLink && (
          <p className="text-center text-xs text-slate-500 mt-6 font-sans">
            No admin user registered yet.{" "}
            <Link href="/signup" className="text-[#6771ab] font-semibold hover:underline">
              Create Admin Account
            </Link>
          </p>
        )}
      </Card>
    </div>
  );
}
