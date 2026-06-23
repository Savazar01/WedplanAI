"use server";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { seedSampleWedding } from "@/lib/seed-sample-wedding";

import { getActiveWedding } from "@/lib/wedding-helper";

export async function createSubsequentUserAction(prevState: { success?: boolean; error?: string } | null, formData: FormData) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const persona = (formData.get("persona") as string) || "diy";

  if (!name || !email || !password || !role) {
    return { error: "All fields are required." };
  }

  if (role !== "admin" && role !== "user" && role !== "client") {
    return { error: "Invalid role selected." };
  }

  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return { error: "A user with this email already exists." };
    }

    const wedding = await getActiveWedding(session.user.id);
    const weddingAccess = (formData.get("weddingAccess") as string) || "all";

    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        persona,
      },
    });

    if (!result || !result.user) {
      return { error: "Failed to create user account." };
    }

    await db.update(users)
      .set({ 
        role: role,
        persona: persona,
        weddingAccess: weddingAccess,
        weddingId: (role === "client" || role === "user")
          ? (weddingAccess === "all" ? (wedding?.id || null) : weddingAccess)
          : null
      })
      .where(eq(users.id, result.user.id));

    if (role === "admin") {
      await seedSampleWedding(result.user.id);
    }

    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    const message = error instanceof Error ? error.message : "Failed to create user.";
    return { error: message };
  }
}
