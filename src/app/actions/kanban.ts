"use server";

import { db } from "@/db/client";
import { tasks, weddings } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { getActiveWedding } from "@/lib/wedding-helper";
import { revalidatePath } from "next/cache";

export async function createTaskAction(data: {
  title: string;
  description?: string;
  category: string;
  dueDate?: string;
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
    const currentTasks = await db.select().from(tasks).where(eq(tasks.weddingId, weddingId));
    const position = currentTasks.length;

    await db.insert(tasks).values({
      weddingId,
      title: data.title,
      description: data.description || "",
      category: data.category,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      status: "todo",
      position,
      isCustom: true,
    });

    revalidatePath("/kanban");
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
    await db
      .update(tasks)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(tasks.id, taskId));

    revalidatePath("/kanban");
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

    revalidatePath("/kanban");
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
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId));

    revalidatePath("/kanban");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update task error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update task";
    return { error: errorMessage };
  }
}

