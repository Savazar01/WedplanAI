import { db } from "@/db/client";
import { tasks } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding } from "@/lib/wedding-helper";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
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

  const dbTasks = await db
    .select()
    .from(tasks)
    .where(eq(tasks.weddingId, wedding.id))
    .orderBy(tasks.position);

  return (
    <main className="w-full max-w-7xl mr-auto p-6 md:px-8">
      <KanbanBoard initialTasks={dbTasks} />
    </main>
  );
}
