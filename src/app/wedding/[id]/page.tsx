import { db } from "@/db/client";
import { weddings, rituals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import Countdown from "@/components/wedding/countdown";
import PublicRsvpForm from "@/components/wedding/public-rsvp-form";
import { formatDateTime, formatDate } from "@/lib/format";
import SampleWalkthroughCard from "@/components/dashboard/SampleWalkthroughCard";
import DynamicTheme from "@/components/theme/DynamicTheme";

// Define the async params type for Next.js 16
interface PageProps {
  params: Promise<{ id: string }>;
}


const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-playfair",
});

export default async function WeddingShowcasePage({ params }: PageProps) {
  const { id } = await params;

  // Retrieve wedding details
  const weddingList = await db
    .select()
    .from(weddings)
    .where(eq(weddings.id, id))
    .limit(1);

  if (weddingList.length === 0) {
    notFound();
  }

  const wedding = weddingList[0];

  // Retrieve wedding rituals
  const dbRituals = await db
    .select()
    .from(rituals)
    .where(eq(rituals.weddingId, wedding.id))
    .orderBy(rituals.startTime);

  const weddingDateStr = formatDate(wedding.weddingDate);

  const fullAddress = [wedding.locationName, wedding.street, wedding.city, wedding.state, wedding.pincode].filter(Boolean).join(", ");

  const traditionLabels: Record<string, string> = {
    hindu: "Shubh Vivah (Hindu Tradition)",
    muslim: "Nikah (Muslim Tradition)",
    sikh: "Anand Karaj (Sikh Tradition)",
    christian: "Holy Matrimony (Christian Tradition)",
    secular: "Wedding Celebration (Secular Tradition)",
  };

  const traditionLabel = traditionLabels[wedding.tradition] || "Wedding Celebration";

  const isSampleWedding = (wedding.description || "").includes("Sample Wedding");

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-slate-800 flex flex-col items-center">
      <DynamicTheme wedding={wedding} mode="showcase" />
      {/* Decorative Top Border */}
      <div className="w-full h-2 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-amber-500" />


      {isSampleWedding && (
        <SampleWalkthroughCard isSampleWedding={true} weddingId={wedding.id} userRole="admin" />
      )}

      {/* Hero Banner Section */}
      <section className="w-full max-w-4xl mx-auto px-6 pt-12 pb-8 flex flex-col items-center text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-6">
          {traditionLabel}
        </div>
        
        <h1 className={`${playfair.className} text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-amber-500 py-3 leading-tight tracking-wide`}>
          {wedding.partnerA} & {wedding.partnerB}
        </h1>

        {/* Elegant Gold Divider */}
        <div className="flex items-center justify-center gap-4 py-4 w-full">
          <div className="h-[1px] flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-amber-400" />
          <span className="text-amber-500 text-lg">✨ 💍 ✨</span>
          <div className="h-[1px] flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-amber-400" />
        </div>

        <p className="text-base sm:text-lg text-[var(--color-primary)] font-medium tracking-wide">
          Save The Date
        </p>
        <p className={`${playfair.className} text-xl sm:text-2xl font-bold text-slate-800 mt-1`}>
          {weddingDateStr}
        </p>
        <p className="text-sm text-slate-500 mt-2 font-medium">
          📍 {fullAddress || wedding.location}
        </p>

        {wedding.description && (
          <p className="max-w-xl text-sm text-slate-500 mt-6 font-light leading-relaxed italic">
            &ldquo;{wedding.description}&rdquo;
          </p>
        )}

        {/* Live Countdown */}
        <div className="w-full mt-8">
          <Countdown targetDate={wedding.weddingDate.toISOString()} />
        </div>
      </section>

      {/* Hero Banner Image */}
      {(wedding.showcaseHeroData || wedding.showcaseHeroUrl) && (
        <div className="w-full max-w-4xl px-6 mb-8">
          <div className="relative w-full h-[250px] sm:h-[400px] overflow-hidden rounded-3xl shadow-md border border-slate-200/50">
            <img
              src={wedding.showcaseHeroData || wedding.showcaseHeroUrl || ""}
              alt="Wedding Hero Banner"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Our Story / Welcome Section */}
      {(wedding.showcaseWelcomeText || wedding.showcaseDetails) && (
        <section className="w-full max-w-2xl mx-auto px-6 py-6">
          <div className="bg-white border border-slate-200/60 p-6 sm:p-8 rounded-3xl shadow-xs text-center space-y-4">
            <h3 className={`${playfair.className} text-2xl sm:text-3xl font-bold text-[var(--color-primary)]`}>
              Our Story
            </h3>
            {wedding.showcaseWelcomeText && (
              <p className="text-lg text-slate-700 font-medium leading-relaxed">
                {wedding.showcaseWelcomeText}
              </p>
            )}
            {wedding.showcaseDetails && (
              <p className="text-sm text-slate-500 font-light leading-relaxed whitespace-pre-wrap">
                {wedding.showcaseDetails}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Itinerary Rituals Section */}
      <section className="w-full max-w-2xl mx-auto px-6 py-8">
        <h3 className={`${playfair.className} text-2xl sm:text-3xl font-bold text-[var(--color-primary)] text-center mb-8 tracking-wide`}>
          Wedding Itinerary
        </h3>

        {dbRituals.length > 0 ? (
          <div className="relative border-l border-amber-200/80 ml-4 sm:ml-8 space-y-8">
            {dbRituals.map((ritual) => {
              const startStr = formatDateTime(ritual.startTime);
              const endStr = new Date(ritual.endTime);
              const endTimeStr = endStr.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              return (
                <div key={ritual.id} className="relative pl-6 sm:pl-8">
                  <div className="absolute -left-2 top-1.5 h-4 w-4 rounded-full border-2 border-amber-400 bg-white shadow-xs" />
                  
                  <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
                    <span className="text-[10px] font-bold text-[var(--color-secondary)] tracking-widest uppercase block mb-1">
                      🕒 {startStr} — {endTimeStr}
                    </span>
                    <h4 className={`${playfair.className} text-lg font-bold text-slate-800`}>
                      {ritual.name}
                    </h4>
                    {ritual.description && (
                      <p className="text-sm text-slate-500 mt-2 font-light leading-relaxed">
                        {ritual.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-800 font-semibold bg-amber-50 border border-amber-200/30 px-3 py-1 rounded-xl w-fit">
                      <span>📍</span>
                      <span>{ritual.location}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-amber-50/40 border border-amber-200/40 rounded-2xl p-6 text-center text-sm text-slate-500 font-light font-sans">
             ✨ Itinerary details are currently being finalized. Please check back soon! ✨
          </div>
        )}
      </section>

      {/* RSVP Section */}
      <section className="w-full max-w-4xl mx-auto px-6 pt-6 pb-16">
        <PublicRsvpForm weddingId={wedding.id} />
      </section>

      {/* Footer */}
      <footer className="w-full bg-slate-100/50 border-t border-slate-200 text-center py-6 mt-auto">
        <p className="text-xs text-slate-400 tracking-widest uppercase font-semibold">
          Created with Love for {wedding.partnerA} & {wedding.partnerB}
        </p>
      </footer>
    </div>
  );
}
