import { db } from "@/db/client";
import { tasks, ceremonies, users } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding, ensureDefaultColumns } from "@/lib/wedding-helper";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import PlanningBoard from "@/components/kanban/board";

export default async function DashboardPlanningBoardPage() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?unauthenticated=true");
  }

  const wedding = await getActiveWedding(session.user.id);

  if (!wedding) {
    redirect("/dashboard");
  }

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
    <main className="w-full max-w-7xl mr-auto p-6 md:px-8">
      <PlanningBoard
        initialTasks={clientTasks}
        initialColumns={dbColumns}
        ceremonies={dbCeremonies}
        teamMembers={teamMembers}
      />
    </main>
  );
}

