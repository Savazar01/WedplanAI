import { db } from "@/db/client";
import { taskCategories } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import CategoriesAdminClient from "./CategoriesAdminClient";
import { defaultCategories } from "@/lib/default-seeds";

export default async function CategoriesAdminPage() {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  let allCategories = await db.select().from(taskCategories).orderBy(taskCategories.name);

  const existingKeys = new Set(allCategories.map((c) => c.key));
  const missingCategories = defaultCategories.filter((c) => !existingKeys.has(c.key));

  if (missingCategories.length > 0) {
    await db.insert(taskCategories).values(missingCategories);
    allCategories = await db.select().from(taskCategories).orderBy(taskCategories.name);
  }

  return <CategoriesAdminClient initialCategories={allCategories} />;
}

