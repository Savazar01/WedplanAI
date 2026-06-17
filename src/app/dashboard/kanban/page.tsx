import { db } from "@/db/client";
import { tasks, kanbanColumns } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding } from "@/lib/wedding-helper";
import { redirect } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import KanbanBoard from "@/components/kanban/board";

export default async function KanbanPage() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?unauthenticated=true");
  }

  const wedding = await getActiveWedding(session.user.id);

  if (!wedding) {
    redirect("/dashboard");
  }

  const dbColumns = await db
    .select()
    .from(kanbanColumns)
    .where(eq(kanbanColumns.weddingId, wedding.id))
    .orderBy(asc(kanbanColumns.position));

  const dbTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.weddingId, wedding.id))
    .orderBy(tasks.position);

  const clientTasks = dbTasks.map((t) => ({
    ...t,
    status: t.columnId || "",
  }));

  return (
    <main className="w-full max-w-7xl mr-auto p-6 md:px-8">
      <KanbanBoard initialTasks={clientTasks} initialColumns={dbColumns} />
    </main>
  );
}
