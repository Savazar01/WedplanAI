import { db } from "@/db/client";
import { weddingTraditions } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import TraditionsAdminClient from "./TraditionsAdminClient";
import { defaultTraditions } from "@/lib/default-seeds";

export default async function TraditionsAdminPage() {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  let allTraditions = await db.select().from(weddingTraditions).orderBy(weddingTraditions.name);

  const existingKeys = new Set(allTraditions.map((t) => t.key));
  const missingTraditions = defaultTraditions.filter((t) => !existingKeys.has(t.key));

  if (missingTraditions.length > 0) {
    await db.insert(weddingTraditions).values(missingTraditions);
    allTraditions = await db.select().from(weddingTraditions).orderBy(weddingTraditions.name);
  }

  return <TraditionsAdminClient initialTraditions={allTraditions} />;
}

