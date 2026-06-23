import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding } from "@/lib/wedding-helper";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import OnboardingClient from "./OnboardingClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function OnboardingPage() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?unauthenticated=true");
  }

  // Restrict access to planners only
  if (session.user.persona !== "wedding_planner") {
    redirect("/dashboard");
  }

  const wedding = await getActiveWedding(session.user.id);
  if (!wedding) {
    redirect("/dashboard");
  }

  // Construct base URL from headers
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3044";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const baseURL = process.env.BETTER_AUTH_URL || `${protocol}://${host}`;

  return (
    <main className="w-full max-w-7xl mr-auto p-6 md:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Delegated Onboarding</h1>
          <p className="text-sm text-slate-500 mt-1">
            Delegate wedding setup details directly to the couple using a secure link or spreadsheet.
          </p>
        </div>
        <Link href="/dashboard" className="shrink-0">
          <Button variant="ghost" className="text-slate-600 border border-slate-200 bg-white hover:bg-slate-50">
            ← Back to Dashboard
          </Button>
        </Link>
      </div>

      <OnboardingClient weddingId={wedding.id} baseURL={baseURL} />
    </main>
  );
}
