"use server";

import { db } from "@/db/client";
import { weddings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getActiveWedding(userId: string) {
  const cookieStore = await cookies();
  const activeWeddingId = cookieStore.get("active_wedding_id")?.value;

  if (activeWeddingId) {
    const weddingResult = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, activeWeddingId), eq(weddings.userId, userId)))
      .limit(1);

    if (weddingResult.length > 0) {
      return weddingResult[0];
    }
  }

  const firstWeddingResult = await db
    .select()
    .from(weddings)
    .where(eq(weddings.userId, userId))
    .limit(1);

  if (firstWeddingResult.length > 0) {
    return firstWeddingResult[0];
  }

  return null;
}

export async function switchWeddingAction(weddingId: string) {
  const cookieStore = await cookies();
  cookieStore.set("active_wedding_id", weddingId);
  redirect("/dashboard");
}
