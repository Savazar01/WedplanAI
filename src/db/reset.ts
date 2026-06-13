import { db, pool } from "./client";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Resetting database...");
  try {
    await db.execute(sql`TRUNCATE TABLE "session", "account", "verification", "user", "wedding", "task", "ritual", "guest", "vendor" CASCADE`);
    console.log("Database reset successfully! You can now register a new admin user.");
  } catch (error) {
    console.error("Reset failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
