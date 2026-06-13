import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding } from "@/lib/wedding-helper";
import { db } from "@/db/client";
import { weddings } from "@/db/schema";
import { eq } from "drizzle-orm";
import SidebarShell from "@/components/dashboard/SidebarShell";
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

  const allWeddings = await db
    .select()
    .from(weddings)
    .where(eq(weddings.userId, session.user.id));

  return (
    <SidebarShell
      activeWedding={activeWedding}
      allWeddings={allWeddings}
      userName={session.user.name}
      userEmail={session.user.email}
      userRole={(session.user as { role?: string }).role || "user"}
    >
      {children}
    </SidebarShell>
  );
}
