"use server";

import { db } from "@/db/client";
import { apiKeys } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding } from "@/lib/wedding-helper";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export async function createApiKeyAction(name: string, scope: 'wedding' | 'global' = 'wedding') {
  const session = await getServerSession();
  if (!session || !session.user || (session.user as { role?: string }).role !== "admin") {
    throw new Error("Unauthorized");
  }

  let weddingId: string | null = null;

  if (scope === 'wedding') {
    const wedding = await getActiveWedding(session.user.id);
    if (!wedding) {
      throw new Error("No active wedding found");
    }
    weddingId = wedding.id;
  }

  const token = crypto.randomBytes(24).toString("hex");
  const rawKey = `wp_live_${token}`;
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  await db.insert(apiKeys).values({
    weddingId,
    scope,
    userId: scope === 'global' ? session.user.id : null,
    name,
    keyHash,
    expiresAt,
  });

  revalidatePath("/dashboard/admin/api-keys");
  return { rawKey, success: true };
}

export async function revokeApiKeyAction(id: string) {
  const session = await getServerSession();
  if (!session || !session.user || (session.user as { role?: string }).role !== "admin") {
    throw new Error("Unauthorized");
  }

  const wedding = await getActiveWedding(session.user.id);
  if (!wedding) {
    throw new Error("No active wedding found");
  }

  await db.delete(apiKeys).where(eq(apiKeys.id, id));

  revalidatePath("/dashboard/admin/api-keys");
  return { success: true };
}
