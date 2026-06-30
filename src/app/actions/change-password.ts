"use server";

import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/auth-server";
import { headers } from "next/headers";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function changePasswordAction(prevState: { success?: boolean; error?: string } | null, formData: FormData) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized. Please sign in." };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required." };
  }

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }

  try {
    const headerStore = await headers();
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
      },
      headers: headerStore,
    });

    await db.update(users)
      .set({ shouldChangePassword: false })
      .where(eq(users.id, session.user.id));

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to change password.";
    return { error: message };
  }
}
