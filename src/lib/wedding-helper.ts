"use server";

import { db } from "@/db/client";
import { weddings, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getActiveWedding(userId: string) {
  // First check if the user has an assigned weddingId in the users table
  const userResult = await db
    .select({ weddingId: users.weddingId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (userResult.length > 0 && userResult[0].weddingId) {
    const assignedWedding = await db
      .select()
      .from(weddings)
      .where(eq(weddings.id, userResult[0].weddingId))
      .limit(1);
    if (assignedWedding.length > 0) {
      return assignedWedding[0];
    }
  }

  const cookieStore = await cookies();
  const activeWeddingId = cookieStore.get("active_wedding_id")?.value;

  if (activeWeddingId) {
    const weddingResult = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.id, activeWeddingId), eq(weddings.userId, userId)))
      .limit(1);

    if (weddingResult.length > 0) {
      return weddingResult[0];
    }
  }

  const firstWeddingResult = await db
    .select()
    .from(weddings)
    .where(eq(weddings.userId, userId))
    .limit(1);

  if (firstWeddingResult.length > 0) {
    return firstWeddingResult[0];
  }

  return null;
}

export async function switchWeddingAction(weddingId: string) {
  const cookieStore = await cookies();
  cookieStore.set("active_wedding_id", weddingId);
  redirect("/dashboard");
}

export async function ensureDefaultColumns(weddingId: string) {
  const { kanbanColumns, tasks, ceremonies, weddingTraditions } = await import("@/db/schema");
  
  let columnsList = await db
    .select()
    .from(kanbanColumns)
    .where(eq(kanbanColumns.weddingId, weddingId));

  if (columnsList.length === 0) {
    console.log(`[Self-Healing] Seeding default columns for wedding ${weddingId}`);
    columnsList = await db.transaction(async (tx) => {
      // Seed default 3 columns
      const [todoCol] = await tx.insert(kanbanColumns).values({
        weddingId,
        name: "To-Do",
        type: "todo",
        color: "#6771ab",
        position: 0,
      }).returning();
      
      const [inProgressCol] = await tx.insert(kanbanColumns).values({
        weddingId,
        name: "In Progress",
        type: "in_progress",
        color: "#f59e0b",
        position: 1,
      }).returning();
      
      const [doneCol] = await tx.insert(kanbanColumns).values({
        weddingId,
        name: "Done",
        type: "done",
        color: "#22c55e",
        position: 2,
      }).returning();

      // Fetch all tasks for this wedding
      const weddingTasks = await tx
        .select()
        .from(tasks)
        .where(eq(tasks.weddingId, weddingId));

      for (const t of weddingTasks) {
        if (t.columnId) continue;
        let targetColId = todoCol.id;
        if (t.status === "in_progress") {
          targetColId = inProgressCol.id;
        } else if (t.status === "done") {
          targetColId = doneCol.id;
        }
        await tx
          .update(tasks)
          .set({ columnId: targetColId })
          .where(eq(tasks.id, t.id));
      }

      return [todoCol, inProgressCol, doneCol];
    });
  }

  // Next, fetch the wedding details (tradition, location, weddingDate)
  const [wedding] = await db
    .select()
    .from(weddings)
    .where(eq(weddings.id, weddingId))
    .limit(1);

  if (wedding) {
    // Query count of existing tasks and ceremonies
    const existingTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.weddingId, weddingId));

    const existingCeremonies = await db
      .select()
      .from(ceremonies)
      .where(eq(ceremonies.weddingId, weddingId));

    if (existingTasks.length === 0 && existingCeremonies.length === 0) {
      console.log(`[Self-Healing] Seeding default tasks and ceremonies for wedding ${weddingId}`);
      const todoColumn = columnsList.find(col => col.type === "todo") || columnsList[0];
      const todoColumnId = todoColumn ? todoColumn.id : null;

      const tradition = wedding.tradition;
      const location = wedding.location;
      const weddingDateObj = new Date(wedding.weddingDate);

      await db.transaction(async (tx) => {
        let seedTasks: { title: string; category: string; dueDate?: string | null }[] = [];
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
        }[] = [];

        if (tradition === "hindu") {
          seedTasks = [
            { title: "Book Mehndi Artist", category: "ceremonies" },
            { title: "Buy Wedding Lehenga & Sherwani", category: "apparel" },
            { title: "Hire Dhol Players & DJ", category: "music" },
            { title: "Arrange Catering & Sweets (Mithai)", category: "catering" },
            { title: "Select Mandap Decorator", category: "decor" },
          ];
          seedRituals = [
            { name: "Mehndi", description: "Traditional henna pre-wedding celebration", offsetDays: -2, startHour: 14, startMin: 0, endHour: 18, endMin: 0, location: location },
            { name: "Haldi", description: "Traditional cleansing ceremony", offsetDays: -1, startHour: 10, startMin: 0, endHour: 13, endMin: 0, location: location },
            { name: "Sangeet", description: "Musical celebration night", offsetDays: -1, startHour: 18, startMin: 0, endHour: 22, endMin: 0, location: location },
            { name: "Mandap Pheras", description: "Main Vedic wedding ceremony rituals around the holy fire", offsetDays: 0, startHour: 10, startMin: 0, endHour: 14, endMin: 0, location: location },
            { name: "Reception", description: "Grand wedding dinner reception", offsetDays: 0, startHour: 19, startMin: 0, endHour: 23, endMin: 0, location: location },
          ];
        } else if (tradition === "muslim") {
          seedTasks = [
            { title: "Coordinate with Qazi & Print Nikah Nama", category: "ceremonies" },
            { title: "Purchase Wedding Attire (Sherwani/Gharara)", category: "apparel" },
            { title: "Select Stage & Floral Decorator", category: "decor" },
            { title: "Book Catering Menu for Valima Feast", category: "catering" },
          ];
          seedRituals = [
            { name: "Manjha", description: "Traditional pre-wedding ceremonies", offsetDays: -2, startHour: 16, startMin: 0, endHour: 20, endMin: 0, location: location },
            { name: "Nikah", description: "Official marriage contract ceremony", offsetDays: 0, startHour: 11, startMin: 0, endHour: 13, endMin: 0, location: location },
            { name: "Valima", description: "Post-wedding grand feast reception", offsetDays: 1, startHour: 19, startMin: 0, endHour: 23, endMin: 0, location: location },
          ];
        } else if (tradition === "sikh") {
          seedTasks = [
            { title: "Book Gurdwara & Coordinate with Ragis", category: "venue" },
            { title: "Purchase Rumalla Sahib for Guru Granth Sahib", category: "ceremonies" },
            { title: "Finalize Langar or Catering Menu", category: "catering" },
            { title: "Buy Anand Karaj Bridal/Groom Suit", category: "apparel" },
          ];
          seedRituals = [
            { name: "Maiya", description: "Traditional pre-wedding cleansing ceremonies", offsetDays: -1, startHour: 10, startMin: 0, endHour: 13, endMin: 0, location: location },
            { name: "Anand Karaj", description: "Holy wedding ceremony at the Gurdwara", offsetDays: 0, startHour: 9, startMin: 0, endHour: 13, endMin: 0, location: location },
            { name: "Reception", description: "Post-wedding dinner party celebration", offsetDays: 0, startHour: 18, startMin: 0, endHour: 23, endMin: 0, location: location },
          ];
        } else if (tradition === "christian") {
          seedTasks = [
            { title: "Secure Church Venue & Priest", category: "venue" },
            { title: "Purchase Wedding Dress & Tuxedo", category: "apparel" },
            { title: "Order Wedding Cake & Floral Bouquets", category: "catering" },
            { title: "Hire Wedding Choir & Organist", category: "music" },
          ];
          seedRituals = [
            { name: "Rehearsal Dinner", description: "Formal dinner with family and bridal party", offsetDays: -1, startHour: 18, startMin: 0, endHour: 21, endMin: 0, location: location },
            { name: "Church Ceremony", description: "Marriage ceremony in the church", offsetDays: 0, startHour: 14, startMin: 0, endHour: 16, endMin: 0, location: location },
            { name: "Reception", description: "Evening reception celebration with cake and dancing", offsetDays: 0, startHour: 18, startMin: 0, endHour: 23, endMin: 0, location: location },
          ];
        } else if (tradition === "secular") {
          seedTasks = [
            { title: "Select Secular Celebrant", category: "ceremonies" },
            { title: "Write Wedding Vows", category: "other" },
            { title: "Arrange Catering & Open Bar", category: "catering" },
            { title: "Coordinate Photographer/Videographer Contracts", category: "other" },
          ];
          seedRituals = [
            { name: "Toast", description: "Ice-breaker drinks with incoming guests", offsetDays: -1, startHour: 18, startMin: 0, endHour: 20, endMin: 0, location: location },
            { name: "Vows", description: "Ceremonial reading of wedding vows", offsetDays: 0, startHour: 16, startMin: 0, endHour: 17, endMin: 30, location: location },
            { name: "Reception", description: "Dinner, toast, and dancing", offsetDays: 0, startHour: 18, startMin: 0, endHour: 23, endMin: 30, location: location },
          ];
        } else {
          const dbTradList = await tx
            .select()
            .from(weddingTraditions)
            .where(eq(weddingTraditions.key, tradition))
            .limit(1);
          if (dbTradList.length > 0) {
            if (dbTradList[0].seedTasks) {
              try {
                seedTasks = JSON.parse(dbTradList[0].seedTasks);
              } catch (e) {
                console.error("Failed to parse db tradition seedTasks:", e);
              }
            }
            if (dbTradList[0].seedCeremonies) {
              try {
                seedRituals = JSON.parse(dbTradList[0].seedCeremonies);
              } catch (e) {
                console.error("Failed to parse db tradition seedCeremonies:", e);
              }
            }
          }
        }

        // Batch insert tasks
        if (seedTasks.length > 0 && todoColumnId) {
          const tasksToInsert = seedTasks.map((t, idx) => ({
            weddingId: weddingId,
            columnId: todoColumnId,
            title: t.title,
            status: "todo",
            category: t.category,
            position: idx,
            dueDate: t.dueDate ? new Date(t.dueDate) : null,
          }));
          await tx.insert(tasks).values(tasksToInsert);
        }

        // Batch insert ceremonies
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

            return {
              weddingId: weddingId,
              name: r.name,
              description: r.description || "",
              startTime,
              endTime,
              location: r.location || location || "",
            };
          });
          await tx.insert(ceremonies).values(ritualsToInsert);
        }
      });
    }
  }

  return columnsList;
}

