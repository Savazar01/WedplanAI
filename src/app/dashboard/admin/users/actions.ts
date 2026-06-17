"use server";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { seedSampleWedding } from "@/lib/seed-sample-wedding";

export async function createSubsequentUserAction(prevState: { success?: boolean; error?: string } | null, formData: FormData) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !password || !role) {
    return { error: "All fields are required." };
  }

  if (role !== "admin" && role !== "user") {
    return { error: "Invalid role selected." };
  }

  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return { error: "A user with this email already exists." };
    }

    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    if (!result || !result.user) {
      return { error: "Failed to create user account." };
    }

    await db.update(users)
      .set({ role: role })
      .where(eq(users.id, result.user.id));

    await seedSampleWedding(result.user.id);

    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    const message = error instanceof Error ? error.message : "Failed to create user.";
    return { error: message };
  }
}
