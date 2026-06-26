import { db } from "@/db/client";
import { emailConfigurations } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding } from "@/lib/wedding-helper";
import { redirect } from "next/navigation";
import EmailSettingsClient from "./EmailSettingsClient";

export default async function EmailSettingsPage() {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  // Ensure active wedding exists or triggers setup/wizard redirect
  await getActiveWedding(session.user.id);

  // Fetch the current email configuration (should only be one)
  const configs = await db.select().from(emailConfigurations).limit(1);
  const config = configs[0] || null;

  return (
    <main className="w-full">
      <EmailSettingsClient initialConfig={config} />
    </main>
  );
}
