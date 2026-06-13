import { db } from "@/db/client";
import { weddings, guests } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import GuestList from "@/components/guests/list";

export default async function GuestsPage() {
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

  const dbGuests = await db
    .select()
    .from(guests)
    .where(eq(guests.weddingId, wedding.id));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <DashboardHeader 
        userName={session.user.name} 
        userEmail={session.user.email} 
        userRole={session.user.role} 
      />

      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        <GuestList initialGuests={dbGuests} weddingId={wedding.id} />
      </main>
    </div>
  );
}
