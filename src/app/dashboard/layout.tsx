import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding } from "@/lib/wedding-helper";
import { db } from "@/db/client";
import { weddings, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import SidebarShell from "@/components/dashboard/SidebarShell";
import DynamicTheme from "@/components/theme/DynamicTheme";
import { getPreviewCode } from "@/lib/preview";
import * as React from "react";
import { cookies } from "next/headers";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: LayoutProps) {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect("/login?unauthenticated=true");
  }

  const activeWedding = await getActiveWedding(session.user.id);

  const user = session.user as { role?: string; weddingAccess?: string; id: string; email: string; name: string; shouldChangePassword?: boolean };
  const userRole = user.role || "user";
  const userWeddingAccess = user.weddingAccess || "all";

  let allWeddings: typeof weddings.$inferSelect[] = [];

  if (userRole === "admin") {
    allWeddings = await db
      .select()
      .from(weddings)
      .where(and(eq(weddings.userId, session.user.id), eq(weddings.isArchived, false)));
  } else {
    if (userWeddingAccess === "all") {
      if (activeWedding) {
        allWeddings = await db
          .select()
          .from(weddings)
          .where(and(eq(weddings.userId, activeWedding.userId), eq(weddings.isArchived, false)));
      }
    } else {
      allWeddings = await db
        .select()
        .from(weddings)
        .where(and(eq(weddings.id, userWeddingAccess), eq(weddings.isArchived, false)));
    }
  }

  const cookieStore = await cookies();
  const sampleWalkthroughStatus = cookieStore.get("sample_walkthrough_status")?.value;
  const isOnboarding = sampleWalkthroughStatus !== "completed" && sampleWalkthroughStatus !== "skipped";

  if (userRole !== "admin" && isOnboarding) {
    // Get creator admin ID
    let creatorAdminId: string | null = null;
    const [userRecord] = await db
      .select({ weddingId: users.weddingId })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    const userAssignedWeddingId = userRecord?.weddingId;

    if (userAssignedWeddingId) {
      const [assignedWedding] = await db
        .select({ userId: weddings.userId })
        .from(weddings)
        .where(eq(weddings.id, userAssignedWeddingId))
        .limit(1);
      if (assignedWedding) {
        creatorAdminId = assignedWedding.userId;
      }
    }

    // Try to find the sample wedding owned by the user's creator admin first
    let sampleWedding: typeof weddings.$inferSelect | null = null;
    if (creatorAdminId) {
      const [w] = await db
        .select()
        .from(weddings)
        .where(and(eq(weddings.isSample, true), eq(weddings.userId, creatorAdminId)))
        .limit(1);
      if (w) sampleWedding = w;
    }

    if (!sampleWedding) {
      const [w] = await db
        .select()
        .from(weddings)
        .where(eq(weddings.isSample, true))
        .limit(1);
      if (w) sampleWedding = w;
    }

    if (sampleWedding) {
      // Ensure the sample wedding is in allWeddings
      if (!allWeddings.some((w) => w.id === sampleWedding!.id)) {
        allWeddings.push(sampleWedding);
      }
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
        shouldChangePassword={user.shouldChangePassword}
        previewCode={activeWedding ? getPreviewCode(activeWedding.id) : ""}
      >
        {children}
      </SidebarShell>
    </>
  );
}

