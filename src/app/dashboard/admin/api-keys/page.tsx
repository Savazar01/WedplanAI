import { db } from "@/db/client";
import { apiKeys } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding } from "@/lib/wedding-helper";
import { redirect } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import ApiKeyManagerClient from "./ApiKeyManagerClient";

export default async function ApiKeysPage() {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const initialKeys = await db
    .select()
    .from(apiKeys)
    .orderBy(desc(apiKeys.createdAt));

  const serializedKeys = initialKeys.map((key) => ({
    id: key.id,
    weddingId: key.weddingId,
    scope: key.scope,
    name: key.name,
    keyHash: key.keyHash,
    createdAt: key.createdAt.toISOString(),
    expiresAt: key.expiresAt.toISOString(),
  }));

  return (
    <main className="w-full max-w-7xl mr-auto p-6 md:px-8">
      <ApiKeyManagerClient initialKeys={serializedKeys} />
    </main>
  );
}
