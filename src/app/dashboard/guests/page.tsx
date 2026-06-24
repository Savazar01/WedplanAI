import { db } from "@/db/client";
import { guests, ceremonies, guestRsvps } from "@/db/schema";
import { getServerSession } from "@/lib/auth-server";
import { getActiveWedding } from "@/lib/wedding-helper";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import GuestList from "@/components/guests/list";
import GuestCsvUpload from "@/components/guests/csv-upload";

export default async function DashboardGuestsPage() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?unauthenticated=true");
  }

  const wedding = await getActiveWedding(session.user.id);

  if (!wedding) {
    redirect("/dashboard");
  }

  const dbGuests = await db
    .select()
    .from(guests)
    .where(eq(guests.weddingId, wedding.id));

  const dbCeremonies = await db
    .select()
    .from(ceremonies)
    .where(eq(ceremonies.weddingId, wedding.id));

  const dbGuestRsvps = await db
    .select({
      id: guestRsvps.id,
      guestId: guestRsvps.guestId,
      ceremonyId: guestRsvps.ceremonyId,
      rsvpStatus: guestRsvps.rsvpStatus,
      guestCount: guestRsvps.guestCount,
    })
    .from(guestRsvps)
    .innerJoin(guests, eq(guestRsvps.guestId, guests.id))
    .where(eq(guests.weddingId, wedding.id));

  return (
    <main className="w-full max-w-7xl mr-auto p-6 md:px-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Batch Import Guests</h2>
          <p className="text-xs text-slate-500">Upload a CSV file containing your guest details.</p>
        </div>
        <GuestCsvUpload weddingId={wedding.id} />
      </div>
      <GuestList
        initialGuests={dbGuests}
        ceremonies={dbCeremonies}
        guestRsvps={dbGuestRsvps}
        weddingId={wedding.id}
        partnerA={wedding.partnerA ?? undefined}
        partnerB={wedding.partnerB ?? undefined}
      />
    </main>
  );
}

