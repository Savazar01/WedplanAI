"use server";

import { db } from "@/db/client";
import { whatsappConfigurations } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { eq } from "drizzle-orm";

export async function getWhatsAppConfigAction() {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  try {
    const configs = await db.select().from(whatsappConfigurations).limit(1);
    return { success: true, config: configs[0] || null };
  } catch (error) {
    console.error("getWhatsAppConfigAction error:", error);
    return { error: "Failed to fetch WhatsApp configuration." };
  }
}

export async function saveWhatsAppConfigAction(data: {
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  apiVersion: string;
  isActive: boolean;
}) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  if (!data.phoneNumberId || !data.businessAccountId || !data.accessToken) {
    return { error: "Phone Number ID, Business Account ID, and System Access Token are required." };
  }

  try {
    // If setting to active, deactivate other configurations
    if (data.isActive) {
      await db.update(whatsappConfigurations).set({ isActive: false });
    }

    const existing = await db.select().from(whatsappConfigurations).limit(1);

    if (existing.length > 0) {
      await db
        .update(whatsappConfigurations)
        .set({
          phoneNumberId: data.phoneNumberId,
          businessAccountId: data.businessAccountId,
          accessToken: data.accessToken,
          apiVersion: data.apiVersion || "v20.0",
          isActive: data.isActive,
          updatedAt: new Date(),
        })
        .where(eq(whatsappConfigurations.id, existing[0].id));
    } else {
      await db.insert(whatsappConfigurations).values({
        phoneNumberId: data.phoneNumberId,
        businessAccountId: data.businessAccountId,
        accessToken: data.accessToken,
        apiVersion: data.apiVersion || "v20.0",
        isActive: data.isActive,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("saveWhatsAppConfigAction error:", error);
    return { error: error instanceof Error ? error.message : "Failed to save WhatsApp configuration." };
  }
}

export async function sendTestWhatsAppAction(to: string) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  if (!to) {
    return { error: "Recipient phone number is required." };
  }

  try {
    // Mock successful validation of the token and sending the test message
    const configs = await db.select().from(whatsappConfigurations).limit(1);
    if (configs.length === 0) {
      return { error: "No WhatsApp configuration found to test." };
    }

    // Simulate standard template message send or validation delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return { success: true };
  } catch (error) {
    console.error("sendTestWhatsAppAction error:", error);
    return { error: error instanceof Error ? error.message : "Failed to send test WhatsApp message." };
  }
}
