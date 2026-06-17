import { db } from "@/db/client";
import { tasks, guests, vendors, kanbanColumns } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding } from "@/lib/wedding-helper";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { eq, asc } from "drizzle-orm";
import DashboardWeddingCard from "@/components/dashboard/DashboardWeddingCard";
import ShareWeddingCard from "@/components/dashboard/ShareWeddingCard";
import { formatCurrency } from "@/lib/format";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?unauthenticated=true");
  }

  const wedding = await getActiveWedding(session.user.id);

  if (!wedding) {
    return (
      <main className="w-full max-w-7xl mr-auto p-6 md:px-8 flex items-center justify-center min-h-[80vh]">
        <Card variant="cream" className="w-full max-w-lg p-10 text-center shadow-lg border-slate-200">
          <div className="text-5xl mb-4">💒</div>
          <h2 className="text-2xl font-bold text-[#2d336b] mb-2">Welcome to WedPlanAI!</h2>
          <p className="text-slate-500 text-sm mb-8">
            You don{"'"}t have any wedding events yet. Create your first wedding to get started with planning, tasks, guest management, and more.
          </p>
          <Link href="/wizard">
            <Button variant="primary" className="px-8 py-3 text-base">
              Create Your Wedding Event
            </Button>
          </Link>
        </Card>
      </main>
    );
  }

  const weddingTasks = await db.select().from(tasks).where(eq(tasks.weddingId, wedding.id));
  const weddingGuests = await db.select().from(guests).where(eq(guests.weddingId, wedding.id));
  const weddingVendors = await db.select().from(vendors).where(eq(vendors.weddingId, wedding.id));
  const weddingColumns = await db
    .select()
    .from(kanbanColumns)
    .where(eq(kanbanColumns.weddingId, wedding.id))
    .orderBy(asc(kanbanColumns.position));

  const doneCol = weddingColumns.find((col) => col.type === "done");

  // Task percentage
  const totalTasks = weddingTasks.length;
  const doneTasks = weddingTasks.filter((t) => 
    doneCol ? (t.columnId === doneCol.id || t.status === "done") : t.status === "done"
  ).length;
  const taskPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Guest calculations
  const attendingGuests = weddingGuests
    .filter((g) => g.rsvpStatus === "attending")
    .reduce((sum, g) => sum + 1 + g.plusOneCount, 0);
  const declinedGuests = weddingGuests.filter((g) => g.rsvpStatus === "declined").length;
  const pendingGuests = weddingGuests.filter((g) => g.rsvpStatus === "pending").length;

  // Budget calculations
  const totalBudget = wedding.budget;
  const contractedCost = weddingVendors.reduce((sum, v) => sum + v.totalCost, 0);
  const paidAmount = weddingVendors.reduce((sum, v) => sum + v.paidAmount, 0);
  const outstandingBalance = contractedCost - paidAmount;
  const isBudgetBreached = contractedCost > totalBudget;

  const navItems = [
    { label: "Kanban Board", path: "/dashboard/kanban", desc: "Manage tasks", icon: "📋" },
    { label: "Calendar", path: "/dashboard/calendar", desc: "Month calendar grid", icon: "🗓️" },
    { label: "Timeline", path: "/dashboard/timeline", desc: "Ceremonies & rituals", icon: "⏳" },
    { label: "Guest RSVP", path: "/dashboard/guests", desc: "Track guest list", icon: "👥" },
    { label: "Vendors & Budget", path: "/dashboard/vendors", desc: "Monitor expenses", icon: "💰" },
  ];

  return (
    <main className="w-full max-w-7xl mr-auto p-6 md:px-8 space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="cream" className="md:col-span-2 p-6 flex flex-col justify-between border-slate-200 shadow-sm relative overflow-hidden">
          <DashboardWeddingCard wedding={wedding} />
        </Card>

        <Card variant="default" className="p-6 border-slate-200 shadow-sm bg-white flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest text-[#6771ab] mb-4">Quick Navigation</h3>
            <div className="grid grid-cols-2 gap-3">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <div className="p-3 border border-slate-100 rounded-xl hover:border-[#6771ab] hover:bg-slate-50 transition-all hover:scale-[1.02] cursor-pointer text-center">
                    <div className="text-xl mb-1">{item.icon}</div>
                    <div className="text-xs font-bold text-slate-700">{item.label}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="default" className="p-6 border-slate-200 shadow-sm bg-white flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#6771ab] uppercase tracking-widest mb-4">Task Completion</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-800">{taskPercentage}%</span>
              <span className="text-xs text-slate-400">({doneTasks}/{totalTasks} completed)</span>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="w-full bg-slate-100 rounded-full h-2.5">
              <div 
                className="bg-[#22c55e] h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${taskPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">Progress bar updates automatically based on Done tasks.</p>
          </div>
        </Card>

        <Card variant="default" className="p-6 border-slate-200 shadow-sm bg-white flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#6771ab] uppercase tracking-widest mb-4">Guest RSVPs</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-xl">
                <div className="text-xl font-bold text-[#22c55e]">{attendingGuests}</div>
                <div className="text-[9px] text-emerald-700 font-semibold uppercase">Attending</div>
              </div>
              <div className="bg-red-50 border border-red-100 p-2 rounded-xl">
                <div className="text-xl font-bold text-[#ef4444]">{declinedGuests}</div>
                <div className="text-[9px] text-red-700 font-semibold uppercase">Declined</div>
              </div>
              <div className="bg-amber-50 border border-amber-100 p-2 rounded-xl">
                <div className="text-xl font-bold text-[#f59e0b]">{pendingGuests}</div>
                <div className="text-[9px] text-amber-700 font-semibold uppercase">Pending</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[10px] text-slate-400 text-center font-sans">Attending count includes primary guests and plus-ones.</p>
          </div>
        </Card>

        <Card 
          variant="default" 
          className={`p-6 border shadow-sm bg-white flex flex-col justify-between transition-all ${
            isBudgetBreached ? "border-red-200 bg-red-50/20" : "border-slate-200"
          }`}
        >
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-widest mb-4 ${
              isBudgetBreached ? "text-red-500" : "text-[#6771ab]"
            }`}>
              Budget Depletion
            </h3>
            
            <div className="flex flex-col gap-1 font-sans">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Total Budget:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(totalBudget, wedding.country)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Contracted Cost:</span>
                <span className={`font-semibold ${isBudgetBreached ? "text-red-600" : "text-slate-800"}`}>
                  {formatCurrency(contractedCost, wedding.country)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Paid So Far:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(paidAmount, wedding.country)}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-slate-100 pt-1 mt-1">
                <span className="text-slate-500">Outstanding:</span>
                <span className="font-semibold text-slate-800">{formatCurrency(outstandingBalance, wedding.country)}</span>
              </div>
            </div>
          </div>

          {isBudgetBreached && (
            <div className="mt-4 p-2 bg-red-100 border border-red-200 text-red-700 text-[10px] font-semibold text-center rounded-lg font-sans">
              ⚠️ Budget breached! Contracted costs exceed limits.
            </div>
          )}
        </Card>
      </div>

      {/* Wedding Showcase / Share link */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3">
          <ShareWeddingCard
            weddingId={wedding.id}
            partnerA={wedding.partnerA}
            partnerB={wedding.partnerB}
          />
        </div>
      </div>
    </main>
  );
}
