import { db } from "./client";
import { weddings, kanbanColumns, tasks } from "./schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Starting data migration...");
  
  // 1. Fetch all weddings
  const allWeddings = await db.select().from(weddings);
  console.log(`Found ${allWeddings.length} weddings.`);

  for (const wedding of allWeddings) {
    console.log(`Processing wedding ${wedding.id} (${wedding.partnerA} & ${wedding.partnerB})...`);
    
    // 2. Check if columns already exist for this wedding
    const existingCols = await db
      .select()
      .from(kanbanColumns)
      .where(eq(kanbanColumns.weddingId, wedding.id));
      
    let todoColId = "";
    let inProgressColId = "";
    let doneColId = "";
    
    if (existingCols.length === 0) {
      console.log("No columns found, seeding defaults...");
      // Seed default 3 columns
      const [todoCol] = await db.insert(kanbanColumns).values({
        weddingId: wedding.id,
        name: "To-Do",
        color: "#6771ab",
        position: 0,
        type: "todo",
      }).returning({ id: kanbanColumns.id });
      
      const [inProgressCol] = await db.insert(kanbanColumns).values({
        weddingId: wedding.id,
        name: "In Progress",
        color: "#f59e0b",
        position: 1,
        type: "in_progress",
      }).returning({ id: kanbanColumns.id });
      
      const [doneCol] = await db.insert(kanbanColumns).values({
        weddingId: wedding.id,
        name: "Done",
        color: "#22c55e",
        position: 2,
        type: "done",
      }).returning({ id: kanbanColumns.id });
      
      todoColId = todoCol.id;
      inProgressColId = inProgressCol.id;
      doneColId = doneCol.id;
      console.log(`Seeded columns: To-Do (${todoColId}), In Progress (${inProgressColId}), Done (${doneColId})`);
    } else {
      console.log("Columns already exist, mapping existing IDs...");
      const todo = existingCols.find(c => c.type === "todo");
      const inProgress = existingCols.find(c => c.type === "in_progress");
      const done = existingCols.find(c => c.type === "done");
      
      todoColId = todo?.id || existingCols[0].id;
      inProgressColId = inProgress?.id || existingCols[0].id;
      doneColId = done?.id || existingCols[0].id;
    }
    
    // 3. Map tasks' legacy status to the new column IDs
    const weddingTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.weddingId, wedding.id));
      
    console.log(`Found ${weddingTasks.length} tasks for this wedding.`);
    
    for (const task of weddingTasks) {
      // If task already has columnId, skip
      if (task.columnId) continue;
      
      let targetColId = todoColId;
      if (task.status === "in_progress") {
        targetColId = inProgressColId;
      } else if (task.status === "done") {
        targetColId = doneColId;
      }
      
      await db
        .update(tasks)
        .set({ columnId: targetColId })
        .where(eq(tasks.id, task.id));
    }
    
    console.log(`Mapped tasks for wedding ${wedding.id}.`);
  }
  
  console.log("Migration complete!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
