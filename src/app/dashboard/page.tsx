import { db } from "@/db/client";
import { tasks, guests, vendors } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding, ensureDefaultColumns } from "@/lib/wedding-helper";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { eq, and, lt, asc } from "drizzle-orm";
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
  const weddingColumns = await ensureDefaultColumns(wedding.id);

  const doneCol = weddingColumns.find((col) => col.type === "done");

  // Task calculations
  const totalTasks = weddingTasks.length;
  const doneTasks = weddingTasks.filter((t) => 
    doneCol ? (t.columnId === doneCol.id || t.status === "done") : t.status === "done"
  ).length;
  const todoTasks = weddingTasks.filter((t) =>
    doneCol ? (t.columnId !== doneCol.id && t.status !== "in_progress" && t.status !== "done") : t.status === "todo" || t.status === "backlog"
  ).length;
  const inProgressTasks = weddingTasks.filter((t) =>
    doneCol ? (t.columnId !== doneCol.id && t.status === "in_progress") : t.status === "in_progress"
  ).length;
  const taskPercentage = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Overdue tasks: due date in the past and not done
  const now = new Date();
  const overdueTasks = weddingTasks.filter((t) => {
    if (!t.dueDate) return false;
    const isDone = doneCol ? (t.columnId === doneCol.id || t.status === "done") : t.status === "done";
    return new Date(t.dueDate) < now && !isDone;
  }).length;

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
  const budgetPercentage = totalBudget > 0 ? Math.round((contractedCost / totalBudget) * 100) : 0;

  return (
    <main className="w-full max-w-7xl mr-auto p-6 md:px-8 space-y-8">

      {/* ─── ROW 1: Wedding Card + Showcase ─── */}
      <Card variant="cream" className="p-6 border-slate-200 shadow-sm relative overflow-hidden">
        <DashboardWeddingCard wedding={wedding} />
        <div className="mt-6 pt-6 border-t border-slate-200/60">
          <ShareWeddingCard
            weddingId={wedding.id}
            partnerA={wedding.partnerA}
            partnerB={wedding.partnerB}
          />
        </div>
      </Card>

      {/* ─── ROW 2: Task Completion (full width) ─── */}
      <Card variant="default" className="p-6 border-slate-200 shadow-sm bg-white">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            <h3 className="text-sm font-bold text-[#6771ab] uppercase tracking-widest">Task Completion</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-slate-800">{taskPercentage}%</span>
              <span className="text-sm text-slate-400">({doneTasks}/{totalTasks} completed)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div 
                className="bg-[#22c55e] h-3 rounded-full transition-all duration-500" 
                style={{ width: `${taskPercentage}%` }}
              />
            </div>
            <div className="flex items-center gap-6 flex-wrap text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#6771ab]" />
                <span className="text-slate-600">To-Do: <strong>{todoTasks}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
                <span className="text-slate-600">In Progress: <strong>{inProgressTasks}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                <span className="text-slate-600">Done: <strong>{doneTasks}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
                <span className="text-slate-600">Overdue: <strong className={overdueTasks > 0 ? "text-red-500" : ""}>{overdueTasks}</strong></span>
              </div>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2 flex-wrap">
            <Link href="/dashboard/planning-board">
              <Button variant="secondary" size="sm" className="text-xs">Wedding Task Planner</Button>
            </Link>
            <Link href="/dashboard/event-itinerary">
              <Button variant="secondary" size="sm" className="text-xs">Wedding Ceremonies</Button>
            </Link>
            <Link href="/dashboard/calendar">
              <Button variant="secondary" size="sm" className="text-xs">Calendar View</Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* ─── ROW 3: Guest RSVPs ─── */}
      <Card variant="default" className="p-6 border-slate-200 shadow-sm bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 flex-1">
            <h3 className="text-sm font-bold text-[#6771ab] uppercase tracking-widest">Guest RSVPs</h3>
            <div className="flex items-center gap-6 flex-wrap">
              <div className="bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-xl text-center min-w-[100px]">
                <div className="text-2xl font-bold text-[#22c55e]">{attendingGuests}</div>
                <div className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">Attending</div>
              </div>
              <div className="bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl text-center min-w-[100px]">
                <div className="text-2xl font-bold text-[#ef4444]">{declinedGuests}</div>
                <div className="text-[10px] text-red-700 font-semibold uppercase tracking-wider">Declined</div>
              </div>
              <div className="bg-amber-50 border border-amber-100 px-4 py-2.5 rounded-xl text-center min-w-[100px]">
                <div className="text-2xl font-bold text-[#f59e0b]">{pendingGuests}</div>
                <div className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">Pending</div>
              </div>
            </div>
            <p className="text-xs text-slate-400">Attending count includes primary guests and plus-ones.</p>
          </div>
          <div className="shrink-0">
            <Link href="/dashboard/guests">
              <Button variant="secondary" size="sm" className="text-xs">Guest RSVP</Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* ─── ROW 4: Budget Depletion ─── */}
      <Card 
        variant="default" 
        className={`p-6 border shadow-sm bg-white ${
          isBudgetBreached ? "border-red-200 bg-red-50/20" : "border-slate-200"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 flex-1">
            <h3 className={`text-sm font-bold uppercase tracking-widest ${
              isBudgetBreached ? "text-red-500" : "text-[#6771ab]"
            }`}>
              Budget Depletion
            </h3>

            <div className="w-full bg-slate-100 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  isBudgetBreached ? "bg-[#ef4444]" : budgetPercentage > 75 ? "bg-[#f59e0b]" : "bg-[#22c55e]"
                }`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Budget</span>
                <span className="font-bold text-slate-800 text-sm">{formatCurrency(totalBudget, wedding.country)}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Contracted</span>
                <span className={`font-bold text-sm ${isBudgetBreached ? "text-red-600" : "text-slate-800"}`}>
                  {formatCurrency(contractedCost, wedding.country)}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Paid</span>
                <span className="font-bold text-slate-800 text-sm">{formatCurrency(paidAmount, wedding.country)}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Outstanding</span>
                <span className="font-bold text-slate-800 text-sm">{formatCurrency(outstandingBalance, wedding.country)}</span>
              </div>
            </div>

            {isBudgetBreached && (
              <div className="p-2.5 bg-red-100 border border-red-200 text-red-700 text-xs font-semibold text-center rounded-xl">
                ⚠️ Budget breached! Contracted costs exceed limits.
              </div>
            )}
          </div>
          <div className="shrink-0">
            <Link href="/dashboard/vendors">
              <Button variant="secondary" size="sm" className="text-xs">Vendors</Button>
            </Link>
          </div>
        </div>
      </Card>

    </main>
  );
}
