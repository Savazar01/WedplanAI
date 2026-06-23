import { db } from "@/db/client";
import { weddings, tasks, ceremonies, users } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { ensureDefaultColumns } from "@/lib/wedding-helper";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PlanningBoard from "@/components/kanban/board";

export default async function PlanningBoardPage() {
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

  const dbColumns = await ensureDefaultColumns(wedding.id);

  const dbTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.weddingId, wedding.id))
    .orderBy(tasks.position);

  const clientTasks = dbTasks.map((t) => ({
    ...t,
    status: t.columnId || "",
  }));

  const dbCeremonies = await db
    .select({ id: ceremonies.id, name: ceremonies.name })
    .from(ceremonies)
    .where(eq(ceremonies.weddingId, wedding.id));

  const teamMembers = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.weddingId, wedding.id));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <DashboardHeader 
        userName={session.user.name} 
        userEmail={session.user.email} 
        userRole={session.user.role} 
      />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        <PlanningBoard
          initialTasks={clientTasks}
          initialColumns={dbColumns}
          ceremonies={dbCeremonies}
          teamMembers={teamMembers}
        />
      </main>
    </div>
  );
}
