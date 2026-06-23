"use server";

import { db } from "@/db/client";
import { weddings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ensureDefaultColumns } from "@/lib/wedding-helper";

export async function submitCoupleOnboardingAction(
  weddingId: string,
  data: {
    partnerA: string;
    partnerB: string;
    weddingDate: string;
    location: string;
    tradition: string;
    customTradition?: string;
    budget: number;
  }
) {
  if (!weddingId) {
    return { error: "Wedding ID is required." };
  }

  const { partnerA, partnerB, weddingDate, location, tradition, customTradition, budget } = data;

  if (!partnerA.trim() || !partnerB.trim() || !weddingDate || !location.trim() || !tradition) {
    return { error: "All fields are required." };
  }

  const weddingDateObj = new Date(weddingDate);
  if (isNaN(weddingDateObj.getTime())) {
    return { error: "Invalid wedding date." };
  }

  const budgetInt = Number(budget);
  if (isNaN(budgetInt) || budgetInt < 0) {
    return { error: "Budget must be a non-negative number." };
  }

  const finalTradition = tradition === "other" && customTradition ? customTradition : tradition;

  try {
    // Check if the wedding exists first
    const existing = await db.select().from(weddings).where(eq(weddings.id, weddingId)).limit(1);
    if (existing.length === 0) {
      return { error: "Wedding event not found." };
    }

    await db.update(weddings)
      .set({
        partnerA: partnerA.trim(),
        partnerB: partnerB.trim(),
        weddingDate: weddingDateObj,
        location: location.trim(),
        tradition: finalTradition.trim(),
        budget: budgetInt,
        updatedAt: new Date(),
      })
      .where(eq(weddings.id, weddingId));

    await ensureDefaultColumns(weddingId);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Failed to update couple onboarding details:", error);
    return { error: error instanceof Error ? error.message : "Failed to update details." };
  }
}
