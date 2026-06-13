import { db } from "@/db/client";
import { vendors } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding } from "@/lib/wedding-helper";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import DashboardVendorManager from "@/components/vendors/dashboard-manager";

export default async function DashboardVendorsPage() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?unauthenticated=true");
  }

  const wedding = await getActiveWedding(session.user.id);

  if (!wedding) {
    redirect("/dashboard");
  }

  const dbVendors = await db
    .select()
    .from(vendors)
    .where(eq(vendors.weddingId, wedding.id));

  return (
    <main className="w-full max-w-7xl mr-auto p-6 md:px-8">
      <DashboardVendorManager initialVendors={dbVendors} totalBudget={wedding.budget} country={wedding.country || 'India'} />
    </main>
  );
}
