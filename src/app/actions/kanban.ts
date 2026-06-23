"use server";

import { db } from "@/db/client";
import { tasks, kanbanColumns } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq, asc, and } from "drizzle-orm";
import { getActiveWedding } from "@/lib/wedding-helper";
import { revalidatePath } from "next/cache";

export async function createColumnAction(data: { name: string; color: string }) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const wedding = await getActiveWedding(session.user.id);
  if (!wedding) {
    return { error: "No wedding profile found." };
  }
  const weddingId = wedding.id;

  try {
    const currentColumns = await db
      .select()
      .from(kanbanColumns)
      .where(eq(kanbanColumns.weddingId, weddingId));
    const position = currentColumns.length;

    await db.insert(kanbanColumns).values({
      weddingId,
      name: data.name,
      color: data.color,
      position,
      type: "custom",
    });

    revalidatePath("/wedding-task-planner");
    revalidatePath("/dashboard/wedding-task-planner");
    return { success: true };
  } catch (error) {
    console.error("Create column error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create column";
    return { error: errorMessage };
  }
}

export async function updateColumnAction(columnId: string, data: { name: string; color: string }) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    await db
      .update(kanbanColumns)
      .set({
        name: data.name,
        color: data.color,
        updatedAt: new Date(),
      })
      .where(eq(kanbanColumns.id, columnId));

    revalidatePath("/wedding-task-planner");
    revalidatePath("/dashboard/wedding-task-planner");
    return { success: true };
  } catch (error) {
    console.error("Update column error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update column";
    return { error: errorMessage };
  }
}

export async function deleteColumnAction(columnId: string) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    const existingTasks = await db
      .select({ id: tasks.id })
      .from(tasks)
      .where(eq(tasks.columnId, columnId))
      .limit(1);

    if (existingTasks.length > 0) {
      return { error: "Cannot delete column containing tasks. Please move them first." };
    }

    await db.delete(kanbanColumns).where(eq(kanbanColumns.id, columnId));

    revalidatePath("/wedding-task-planner");
    revalidatePath("/dashboard/wedding-task-planner");
    return { success: true };
  } catch (error) {
    console.error("Delete column error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete column";
    return { error: errorMessage };
  }
}

export async function reorderColumnsAction(columnIds: string[]) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    for (let i = 0; i < columnIds.length; i++) {
      await db
        .update(kanbanColumns)
        .set({ position: i, updatedAt: new Date() })
        .where(eq(kanbanColumns.id, columnIds[i]));
    }

    revalidatePath("/wedding-task-planner");
    revalidatePath("/dashboard/wedding-task-planner");
    return { success: true };
  } catch (error) {
    console.error("Reorder columns error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to reorder columns";
    return { error: errorMessage };
  }
}

export async function createTaskAction(data: {
  title: string;
  description?: string;
  category: string;
  dueDate?: string;
  ceremonyId?: string | null;
  assignedUserId?: string | null;
  categoryData?: string | null;
}) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const wedding = await getActiveWedding(session.user.id);
  if (!wedding) {
    return { error: "No wedding profile found." };
  }
  const weddingId = wedding.id;

  try {
    const firstColumn = await db
      .select()
      .from(kanbanColumns)
      .where(eq(kanbanColumns.weddingId, weddingId))
      .orderBy(asc(kanbanColumns.position))
      .limit(1)
      .then((rows) => rows[0]);

    if (!firstColumn) {
      return { error: "No columns found for the wedding. Please create a column first." };
    }

    const currentTasks = await db.select().from(tasks).where(eq(tasks.weddingId, weddingId));
    const position = currentTasks.length;

    await db.insert(tasks).values({
      weddingId,
      columnId: firstColumn.id,
      title: data.title,
      description: data.description || "",
      category: data.category,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: "todo",
      position,
      isCustom: true,
      ceremonyId: data.ceremonyId || null,
      assignedUserId: data.assignedUserId || null,
      categoryData: data.categoryData || null,
    });

    revalidatePath("/wedding-task-planner");
    revalidatePath("/dashboard/wedding-task-planner");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Create task error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create task";
    return { error: errorMessage };
  }
}

export async function updateTaskStatusAction(taskId: string, newStatus: string) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(newStatus);
    let targetColumnId = newStatus;

    if (!isUuid) {
      const task = await db
        .select({ weddingId: tasks.weddingId })
        .from(tasks)
        .where(eq(tasks.id, taskId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!task) {
        return { error: "Task not found" };
      }

      let targetType = newStatus;
      if (newStatus === "backlog") {
        targetType = "todo";
      }

      const column = await db
        .select({ id: kanbanColumns.id })
        .from(kanbanColumns)
        .where(
          and(
            eq(kanbanColumns.weddingId, task.weddingId),
            eq(kanbanColumns.type, targetType)
          )
        )
        .limit(1)
        .then((rows) => rows[0]);

      if (!column) {
        return { error: `Column of type "${newStatus}" not found for this wedding.` };
      }
      targetColumnId = column.id;
    }

    await db
      .update(tasks)
      .set({ columnId: targetColumnId, status: newStatus, updatedAt: new Date() })
      .where(eq(tasks.id, taskId));

    revalidatePath("/wedding-task-planner");
    revalidatePath("/dashboard/wedding-task-planner");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update task status error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update task status";
    return { error: errorMessage };
  }
}

export async function deleteTaskAction(taskId: string) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    await db.delete(tasks).where(eq(tasks.id, taskId));

    revalidatePath("/wedding-task-planner");
    revalidatePath("/dashboard/wedding-task-planner");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete task error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete task";
    return { error: errorMessage };
  }
}

export async function updateTaskAction(
  taskId: string,
  data: {
    title: string;
    description?: string;
    category: string;
    dueDate?: string;
    ceremonyId?: string | null;
    assignedUserId?: string | null;
    categoryData?: string | null;
  }
) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    await db
      .update(tasks)
      .set({
        title: data.title,
        description: data.description || "",
        category: data.category,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        ceremonyId: data.ceremonyId || null,
        assignedUserId: data.assignedUserId || null,
        categoryData: data.categoryData || null,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId));

    revalidatePath("/wedding-task-planner");
    revalidatePath("/dashboard/wedding-task-planner");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update task error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update task";
    return { error: errorMessage };
  }
}

