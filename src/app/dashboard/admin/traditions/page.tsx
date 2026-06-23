import { db } from "@/db/client";
import { weddingTraditions } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import TraditionsAdminClient from "./TraditionsAdminClient";

export default async function TraditionsAdminPage() {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const allTraditions = await db.select().from(weddingTraditions).orderBy(weddingTraditions.name);

  return <TraditionsAdminClient initialTraditions={allTraditions} />;
}
