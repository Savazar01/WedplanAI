"use server";

import { db } from "@/db/client";
import { guests, guestRsvps, ceremonies } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding } from "@/lib/wedding-helper";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { checkRateLimit } from "@/lib/rate-limit";

export async function createGuestAction(data: {
  name: string;
  email?: string;
  phone?: string;
  rsvpStatus: "pending" | "attending" | "declined";
  plusOneCount: number;
  dietaryRestrictions?: string;
  invitedCeremonies?: string;
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
    const loginCode = crypto.randomBytes(3).toString('hex');

    await db.insert(guests).values({
      weddingId,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      loginCode,
      rsvpStatus: data.rsvpStatus,
      plusOneCount: data.plusOneCount,
      dietaryRestrictions: data.dietaryRestrictions || null,
      invitedCeremonies: data.invitedCeremonies || "all",
    });

    revalidatePath("/guests");
    revalidatePath("/dashboard/guests");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Create guest error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create guest";
    return { error: errorMessage };
  }
}

export async function updateGuestRSVPAction(guestId: string, status: "pending" | "attending" | "declined") {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const wedding = await getActiveWedding(session.user.id);
  if (!wedding) return { error: "No wedding profile found." };

  try {
    await db
      .update(guests)
      .set({ rsvpStatus: status, updatedAt: new Date() })
      .where(and(eq(guests.id, guestId), eq(guests.weddingId, wedding.id)));

    revalidatePath("/guests");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update guest RSVP error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update RSVP";
    return { error: errorMessage };
  }
}

export async function deleteGuestAction(guestId: string) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const wedding = await getActiveWedding(session.user.id);
  if (!wedding) return { error: "No wedding profile found." };

  try {
    await db.delete(guests).where(and(eq(guests.id, guestId), eq(guests.weddingId, wedding.id)));

    revalidatePath("/guests");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete guest error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete guest";
    return { error: errorMessage };
  }
}

export async function updateGuestAction(
  guestId: string,
  data: {
    name: string;
    email?: string;
    phone?: string;
    rsvpStatus: "pending" | "attending" | "declined";
    plusOneCount: number;
    dietaryRestrictions?: string;
    invitedCeremonies?: string;
  }
) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const wedding = await getActiveWedding(session.user.id);
  if (!wedding) return { error: "No wedding profile found." };

  try {
    await db
      .update(guests)
      .set({
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        rsvpStatus: data.rsvpStatus,
        plusOneCount: data.plusOneCount,
        dietaryRestrictions: data.dietaryRestrictions || null,
        invitedCeremonies: data.invitedCeremonies !== undefined ? data.invitedCeremonies : "all",
        updatedAt: new Date(),
      })
      .where(and(eq(guests.id, guestId), eq(guests.weddingId, wedding.id)));

    revalidatePath("/guests");
    revalidatePath("/dashboard/guests");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Update guest error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update guest";
    return { error: errorMessage };
  }
}

export interface BatchGuestInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  rsvpStatus?: string;
  plusOneCount?: number | string;
  dietaryRestrictions?: string | null;
  invitedCeremonies?: string | null;
}

export async function batchInsertGuestsAction(weddingId: string, guestsList: BatchGuestInput[]) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  const wedding = await getActiveWedding(session.user.id);
  if (!wedding) return { error: "No wedding profile found." };
  if (wedding.id !== weddingId) return { error: "Unauthorized." };

  try {
    if (guestsList.length > 500) {
      return { error: 'Maximum 500 guests per import.' };
    }
    if (guestsList.length === 0) {
      return { error: 'No guests to import.' };
    }

    const dbCeremonies = await db.select().from(ceremonies).where(eq(ceremonies.weddingId, weddingId));
    const toInsert: {
      weddingId: string;
      name: string;
      email: string | null;
      phone: string | null;
      loginCode: string;
      rsvpStatus: "pending" | "attending" | "declined";
      plusOneCount: number;
      dietaryRestrictions: string | null;
      invitedCeremonies: string;
    }[] = [];

    for (const guest of guestsList) {
      const loginCode = crypto.randomBytes(3).toString('hex');

      let resolved = "all";
      if (guest.invitedCeremonies && guest.invitedCeremonies.trim() !== "") {
        const trimmed = guest.invitedCeremonies.trim().toLowerCase();
        if (trimmed !== "all") {
          const names = trimmed.split(",").map(n => n.trim().toLowerCase());
          const matchedIds = dbCeremonies
            .filter(c => names.includes(c.name.toLowerCase()))
            .map(c => c.id);
          if (matchedIds.length > 0) {
            resolved = matchedIds.join(",");
          }
        }
      }

      toInsert.push({
        weddingId,
        name: guest.name || "Unnamed Guest",
        email: guest.email || null,
        phone: guest.phone || null,
        loginCode: loginCode,
        rsvpStatus: (guest.rsvpStatus || "pending") as "pending" | "attending" | "declined",
        plusOneCount: Math.max(0, typeof guest.plusOneCount === "number" ? guest.plusOneCount : parseInt(guest.plusOneCount || "0") || 0),
        dietaryRestrictions: guest.dietaryRestrictions || null,
        invitedCeremonies: resolved,
      });
    }

    if (toInsert.length > 0) {
      await db.insert(guests).values(toInsert);
    }

    revalidatePath("/guests");
    revalidatePath("/dashboard/guests");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Batch insert guests error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to batch insert guests";
    return { error: errorMessage };
  }
}

export async function findGuestByCodeAction(weddingId: string, loginCode: string) {
  const rl = checkRateLimit(`guest-code:${weddingId}:${loginCode.slice(0, 2)}`, 'public');
  if (!rl.success) {
    return { error: "Too many attempts. Please try again later." };
  }

  try {
    const code = loginCode.trim().toUpperCase();
    const result = await db
      .select()
      .from(guests)
      .where(eq(guests.loginCode, code))
      .limit(1);

    if (result.length === 0) {
      console.warn(`[findGuestByCode] Code not found: ${code}`);
      return { error: "Invalid or expired invitation code." };
    }

    const guest = result[0];
    if (guest.weddingId !== weddingId) {
      console.warn(`[findGuestByCode] Code ${code} belongs to wedding ${guest.weddingId}, not ${weddingId}`);
      return { error: "Invalid or expired invitation code." };
    }

    const rsvps = await db
      .select()
      .from(guestRsvps)
      .where(eq(guestRsvps.guestId, guest.id));

    return { success: true, guest, rsvps };
  } catch (error) {
    console.error("[findGuestByCode] Error:", error);
    return { error: "Invalid or expired invitation code." };
  }
}

export async function updateGuestRsvpPublicAction(
  guestId: string,
  data: {
    rsvpStatus: "attending" | "declined";
    plusOneCount: number;
    dietaryRestrictions?: string;
  }
) {
  try {
    await db
      .update(guests)
      .set({
        rsvpStatus: data.rsvpStatus,
        plusOneCount: data.plusOneCount,
        dietaryRestrictions: data.dietaryRestrictions || null,
        updatedAt: new Date(),
      })
      .where(eq(guests.id, guestId));

    return { success: true };
  } catch (error) {
    console.error("Public RSVP update error:", error);
    return { error: "Failed to save RSVP." };
  }
}

export async function saveGuestRsvpAction(
  guestId: string,
  rsvps: { ceremonyId: string; rsvpStatus: "attending" | "declined"; guestCount: number }[],
  data: {
    plusOneCount: number;
    dietaryRestrictions?: string;
  }
) {
  try {
    // Delete existing guest RSVPs
    await db.delete(guestRsvps).where(eq(guestRsvps.guestId, guestId));

    // Insert new guest RSVPs if any
    if (rsvps.length > 0) {
      await db.insert(guestRsvps).values(
        rsvps.map((r) => ({
          guestId,
          ceremonyId: r.ceremonyId,
          rsvpStatus: r.rsvpStatus,
          guestCount: r.guestCount,
        }))
      );
    }

    // Determine the main RSVP status
    const hasAttending = rsvps.some((r) => r.rsvpStatus === "attending");
    const mainStatus = hasAttending ? "attending" : rsvps.length > 0 ? "declined" : "pending";

    await db
      .update(guests)
      .set({
        rsvpStatus: mainStatus,
        plusOneCount: data.plusOneCount,
        dietaryRestrictions: data.dietaryRestrictions || null,
        updatedAt: new Date(),
      })
      .where(eq(guests.id, guestId));

    revalidatePath("/guests");
    revalidatePath("/dashboard/guests");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Save guest RSVP error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to save RSVPs";
    return { error: errorMessage };
  }
}



