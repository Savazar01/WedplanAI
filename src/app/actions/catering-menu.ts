"use server";

import { db } from "@/db/client";
import { cateringMenus, tasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface CateringMenuInput {
  weddingId: string;
  ceremonyId: string;
  vendorId?: string | null;
  cuisine?: string | null;
  guestCount: number;
  appetizers?: string | null;
  mainCourses?: string | null;
  desserts?: string | null;
  drinks?: string | null;
  notes?: string | null;
}

export async function getCateringMenus(weddingId: string) {
  try {
    const menus = await db
      .select()
      .from(cateringMenus)
      .where(eq(cateringMenus.weddingId, weddingId))
      .orderBy(cateringMenus.createdAt);
    return { success: true, data: menus };
  } catch (error) {
    console.error("Error getting catering menus:", error);
    return { success: false, error: "Failed to fetch catering menus." };
  }
}

export async function createCateringMenu(input: CateringMenuInput) {
  try {
    const [menu] = await db
      .insert(cateringMenus)
      .values({
        weddingId: input.weddingId,
        ceremonyId: input.ceremonyId,
        vendorId: input.vendorId || null,
        cuisine: input.cuisine || null,
        guestCount: input.guestCount || 0,
        appetizers: input.appetizers || null,
        mainCourses: input.mainCourses || null,
        desserts: input.desserts || null,
        drinks: input.drinks || null,
        notes: input.notes || null,
      })
      .returning();

    revalidatePath("/dashboard/menu-plan");
    return { success: true, data: menu };
  } catch (error) {
    console.error("Error creating catering menu:", error);
    return { success: false, error: "Failed to create catering menu." };
  }
}

export async function updateCateringMenu(id: string, input: Partial<CateringMenuInput>) {
  try {
    const [updatedMenu] = await db
      .update(cateringMenus)
      .set({
        ceremonyId: input.ceremonyId,
        vendorId: input.vendorId !== undefined ? input.vendorId : undefined,
        cuisine: input.cuisine !== undefined ? input.cuisine : undefined,
        guestCount: input.guestCount !== undefined ? input.guestCount : undefined,
        appetizers: input.appetizers !== undefined ? input.appetizers : undefined,
        mainCourses: input.mainCourses !== undefined ? input.mainCourses : undefined,
        desserts: input.desserts !== undefined ? input.desserts : undefined,
        drinks: input.drinks !== undefined ? input.drinks : undefined,
        notes: input.notes !== undefined ? input.notes : undefined,
        updatedAt: new Date(),
      })
      .where(eq(cateringMenus.id, id))
      .returning();

    revalidatePath("/dashboard/menu-plan");
    return { success: true, data: updatedMenu };
  } catch (error) {
    console.error("Error updating catering menu:", error);
    return { success: false, error: "Failed to update catering menu." };
  }
}

export async function deleteCateringMenu(id: string) {
  try {
    // Unlink from any tasks first
    await db
      .update(tasks)
      .set({ cateringMenuId: null })
      .where(eq(tasks.cateringMenuId, id));

    await db
      .delete(cateringMenus)
      .where(eq(cateringMenus.id, id));

    revalidatePath("/dashboard/menu-plan");
    return { success: true };
  } catch (error) {
    console.error("Error deleting catering menu:", error);
    return { success: false, error: "Failed to delete catering menu." };
  }
}
