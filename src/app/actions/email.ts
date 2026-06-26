"use server";

import { db } from "@/db/client";
import { emailConfigurations } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/mailer";

export async function getEmailConfigAction() {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  try {
    const configs = await db.select().from(emailConfigurations).limit(1);
    return { success: true, config: configs[0] || null };
  } catch (error) {
    console.error("getEmailConfigAction error:", error);
    return { error: "Failed to fetch email configuration." };
  }
}

export async function saveEmailConfigAction(data: {
  provider: "gmail" | "sendgrid" | "disabled";
  senderEmail: string;
  clientId?: string | null;
  clientSecret?: string | null;
  refreshToken?: string | null;
  apiKey?: string | null;
  isActive: boolean;
}) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  if (!data.provider || !data.senderEmail) {
    return { error: "Provider and Sender Email are required fields." };
  }

  try {
    // If setting to active, deactivate other configurations
    if (data.isActive) {
      await db.update(emailConfigurations).set({ isActive: false });
    }

    const existing = await db.select().from(emailConfigurations).limit(1);

    if (existing.length > 0) {
      await db
        .update(emailConfigurations)
        .set({
          provider: data.provider,
          senderEmail: data.senderEmail,
          clientId: data.clientId || null,
          clientSecret: data.clientSecret || null,
          refreshToken: data.refreshToken || null,
          apiKey: data.apiKey || null,
          isActive: data.isActive,
          updatedAt: new Date(),
        })
        .where(eq(emailConfigurations.id, existing[0].id));
    } else {
      await db.insert(emailConfigurations).values({
        provider: data.provider,
        senderEmail: data.senderEmail,
        clientId: data.clientId || null,
        clientSecret: data.clientSecret || null,
        refreshToken: data.refreshToken || null,
        apiKey: data.apiKey || null,
        isActive: data.isActive,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("saveEmailConfigAction error:", error);
    return { error: error instanceof Error ? error.message : "Failed to save email configuration." };
  }
}

export async function sendTestEmailAction(to: string) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  if (!to) {
    return { error: "Recipient email is required for testing." };
  }

  try {
    const result = await sendEmail({
      to,
      subject: "WedPlanAI - Test Email Connection",
      html: `
        <div style="font-family: sans-serif; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <h2 style="color: #6771ab; margin-top: 0;">WedPlanAI Connection Verified!</h2>
          <p style="font-size: 16px; color: #334155;">Hello,</p>
          <p style="font-size: 16px; color: #334155; line-height: 1.5;">This email confirms that your SMTP/OAuth2 configuration with WedPlanAI is successfully established and online.</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #475569;"><strong>Test Recipient:</strong> ${to}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #475569;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">You can now send guest invitations directly through the WedPlanAI guest list dashboard.</p>
        </div>
      `,
    });

    if (result.error) {
      return { error: result.error };
    }

    return { success: true };
  } catch (error) {
    console.error("sendTestEmailAction error:", error);
    return { error: error instanceof Error ? error.message : "Failed to send test email." };
  }
}
