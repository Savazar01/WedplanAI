"use server";

import { db } from "@/db/client";
import { users, emailConfigurations } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { seedSampleWedding } from "@/lib/seed-sample-wedding";
import { getActiveWedding } from "@/lib/wedding-helper";
import { sendEmail } from "@/lib/mailer";

export async function createSubsequentUserAction(prevState: { success?: boolean; error?: string; emailSent?: boolean; emailError?: string } | null, formData: FormData) {
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
        shouldChangePassword: true,
        weddingId: (role === "client" || role === "user")
          ? (weddingAccess === "all" ? (wedding?.id || null) : weddingAccess)
          : null
      })
      .where(eq(users.id, result.user.id));

    if (role === "admin") {
      await seedSampleWedding(result.user.id);
    }

    // Check if email integration is active
    let emailSent = false;
    let emailError: string | undefined = undefined;

    const [emailConfig] = await db
      .select()
      .from(emailConfigurations)
      .where(eq(emailConfigurations.isActive, true))
      .limit(1);

    if (emailConfig && emailConfig.provider !== "disabled") {
      try {
        const emailResult = await sendEmail({
          to: email,
          subject: "Your WedplanAI Account Credentials",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #6771ab;">Welcome to Wedding Task Planner!</h2>
              <p>Hello ${name},</p>
              <p>Your administrator has created a new account for you. Here are your login credentials:</p>
              <table style="border-collapse: collapse; width: 100%; max-width: 400px; margin: 20px 0;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Email</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">Password</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${password}</td>
                </tr>
              </table>
              <p style="font-weight: bold; color: #ef4444;">For security reasons, you will be required to change your password upon your first login.</p>
              <p>Best regards,<br/>The Wedding Task Planner Team</p>
            </div>
          `,
        });
        if (emailResult.success) {
          emailSent = true;
        } else {
          emailError = emailResult.error;
        }
      } catch (err) {
        emailError = err instanceof Error ? err.message : "Failed to send credentials email.";
      }
    }

    revalidatePath("/dashboard/admin/users");
    return { success: true, emailSent, emailError };
  } catch (error) {
    console.error("Error creating user:", error);
    const message = error instanceof Error ? error.message : "Failed to create user.";
    return { error: message };
  }
}

export async function editUserAction(
  userId: string,
  name: string,
  role: string,
  persona: string,
  weddingAccess: string
) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  if (!userId || !name || !role) {
    return { error: "Name and role are required." };
  }

  if (role !== "admin" && role !== "user" && role !== "client") {
    return { error: "Invalid role selected." };
  }

  try {
    const wedding = await getActiveWedding(session.user.id);
    const weddingIdValue = (role === "client" || role === "user")
      ? (weddingAccess === "all" ? (wedding?.id || null) : weddingAccess)
      : null;

    await db.update(users)
      .set({
        name,
        role,
        persona,
        weddingAccess,
        weddingId: weddingIdValue,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error editing user:", error);
    return { error: error instanceof Error ? error.message : "Failed to edit user." };
  }
}

export async function deleteUserAction(userId: string) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  if (session.user.id === userId) {
    return { error: "Admins cannot delete themselves." };
  }

  try {
    await db.delete(users).where(eq(users.id, userId));
    revalidatePath("/dashboard/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: error instanceof Error ? error.message : "Failed to delete user." };
  }
}
