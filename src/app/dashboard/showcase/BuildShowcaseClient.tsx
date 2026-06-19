"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toast } from "@/components/ui/toast";
import { Dialog } from "@/components/ui/dialog";
import { updateWeddingShowcaseAction } from "@/app/actions/wedding";
import { updateRitualAction } from "@/app/actions/calendar";
import { formatDate, formatDateTime } from "@/lib/format";
import Countdown from "@/components/wedding/countdown";

interface Wedding {
  id: string;
  partnerA: string;
  partnerB: string;
  weddingDate: Date | string;
  location: string;
  locationName?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  country: string;
  pincode?: string | null;
  description?: string | null;
  tradition: string;
  themeFont: string;
  themePrimary: string;
  themeSecondary: string;
  themeBackground: string;
  logoUrl?: string | null;
  logoData?: string | null;
  showcaseFont: string;
  showcaseTitleFont: string;
  showcasePrimary: string;
  showcaseSecondary: string;
  showcaseBackground: string;
  showcaseHeroUrl?: string | null;
  showcaseHeroData?: string | null;
  showcaseWelcomeText?: string | null;
  showcaseDetails?: string | null;
  showcaseSubtitle?: string | null;
  showcaseTitle?: string | null;
  showcaseDescription?: string | null;
  showcaseRsvpTitle?: string | null;
  showcaseRsvpDescription?: string | null;
  showcaseGiftUrl?: string | null;
  showcaseGiftTitle?: string | null;
  showcaseGiftDescription?: string | null;
}

interface Ritual {
  id: string;
  weddingId: string;
  name: string;
  description: string | null;
  startTime: Date | string;
  endTime: Date | string;
  location: string;
  isCustom: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface BuildShowcaseClientProps {
  wedding: Wedding;
  rituals: Ritual[];
}

const fonts = [
  "Geist", "Inter", "Outfit", "Montserrat", "Playfair Display", "Cinzel", 
  "Cormorant Garamond", "Bodoni Moda", "Lora", "Prata", "Great Vibes", 
  "Alex Brush", "Pinyon Script", "Allura", "Sacramento", "Italianno"
];

function parseDateTimeForInput(dateVal: Date | string) {
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) {
    return { date: "", time: "" };
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return {
    date: `${year}-${month}-${day}`, // YYYY-MM-DD
    time: `${hours}:${minutes}`, // HH:MM
  };
}

function mergeDateAndTime(dateStr: string, timeStr: string): string {
  if (!dateStr || !timeStr) return "";
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
}

function areRitualsEqual(arr1: Ritual[], arr2: Ritual[]): boolean {
  if (arr1 === arr2) return true;
  if (arr1.length !== arr2.length) return false;
  const map1 = new Map(arr1.map(r => [r.id, r]));
  for (const r2 of arr2) {
    const r1 = map1.get(r2.id);
    if (!r1) return false;
    if (
      r1.name !== r2.name ||
      r1.description !== r2.description ||
      new Date(r1.startTime).getTime() !== new Date(r2.startTime).getTime() ||
      new Date(r1.endTime).getTime() !== new Date(r2.endTime).getTime() ||
      r1.location !== r2.location ||
      r1.isCustom !== r2.isCustom
    ) {
      return false;
    }
  }
  return true;
}

export default function BuildShowcaseClient({ wedding, rituals: initialRituals }: BuildShowcaseClientProps) {
  const router = useRouter();
  
  // Theme styling state
  const [showcaseFont, setShowcaseFont] = React.useState(wedding.showcaseFont);
  const [showcaseTitleFont, setShowcaseTitleFont] = React.useState(wedding.showcaseTitleFont);
  const [showcasePrimary, setShowcasePrimary] = React.useState(wedding.showcasePrimary);
  const [showcaseSecondary, setShowcaseSecondary] = React.useState(wedding.showcaseSecondary);
  const [showcaseBackground, setShowcaseBackground] = React.useState(wedding.showcaseBackground);

  // Showcase layout state
  const [showcaseSubtitle, setShowcaseSubtitle] = React.useState(wedding.showcaseSubtitle || "");
  const [showcaseTitle, setShowcaseTitle] = React.useState(wedding.showcaseTitle || "");
  const [showcaseDescription, setShowcaseDescription] = React.useState(wedding.showcaseDescription || "");
  
  const [showcaseHeroUrl, setShowcaseHeroUrl] = React.useState(wedding.showcaseHeroUrl || "");
  const [showcaseHeroData, setShowcaseHeroData] = React.useState(wedding.showcaseHeroData || "");
  const [heroFileName, setHeroFileName] = React.useState("");

  const [showcaseWelcomeText, setShowcaseWelcomeText] = React.useState(wedding.showcaseWelcomeText || "");
  const [showcaseDetails, setShowcaseDetails] = React.useState(wedding.showcaseDetails || "");

  const [showcaseRsvpTitle, setShowcaseRsvpTitle] = React.useState(wedding.showcaseRsvpTitle || "");
  const [showcaseRsvpDescription, setShowcaseRsvpDescription] = React.useState(wedding.showcaseRsvpDescription || "");

  const [showcaseGiftUrl, setShowcaseGiftUrl] = React.useState(wedding.showcaseGiftUrl || "");
  const [showcaseGiftTitle, setShowcaseGiftTitle] = React.useState(wedding.showcaseGiftTitle || "");
  const [showcaseGiftDescription, setShowcaseGiftDescription] = React.useState(wedding.showcaseGiftDescription || "");

  // Itinerary custom heading state (local preview only)
  const [itineraryHeading, setItineraryHeading] = React.useState("Wedding Itinerary");
  const [itineraryDescription, setItineraryDescription] = React.useState("The schedule of our celebration events.");

  // Rituals list state
  const [ritualsList, setRitualsList] = React.useState<Ritual[]>(initialRituals);

  // Modals state
  const [activeModal, setActiveModal] = React.useState<"header" | "hero" | "story" | "itinerary" | "rsvp" | "gift" | null>(null);
  
  // Ritual inline edit states inside Itinerary Modal
  const [editedRituals, setEditedRituals] = React.useState<Record<string, {
    name: string;
    description: string;
    location: string;
    date: string;
    startTime: string;
    endTime: string;
    saving: boolean;
    error: string;
    success: boolean;
  }>>({});

  // Global action pending / toast states
  const [isSaving, setIsSaving] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);

  // Sync state on wedding prop change during rendering
  const [prevWedding, setPrevWedding] = React.useState(wedding);
  if (wedding.id !== prevWedding.id) {
    setPrevWedding(wedding);
    setShowcaseFont(wedding.showcaseFont);
    setShowcaseTitleFont(wedding.showcaseTitleFont);
    setShowcasePrimary(wedding.showcasePrimary);
    setShowcaseSecondary(wedding.showcaseSecondary);
    setShowcaseBackground(wedding.showcaseBackground);
    setShowcaseSubtitle(wedding.showcaseSubtitle || "");
    setShowcaseTitle(wedding.showcaseTitle || "");
    setShowcaseDescription(wedding.showcaseDescription || "");
    setShowcaseHeroUrl(wedding.showcaseHeroUrl || "");
    setShowcaseHeroData(wedding.showcaseHeroData || "");
    setShowcaseWelcomeText(wedding.showcaseWelcomeText || "");
    setShowcaseDetails(wedding.showcaseDetails || "");
    setShowcaseRsvpTitle(wedding.showcaseRsvpTitle || "");
    setShowcaseRsvpDescription(wedding.showcaseRsvpDescription || "");
    setShowcaseGiftUrl(wedding.showcaseGiftUrl || "");
    setShowcaseGiftTitle(wedding.showcaseGiftTitle || "");
    setShowcaseGiftDescription(wedding.showcaseGiftDescription || "");
  }

  // Sync state on rituals prop change during rendering
  const [prevInitialRituals, setPrevInitialRituals] = React.useState(initialRituals);
  if (!areRitualsEqual(initialRituals, prevInitialRituals)) {
    setPrevInitialRituals(initialRituals);
    setRitualsList(initialRituals);
  }

  // Pre-fill editedRituals helper when opening the itinerary modal
  const openItineraryModal = () => {
    const initialEdited: typeof editedRituals = {};
    ritualsList.forEach((r) => {
      const { date, time: startT } = parseDateTimeForInput(r.startTime);
      const { time: endT } = parseDateTimeForInput(r.endTime);
      initialEdited[r.id] = {
        name: r.name,
        description: r.description || "",
        location: r.location,
        date,
        startTime: startT,
        endTime: endT,
        saving: false,
        error: "",
        success: false,
      };
    });
    setEditedRituals(initialEdited);
    setActiveModal("itinerary");
  };

  // File Upload Handler
  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setShowcaseHeroData(reader.result as string);
        setShowcaseHeroUrl(""); // Clear URL when uploading file
      };
      reader.readAsDataURL(file);
    }
  };

  // Discard changes
  const handleDiscardChanges = () => {
    setShowcaseFont(wedding.showcaseFont);
    setShowcaseTitleFont(wedding.showcaseTitleFont);
    setShowcasePrimary(wedding.showcasePrimary);
    setShowcaseSecondary(wedding.showcaseSecondary);
    setShowcaseBackground(wedding.showcaseBackground);
    setShowcaseSubtitle(wedding.showcaseSubtitle || "");
    setShowcaseTitle(wedding.showcaseTitle || "");
    setShowcaseDescription(wedding.showcaseDescription || "");
    setShowcaseHeroUrl(wedding.showcaseHeroUrl || "");
    setShowcaseHeroData(wedding.showcaseHeroData || "");
    setShowcaseWelcomeText(wedding.showcaseWelcomeText || "");
    setShowcaseDetails(wedding.showcaseDetails || "");
    setShowcaseRsvpTitle(wedding.showcaseRsvpTitle || "");
    setShowcaseRsvpDescription(wedding.showcaseRsvpDescription || "");
    setShowcaseGiftUrl(wedding.showcaseGiftUrl || "");
    setShowcaseGiftTitle(wedding.showcaseGiftTitle || "");
    setShowcaseGiftDescription(wedding.showcaseGiftDescription || "");
    setItineraryHeading("Wedding Itinerary");
    setItineraryDescription("The schedule of our celebration events.");
    setToast({ message: "Changes discarded successfully.", type: "success" });
  };

  // Save showcase settings
  const handleSaveShowcase = async () => {
    setIsSaving(true);
    try {
      const res = await updateWeddingShowcaseAction(wedding.id, {
        showcaseFont,
        showcaseTitleFont,
        showcasePrimary,
        showcaseSecondary,
        showcaseBackground,
        showcaseHeroUrl: showcaseHeroUrl || null,
        showcaseHeroData: showcaseHeroData || null,
        showcaseWelcomeText: showcaseWelcomeText || null,
        showcaseDetails: showcaseDetails || null,
        showcaseSubtitle: showcaseSubtitle || null,
        showcaseTitle: showcaseTitle || null,
        showcaseDescription: showcaseDescription || null,
        showcaseRsvpTitle: showcaseRsvpTitle || null,
        showcaseRsvpDescription: showcaseRsvpDescription || null,
        showcaseGiftUrl: showcaseGiftUrl || null,
        showcaseGiftTitle: showcaseGiftTitle || null,
        showcaseGiftDescription: showcaseGiftDescription || null,
      });

      if (res?.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setToast({ message: "Showcase configuration saved successfully!", type: "success" });
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "An unexpected error occurred while saving.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Save specific Ritual inside modal
  const handleSaveRitualEvent = async (ritualId: string) => {
    const editState = editedRituals[ritualId];
    if (!editState) return;

    // Set saving
    setEditedRituals(prev => ({
      ...prev,
      [ritualId]: { ...prev[ritualId], saving: true, error: "", success: false }
    }));

    const mergedStart = mergeDateAndTime(editState.date, editState.startTime);
    const mergedEnd = mergeDateAndTime(editState.date, editState.endTime);

    if (!editState.name.trim()) {
      setEditedRituals(prev => ({
        ...prev,
        [ritualId]: { ...prev[ritualId], saving: false, error: "Event name is required." }
      }));
      return;
    }

    if (!mergedStart || !mergedEnd) {
      setEditedRituals(prev => ({
        ...prev,
        [ritualId]: { ...prev[ritualId], saving: false, error: "Date, Start Time, and End Time are required." }
      }));
      return;
    }

    if (new Date(mergedEnd) <= new Date(mergedStart)) {
      setEditedRituals(prev => ({
        ...prev,
        [ritualId]: { ...prev[ritualId], saving: false, error: "End time must be after start time." }
      }));
      return;
    }

    try {
      const res = await updateRitualAction(ritualId, {
        name: editState.name,
        description: editState.description || undefined,
        location: editState.location,
        startTime: mergedStart,
        endTime: mergedEnd,
      });

      if (res?.error) {
        setEditedRituals(prev => ({
          ...prev,
          [ritualId]: { ...prev[ritualId], saving: false, error: res.error }
        }));
      } else {
        setEditedRituals(prev => ({
          ...prev,
          [ritualId]: { ...prev[ritualId], saving: false, success: true }
        }));
        // Update local list
        setRitualsList(prev =>
          prev.map((r) =>
            r.id === ritualId
              ? {
                  ...r,
                  name: editState.name,
                  description: editState.description || null,
                  location: editState.location,
                  startTime: mergedStart,
                  endTime: mergedEnd,
                }
              : r
          )
        );
        setToast({ message: `Event "${editState.name}" updated successfully!`, type: "success" });
      }
    } catch (err) {
      console.error(err);
      setEditedRituals(prev => ({
        ...prev,
        [ritualId]: { ...prev[ritualId], saving: false, error: "Failed to save ritual event." }
      }));
    }
  };

  const fullAddress = [wedding.locationName, wedding.street, wedding.city, wedding.state, wedding.pincode]
    .filter(Boolean)
    .join(", ");

  const traditionLabels: Record<string, string> = {
    hindu: "Shubh Vivah (Hindu Tradition)",
    muslim: "Nikah (Muslim Tradition)",
    sikh: "Anand Karaj (Sikh Tradition)",
    christian: "Holy Matrimony (Christian Tradition)",
    secular: "Wedding Celebration (Secular Tradition)",
  };

  const defaultSubtitle = traditionLabels[wedding.tradition] || "Wedding Celebration";
  const defaultTitle = `${wedding.partnerA} & ${wedding.partnerB}`;
  const weddingDateStr = formatDate(wedding.weddingDate);

  // Dynamic CSS Properties for Scoped Styling
  const scopedStyleProps = {
    "--color-primary": showcasePrimary,
    "--color-secondary": showcaseSecondary,
    "--color-background": showcaseBackground,
    "--font-sans": `"${showcaseFont}", sans-serif`,
    "--font-title": `"${showcaseTitleFont}", serif`,
    fontFamily: `var(--font-sans)`,
    backgroundColor: `var(--color-background)`,
  } as React.CSSProperties;

  return (
    <div className="flex flex-col lg:flex-row gap-8 relative items-start">
      {/* Dynamic Font Loader (Preview Container Only) */}
      {showcaseFont && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(
              showcaseFont.replace(/[^a-zA-Z0-9\s-]/g, "")
            )}&display=swap`}
            rel="stylesheet"
          />
        </>
      )}
      {showcaseTitleFont && showcaseTitleFont !== showcaseFont && (
        <link
          href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(
            showcaseTitleFont.replace(/[^a-zA-Z0-9\s-]/g, "")
          )}&display=swap`}
          rel="stylesheet"
        />
      )}

      {/* 1. Theme Configuration Panel (Sidebar) */}
      <Card className="w-full lg:w-80 p-6 bg-white border border-slate-200 lg:sticky lg:top-6 shrink-0 space-y-6 shadow-sm rounded-2xl">
        <div>
          <h3 className="text-base font-bold text-slate-800 mb-1">Showcase Style</h3>
          <p className="text-xs text-slate-500">Configure public page fonts and colors.</p>
        </div>

        {/* Fonts Section */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
              Body Font Family
            </label>
            <Select
              value={showcaseFont}
              onChange={(e) => setShowcaseFont(e.target.value)}
            >
              {fonts.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
              Title Font Family
            </label>
            <Select
              value={showcaseTitleFont}
              onChange={(e) => setShowcaseTitleFont(e.target.value)}
            >
              {fonts.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Colors Section */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          {/* Primary Color */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
              Primary Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={showcasePrimary}
                onChange={(e) => setShowcasePrimary(e.target.value)}
                className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-white shrink-0"
              />
              <Input
                type="text"
                value={showcasePrimary}
                onChange={(e) => setShowcasePrimary(e.target.value)}
                className="font-mono text-sm"
                placeholder="#c484b0"
                pattern="^#[0-9A-Fa-f]{6}$"
                required
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
              Secondary Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={showcaseSecondary}
                onChange={(e) => setShowcaseSecondary(e.target.value)}
                className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-white shrink-0"
              />
              <Input
                type="text"
                value={showcaseSecondary}
                onChange={(e) => setShowcaseSecondary(e.target.value)}
                className="font-mono text-sm"
                placeholder="#e6b7d2"
                pattern="^#[0-9A-Fa-f]{6}$"
                required
              />
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={showcaseBackground}
                onChange={(e) => setShowcaseBackground(e.target.value)}
                className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-1 bg-white shrink-0"
              />
              <Input
                type="text"
                value={showcaseBackground}
                onChange={(e) => setShowcaseBackground(e.target.value)}
                className="font-mono text-sm"
                placeholder="#fffafb"
                pattern="^#[0-9A-Fa-f]{6}$"
                required
              />
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
          <Button
            type="button"
            variant="primary"
            className="w-full bg-[#6771ab] hover:bg-[#566198] text-white font-semibold"
            disabled={isSaving}
            onClick={handleSaveShowcase}
          >
            {isSaving ? "Saving changes..." : "Save Showcase Page"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full border border-slate-200 text-slate-700 font-semibold"
            onClick={handleDiscardChanges}
            disabled={isSaving}
          >
            Discard Changes
          </Button>

          <Link
            href={`/wedding/${wedding.id}`}
            target="_blank"
            className="w-full inline-flex items-center justify-center font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 h-10 text-sm hover:bg-slate-100 transition-all active:scale-[0.97]"
          >
            View Public Page ↗
          </Link>
        </div>
      </Card>

      {/* 2. Interactive Showcase Preview (Scrolled/Interactive Mockup) */}
      <div className="flex-1 w-full max-w-4xl border border-slate-200 rounded-3xl overflow-hidden bg-slate-50 shadow-sm relative group/preview">
        {/* Mock Browser Titlebar */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400 block" />
            <span className="w-3 h-3 rounded-full bg-amber-400 block" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 block" />
          </div>
          <span className="text-sm font-bold text-slate-500 tracking-wide">
            Showcase Page - Live Preview
          </span>
        </div>

        {/* Live Styled Preview Container */}
        <div style={scopedStyleProps} className="text-slate-800 flex flex-col items-center min-h-[80vh] transition-all duration-300">
          {/* Decorative Top Border */}
          <div className="w-full h-2 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-amber-500" />

          {/* A. Header Section (Subtitle, Title, Description, Countdown) */}
          <section className="relative w-full max-w-4xl mx-auto px-6 pt-12 pb-8 flex flex-col items-center text-center border border-transparent hover:border-dashed hover:border-slate-300 rounded-3xl m-2 transition-all">
            <button
              onClick={() => setActiveModal("header")}
              className="self-start mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 active:bg-amber-400 text-amber-900 text-xs font-bold transition-all active:scale-95 shadow-sm border border-amber-300/50"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </button>

            <div className="inline-block px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider mb-6">
              {showcaseSubtitle || defaultSubtitle}
            </div>
            
            <h1 
              style={{ fontFamily: "var(--font-title)" }}
              className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-amber-500 py-3 leading-tight tracking-wide"
            >
              {showcaseTitle || defaultTitle}
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
            <p style={{ fontFamily: "var(--font-title)" }} className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">
              {weddingDateStr}
            </p>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              📍 {fullAddress || wedding.location}
            </p>

            {(showcaseDescription || wedding.description) && (
              <p className="max-w-xl text-sm text-slate-500 mt-6 font-light leading-relaxed italic">
                &ldquo;{showcaseDescription || wedding.description}&rdquo;
              </p>
            )}

            {/* Live Countdown */}
            <div className="w-full mt-8">
              <Countdown targetDate={new Date(wedding.weddingDate).toISOString()} />
            </div>
          </section>

          {/* B. Hero Banner Section (Hero image) */}
          <section className="relative w-full max-w-4xl px-6 mb-8 border border-transparent hover:border-dashed hover:border-slate-300 rounded-3xl m-2 transition-all">
            <button
              onClick={() => setActiveModal("hero")}
              className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 active:bg-amber-400 text-amber-900 text-xs font-bold transition-all active:scale-95 shadow-sm border border-amber-300/50"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </button>

            {(showcaseHeroData || showcaseHeroUrl) ? (
              <div className="relative w-full h-[220px] sm:h-[360px] overflow-hidden rounded-3xl shadow-sm border border-slate-200/50">
                <img
                  src={showcaseHeroData || showcaseHeroUrl || ""}
                  alt="Wedding Hero Banner"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-[200px] bg-slate-200/40 rounded-3xl flex flex-col items-center justify-center text-sm text-slate-400 border border-slate-300/40 border-dashed italic gap-2">
                <span>📷 No Hero Image Selected</span>
                <span className="text-xs text-slate-400 not-italic">Click Edit to upload or add an image URL</span>
              </div>
            )}
          </section>

          {/* C. Our Story / Welcome Section */}
          <section className="relative w-full max-w-2xl mx-auto px-6 py-6 border border-transparent hover:border-dashed hover:border-slate-300 rounded-3xl m-2 transition-all">
            <button
              onClick={() => setActiveModal("story")}
              className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 active:bg-amber-400 text-amber-900 text-xs font-bold transition-all active:scale-95 shadow-sm border border-amber-300/50"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </button>

            <div className="bg-white border border-slate-200/60 p-6 sm:p-8 rounded-3xl shadow-xs text-center space-y-4">
              <h3 
                style={{ fontFamily: "var(--font-title)", color: "var(--color-primary)" }}
                className="text-2xl sm:text-3xl font-bold"
              >
                Our Story
              </h3>
              {showcaseWelcomeText ? (
                <p className="text-lg text-slate-700 font-medium leading-relaxed">
                  {showcaseWelcomeText}
                </p>
              ) : (
                <p className="text-sm text-slate-400 italic font-light">Welcome text is empty. Click Edit to add details.</p>
              )}
              {showcaseDetails ? (
                <p className="text-sm text-slate-500 font-light leading-relaxed whitespace-pre-wrap">
                  {showcaseDetails}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic font-light">Story details/description is empty.</p>
              )}
            </div>
          </section>

          {/* D. Itinerary Section */}
          <section className="relative w-full max-w-2xl mx-auto px-6 py-8 border border-transparent hover:border-dashed hover:border-slate-300 rounded-3xl m-2 transition-all">
            <button
              onClick={openItineraryModal}
              className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 active:bg-amber-400 text-amber-900 text-xs font-bold transition-all active:scale-95 shadow-sm border border-amber-300/50"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </button>

            <h3 
              style={{ fontFamily: "var(--font-title)", color: "var(--color-primary)" }}
              className="text-2xl sm:text-3xl font-bold text-center mb-2 tracking-wide"
            >
              {itineraryHeading}
            </h3>
            <p className="text-xs text-center text-slate-400 mb-8 max-w-md mx-auto">{itineraryDescription}</p>

            {ritualsList.length > 0 ? (
              <div className="relative border-l border-amber-200/80 ml-4 sm:ml-8 space-y-8">
                {ritualsList.map((ritual) => {
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
                        <h4 style={{ fontFamily: "var(--font-title)" }} className="text-lg font-bold text-slate-800">
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

          {/* E. RSVP Form Section */}
          <section className="relative w-full max-w-xl mx-auto px-6 pt-6 pb-16 border border-transparent hover:border-dashed hover:border-slate-300 rounded-3xl m-2 transition-all">
            <button
              onClick={() => setActiveModal("rsvp")}
              className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 active:bg-amber-400 text-amber-900 text-xs font-bold transition-all active:scale-95 shadow-sm border border-amber-300/50"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </button>

            {/* Simulated RSVP Form Mock */}
            <div className="bg-white/95 backdrop-blur-md border border-amber-200 rounded-3xl p-6 md:p-8 shadow-xl max-w-xl mx-auto font-sans relative overflow-hidden">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-400 rounded-tl-xl m-2 opacity-50" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-400 rounded-tr-xl m-2 opacity-50" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-400 rounded-bl-xl m-2 opacity-50" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-400 rounded-br-xl m-2 opacity-50" />

              <h3 
                style={{ fontFamily: "var(--font-title)", color: "var(--color-primary)" }}
                className="text-xl font-bold text-center mb-6 tracking-wide"
              >
                {showcaseRsvpTitle || "Will You Celebrate With Us?"}
              </h3>

              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-4 font-light leading-relaxed">
                    {showcaseRsvpDescription || "Please enter the unique 6-character Login Code from your invitation card to unlock your RSVP."}
                  </p>
                  <div className="max-w-[240px] mx-auto">
                    <Input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. G1H3B8"
                      className="text-center text-xl tracking-widest font-mono font-bold border-amber-200 rounded-xl bg-amber-50/20"
                      disabled={true}
                    />
                  </div>
                </div>

                <div className="text-center pt-2">
                  <Button
                    type="button"
                    disabled={true}
                    className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-[var(--color-primary)] text-white shadow-md cursor-not-allowed"
                  >
                    Unlock Invitation (Mocked)
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* F. Gift Registry Section */}
          <section className="relative w-full max-w-xl mx-auto px-6 pt-6 pb-4 border border-transparent hover:border-dashed hover:border-slate-300 rounded-3xl m-2 transition-all">
            <button
              onClick={() => setActiveModal("gift")}
              className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 active:bg-amber-400 text-amber-900 text-xs font-bold transition-all active:scale-95 shadow-sm border border-amber-300/50"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </button>

            <div className="bg-white/95 backdrop-blur-md border border-rose-200 rounded-3xl p-6 md:p-8 shadow-xl max-w-xl mx-auto text-center relative overflow-hidden">
              <div className="text-4xl mb-3">🎁</div>
              <h3
                style={{ fontFamily: "var(--font-title)", color: "var(--color-primary)" }}
                className="text-xl font-bold mb-3 tracking-wide"
              >
                {showcaseGiftTitle || "Gift Registry"}
              </h3>
              <p className="text-sm text-slate-500 mb-5 font-light leading-relaxed">
                {showcaseGiftDescription || "Your presence is the greatest gift, but if you wish to honor us with a token of love, we've curated a small registry below."}
              </p>
              {showcaseGiftUrl ? (
                <a
                  href={showcaseGiftUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-primary)] text-white shadow-md hover:opacity-90 transition-all text-sm font-semibold"
                >
                  🎀 View Gift Registry
                </a>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Add a registry URL in the edit dialog to enable the button.
                </p>
              )}
            </div>
          </section>

          {/* Footer */}
          <footer className="w-full bg-slate-100/30 border-t border-slate-200/50 text-center py-6 mt-auto">
            <p className="text-[10px] text-slate-400 tracking-widest uppercase font-semibold">
              Created with Love for {wedding.partnerA} & {wedding.partnerB}
            </p>
          </footer>
        </div>
      </div>

      {/* 3. MODALS FOR EDITING EACH SECTION */}

      {/* A. Header Modal */}
      <Dialog
        isOpen={activeModal === "header"}
        onClose={() => setActiveModal(null)}
        title="Edit Header Section"
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
              Subtitle / Celebration Label
            </label>
            <Input
              type="text"
              value={showcaseSubtitle}
              onChange={(e) => setShowcaseSubtitle(e.target.value)}
              placeholder={`e.g. ${defaultSubtitle}`}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
              Showcase Main Title (Names)
            </label>
            <Input
              type="text"
              value={showcaseTitle}
              onChange={(e) => setShowcaseTitle(e.target.value)}
              placeholder={`e.g. ${defaultTitle}`}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
              Introductory Quote / Description Block
            </label>
            <textarea
              value={showcaseDescription}
              onChange={(e) => setShowcaseDescription(e.target.value)}
              rows={3}
              placeholder="e.g. A beautiful quote or description of the celebration..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6771ab] focus:border-[#6771ab]"
            />
          </div>

          <div className="flex justify-end pt-4 gap-2">
            <Button
              type="button"
              variant="primary"
              className="bg-[#6771ab] hover:bg-[#566198] text-white"
              onClick={() => {
                setActiveModal(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
                setToast({ message: "Preview updated! Click 'Save Showcase Page' above to persist changes.", type: "success" });
              }}
            >
              Apply to Preview
            </Button>
          </div>
        </div>
      </Dialog>

      {/* B. Hero Modal */}
      <Dialog
        isOpen={activeModal === "hero"}
        onClose={() => setActiveModal(null)}
        title="Edit Hero & Banner Section"
      >
        <div className="space-y-4">
          {/* Image URL option */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
              Hero Image URL
            </label>
            <Input
              type="url"
              value={showcaseHeroUrl}
              onChange={(e) => {
                setShowcaseHeroUrl(e.target.value);
                setShowcaseHeroData(""); // Clear uploaded data if URL provided
                setHeroFileName("");
              }}
              placeholder="https://example.com/banner.jpg"
            />
          </div>

          {/* Image Upload option */}
          <div className="space-y-1 pt-2">
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider mb-1">
              Upload Hero Image File
            </label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold py-2 px-4 rounded-xl border border-slate-200 transition-all active:scale-[0.97]">
                Choose Image File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroFileChange}
                  className="hidden"
                />
              </label>
              {heroFileName ? (
                <span className="text-xs text-slate-500 truncate max-w-[200px]">
                  {heroFileName}
                </span>
              ) : showcaseHeroData ? (
                <span className="text-xs text-slate-500 italic">
                  Stored custom upload
                </span>
              ) : null}
              {showcaseHeroData && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-500 font-semibold h-8"
                  onClick={() => {
                    setShowcaseHeroData("");
                    setHeroFileName("");
                  }}
                >
                  Clear Upload
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-1 pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
              Welcome Headline (Story Section)
            </label>
            <Input
              type="text"
              value={showcaseWelcomeText}
              onChange={(e) => setShowcaseWelcomeText(e.target.value)}
              placeholder="e.g. Welcome to our Wedding Website!"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
              Story Details / Love Story description
            </label>
            <textarea
              value={showcaseDetails}
              onChange={(e) => setShowcaseDetails(e.target.value)}
              rows={4}
              placeholder="e.g. The details of how we met, our journey, and what this day means to us..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6771ab] focus:border-[#6771ab]"
            />
          </div>

          <div className="flex justify-end pt-4 gap-2">
            <Button
              type="button"
              variant="primary"
              className="bg-[#6771ab] hover:bg-[#566198] text-white"
              onClick={() => {
                setActiveModal(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
                setToast({ message: "Preview updated! Click 'Save Showcase Page' above to persist changes.", type: "success" });
              }}
            >
              Apply to Preview
            </Button>
          </div>
        </div>
      </Dialog>

      {/* C. Our Story Modal */}
      <Dialog
        isOpen={activeModal === "story"}
        onClose={() => setActiveModal(null)}
        title="Edit Our Story Section"
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
              Welcome Headline
            </label>
            <Input
              type="text"
              value={showcaseWelcomeText}
              onChange={(e) => setShowcaseWelcomeText(e.target.value)}
              placeholder="e.g. Welcome to our Wedding Website!"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
              Story Details
            </label>
            <textarea
              value={showcaseDetails}
              onChange={(e) => setShowcaseDetails(e.target.value)}
              rows={5}
              placeholder="e.g. Share your story with guests..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6771ab] focus:border-[#6771ab]"
            />
          </div>

          <div className="flex justify-end pt-4 gap-2">
            <Button
              type="button"
              variant="primary"
              className="bg-[#6771ab] hover:bg-[#566198] text-white"
              onClick={() => {
                setActiveModal(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
                setToast({ message: "Preview updated! Click 'Save Showcase Page' above to persist changes.", type: "success" });
              }}
            >
              Apply to Preview
            </Button>
          </div>
        </div>
      </Dialog>

      {/* D. Itinerary Section Modal */}
      <Dialog
        isOpen={activeModal === "itinerary"}
        onClose={() => setActiveModal(null)}
        title="Edit Wedding Itinerary & Ceremonies"
      >
        <div className="space-y-6">
          {/* Heading Settings */}
          <div className="space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Section Heading (Preview only)</h4>
            <div className="space-y-1">
              <label className="block text-xs text-slate-500 font-medium">Itinerary Section Title</label>
              <Input
                type="text"
                value={itineraryHeading}
                onChange={(e) => setItineraryHeading(e.target.value)}
                placeholder="e.g. Wedding Itinerary"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs text-slate-500 font-medium">Itinerary Description / Subtitle</label>
              <Input
                type="text"
                value={itineraryDescription}
                onChange={(e) => setItineraryDescription(e.target.value)}
                placeholder="e.g. The schedule of our celebration events."
              />
            </div>
          </div>

          {/* List Rituals */}
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-800">Ceremony / Ritual Schedule List</h4>
              <Link
                href="/dashboard/wedding-ceremony-planner"
                className="text-xs font-bold text-[#6771ab] hover:underline"
              >
                Go to Scheduling Page (Add/Delete) →
              </Link>
            </div>

            {ritualsList.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 bg-amber-50/50 rounded-xl text-center">
                No events found. Go to the Scheduling Page to add events first.
              </p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {ritualsList.map((ritual) => {
                  const state = editedRituals[ritual.id] || {
                    name: ritual.name,
                    description: ritual.description || "",
                    location: ritual.location,
                    date: "",
                    startTime: "",
                    endTime: "",
                    saving: false,
                    error: "",
                    success: false,
                  };

                  return (
                    <div
                      key={ritual.id}
                      className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3"
                    >
                      <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800">
                          {ritual.name || "Unnamed Event"}
                        </span>
                        {state.success && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            ✓ Saved to DB
                          </span>
                        )}
                        {state.error && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                            ⚠️ {state.error}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Event Name */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Name</label>
                          <Input
                            type="text"
                            value={state.name}
                            onChange={(e) => handleRitualFieldChange(ritual.id, "name", e.target.value)}
                            disabled={state.saving}
                            placeholder="Ceremony Name"
                          />
                        </div>

                        {/* Location */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Location</label>
                          <Input
                            type="text"
                            value={state.location}
                            onChange={(e) => handleRitualFieldChange(ritual.id, "location", e.target.value)}
                            disabled={state.saving}
                            placeholder="Venue Location"
                          />
                        </div>

                        {/* Date */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Date</label>
                          <Input
                            type="date"
                            value={state.date}
                            onChange={(e) => handleRitualFieldChange(ritual.id, "date", e.target.value)}
                            disabled={state.saving}
                          />
                        </div>

                        {/* Times */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Start Time</label>
                            <Input
                              type="time"
                              value={state.startTime}
                              onChange={(e) => handleRitualFieldChange(ritual.id, "startTime", e.target.value)}
                              disabled={state.saving}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">End Time</label>
                            <Input
                              type="time"
                              value={state.endTime}
                              onChange={(e) => handleRitualFieldChange(ritual.id, "endTime", e.target.value)}
                              disabled={state.saving}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                        <textarea
                          value={state.description}
                          onChange={(e) => handleRitualFieldChange(ritual.id, "description", e.target.value)}
                          disabled={state.saving}
                          rows={2}
                          placeholder="Event description..."
                          className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#6771ab] focus:border-[#6771ab]"
                        />
                      </div>

                      {/* Save Button for Ritual */}
                      <div className="flex justify-end pt-1">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={state.saving}
                          className="bg-[#8b93c5] text-white"
                          onClick={() => handleSaveRitualEvent(ritual.id)}
                        >
                          {state.saving ? "Saving..." : "Save Event"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="primary"
              className="bg-[#6771ab] hover:bg-[#566198] text-white"
              onClick={() => {
                setActiveModal(null);
              }}
            >
              Done Editing
            </Button>
          </div>
        </div>
      </Dialog>

      {/* E. RSVP Customization Modal */}
      <Dialog
        isOpen={activeModal === "rsvp"}
        onClose={() => setActiveModal(null)}
        title="Edit RSVP Section Text"
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
              RSVP Heading Title
            </label>
            <Input
              type="text"
              value={showcaseRsvpTitle}
              onChange={(e) => setShowcaseRsvpTitle(e.target.value)}
              placeholder="e.g. Will You Celebrate With Us?"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
              RSVP Subtitle Description
            </label>
            <textarea
              value={showcaseRsvpDescription}
              onChange={(e) => setShowcaseRsvpDescription(e.target.value)}
              rows={4}
              placeholder="e.g. Please enter the unique 6-character Login Code from your invitation card..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6771ab] focus:border-[#6771ab]"
            />
          </div>

          <div className="flex justify-end pt-4 gap-2">
            <Button
              type="button"
              variant="primary"
              className="bg-[#6771ab] hover:bg-[#566198] text-white"
              onClick={() => {
                setActiveModal(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
                setToast({ message: "Preview updated! Click 'Save Showcase Page' above to persist changes.", type: "success" });
              }}
            >
              Apply to Preview
            </Button>
          </div>
        </div>
      </Dialog>

      {/* F. Gift Registry Modal */}
      <Dialog
        isOpen={activeModal === "gift"}
        onClose={() => setActiveModal(null)}
        title="Edit Gift Registry"
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
              Gift Registry URL / Link
            </label>
            <Input
              type="text"
              value={showcaseGiftUrl}
              onChange={(e) => setShowcaseGiftUrl(e.target.value)}
              placeholder="e.g. https://www.amazon.com/wedding/registry/..."
            />
            <p className="text-[10px] text-slate-400 mt-1">The section is always visible. Add a link to enable the View button.</p>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
              Gift Registry Title
            </label>
            <Input
              type="text"
              value={showcaseGiftTitle}
              onChange={(e) => setShowcaseGiftTitle(e.target.value)}
              placeholder="e.g. Gift Registry"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
              Description <span className="text-slate-400 normal-case">(optional)</span>
            </label>
            <textarea
              value={showcaseGiftDescription}
              onChange={(e) => setShowcaseGiftDescription(e.target.value)}
              rows={3}
              placeholder="e.g. Your presence is the greatest gift, but if you wish to honour us with a gift..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6771ab] focus:border-[#6771ab]"
            />
          </div>

          <div className="flex justify-end pt-4 gap-2">
            <Button
              type="button"
              variant="primary"
              className="bg-[#6771ab] hover:bg-[#566198] text-white"
              onClick={() => {
                setActiveModal(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
                setToast({ message: "Preview updated! Click 'Save Showcase Page' above to persist changes.", type: "success" });
              }}
            >
              Apply to Preview
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Toast Alert */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );

  // Helper to handle updating field values inside editedRituals map
  function handleRitualFieldChange(ritualId: string, field: string, value: string) {
    setEditedRituals((prev) => ({
      ...prev,
      [ritualId]: {
        ...prev[ritualId],
        [field]: value,
        success: false, // reset success badge when edited
      },
    }));
  }
}
