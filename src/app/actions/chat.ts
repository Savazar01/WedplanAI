"use server";

import { db } from "@/db/client";
import { chatMessages, guests, weddings } from "@/db/schema";
import { eq, and, or, asc } from "drizzle-orm";
import { getServerSession } from "@/lib/auth-server";
import { getPreviewCode } from "@/lib/preview";

export async function getChatMessagesAction(weddingId: string) {
  try {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.weddingId, weddingId))
      .orderBy(asc(chatMessages.createdAt));

    return { success: true, messages };
  } catch (error) {
    console.error("Error in getChatMessagesAction:", error);
    return { error: error instanceof Error ? error.message : "Failed to fetch chat messages." };
  }
}

export async function sendChatMessageAction(
  message: string,
  senderName: string,
  senderRole: string,
  weddingId: string,
  guestCode?: string
) {
  // 1. Validate required fields
  if (!message || !senderName || !senderRole || !weddingId) {
    return { error: "Message, senderName, senderRole, and weddingId are required." };
  }

  let senderEmail: string | null = null;

  try {
    // 2. Perform role-based validation
    if (senderRole === "guest") {
      // Verifies guestCode. If not provided, returns { error: "Guest code is required." }
      if (!guestCode) {
        return { error: "Guest code is required." };
      }

      const code = guestCode.trim();
      let isCodeValid = false;

      // Either guestCode === getPreviewCode(weddingId)
      if (code === getPreviewCode(weddingId)) {
        isCodeValid = true;
      } else {
        // or there is a record in the guests table where loginCode matches guestCode (case-insensitive) and weddingId matches weddingId
        const guestRecord = await db
          .select()
          .from(guests)
          .where(
            and(
              eq(guests.weddingId, weddingId),
              or(
                eq(guests.loginCode, code.toLowerCase()),
                eq(guests.loginCode, code.toUpperCase())
              )
            )
          )
          .limit(1);

        if (guestRecord.length > 0) {
          isCodeValid = true;
          // Optionally extracts the guest's email to save in senderEmail
          senderEmail = guestRecord[0].email || null;
        }
      }

      // If validation fails, returns { error: "Invalid guest invitation code." }
      if (!isCodeValid) {
        return { error: "Invalid guest invitation code." };
      }
    } else {
      // Retrieves the logged-in user session using getServerSession()
      const session = await getServerSession();
      // If no session or user, returns { error: "Unauthorized: Please log in." }
      if (!session || !session.user) {
        return { error: "Unauthorized: Please log in." };
      }

      const user = session.user as any;
      let isAuthorized = false;

      // Verifies user access to the wedding:
      // Allow if user role is "admin"
      if (user.role === "admin") {
        isAuthorized = true;
      }
      // Or user weddingAccess === "all" or user weddingAccess === weddingId or user weddingId === weddingId
      else if (
        user.weddingAccess === "all" ||
        user.weddingAccess === weddingId ||
        user.weddingId === weddingId
      ) {
        isAuthorized = true;
      } else {
        // Or user id is the owner of the wedding (userId in weddings table matches the user's id)
        const [weddingRecord] = await db
          .select({ userId: weddings.userId })
          .from(weddings)
          .where(eq(weddings.id, weddingId))
          .limit(1);

        if (weddingRecord && weddingRecord.userId === user.id) {
          isAuthorized = true;
        }
      }

      // If none of these match, returns { error: "Unauthorized access to this wedding's chat." }
      if (!isAuthorized) {
        return { error: "Unauthorized access to this wedding's chat." };
      }

      // Extracts the user's email to save in senderEmail
      senderEmail = user.email || null;
    }

    // 3. Insert a new chat message
    const [insertedMessage] = await db
      .insert(chatMessages)
      .values({
        weddingId,
        message,
        senderName,
        senderRole,
        senderEmail,
      })
      .returning();

    return { success: true, message: insertedMessage };
  } catch (error) {
    console.error("Error in sendChatMessageAction:", error);
    return { error: error instanceof Error ? error.message : "Failed to send chat message." };
  }
}
