"use server";

import { db } from "@/db/client";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { seedSampleWedding } from "@/lib/seed-sample-wedding";

export async function signupAction(prevState: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const persona = (formData.get("persona") as string) || "diy";

  if (!name || !email || !password) {
    return { error: "All fields are required." };
  }

  try {
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      return { error: "Public registration is closed. Please contact the administrator." };
    }

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
      .set({ role: "admin", persona })
      .where(eq(users.id, result.user.id));

    await seedSampleWedding(result.user.id);

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred during signup.";
    return { error: errorMessage };
  }
}

export async function isRegistrationClosed() {
  try {
    const existingUsers = await db.select().from(users).limit(1);
    return existingUsers.length > 0;
  } catch {
    return false;
  }
}
