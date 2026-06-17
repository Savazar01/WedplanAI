"use server";

import { db } from "@/db/client";
import { weddings, tasks, rituals, kanbanColumns } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const createWeddingSchema = z.object({
  partnerA: z.string().min(1, "Partner A name is required"),
  partnerB: z.string().min(1, "Partner B name is required"),
  tradition: z.enum(["hindu", "muslim", "sikh", "christian", "secular"]),
  weddingDate: z.string().refine((val) => new Date(val) > new Date(), {
    message: "Wedding date must be in the future",
  }),
  budget: z.number().min(0, "Budget must be positive").default(1000000),
  guestCount: z.number().min(0, "Guest count must be positive").default(150),
  location: z.string().min(1, "Location is required"),
  locationName: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("India"),
  pincode: z.string().optional(),
  description: z.string().optional(),
  customTasks: z.array(z.object({
    title: z.string(),
    category: z.string(),
  })).optional(),
  customRituals: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    offsetDays: z.number().optional(),
    startHour: z.number().optional(),
    startMin: z.number().optional(),
    endHour: z.number().optional(),
    endMin: z.number().optional(),
    location: z.string().optional(),
  })).optional(),
});

export async function createWeddingAction(data: {
  partnerA: string;
  partnerB: string;
  tradition: string;
  weddingDate: string;
  budget: number;
  guestCount: number;
  location: string;
  locationName?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  description?: string;
  customTasks?: { title: string; category: string }[];
  customRituals?: {
    name: string;
    description?: string;
    offsetDays?: number;
    startHour?: number;
    startMin?: number;
    endHour?: number;
    endMin?: number;
    location?: string;
  }[];
}) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized. Please sign in." };
  }

  const parsed = createWeddingSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Validation failed" };
  }

  const { partnerA, partnerB, tradition, weddingDate, budget, guestCount, location, locationName, street, city, state, country, pincode, description, customTasks, customRituals } = parsed.data;
  const weddingDateObj = new Date(weddingDate);

  let newlyCreatedWeddingId: string | null = null;
  try {
    await db.transaction(async (tx) => {
      const [insertedWedding] = await tx.insert(weddings).values({
        userId: session.user.id,
        partnerA,
        partnerB,
        tradition,
        weddingDate: weddingDateObj,
        budget,
        guestCount,
        location,
        locationName: locationName || null,
        street: street || null,
        city: city || null,
        state: state || null,
        country: country || "India",
        pincode: pincode || null,
        description: description || null,
      }).returning();

      if (!insertedWedding) {
        throw new Error("Failed to insert wedding");
      }

      newlyCreatedWeddingId = insertedWedding.id;
      const weddingId = insertedWedding.id;

      // Insert default kanban columns
      const [todoCol] = await tx.insert(kanbanColumns).values([
        {
          weddingId,
          name: "To-Do",
          type: "todo",
          color: "#6771ab",
          position: 0,
        },
        {
          weddingId,
          name: "In Progress",
          type: "in_progress",
          color: "#f59e0b",
          position: 1,
        },
        {
          weddingId,
          name: "Done",
          type: "done",
          color: "#22c55e",
          position: 2,
        },
      ]).returning();

      if (!todoCol) {
        throw new Error("Failed to insert default columns");
      }
      const todoColumnId = todoCol.id;

      // 2. Define custom seeds based on requirements
      let seedTasks: { title: string; category: string }[] = [];
      let seedRituals: {
        name: string;
        description?: string;
        offsetDays?: number;
        startHour?: number;
        startMin?: number;
        endHour?: number;
        endMin?: number;
        location?: string;
      }[] = [];

      if (customTasks) {
        seedTasks = customTasks;
      } else {
        if (tradition === "hindu") {
          seedTasks = [
            { title: "Book Mehndi Artist", category: "rituals" },
            { title: "Buy Wedding Lehenga & Sherwani", category: "apparel" },
            { title: "Hire Dhol Players & DJ", category: "music" },
            { title: "Arrange Catering & Sweets (Mithai)", category: "catering" },
            { title: "Select Mandap Decorator", category: "decor" },
          ];
        } else if (tradition === "muslim") {
          seedTasks = [
            { title: "Coordinate with Qazi & Print Nikah Nama", category: "rituals" },
            { title: "Purchase Wedding Attire (Sherwani/Gharara)", category: "apparel" },
            { title: "Select Stage & Floral Decorator", category: "decor" },
            { title: "Book Catering Menu for Valima Feast", category: "catering" },
          ];
        } else if (tradition === "sikh") {
          seedTasks = [
            { title: "Book Gurdwara & Coordinate with Ragis", category: "venue" },
            { title: "Purchase Rumalla Sahib for Guru Granth Sahib", category: "rituals" },
            { title: "Finalize Langar or Catering Menu", category: "catering" },
            { title: "Buy Anand Karaj Bridal/Groom Suit", category: "apparel" },
          ];
        } else if (tradition === "christian") {
          seedTasks = [
            { title: "Secure Church Venue & Priest", category: "venue" },
            { title: "Purchase Wedding Dress & Tuxedo", category: "apparel" },
            { title: "Order Wedding Cake & Floral Bouquets", category: "catering" },
            { title: "Hire Wedding Choir & Organist", category: "music" },
          ];
        } else if (tradition === "secular") {
          seedTasks = [
            { title: "Select Secular Celebrant", category: "rituals" },
            { title: "Write Wedding Vows", category: "other" },
            { title: "Arrange Catering & Open Bar", category: "catering" },
            { title: "Coordinate Photographer/Videographer Contracts", category: "other" },
          ];
        }
      }

      if (customRituals) {
        seedRituals = customRituals;
      } else {
        if (tradition === "hindu") {
          seedRituals = [
            { name: "Mehndi", description: "Traditional henna pre-wedding celebration", offsetDays: -2, startHour: 14, startMin: 0, endHour: 18, endMin: 0, location: location },
            { name: "Haldi", description: "Traditional cleansing ceremony", offsetDays: -1, startHour: 10, startMin: 0, endHour: 13, endMin: 0, location: location },
            { name: "Sangeet", description: "Musical celebration night", offsetDays: -1, startHour: 18, startMin: 0, endHour: 22, endMin: 0, location: location },
            { name: "Mandap Pheras", description: "Main Vedic wedding ceremony rituals around the holy fire", offsetDays: 0, startHour: 10, startMin: 0, endHour: 14, endMin: 0, location: location },
            { name: "Reception", description: "Grand wedding dinner reception", offsetDays: 0, startHour: 19, startMin: 0, endHour: 23, endMin: 0, location: location },
          ];
        } else if (tradition === "muslim") {
          seedRituals = [
            { name: "Manjha", description: "Traditional pre-wedding ceremonies", offsetDays: -2, startHour: 16, startMin: 0, endHour: 20, endMin: 0, location: location },
            { name: "Nikah", description: "Official marriage contract ceremony", offsetDays: 0, startHour: 11, startMin: 0, endHour: 13, endMin: 0, location: location },
            { name: "Valima", description: "Post-wedding grand feast reception", offsetDays: 1, startHour: 19, startMin: 0, endHour: 23, endMin: 0, location: location },
          ];
        } else if (tradition === "sikh") {
          seedRituals = [
            { name: "Maiya", description: "Traditional pre-wedding cleansing ceremonies", offsetDays: -1, startHour: 10, startMin: 0, endHour: 13, endMin: 0, location: location },
            { name: "Anand Karaj", description: "Holy wedding ceremony at the Gurdwara", offsetDays: 0, startHour: 9, startMin: 0, endHour: 13, endMin: 0, location: location },
            { name: "Reception", description: "Post-wedding dinner party celebration", offsetDays: 0, startHour: 18, startMin: 0, endHour: 23, endMin: 0, location: location },
          ];
        } else if (tradition === "christian") {
          seedRituals = [
            { name: "Rehearsal Dinner", description: "Formal dinner with family and bridal party", offsetDays: -1, startHour: 18, startMin: 0, endHour: 21, endMin: 0, location: location },
            { name: "Church Ceremony", description: "Marriage ceremony in the church", offsetDays: 0, startHour: 14, startMin: 0, endHour: 16, endMin: 0, location: location },
            { name: "Reception", description: "Evening reception celebration with cake and dancing", offsetDays: 0, startHour: 18, startMin: 0, endHour: 23, endMin: 0, location: location },
          ];
        } else if (tradition === "secular") {
          seedRituals = [
            { name: "Toast", description: "Ice-breaker drinks with incoming guests", offsetDays: -1, startHour: 18, startMin: 0, endHour: 20, endMin: 0, location: location },
            { name: "Vows", description: "Ceremonial reading of wedding vows", offsetDays: 0, startHour: 16, startMin: 0, endHour: 17, endMin: 30, location: location },
            { name: "Reception", description: "Dinner, toast, and dancing", offsetDays: 0, startHour: 18, startMin: 0, endHour: 23, endMin: 30, location: location },
          ];
        }
      }

      // Batch insert tasks
      if (seedTasks.length > 0) {
        const tasksToInsert = seedTasks.map((t, idx) => ({
          weddingId: weddingId,
          columnId: todoColumnId,
          title: t.title,
          status: "todo",
          category: t.category,
          position: idx,
        }));
        await tx.insert(tasks).values(tasksToInsert);
      }

      // Batch insert rituals
      if (seedRituals.length > 0) {
        const ritualsToInsert = seedRituals.map((r) => {
          const baseDate = new Date(weddingDateObj);
          const offsetDays = r.offsetDays ?? 0;
          baseDate.setDate(baseDate.getDate() + offsetDays);
          
          const startTime = new Date(baseDate);
          startTime.setHours(r.startHour ?? 9, r.startMin ?? 0, 0, 0);

          const endTime = new Date(baseDate);
          endTime.setHours(r.endHour ?? 17, r.endMin ?? 0, 0, 0);

          return {
            weddingId: weddingId,
            name: r.name,
            description: r.description || "",
            startTime,
            endTime,
            location: r.location || location || "",
          };
        });
        await tx.insert(rituals).values(ritualsToInsert);
      }
    });

    if (newlyCreatedWeddingId) {
      const cookieStore = await cookies();
      cookieStore.set("active_wedding_id", newlyCreatedWeddingId);
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating wedding:", error);
    const message = error instanceof Error ? error.message : "Failed to finalize onboarding.";
    return { error: message };
  }
}

export async function updateWeddingAction(weddingId: string, data: {
  partnerA: string;
  partnerB: string;
  location: string;
  weddingDate: string;
  budget: number;
  guestCount: number;
  tradition: string;
  locationName?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  description?: string;
}) {
  const session = await getServerSession();
  if (!session?.user) return { error: 'Unauthorized' };

  // verify ownership
  const existing = await db
    .select()
    .from(weddings)
    .where(and(eq(weddings.id, weddingId), eq(weddings.userId, session.user.id)))
    .limit(1);
  if (!existing[0]) return { error: 'Wedding not found' };

  await db.update(weddings).set({
    partnerA: data.partnerA,
    partnerB: data.partnerB,
    location: data.location,
    locationName: data.locationName ?? existing[0].locationName,
    street: data.street ?? existing[0].street,
    city: data.city ?? existing[0].city,
    state: data.state !== undefined ? (data.state || null) : existing[0].state,
    country: data.country ?? existing[0].country,
    pincode: data.pincode ?? existing[0].pincode,
    description: data.description ?? existing[0].description,
    weddingDate: new Date(data.weddingDate),
    budget: data.budget,
    guestCount: data.guestCount,
    tradition: data.tradition,
    updatedAt: new Date(),
  }).where(eq(weddings.id, weddingId));

  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateWeddingAppearanceAction(
  weddingId: string,
  data: {
    themeFont: string;
    themePrimary: string;
    themeSecondary: string;
    themeBackground: string;
    logoUrl?: string | null;
    logoData?: string | null;
  }
) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  try {
    const existing = await db
      .select()
      .from(weddings)
      .where(eq(weddings.id, weddingId))
      .limit(1);
    if (!existing[0]) {
      return { error: "Wedding not found" };
    }

    await db.update(weddings).set({
      themeFont: data.themeFont,
      themePrimary: data.themePrimary,
      themeSecondary: data.themeSecondary,
      themeBackground: data.themeBackground,
      logoUrl: data.logoUrl || null,
      logoData: data.logoData || null,
      updatedAt: new Date(),
    }).where(eq(weddings.id, weddingId));

    revalidatePath("/dashboard");
    revalidatePath(`/wedding/${weddingId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating wedding appearance:", error);
    const message = error instanceof Error ? error.message : "Failed to update appearance.";
    return { error: message };
  }
}

export async function updateWeddingShowcaseAction(
  weddingId: string,
  data: {
    showcaseFont?: string;
    showcasePrimary?: string;
    showcaseSecondary?: string;
    showcaseBackground?: string;
    showcaseHeroUrl?: string | null;
    showcaseHeroData?: string | null;
    showcaseWelcomeText?: string | null;
    showcaseDetails?: string | null;
  }
) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    return { error: "Unauthorized. Admin role required." };
  }

  try {
    const existing = await db
      .select()
      .from(weddings)
      .where(eq(weddings.id, weddingId))
      .limit(1);
    if (!existing[0]) {
      return { error: "Wedding not found" };
    }

    await db.update(weddings).set({
      ...(data.showcaseFont !== undefined && { showcaseFont: data.showcaseFont }),
      ...(data.showcasePrimary !== undefined && { showcasePrimary: data.showcasePrimary }),
      ...(data.showcaseSecondary !== undefined && { showcaseSecondary: data.showcaseSecondary }),
      ...(data.showcaseBackground !== undefined && { showcaseBackground: data.showcaseBackground }),
      ...(data.showcaseHeroUrl !== undefined && { showcaseHeroUrl: data.showcaseHeroUrl }),
      ...(data.showcaseHeroData !== undefined && { showcaseHeroData: data.showcaseHeroData }),
      ...(data.showcaseWelcomeText !== undefined && { showcaseWelcomeText: data.showcaseWelcomeText }),
      ...(data.showcaseDetails !== undefined && { showcaseDetails: data.showcaseDetails }),
      updatedAt: new Date(),
    }).where(eq(weddings.id, weddingId));

    revalidatePath("/dashboard");
    revalidatePath(`/wedding/${weddingId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating wedding showcase:", error);
    const message = error instanceof Error ? error.message : "Failed to update showcase.";
    return { error: message };
  }
}
