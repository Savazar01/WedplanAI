import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@/db/client";
import { weddingTraditions, taskCategories } from "@/db/schema";
import { defaultTraditions, defaultCategories } from "@/lib/default-seeds";

export async function register() {
  try {
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("[instrumentation] Migrations applied successfully");

    // Seed default traditions
    const allTraditions = await db.select().from(weddingTraditions);
    const existingTradKeys = new Set(allTraditions.map((t) => t.key));
    const missingTraditions = defaultTraditions.filter((t) => !existingTradKeys.has(t.key));
    if (missingTraditions.length > 0) {
      await db.insert(weddingTraditions).values(missingTraditions);
      console.log(`[instrumentation] Seeded ${missingTraditions.length} default traditions`);
    }

    // Seed default categories
    const allCategories = await db.select().from(taskCategories);
    const existingCatKeys = new Set(allCategories.map((c) => c.key));
    const missingCategories = defaultCategories.filter((c) => !existingCatKeys.has(c.key));
    if (missingCategories.length > 0) {
      await db.insert(taskCategories).values(missingCategories);
      console.log(`[instrumentation] Seeded ${missingCategories.length} default categories`);
    }
  } catch (error) {
    console.error("[instrumentation] Migration/seeding failed:", error);
    throw error;
  }
}

