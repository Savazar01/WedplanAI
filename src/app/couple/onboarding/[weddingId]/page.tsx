import { db } from "@/db/client";
import { weddings, weddingTraditions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import CoupleOnboardingForm from "./CoupleOnboardingForm";

interface PageProps {
  params: Promise<{ weddingId: string }>;
}

export default async function CoupleOnboardingPage({ params }: PageProps) {
  const { weddingId } = await params;

  if (!weddingId) {
    notFound();
  }

  // Fetch the wedding record by UUID
  const weddingResult = await db
    .select()
    .from(weddings)
    .where(eq(weddings.id, weddingId))
    .limit(1);

  if (weddingResult.length === 0) {
    return (
      <main className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200 shadow-lg rounded-2xl p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Wedding Event Not Found</h2>
          <p className="text-slate-500 text-sm">
            The onboarding link you followed appears to be invalid or the wedding event has been removed. Please contact your wedding planner.
          </p>
        </div>
      </main>
    );
  }

  const wedding = weddingResult[0];

  // Fetch traditions from database configurations to support standard and user-defined traditions
  const dbTraditions = await db.select().from(weddingTraditions);

  const defaultTraditions = [
    { id: "christian", name: "Christian" },
    { id: "hindu", name: "Hindu" },
    { id: "muslim", name: "Muslim" },
    { id: "sikh", name: "Sikh" },
    { id: "jewish", name: "Jewish" },
    { id: "secular", name: "Secular" },
    { id: "other", name: "Other" }
  ];

  // Merge traditions using Map to eliminate duplicates
  const traditionsMap = new Map<string, string>();
  defaultTraditions.forEach((t) => traditionsMap.set(t.id, t.name));
  dbTraditions.forEach((t) => traditionsMap.set(t.key, t.name));

  const traditionsList = Array.from(traditionsMap.entries()).map(([id, name]) => ({
    id,
    name,
  }));

  const initialData = {
    partnerA: wedding.partnerA || "",
    partnerB: wedding.partnerB || "",
    weddingDate: wedding.weddingDate ? new Date(wedding.weddingDate).toISOString().split("T")[0] : "",
    location: wedding.location || "",
    tradition: wedding.tradition || "",
    budget: wedding.budget || 0,
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 font-sans flex flex-col justify-center">
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <span className="text-4xl text-[#6771ab] font-serif font-bold tracking-wide">WedPlanAI</span>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">Couple Onboarding Portal</p>
      </div>

      <CoupleOnboardingForm
        weddingId={wedding.id}
        initialData={initialData}
        traditionsList={traditionsList}
      />
    </main>
  );
}
