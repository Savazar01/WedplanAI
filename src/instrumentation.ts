import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@/db/client";

export async function register() {
  try {
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    console.log("[instrumentation] Migrations applied successfully");
  } catch (error) {
    console.error("[instrumentation] Migration failed:", error);
    throw error;
  }
}
