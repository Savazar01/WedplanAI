"use server";

import { db } from "@/db/client";
import { weddings, tasks, rituals, kanbanColumns, weddingTraditions, taskCategories, cateringMenus, users, emailConfigurations } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { switchWeddingAction } from "@/lib/wedding-helper";
import { defaultTraditions, defaultCategories } from "@/lib/default-seeds";

export async function createWizardTraditionAction(data: {
  name: string;
  description?: string;
}) {
  const session = await getServerSession();
  if (!session?.user) return { error: 'Unauthorized' };

  const key = data.name.toLowerCase().replace(/\s+/g, '_');
  const existing = await db.select().from(weddingTraditions).where(eq(weddingTraditions.key, key)).limit(1);
  if (existing.length > 0) return { error: 'A tradition with this name already exists.' };

  const [created] = await db.insert(weddingTraditions).values({
    key,
    name: data.name.trim(),
    description: data.description?.trim() || null,
  }).returning();

  return { success: true, tradition: created };
}

const createWeddingSchema = z.object({
  partnerA: z.string().min(1, "Partner A name is required"),
  brideFather: z.string().optional(),
  brideMother: z.string().optional(),
  partnerB: z.string().min(1, "Partner B name is required"),
  groomFather: z.string().optional(),
  groomMother: z.string().optional(),
  teamMembers: z.array(z.object({ name: z.string(), email: z.string(), password: z.string() })).optional(),
  tradition: z.string().min(1, "Tradition is required"),
  weddingDate: z.string().refine((val) => new Date(val) > new Date(), {
    message: "Wedding date must be in the future",
  }),
  budget: z.number().min(0, "Budget must be positive").default(1000000),
  guestCount: z.number().min(0, "Guest count must be positive").default(150),
  location: z.string().min(1, "Location is required"),
  locationOptions: z.array(z.string()).optional(),
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
    dueDate: z.string().optional().nullable(),
    ceremonyName: z.string().optional().nullable(),
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
    startTime: z.string().optional().nullable(),
    endTime: z.string().optional().nullable(),
    isFoodServed: z.boolean().optional(),
  })).optional(),
});

export async function createWeddingAction(data: {
  partnerA: string;
  brideFather?: string;
  brideMother?: string;
  partnerB: string;
  groomFather?: string;
  groomMother?: string;
  teamMembers?: { name: string; email: string; password: string }[];
  tradition: string;
  weddingDate: string;
  budget: number;
  guestCount: number;
  location: string;
  locationOptions?: string[];
  locationName?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  description?: string;
  customTasks?: { title: string; category: string; dueDate?: string | null; ceremonyName?: string | null }[];
  customRituals?: {
    name: string;
    description?: string;
    offsetDays?: number;
    startHour?: number;
    startMin?: number;
    endHour?: number;
    endMin?: number;
    location?: string;
    startTime?: string | null;
    endTime?: string | null;
    isFoodServed?: boolean;
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

  const { partnerA, brideFather, brideMother, partnerB, groomFather, groomMother, teamMembers, tradition, weddingDate, budget, guestCount, location, locationOptions, locationName, street, city, state, country, pincode, description, customTasks, customRituals } = parsed.data;
  const weddingDateObj = new Date(weddingDate);

  let newlyCreatedWeddingId: string | null = null;
  try {
    await db.transaction(async (tx) => {
      const [insertedWedding] = await tx.insert(weddings).values({
        userId: session.user.id,
        partnerA,
        brideFather: brideFather || null,
          brideMother: brideMother || null,
        partnerB,
        groomFather: groomFather || null,
          groomMother: groomMother || null,
        tradition,
        weddingDate: weddingDateObj,
        budget,
        guestCount,
        location,
        locationOptions: locationOptions ? JSON.stringify(locationOptions) : null,
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

      // Insert default planning board columns
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
      let seedTasks: { title: string; category: string; dueDate?: string | null; ceremonyName?: string | null }[] = [];
      let seedRituals: {
        name: string;
        description?: string;
        offsetDays?: number;
        startHour?: number;
        startMin?: number;
        endHour?: number;
        endMin?: number;
        location?: string;
        startTime?: string | null;
        endTime?: string | null;
        isFoodServed?: boolean;
      }[] = [];

      const dbTradList = await tx.select().from(weddingTraditions).where(eq(weddingTraditions.key, tradition)).limit(1);
      const dbTraditionData = dbTradList.length > 0 ? dbTradList[0] : null;

      if (customTasks) {
        seedTasks = customTasks;
      } else {
        let loadedTasksFromDb = false;
        if (dbTraditionData && dbTraditionData.seedTasks) {
          try {
            seedTasks = JSON.parse(dbTraditionData.seedTasks);
            loadedTasksFromDb = true;
          } catch (e) {
            console.error("Failed to parse db tradition seedTasks:", e);
          }
        }
        if (!loadedTasksFromDb) {
          if (tradition === "hindu") {
            seedTasks = [
              { title: "Book Mehndi Artist", category: "ceremonies", ceremonyName: "Mehndi" },
              { title: "Buy Wedding Lehenga & Sherwani", category: "apparel", ceremonyName: "Mandap Pheras" },
              { title: "Hire Dhol Players & DJ", category: "music", ceremonyName: "Sangeet" },
              { title: "Arrange Catering & Sweets (Mithai)", category: "catering", ceremonyName: "Reception" },
              { title: "Select Mandap Decorator", category: "decor", ceremonyName: "Mandap Pheras" },
            ];
          } else if (tradition === "muslim") {
            seedTasks = [
              { title: "Coordinate with Qazi & Print Nikah Nama", category: "ceremonies", ceremonyName: "Nikah" },
              { title: "Purchase Wedding Attire (Sherwani/Gharara)", category: "apparel", ceremonyName: "Nikah" },
              { title: "Select Stage & Floral Decorator", category: "decor", ceremonyName: "Valima" },
              { title: "Book Catering Menu for Valima Feast", category: "catering", ceremonyName: "Valima" },
            ];
          } else if (tradition === "sikh") {
            seedTasks = [
              { title: "Book Gurdwara & Coordinate with Ragis", category: "venue", ceremonyName: "Anand Karaj" },
              { title: "Purchase Rumalla Sahib for Guru Granth Sahib", category: "ceremonies", ceremonyName: "Anand Karaj" },
              { title: "Finalize Langar or Catering Menu", category: "catering", ceremonyName: "Anand Karaj" },
              { title: "Buy Anand Karaj Bridal/Groom Suit", category: "apparel", ceremonyName: "Anand Karaj" },
            ];
          } else if (tradition === "christian") {
            seedTasks = [
              { title: "Secure Church Venue & Priest", category: "venue", ceremonyName: "Church Ceremony" },
              { title: "Purchase Wedding Dress & Tuxedo", category: "apparel", ceremonyName: "Church Ceremony" },
              { title: "Order Wedding Cake & Floral Bouquets", category: "catering", ceremonyName: "Reception" },
              { title: "Hire Wedding Choir & Organist", category: "music", ceremonyName: "Church Ceremony" },
            ];
          } else if (tradition === "secular") {
            seedTasks = [
              { title: "Select Secular Celebrant", category: "ceremonies", ceremonyName: "Vows" },
              { title: "Write Wedding Vows", category: "other", ceremonyName: "Vows" },
              { title: "Arrange Catering & Open Bar", category: "catering", ceremonyName: "Reception" },
              { title: "Coordinate Photographer/Videographer Contracts", category: "other", ceremonyName: "Reception" },
            ];
          }
        }
      }

      if (customRituals) {
        seedRituals = customRituals;
      } else {
        let loadedRitualsFromDb = false;
        if (dbTraditionData && dbTraditionData.seedCeremonies) {
          try {
            seedRituals = JSON.parse(dbTraditionData.seedCeremonies);
            loadedRitualsFromDb = true;
          } catch (e) {
            console.error("Failed to parse db tradition seedCeremonies:", e);
          }
        }
        if (!loadedRitualsFromDb) {
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
      }

      // Batch insert rituals
      let insertedRituals: { id: string; name: string; isFoodServed: boolean }[] = [];
      if (seedRituals.length > 0) {
        const ritualsToInsert = seedRituals.map((r) => {
          let startTime: Date;
          let endTime: Date;

          if (r.startTime && r.endTime) {
            startTime = new Date(r.startTime);
            endTime = new Date(r.endTime);
          } else {
            const baseDate = new Date(weddingDateObj);
            const offsetDays = r.offsetDays ?? 0;
            baseDate.setDate(baseDate.getDate() + offsetDays);
            
            startTime = new Date(baseDate);
            startTime.setHours(r.startHour ?? 9, r.startMin ?? 0, 0, 0);

            endTime = new Date(baseDate);
            endTime.setHours(r.endHour ?? 17, r.endMin ?? 0, 0, 0);
          }

          const hasFood = typeof r.isFoodServed === "boolean"
            ? r.isFoodServed
            : (r.name.toLowerCase().includes("reception") || 
               r.name.toLowerCase().includes("valima") || 
               r.name.toLowerCase().includes("pheras") ||
               r.name.toLowerCase().includes("feast"));

          return {
            weddingId: weddingId,
            name: r.name,
            description: r.description || "",
            startTime,
            endTime,
            location: r.location || location || "",
            isFoodServed: hasFood,
          };
        });
        insertedRituals = await tx.insert(rituals).values(ritualsToInsert).returning();

        // Seed a default catering menu for each ceremony where food is served
        for (const ritual of insertedRituals) {
          if (ritual.isFoodServed) {
            await tx.insert(cateringMenus).values({
              weddingId: weddingId,
              ceremonyId: ritual.id,
              cuisine: "Traditional Buffet",
              guestCount: guestCount || 150,
              appetizers: "Assorted Starters",
              mainCourses: "Signature Main Course Dishes, Breads, and Rice",
              desserts: "Traditional Dessert Specialties",
              drinks: "Juices, Mocktails, and Water",
              notes: "Default seeded menu. Edit this to customize your menu.",
            });
          }
        }
      }

      // Batch insert tasks
      if (seedTasks.length > 0) {
        const tasksToInsert = seedTasks.map((t, idx) => {
          let ceremonyId: string | null = null;
          if (t.ceremonyName) {
            const matchedRitual = insertedRituals.find(
              (r) => r.name.toLowerCase() === t.ceremonyName!.toLowerCase()
            );
            if (matchedRitual) {
              ceremonyId = matchedRitual.id;
            }
          }
          return {
            weddingId: weddingId,
            columnId: todoColumnId,
            title: t.title,
            status: "todo",
            category: t.category,
            position: idx,
            dueDate: t.dueDate ? new Date(t.dueDate) : null,
            ceremonyId,
          };
        });
        await tx.insert(tasks).values(tasksToInsert);
      }
    });

    
    if (newlyCreatedWeddingId && teamMembers && teamMembers.length > 0) {
      for (const tm of teamMembers) {
        try {
          const existingUser = await db.select().from(users).where(eq(users.email, tm.email)).limit(1);
          if (existingUser.length === 0) {
            const result = await auth.api.signUpEmail({
              body: {
                name: tm.name,
                email: tm.email,
                password: tm.password,
                persona: "diy",
              },
            });
            if (result && result.user) {
              await db.update(users).set({ 
                role: "user",
                weddingAccess: "all",
                shouldChangePassword: true,
                weddingId: newlyCreatedWeddingId
              }).where(eq(users.id, result.user.id));
              
              const confs = await db.select().from(emailConfigurations).where(eq(emailConfigurations.isActive, true)).limit(1);
              if (confs.length > 0) {
                const conf = confs[0];
                const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`;
                const emailHtml = `
                  <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Welcome to WedPlanAI!</h2>
                    <p>You have been invited as a team member to collaborate on a wedding.</p>
                    <p><strong>Your login credentials:</strong></p>
                    <ul>
                      <li>Email: ${tm.email}</li>
                      <li>Temporary Password: ${tm.password}</li>
                    </ul>
                    <p>Please log in and change your password immediately.</p>
                    <a href="${loginUrl}" style="display: inline-block; padding: 10px 20px; background-color: #6771ab; color: white; text-decoration: none; border-radius: 4px;">Log In Now</a>
                  </div>
                `;
                await sendEmail({
                  to: tm.email,
                  subject: "You're invited to collaborate on WedPlanAI",
                  html: emailHtml
                });
              }
            }
          }
        } catch (e) {
          console.error("Failed to create team member:", e);
        }
      }
    }

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
  brideFather?: string;
  brideMother?: string;
  partnerB: string;
  groomFather?: string;
  groomMother?: string;
  teamMembers?: { name: string; email: string; password: string }[];
  location: string;
  weddingDate: string;
  budget: number;
  guestCount: number;
  tradition: string;
  locationOptions?: string[];
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
    locationOptions: data.locationOptions !== undefined ? JSON.stringify(data.locationOptions) : existing[0].locationOptions,
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
    themeDarkPrimary: string;
    themeDarkSecondary: string;
    themeDarkBackground: string;
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

    const colorFields = ['themePrimary', 'themeSecondary', 'themeBackground', 'themeDarkPrimary', 'themeDarkSecondary', 'themeDarkBackground'] as const;
    for (const field of colorFields) {
      if (data[field] && !/^#[0-9A-Fa-f]{6}$/.test(data[field])) {
        return { error: `Invalid color format for ${field}. Use hex format (#RRGGBB).` };
      }
    }

    if (data.logoData) {
      const base64Str = data.logoData.includes(',') ? data.logoData.split(',')[1] : data.logoData;
      const decodedSize = Buffer.from(base64Str, 'base64').length;
      if (decodedSize > 5 * 1024 * 1024) {
        return { error: 'Logo image must be under 5MB.' };
      }
    }

    await db.update(weddings).set({
      themeFont: data.themeFont,
      themePrimary: data.themePrimary,
      themeSecondary: data.themeSecondary,
      themeBackground: data.themeBackground,
      themeDarkPrimary: data.themeDarkPrimary,
      themeDarkSecondary: data.themeDarkSecondary,
      themeDarkBackground: data.themeDarkBackground,
      logoUrl: data.logoUrl || null,
      logoData: data.logoData || null,
      updatedAt: new Date(),
    }).where(eq(weddings.id, weddingId));

    revalidatePath("/dashboard", "layout");
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
    showcaseTitleFont?: string;
    showcasePrimary?: string;
    showcaseSecondary?: string;
    showcaseBackground?: string;
    showcaseHeroUrl?: string | null;
    showcaseHeroData?: string | null;
    showcaseWelcomeText?: string | null;
    showcaseDetails?: string | null;
    showcaseSubtitle?: string | null;
    showcaseTitle?: string | null;
    showcaseDescription?: string | null;
    showcaseRsvpTitle?: string | null;
    showcaseRsvpDescription?: string | null;
    showcaseGiftUrl?: string | null;
    showcaseGiftTitle?: string | null;
    showcaseGiftDescription?: string | null;
    showcaseTemplate?: string;
    showcaseTopLabel?: string | null;
  }
) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return { error: "Unauthorized." };
  }

  const isUserAdmin = session.user.role === "admin";
  const isUserClient = session.user.role === "client";
  const isAssignedToThisWedding = session.user.weddingId === weddingId;

  if (!isUserAdmin && (!isUserClient || !isAssignedToThisWedding)) {
    return { error: "Unauthorized. You do not have permission to update this wedding showcase." };
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

    const colorFields = ['showcasePrimary', 'showcaseSecondary', 'showcaseBackground'] as const;
    for (const field of colorFields) {
      if (data[field as keyof typeof data] && !/^#[0-9A-Fa-f]{6}$/.test(data[field as keyof typeof data] as string)) {
        return { error: `Invalid color format for ${field}. Use hex format (#RRGGBB).` };
      }
    }

    if (data.showcaseHeroData) {
      const base64Str = data.showcaseHeroData.includes(',') ? data.showcaseHeroData.split(',')[1] : data.showcaseHeroData;
      const decodedSize = Buffer.from(base64Str, 'base64').length;
      if (decodedSize > 5 * 1024 * 1024) {
        return { error: 'Hero image must be under 5MB.' };
      }
    }

    await db.update(weddings).set({
      ...(data.showcaseFont !== undefined && { showcaseFont: data.showcaseFont }),
      ...(data.showcaseTitleFont !== undefined && { showcaseTitleFont: data.showcaseTitleFont }),
      ...(data.showcasePrimary !== undefined && { showcasePrimary: data.showcasePrimary }),
      ...(data.showcaseSecondary !== undefined && { showcaseSecondary: data.showcaseSecondary }),
      ...(data.showcaseBackground !== undefined && { showcaseBackground: data.showcaseBackground }),
      ...(data.showcaseHeroUrl !== undefined && { showcaseHeroUrl: data.showcaseHeroUrl }),
      ...(data.showcaseHeroData !== undefined && { showcaseHeroData: data.showcaseHeroData }),
      ...(data.showcaseWelcomeText !== undefined && { showcaseWelcomeText: data.showcaseWelcomeText }),
      ...(data.showcaseDetails !== undefined && { showcaseDetails: data.showcaseDetails }),
      ...(data.showcaseSubtitle !== undefined && { showcaseSubtitle: data.showcaseSubtitle }),
      ...(data.showcaseTitle !== undefined && { showcaseTitle: data.showcaseTitle }),
      ...(data.showcaseDescription !== undefined && { showcaseDescription: data.showcaseDescription }),
      ...(data.showcaseRsvpTitle !== undefined && { showcaseRsvpTitle: data.showcaseRsvpTitle }),
      ...(data.showcaseRsvpDescription !== undefined && { showcaseRsvpDescription: data.showcaseRsvpDescription }),
      ...(data.showcaseGiftUrl !== undefined && { showcaseGiftUrl: data.showcaseGiftUrl }),
      ...(data.showcaseGiftTitle !== undefined && { showcaseGiftTitle: data.showcaseGiftTitle }),
      ...(data.showcaseGiftDescription !== undefined && { showcaseGiftDescription: data.showcaseGiftDescription }),
      ...(data.showcaseTemplate !== undefined && { showcaseTemplate: data.showcaseTemplate }),
      ...(data.showcaseTopLabel !== undefined && { showcaseTopLabel: data.showcaseTopLabel || "" }),
      updatedAt: new Date(),
    }).where(eq(weddings.id, weddingId));

    revalidatePath("/dashboard", "layout");
    revalidatePath(`/wedding/${weddingId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating wedding showcase:", error);
    const message = error instanceof Error ? error.message : "Failed to update showcase.";
    return { error: message };
  }
}

export async function getPublicTraditions() {
  try {
    let list = await db.select().from(weddingTraditions).orderBy(weddingTraditions.name);
    const existingKeys = new Set(list.map((t) => t.key));
    const missingTraditions = defaultTraditions.filter((t) => !existingKeys.has(t.key));

    if (missingTraditions.length > 0) {
      await db.insert(weddingTraditions).values(missingTraditions);
      list = await db.select().from(weddingTraditions).orderBy(weddingTraditions.name);
    }
    return list;
  } catch (e) {
    console.error("Failed to list public traditions:", e);
    return [];
  }
}

export async function getPublicCategories() {
  try {
    let list = await db.select().from(taskCategories).orderBy(taskCategories.name);
    const existingKeys = new Set(list.map((c) => c.key));
    const missingCategories = defaultCategories.filter((c) => !existingKeys.has(c.key));

    if (missingCategories.length > 0) {
      await db.insert(taskCategories).values(missingCategories);
      list = await db.select().from(taskCategories).orderBy(taskCategories.name);
    }
    return list;
  } catch (e) {
    console.error("Failed to list public categories:", e);
    return [];
  }
}

export async function archiveWeddingAction(weddingId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, weddingId), eq(weddings.userId, session.user.id)))
      .limit(1);
    if (!wedding) return { error: "Wedding not found or access denied" };

    await db.update(weddings)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(eq(weddings.id, weddingId));

    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error archiving wedding:", error);
    return { error: "Failed to archive wedding." };
  }
}

export async function unarchiveWeddingAction(weddingId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, weddingId), eq(weddings.userId, session.user.id)))
      .limit(1);
    if (!wedding) return { error: "Wedding not found or access denied" };

    await db.update(weddings)
      .set({ isArchived: false, updatedAt: new Date() })
      .where(eq(weddings.id, weddingId));

    revalidatePath("/dashboard", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error unarchiving wedding:", error);
    return { error: "Failed to unarchive wedding." };
  }
}

export async function deleteWeddingAction(weddingId: string) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const [wedding] = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, weddingId), eq(weddings.userId, session.user.id)))
      .limit(1);
    if (!wedding) return { error: "Wedding not found or access denied" };

    if (wedding.isSample || (wedding.partnerA === "Rahul" && wedding.partnerB === "Priya")) {
      return { error: "This wedding is for onboarding and cannot be deleted." };
    }

    await db.delete(weddings).where(eq(weddings.id, weddingId));

    revalidatePath("/dashboard", "layout");
    redirect("/dashboard");
  } catch (error) {
    console.error("Error deleting wedding:", error);
    return { error: "Failed to delete wedding." };
  }
}
