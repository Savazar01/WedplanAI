const { Pool } = require("pg");
const { drizzle } = require("drizzle-orm/node-postgres");
const { migrate } = require("drizzle-orm/node-postgres/migrator");
const path = require("path");

async function main() {
  console.log("Running production database migrations...");
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL environment variable is missing!");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
  });

  const db = drizzle(pool);

  try {
    await migrate(db, {
      migrationsFolder: path.join(__dirname, "migrations"),
    });
    console.log("Production database migrations applied successfully!");
  } catch (error) {
    console.error("Production migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
