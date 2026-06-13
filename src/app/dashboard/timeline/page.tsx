import { db } from "@/db/client";
import { rituals } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding } from "@/lib/wedding-helper";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import TimelineOnly from "@/components/calendar/TimelineOnly";

export default async function DashboardTimelinePage() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?unauthenticated=true");
  }

  const wedding = await getActiveWedding(session.user.id);

  if (!wedding) {
    redirect("/dashboard");
  }

  const dbRituals = await db
    .select()
    .from(rituals)
    .where(eq(rituals.weddingId, wedding.id));

  return (
    <main className="w-full max-w-7xl mr-auto p-6 md:px-8">
      <TimelineOnly initialRituals={dbRituals} />
    </main>
  );
}
