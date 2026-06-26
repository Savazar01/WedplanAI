import { db } from "@/db/client";
import { ceremonies, vendors, cateringMenus } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding } from "@/lib/wedding-helper";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import MenuPlannerClient from "./MenuPlannerClient";
import { getLocaleServer } from "@/lib/i18n-server";
import { translations } from "@/lib/translations";

export default async function MenuPlannerPage() {
  const locale = await getLocaleServer();
  const tDict = translations[locale] || translations["en"];
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?unauthenticated=true");
  }

  const wedding = await getActiveWedding(session.user.id);
  if (!wedding) {
    redirect("/dashboard");
  }

  const dbCeremonies = await db
    .select()
    .from(ceremonies)
    .where(eq(ceremonies.weddingId, wedding.id))
    .orderBy(ceremonies.startTime);

  const dbCateringVendors = await db
    .select()
    .from(vendors)
    .where(and(eq(vendors.weddingId, wedding.id), eq(vendors.category, "catering")))
    .orderBy(vendors.name);

  const dbCateringMenus = await db
    .select()
    .from(cateringMenus)
    .where(eq(cateringMenus.weddingId, wedding.id))
    .orderBy(cateringMenus.createdAt);

  return (
    <main className="w-full max-w-7xl mr-auto p-6 md:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{tDict.cateringMenuPlanner}</h1>
        <p className="text-xs text-slate-500">Design and manage food & beverage menus for your wedding ceremonies.</p>
      </div>

      <MenuPlannerClient
        weddingId={wedding.id}
        initialMenus={dbCateringMenus}
        ceremonies={dbCeremonies}
        vendors={dbCateringVendors}
      />
    </main>
  );
}
