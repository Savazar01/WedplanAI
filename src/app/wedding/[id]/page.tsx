import { db } from "@/db/client";
import { weddings, rituals, guests } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { notFound } from "next/navigation";
import Countdown from "@/components/wedding/countdown";
import PublicRsvpForm from "@/components/wedding/public-rsvp-form";
import { formatDateTime, formatDate } from "@/lib/format";
import DynamicTheme from "@/components/theme/DynamicTheme";
import Link from "next/link";
import { getPreviewCode } from "@/lib/preview";

// Define the async params type for Next.js 16
interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ code?: string }>;
}

export default async function WeddingShowcasePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { code } = await searchParams;

  const weddingList = await db
    .select()
    .from(weddings)
    .where(eq(weddings.id, id))
    .limit(1);

  if (weddingList.length === 0) {
    notFound();
  }

  const wedding = weddingList[0];

  let isValidGuest = false;
  let guestRecord: typeof guests.$inferSelect | null = null;

  if (code) {
    const previewCode = getPreviewCode(id);
    if (code === previewCode) {
      isValidGuest = true;
    } else {
      const guestList = await db
        .select()
        .from(guests)
        .where(
          or(
            eq(guests.loginCode, code.toLowerCase()),
            eq(guests.loginCode, code.toUpperCase())
          )
        )
        .limit(1);
      if (guestList.length > 0) {
        isValidGuest = true;
        guestRecord = guestList[0];
      }
    }
  }

  if (!isValidGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf5ff] to-white dark:from-[#0b0f19] dark:to-slate-900 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-center px-6">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-6">💒</div>
          <h1 className="text-3xl font-bold text-[#2d336b] dark:text-slate-200 mb-4">
            Private Wedding
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            This wedding is private. You need a personal invitation link to view the details.
          </p>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-8 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            If you received an invitation, please use the link sent to you. This link is personal and uniquely assigned to you. Please do not share it.
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Created with Love for {wedding.partnerA} &amp; {wedding.partnerB}
          </p>
        </div>
        <footer className="w-full text-center py-6 mt-auto border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400 tracking-widest uppercase font-semibold">
            Created with Love for {wedding.partnerA} &amp; {wedding.partnerB}
          </p>
        </footer>
      </div>
    );
  }

  const dbRituals = await db
    .select()
    .from(rituals)
    .where(eq(rituals.weddingId, wedding.id))
    .orderBy(rituals.startTime);

  let visibleRituals = dbRituals;
  if (guestRecord) {
    const invitedCeremonies = guestRecord.invitedCeremonies;
    if (invitedCeremonies && invitedCeremonies !== "all") {
      const invitedIds = invitedCeremonies.split(",").map((s: string) => s.trim());
      visibleRituals = dbRituals.filter((r) => invitedIds.includes(r.id));
    }
  }

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

  const isSampleWedding = wedding.isSample || (wedding.partnerA === "Rahul" && wedding.partnerB === "Priya");
  const previewCode = getPreviewCode(id);

  return (
    <div className={`min-h-screen bg-[var(--color-background)] text-slate-800 flex flex-col items-center w-full relative template-${wedding.showcaseTemplate || "classic"} overflow-hidden pb-12`}>
      {/* Template Specific Frame/Borders */}
      {wedding.showcaseTemplate === "classic" && (
        <div className="absolute inset-4 border-2 border-double pointer-events-none rounded-2xl z-10 flex items-start justify-center" style={{ borderColor: "var(--color-primary)" }}>
          <div className="absolute -top-3 left-0 right-0 flex justify-center text-[8px] text-center" style={{ color: "var(--color-primary)" }}>✧ ✧ ✧ ✧ ✧</div>
          <div className="absolute -bottom-3 left-0 right-0 flex justify-center text-[8px] text-center" style={{ color: "var(--color-primary)" }}>✧ ✧ ✧</div>
          <div className="absolute -top-3 -left-3 text-base" style={{ color: "var(--color-primary)" }}>✧</div>
          <div className="absolute -top-3 -right-3 text-base" style={{ color: "var(--color-primary)" }}>✧</div>
          <div className="absolute -bottom-3 -left-3 text-base" style={{ color: "var(--color-primary)" }}>✧</div>
          <div className="absolute -bottom-3 -right-3 text-base" style={{ color: "var(--color-primary)" }}>✧</div>
        </div>
      )}
      {wedding.showcaseTemplate === "modern" && (
        <div className="absolute inset-4 border border-slate-200 pointer-events-none rounded-2xl z-10 flex items-start justify-center">
          <div className="absolute -top-3 left-0 right-0 flex justify-center text-[8px] text-slate-400">▬ ▬ ▬ ▬ ▬</div>
          <div className="absolute -bottom-3 left-0 right-0 flex justify-center text-[8px] text-slate-400">▬ ▬ ▬</div>
          <div className="absolute -top-3 -left-3 text-base text-slate-400">◇</div>
          <div className="absolute -top-3 -right-3 text-base text-slate-400">◆</div>
          <div className="absolute -bottom-3 -left-3 text-base text-slate-400">◇</div>
          <div className="absolute -bottom-3 -right-3 text-base text-slate-400">◆</div>
        </div>
      )}
      {wedding.showcaseTemplate === "royal" && (
        <div className="absolute inset-4 border border-amber-600/30 pointer-events-none rounded-2xl z-10 flex items-start justify-center">
          <div className="absolute -top-3 left-0 right-0 flex justify-center text-[8px] text-amber-600">👑 ⚜ 👑 ⚜ 👑</div>
          <div className="absolute -bottom-3 left-0 right-0 flex justify-center text-[8px] text-amber-600">⚜ ⚜ ⚜</div>
          <div className="absolute -top-3 -left-3 text-base text-amber-600">👑</div>
          <div className="absolute -top-3 -right-3 text-base text-amber-600">👑</div>
          <div className="absolute -bottom-3 -left-3 text-base text-amber-600">👑</div>
          <div className="absolute -bottom-3 -right-3 text-base text-amber-600">👑</div>
        </div>
      )}
      {wedding.showcaseTemplate === "floral" && (
        <div className="absolute inset-4 border border-pink-200 pointer-events-none rounded-2xl z-10 flex items-start justify-center">
          <div className="absolute -top-3 left-0 right-0 flex justify-center text-[8px]">🌸 🌿 🌺 🌿 🌸 🌿 🌺 🌿 🌸</div>
          <div className="absolute -bottom-3 left-0 right-0 flex justify-center text-[8px]">🌿 🌸 🌿</div>
          <div className="absolute -top-3 -left-3 text-sm">🌸🌿</div>
          <div className="absolute -top-3 -right-3 text-sm">🌸🌿</div>
          <div className="absolute -bottom-3 -left-3 text-sm">🌸🌿</div>
          <div className="absolute -bottom-3 -right-3 text-sm">🌸🌿</div>
        </div>
      )}
      {wedding.showcaseTemplate === "beach" && (
        <div className="absolute inset-4 border border-cyan-200 pointer-events-none rounded-2xl z-10 flex items-start justify-center">
          <div className="absolute -top-3 left-0 right-0 flex justify-center text-[8px]">🐚 🌊 🐚 🌊 🐚 🌊 🐚</div>
          <div className="absolute -bottom-3 left-0 right-0 flex justify-center text-[8px]">🌊 🐚 🌊</div>
          <div className="absolute -top-3 -left-3 text-sm">🐚</div>
          <div className="absolute -top-3 -right-3 text-sm">🐚</div>
          <div className="absolute -bottom-3 -left-3 text-sm">🐚</div>
          <div className="absolute -bottom-3 -right-3 text-sm">🐚</div>
        </div>
      )}
      {wedding.showcaseTemplate === "indian" && (
        <div className="absolute inset-4 border-2 border-orange-500/30 border-dashed pointer-events-none rounded-2xl z-10 flex justify-center items-start pt-2">
          <span className="text-xs bg-orange-50 text-orange-800 px-3 py-1 rounded-full font-serif border border-orange-200 shadow-sm relative -top-5 z-20">
            {wedding.showcaseTopLabel || "शुभ विवाह"}
          </span>
          <div className="absolute -top-3 left-0 right-0 flex justify-center text-[8px]">🪔 🌼 🪔 🌼 🪔 🌼 🪔 🌼 🪔</div>
          <div className="absolute -bottom-3 left-0 right-0 flex justify-center text-[8px]">🌼 🪔 🌼</div>
          <div className="absolute -top-3 -left-3 text-sm">🪔</div>
          <div className="absolute -top-3 -right-3 text-sm">🪔</div>
          <div className="absolute -bottom-3 -left-3 text-sm">🪔</div>
          <div className="absolute -bottom-3 -right-3 text-sm">🪔</div>
        </div>
      )}
      {wedding.showcaseTemplate === "indian_royal" && (
        <div className="absolute inset-4 border-2 border-red-800/40 pointer-events-none rounded-2xl z-10 flex justify-center items-start pt-2">
          <span className="text-xs bg-red-900 text-amber-200 px-3 py-1 rounded-full font-serif border border-amber-500 shadow-md relative -top-5 z-20">
            {wedding.showcaseTopLabel || "शुभ विवाह"}
          </span>
          <div className="absolute -top-3 left-0 right-0 flex justify-center text-[8px]">👑 🪔 👑 🪔 👑 🪔 👑 🪔 👑</div>
          <div className="absolute -bottom-3 left-0 right-0 flex justify-center text-[8px]">⚜ 🪔 ⚜</div>
          <div className="absolute -top-3 -left-3 text-amber-500 text-sm">👑</div>
          <div className="absolute -top-3 -right-3 text-amber-500 text-sm">👑</div>
          <div className="absolute -bottom-3 -left-3 text-amber-500 text-sm">👑</div>
          <div className="absolute -bottom-3 -right-3 text-amber-500 text-sm">👑</div>
        </div>
      )}
      {wedding.showcaseTemplate === "indian_marigold" && (
        <div className="absolute inset-4 border-2 border-yellow-500/40 border-double pointer-events-none rounded-2xl z-10 flex justify-center items-start pt-2">
          <span className="text-xs bg-yellow-50 text-amber-800 px-3 py-1 rounded-full font-serif border border-yellow-300 shadow-sm relative -top-5 z-20">
            {wedding.showcaseTopLabel || "शुभ विवाह"}
          </span>
          <div className="absolute -top-3 left-0 right-0 flex justify-center text-[8px]">🌼 🌼 🌼 🌼 🌼 🌼 🌼 🌼 🌼</div>
          <div className="absolute -bottom-3 left-0 right-0 flex justify-center text-[8px]">🌼 🌼 🌼</div>
          <div className="absolute -top-3 -left-3 text-sm">🌼</div>
          <div className="absolute -top-3 -right-3 text-sm">🌼</div>
          <div className="absolute -bottom-3 -left-3 text-sm">🌼</div>
          <div className="absolute -bottom-3 -right-3 text-sm">🌼</div>
        </div>
      )}
      {wedding.showcaseTemplate === "indian_modern" && (
        <div className="absolute inset-4 border border-pink-500/30 pointer-events-none rounded-2xl z-10 flex justify-center items-start pt-2">
          <span className="text-xs bg-pink-50 text-pink-700 px-3 py-1 rounded-full font-sans border border-pink-200 shadow-sm relative -top-5 z-20">
            {wedding.showcaseTopLabel || "शुभ विवाह"}
          </span>
          <div className="absolute -top-3 left-0 right-0 flex justify-center text-[8px]">✦ 🪔 ✦ 🪔 ✦ 🪔 ✦ 🪔 ✦</div>
          <div className="absolute -bottom-3 left-0 right-0 flex justify-center text-[8px]">✦ ✦ ✦</div>
          <div className="absolute -top-3 -left-3 text-sm">✦</div>
          <div className="absolute -top-3 -right-3 text-sm">✦</div>
          <div className="absolute -bottom-3 -left-3 text-sm">✦</div>
          <div className="absolute -bottom-3 -right-3 text-sm">✦</div>
        </div>
      )}

      <DynamicTheme wedding={wedding} mode="showcase" />
      <div className="w-full h-2 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-amber-500" />

      <section className="w-full max-w-4xl mx-auto px-6 pt-12 pb-8 flex flex-col items-center text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-6">
          {wedding.showcaseSubtitle || traditionLabel}
        </div>
        
        <h1
          className="showcase-gradient-text font-title text-4xl sm:text-6xl font-extrabold bg-clip-text bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-amber-500 py-3 leading-tight tracking-wide"
          style={{ WebkitTextFillColor: 'transparent', color: 'transparent' }}
        >
          {wedding.showcaseTitle || `${wedding.partnerA} & ${wedding.partnerB}`}
        </h1>

        <div className="flex items-center justify-center gap-4 py-4 w-full">
          <div className="h-[1px] flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-[var(--color-primary)]" />
          <span className="text-[var(--color-primary)] text-lg">
            {(wedding.showcaseTemplate || "classic") === "classic" && "✨ 💍 ✨"}
            {wedding.showcaseTemplate === "modern" && "✦ ✦ ✦"}
            {wedding.showcaseTemplate === "royal" && "👑 ⚜️ 👑"}
            {wedding.showcaseTemplate === "floral" && "🌸 🌺 🌸"}
            {wedding.showcaseTemplate === "indian" && "🪔 🕉️ 🪔"}
            {wedding.showcaseTemplate === "indian_royal" && "⚜️ 🪔 ⚜️"}
            {wedding.showcaseTemplate === "indian_marigold" && "🌼 🪔 🌼"}
            {wedding.showcaseTemplate === "indian_modern" && "✦ ✨ ✦"}
            {wedding.showcaseTemplate === "beach" && "🌊 🐚 🌊"}
          </span>
          <div className="h-[1px] flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-[var(--color-primary)]" />
        </div>

        <p className="text-base sm:text-lg text-[var(--color-primary)] font-medium tracking-wide">
          Save The Date
        </p>
        <p className="font-title text-xl sm:text-2xl font-bold text-slate-800 mt-1">
          {weddingDateStr}
        </p>
        <p className="text-sm text-slate-500 mt-2 font-medium">
          📍 {fullAddress || wedding.location}
        </p>

        {(wedding.showcaseDescription || wedding.description) && (
          <p className="max-w-xl text-sm text-slate-500 mt-6 font-light leading-relaxed italic">
            &ldquo;{wedding.showcaseDescription || wedding.description}&rdquo;
          </p>
        )}

        <div className="w-full mt-8">
          <Countdown targetDate={wedding.weddingDate.toISOString()} />
        </div>
      </section>

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

      {(wedding.showcaseWelcomeText || wedding.showcaseDetails) && (
        <section className="w-full max-w-2xl mx-auto px-6 py-6">
          <div className="bg-white border border-slate-200/60 p-6 sm:p-8 rounded-3xl shadow-xs text-center space-y-4">
            <h3 className="font-title text-2xl sm:text-3xl font-bold text-[var(--color-primary)]">
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

      <section className="w-full max-w-2xl mx-auto px-6 py-8">
        <h3 className="font-title text-2xl sm:text-3xl font-bold text-[var(--color-primary)] text-center mb-8 tracking-wide">
          Wedding Program
        </h3>

        {visibleRituals.length > 0 ? (
          <div className="relative border-l border-slate-200 ml-4 sm:ml-8 space-y-6">
            {visibleRituals.map((ritual) => {
              const startStr = formatDateTime(ritual.startTime);
              const endStr = new Date(ritual.endTime);
              const endTimeStr = endStr.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              return (
                <div key={ritual.id} className="relative pl-6 sm:pl-8">
                  <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-[var(--color-primary)] ring-4 ring-white" />
                  
                  <div className="space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="font-title text-base sm:text-lg font-bold text-slate-800">
                        {ritual.name}
                      </h4>
                      <span className="text-xs font-semibold text-[var(--color-secondary)] uppercase tracking-wider whitespace-nowrap">
                        🕒 {startStr} — {endTimeStr}
                      </span>
                    </div>
                    {ritual.description && (
                      <p className="text-sm text-slate-600 font-light leading-relaxed">
                        {ritual.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <span className="text-amber-500">📍</span>
                      <span>{ritual.location}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-amber-50/40 border border-amber-200/40 rounded-2xl p-6 text-center text-sm text-slate-500 font-light font-sans">
             ✨ Program details are currently being finalized. Please check back soon! ✨
          </div>
        )}
      </section>

      <section className="w-full max-w-4xl mx-auto px-6 pt-6 pb-16">
        <PublicRsvpForm 
          weddingId={wedding.id} 
          rsvpTitle={wedding.showcaseRsvpTitle}
          rsvpDescription={wedding.showcaseRsvpDescription}
          scrollToOnAttending="gift-registry"
          ceremonies={visibleRituals}
        />
      </section>

      <section id="gift-registry" className="w-full max-w-xl mx-auto px-6 pb-16">
        <div className="bg-white/95 backdrop-blur-md border border-rose-200 rounded-3xl p-6 md:p-8 shadow-xl text-center relative overflow-hidden">
          <div className="text-4xl mb-3">🎁</div>
          <h3 className="font-title text-xl font-bold text-[var(--color-primary)] mb-3 tracking-wide">
            {wedding.showcaseGiftTitle || "Gift Registry"}
          </h3>
          <p className="text-sm text-slate-500 mb-5 font-light leading-relaxed">
            {wedding.showcaseGiftDescription || "Your presence is the greatest gift, but if you wish to honor us with a token of love, we've curated a small registry below."}
          </p>
          {wedding.showcaseGiftUrl ? (
            <a
              href={wedding.showcaseGiftUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white shadow-md hover:opacity-90 transition-all text-sm font-semibold"
            >
              🎀 View Gift Registry
            </a>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Thank you for your love and generosity — it means the world to us!
            </p>
          )}
        </div>
      </section>

      <footer className="w-full bg-slate-100/50 border-t border-slate-200 text-center py-6 mt-auto">
        <p className="text-xs text-slate-400 tracking-widest uppercase font-semibold">
          Created with Love for {wedding.partnerA} & {wedding.partnerB}
        </p>
      </footer>
    </div>
  );
}
