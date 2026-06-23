import { db } from "@/db/client";
import { tasks, guests, vendors, ceremonies, guestRsvps } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding, ensureDefaultColumns } from "@/lib/wedding-helper";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { eq } from "drizzle-orm";
import DashboardWeddingCard from "@/components/dashboard/DashboardWeddingCard";
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

  const weddingCeremonies = await db
    .select()
    .from(ceremonies)
    .where(eq(ceremonies.weddingId, wedding.id));

  const dbGuestRsvps = await db
    .select({
      ceremonyId: guestRsvps.ceremonyId,
      rsvpStatus: guestRsvps.rsvpStatus,
      guestCount: guestRsvps.guestCount,
    })
    .from(guestRsvps)
    .innerJoin(guests, eq(guestRsvps.guestId, guests.id))
    .where(eq(guests.weddingId, wedding.id));

  const ceremonyAttendance = weddingCeremonies.map((c) => {
    const totalAttending = dbGuestRsvps
      .filter((r) => r.ceremonyId === c.id && r.rsvpStatus === "attending")
      .reduce((sum, r) => sum + r.guestCount, 0);
    return {
      id: c.id,
      name: c.name,
      totalAttending,
    };
  });

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

  const isClient = session.user.role === "client";

  if (isClient) {
    return (
      <main className="w-full max-w-7xl mr-auto p-6 md:px-8 space-y-8">
        {/* ─── ROW 1: Wedding Card + Showcase Quick Nav ─── */}
        <Card variant="cream" className="p-6 border-slate-200 shadow-sm relative overflow-hidden">
          <DashboardWeddingCard wedding={wedding} />
          <div className="mt-6 pt-6 border-t border-slate-200/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your wedding showcase page lets guests view ceremony details, venue, and RSVP. Head over to the{" "}
                  <Link href="/dashboard/showcase" className="text-[#6771ab] font-semibold underline underline-offset-2 hover:text-[#2d336b]">
                    Build Showcase Page
                  </Link>{" "}
                  to preview, update content, and see how it looks.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Personal invitation links — each guest receives a unique link with their login code pre-filled.
                  Manage and send them from the{" "}
                  <Link href="/dashboard/guests" className="text-[#6771ab] font-semibold underline underline-offset-2 hover:text-[#2d336b]">
                    Guests
                  </Link>{" "}
                  section.
                </p>
              </div>
              <Link href="/dashboard/showcase" className="shrink-0">
                <Button variant="secondary" size="sm" className="text-xs gap-2 whitespace-nowrap">
                  <svg className="h-4 w-4 text-[#6771ab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Build Showcase Page
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* ─── ROW 3: Guest RSVPs ─── */}
        <Card variant="default" className="p-6 border-slate-200 shadow-sm bg-white">
          <div className="space-y-6">
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
                  <Button variant="secondary" size="sm" className="text-xs gap-1.5">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Guest RSVP
                  </Button>
                </Link>
              </div>
            </div>

            {/* Ceremony Breakdown */}
            {ceremonyAttendance.length > 0 && (
              <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ceremony Attendance Breakdown</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {ceremonyAttendance.map((ca) => (
                    <div key={ca.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-center text-left">
                      <span className="text-xs font-medium text-slate-600 truncate" title={ca.name}>{ca.name}</span>
                      <span className="text-lg font-bold text-slate-800 mt-0.5">{ca.totalAttending} attending</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="w-full max-w-7xl mr-auto p-6 md:px-8 space-y-8">

      {/* ─── Planner Delegated Onboarding Banner ─── */}
      {session.user.persona === "wedding_planner" && (
        <Card variant="cream" className="p-6 border-slate-200 shadow-md relative overflow-hidden bg-gradient-to-r from-violet-50/40 via-amber-50/20 to-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                <h3 className="text-lg font-bold text-[#2d336b]">Delegated Onboarding</h3>
              </div>
              <p className="text-sm text-slate-600 max-w-3xl">
                As a wedding planner, you can delegate setup details to the couple.
                Share a secure public Onboarding Link or download and upload the Onboarding Spreadsheet to easily collect partners, tradition, date, budget, and location details.
              </p>
            </div>
            <Link href="/dashboard/onboarding" className="shrink-0">
              <Button variant="primary" className="whitespace-nowrap shadow-sm">
                Manage Onboarding
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* ─── ROW 1: Wedding Card + Showcase Quick Nav ─── */}
      <Card variant="cream" className="p-6 border-slate-200 shadow-sm relative overflow-hidden">
        <DashboardWeddingCard wedding={wedding} />
        <div className="mt-6 pt-6 border-t border-slate-200/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs text-slate-500 leading-relaxed">
                Your wedding showcase page lets guests view ceremony details, venue, and RSVP. Head over to the{" "}
                <Link href="/dashboard/showcase" className="text-[#6771ab] font-semibold underline underline-offset-2 hover:text-[#2d336b]">
                  Build Showcase Page
                </Link>{" "}
                to preview, update content, and see how it looks.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Personal invitation links — each guest receives a unique link with their login code pre-filled.
                Manage and send them from the{" "}
                <Link href="/dashboard/guests" className="text-[#6771ab] font-semibold underline underline-offset-2 hover:text-[#2d336b]">
                  Guests
                </Link>{" "}
                section.
              </p>
            </div>
            <Link href="/dashboard/showcase" className="shrink-0">
              <Button variant="secondary" size="sm" className="text-xs gap-2 whitespace-nowrap">
                <svg className="h-4 w-4 text-[#6771ab]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Build Showcase Page
              </Button>
            </Link>
          </div>
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
            <Link href="/dashboard/wedding-task-planner">
              <Button variant="secondary" size="sm" className="text-xs gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Wedding Task Planner
              </Button>
            </Link>
            <Link href="/dashboard/wedding-ceremony-planner">
              <Button variant="secondary" size="sm" className="text-xs gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
                Wedding Ceremonies
              </Button>
            </Link>
            <Link href="/dashboard/calendar">
              <Button variant="secondary" size="sm" className="text-xs gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendar View
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* ─── ROW 3: Guest RSVPs ─── */}
      <Card variant="default" className="p-6 border-slate-200 shadow-sm bg-white">
        <div className="space-y-6">
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
                <Button variant="secondary" size="sm" className="text-xs gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Guest RSVP
                </Button>
              </Link>
            </div>
          </div>

          {/* Ceremony Breakdown */}
          {ceremonyAttendance.length > 0 && (
            <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ceremony Attendance Breakdown</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {ceremonyAttendance.map((ca) => (
                  <div key={ca.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-center text-left">
                    <span className="text-xs font-medium text-slate-600 truncate" title={ca.name}>{ca.name}</span>
                    <span className="text-lg font-bold text-slate-800 mt-0.5">{ca.totalAttending} attending</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
              <Button variant="secondary" size="sm" className="text-xs gap-1.5">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Vendors
              </Button>
            </Link>
          </div>
        </div>
      </Card>

    </main>
  );
}
