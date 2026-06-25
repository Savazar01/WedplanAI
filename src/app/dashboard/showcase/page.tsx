import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding } from "@/lib/wedding-helper";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { rituals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Suspense } from "react";
import BuildShowcaseClient from "./BuildShowcaseClient";
import { getPreviewCode } from "@/lib/preview";

export default async function ShowcasePage() {
  const session = await getServerSession();
  if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "client")) {
    redirect("/dashboard");
  }

  const wedding = await getActiveWedding(session.user.id);
  if (!wedding) {
    redirect("/dashboard");
  }

  const dbRituals = await db
    .select()
    .from(rituals)
    .where(eq(rituals.weddingId, wedding.id));

  return (
    <main className="w-full max-w-7xl mr-auto p-6 md:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Wedding Showcase Builder</h1>
        <p className="text-sm text-slate-500">
          Design and preview the public landing page that your guests will see.
        </p>
      </div>

      <Suspense fallback={<div className="text-sm text-slate-500">Loading showcase builder...</div>}>
        <BuildShowcaseClient wedding={wedding} rituals={dbRituals} previewCode={getPreviewCode(wedding.id)} />
      </Suspense>
    </main>
  );
}
