import { db } from "@/db/client";
import { taskCategories } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import CategoriesAdminClient from "./CategoriesAdminClient";

export default async function CategoriesAdminPage() {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const allCategories = await db.select().from(taskCategories).orderBy(taskCategories.name);

  return <CategoriesAdminClient initialCategories={allCategories} />;
}
