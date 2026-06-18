import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding } from "@/lib/wedding-helper";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AppearanceFormClient from "./AppearanceFormClient";

export default async function AppearancePage() {
  const session = await getServerSession();
  if (!session || !session.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const activeWedding = await getActiveWedding(session.user.id);

  return (
    <main className="w-full max-w-7xl mr-auto p-6 md:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Wedding Appearance</h1>
        <p className="text-sm text-slate-500">Customize the design system, branding, colors, and typography of your wedding website.</p>
      </div>

      {!activeWedding ? (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
          <p className="text-slate-600">No active wedding found. Please create a wedding event first.</p>
        </div>
      ) : (
        <Suspense fallback={<div>Loading appearance settings...</div>}>
          <AppearanceFormClient wedding={activeWedding} />
        </Suspense>
      )}
    </main>
  );
}
