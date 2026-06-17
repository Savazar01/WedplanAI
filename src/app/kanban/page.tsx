import { db } from "@/db/client";
import { weddings, tasks, kanbanColumns } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KanbanBoard from "@/components/kanban/board";

export default async function KanbanPage() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?unauthenticated=true");
  }

  const userWeddings = await db
    .select()
    .from(weddings)
    .where(eq(weddings.userId, session.user.id))
    .limit(1);

  if (userWeddings.length === 0) {
    redirect("/dashboard");
  }

  const wedding = userWeddings[0];

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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <DashboardHeader 
        userName={session.user.name} 
        userEmail={session.user.email} 
        userRole={session.user.role} 
      />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        <KanbanBoard initialTasks={clientTasks} initialColumns={dbColumns} />
      </main>
    </div>
  );
}
