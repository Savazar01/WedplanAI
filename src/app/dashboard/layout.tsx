import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding } from "@/lib/wedding-helper";
import { db } from "@/db/client";
import { weddings } from "@/db/schema";
import { eq } from "drizzle-orm";
import SidebarShell from "@/components/dashboard/SidebarShell";
import DynamicTheme from "@/components/theme/DynamicTheme";
import * as React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: LayoutProps) {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect("/login?unauthenticated=true");
  }

  const activeWedding = await getActiveWedding(session.user.id);

  const user = session.user as any;
  const userRole = user.role || "user";
  const userWeddingAccess = user.weddingAccess || "all";

  let allWeddings: typeof weddings.$inferSelect[] = [];

  if (userRole === "admin") {
    allWeddings = await db
      .select()
      .from(weddings)
      .where(eq(weddings.userId, session.user.id));
  } else {
    if (userWeddingAccess === "all") {
      if (activeWedding) {
        allWeddings = await db
          .select()
          .from(weddings)
          .where(eq(weddings.userId, activeWedding.userId));
      }
    } else {
      allWeddings = await db
        .select()
        .from(weddings)
        .where(eq(weddings.id, userWeddingAccess));
    }
  }

  return (
    <>
      <DynamicTheme wedding={activeWedding} />
      <SidebarShell
        activeWedding={activeWedding}
        allWeddings={allWeddings}
        userName={session.user.name}
        userEmail={session.user.email}
        userRole={(session.user as { role?: string }).role || "user"}
      >
        {children}
      </SidebarShell>
    </>
  );
}

