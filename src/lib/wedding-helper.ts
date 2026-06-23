"use server";

import { db } from "@/db/client";
import { weddings, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getActiveWedding(userId: string) {
  // First check if the user has an assigned weddingId in the users table
  const userResult = await db
    .select({ weddingId: users.weddingId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (userResult.length > 0 && userResult[0].weddingId) {
    const assignedWedding = await db
      .select()
      .from(weddings)
      .where(eq(weddings.id, userResult[0].weddingId))
      .limit(1);
    if (assignedWedding.length > 0) {
      return assignedWedding[0];
    }
  }

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

export async function ensureDefaultColumns(weddingId: string) {
  const { kanbanColumns, tasks } = await import("@/db/schema");
  
  const existingCols = await db
    .select()
    .from(kanbanColumns)
    .where(eq(kanbanColumns.weddingId, weddingId));

  if (existingCols.length > 0) {
    return existingCols;
  }

  console.log(`[Self-Healing] Seeding default columns for wedding ${weddingId}`);

  return await db.transaction(async (tx) => {
    // Seed default 3 columns
    const [todoCol] = await tx.insert(kanbanColumns).values({
      weddingId,
      name: "To-Do",
      type: "todo",
      color: "#6771ab",
      position: 0,
    }).returning();
    
    const [inProgressCol] = await tx.insert(kanbanColumns).values({
      weddingId,
      name: "In Progress",
      type: "in_progress",
      color: "#f59e0b",
      position: 1,
    }).returning();
    
    const [doneCol] = await tx.insert(kanbanColumns).values({
      weddingId,
      name: "Done",
      type: "done",
      color: "#22c55e",
      position: 2,
    }).returning();

    // Fetch all tasks for this wedding
    const weddingTasks = await tx
      .select()
      .from(tasks)
      .where(eq(tasks.weddingId, weddingId));

    for (const t of weddingTasks) {
      if (t.columnId) continue;
      let targetColId = todoCol.id;
      if (t.status === "in_progress") {
        targetColId = inProgressCol.id;
      } else if (t.status === "done") {
        targetColId = doneCol.id;
      }
      await tx
        .update(tasks)
        .set({ columnId: targetColId })
        .where(eq(tasks.id, t.id));
    }

    return [todoCol, inProgressCol, doneCol];
  });
}

