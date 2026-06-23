"use server";

import { db } from "@/db/client";
import { weddingTraditions } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function listTraditionsAction() {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    throw new Error("Unauthorized. Admin role required.");
  }
  return await db.select().from(weddingTraditions).orderBy(weddingTraditions.name);
}

export async function createTraditionAction(data: {
  key: string;
  name: string;
  description?: string;
  seedTasks?: string;
  seedCeremonies?: string;
}) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  if (!data.key || !data.name) {
    return { error: "Key and name are required." };
  }

  if (data.seedTasks) {
    try {
      JSON.parse(data.seedTasks);
    } catch {
      return { error: "Seed tasks must be a valid JSON array or object." };
    }
  }
  if (data.seedCeremonies) {
    try {
      JSON.parse(data.seedCeremonies);
    } catch {
      return { error: "Seed ceremonies must be a valid JSON array or object." };
    }
  }

  try {
    const existing = await db
      .select()
      .from(weddingTraditions)
      .where(eq(weddingTraditions.key, data.key))
      .limit(1);

    if (existing.length > 0) {
      return { error: `A tradition with key "${data.key}" already exists.` };
    }

    await db.insert(weddingTraditions).values({
      key: data.key,
      name: data.name,
      description: data.description || null,
      seedTasks: data.seedTasks || null,
      seedCeremonies: data.seedCeremonies || null,
    });

    revalidatePath("/dashboard/admin/traditions");
    return { success: true };
  } catch (err) {
    console.error("Error creating tradition:", err);
    const msg = err instanceof Error ? err.message : "Failed to create tradition.";
    return { error: msg };
  }
}

export async function updateTraditionAction(
  id: string,
  data: {
    key: string;
    name: string;
    description?: string;
    seedTasks?: string;
    seedCeremonies?: string;
  }
) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  if (!data.key || !data.name) {
    return { error: "Key and name are required." };
  }

  if (data.seedTasks) {
    try {
      JSON.parse(data.seedTasks);
    } catch {
      return { error: "Seed tasks must be a valid JSON array or object." };
    }
  }
  if (data.seedCeremonies) {
    try {
      JSON.parse(data.seedCeremonies);
    } catch {
      return { error: "Seed ceremonies must be a valid JSON array or object." };
    }
  }

  try {
    const existing = await db
      .select()
      .from(weddingTraditions)
      .where(eq(weddingTraditions.key, data.key))
      .limit(1);

    if (existing.length > 0 && existing[0].id !== id) {
      return { error: `Another tradition with key "${data.key}" already exists.` };
    }

    await db
      .update(weddingTraditions)
      .set({
        key: data.key,
        name: data.name,
        description: data.description || null,
        seedTasks: data.seedTasks || null,
        seedCeremonies: data.seedCeremonies || null,
        updatedAt: new Date(),
      })
      .where(eq(weddingTraditions.id, id));

    revalidatePath("/dashboard/admin/traditions");
    return { success: true };
  } catch (err) {
    console.error("Error updating tradition:", err);
    const msg = err instanceof Error ? err.message : "Failed to update tradition.";
    return { error: msg };
  }
}

export async function deleteTraditionAction(id: string) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  try {
    await db.delete(weddingTraditions).where(eq(weddingTraditions.id, id));
    revalidatePath("/dashboard/admin/traditions");
    return { success: true };
  } catch (err) {
    console.error("Error deleting tradition:", err);
    const msg = err instanceof Error ? err.message : "Failed to delete tradition.";
    return { error: msg };
  }
}
