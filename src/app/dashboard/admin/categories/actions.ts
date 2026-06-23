"use server";

import { db } from "@/db/client";
import { taskCategories } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function listCategoriesAction() {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    throw new Error("Unauthorized. Admin role required.");
  }
  return await db.select().from(taskCategories).orderBy(taskCategories.name);
}

export async function createCategoryAction(data: {
  key: string;
  name: string;
  followUpQuestions?: string;
}) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  if (!data.key || !data.name) {
    return { error: "Key and name are required." };
  }

  if (data.followUpQuestions) {
    try {
      JSON.parse(data.followUpQuestions);
    } catch {
      return { error: "Follow-up questions must be a valid JSON array or object." };
    }
  }

  try {
    const existing = await db
      .select()
      .from(taskCategories)
      .where(eq(taskCategories.key, data.key))
      .limit(1);

    if (existing.length > 0) {
      return { error: `A category with key "${data.key}" already exists.` };
    }

    await db.insert(taskCategories).values({
      key: data.key,
      name: data.name,
      followUpQuestions: data.followUpQuestions || null,
    });

    revalidatePath("/dashboard/admin/categories");
    return { success: true };
  } catch (err) {
    console.error("Error creating category:", err);
    const msg = err instanceof Error ? err.message : "Failed to create category.";
    return { error: msg };
  }
}

export async function updateCategoryAction(
  id: string,
  data: {
    key: string;
    name: string;
    followUpQuestions?: string;
  }
) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  if (!data.key || !data.name) {
    return { error: "Key and name are required." };
  }

  if (data.followUpQuestions) {
    try {
      JSON.parse(data.followUpQuestions);
    } catch {
      return { error: "Follow-up questions must be a valid JSON array or object." };
    }
  }

  try {
    const existing = await db
      .select()
      .from(taskCategories)
      .where(eq(taskCategories.key, data.key))
      .limit(1);

    if (existing.length > 0 && existing[0].id !== id) {
      return { error: `Another category with key "${data.key}" already exists.` };
    }

    await db
      .update(taskCategories)
      .set({
        key: data.key,
        name: data.name,
        followUpQuestions: data.followUpQuestions || null,
        updatedAt: new Date(),
      })
      .where(eq(taskCategories.id, id));

    revalidatePath("/dashboard/admin/categories");
    return { success: true };
  } catch (err) {
    console.error("Error updating category:", err);
    const msg = err instanceof Error ? err.message : "Failed to update category.";
    return { error: msg };
  }
}

export async function deleteCategoryAction(id: string) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  try {
    await db.delete(taskCategories).where(eq(taskCategories.id, id));
    revalidatePath("/dashboard/admin/categories");
    return { success: true };
  } catch (err) {
    console.error("Error deleting category:", err);
    const msg = err instanceof Error ? err.message : "Failed to delete category.";
    return { error: msg };
  }
}
