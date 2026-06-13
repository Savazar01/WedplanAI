"use server";

import { db } from "@/db/client";
import { rituals, weddings } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createRitualAction(data: {
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  location: string;
}) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  if (end <= start) {
    return { error: "End time must be after the start time." };
  }

  const userWeddings = await db
    .select()
    .from(weddings)
    .where(eq(weddings.userId, session.user.id))
    .limit(1);

  if (userWeddings.length === 0) {
    return { error: "No wedding profile found." };
  }
  const weddingId = userWeddings[0].id;

  try {
    await db.insert(rituals).values({
      weddingId,
      name: data.name,
      description: data.description || "",
      startTime: start,
      endTime: end,
      location: data.location,
      isCustom: true,
    });

    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Create ritual error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create ritual";
    return { error: errorMessage };
  }
}

export async function updateRitualAction(
  ritualId: string,
  data: {
    name: string;
    description?: string;
    startTime: string;
    endTime: string;
    location: string;
  }
) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  if (end <= start) {
    return { error: "End time must be after the start time." };
  }

  try {
    await db
      .update(rituals)
      .set({
        name: data.name,
        description: data.description || "",
        startTime: start,
        endTime: end,
        location: data.location,
        updatedAt: new Date(),
      })
      .where(eq(rituals.id, ritualId));

    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update ritual error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update ritual";
    return { error: errorMessage };
  }
}

export async function deleteRitualAction(ritualId: string) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    await db.delete(rituals).where(eq(rituals.id, ritualId));

    revalidatePath("/calendar");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete ritual error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete ritual";
    return { error: errorMessage };
  }
}
