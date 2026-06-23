"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { submitCoupleOnboardingAction } from "./actions";
import Link from "next/link";

interface Tradition {
  id: string;
  name: string;
}

interface CoupleOnboardingFormProps {
  weddingId: string;
  initialData: {
    partnerA: string;
    partnerB: string;
    weddingDate: string;
    location: string;
    tradition: string;
    budget: number;
  };
  traditionsList: Tradition[];
}

export default function CoupleOnboardingForm({
  weddingId,
  initialData,
  traditionsList,
}: CoupleOnboardingFormProps) {
  // Check if current tradition is a standard one
  const isStandard = traditionsList.some(t => t.id === initialData.tradition && t.id !== "other");
  
  const [partnerA, setPartnerA] = React.useState(initialData.partnerA || "");
  const [partnerB, setPartnerB] = React.useState(initialData.partnerB || "");
  const [weddingDate, setWeddingDate] = React.useState(initialData.weddingDate || "");
  const [location, setLocation] = React.useState(initialData.location || "");
  const [tradition, setTradition] = React.useState(isStandard ? initialData.tradition : (initialData.tradition ? "other" : "secular"));
  const [customTradition, setCustomTradition] = React.useState(isStandard ? "" : initialData.tradition || "");
  const [budget, setBudget] = React.useState(initialData.budget || 0);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerA.trim() || !partnerB.trim() || !weddingDate || !location.trim() || !tradition) {
      setError("Please fill out all required fields.");
      return;
    }

    if (tradition === "other" && !customTradition.trim()) {
      setError("Please specify your custom tradition.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await submitCoupleOnboardingAction(weddingId, {
        partnerA,
        partnerB,
        weddingDate,
        location,
        tradition,
        customTradition: tradition === "other" ? customTradition : undefined,
        budget: Number(budget),
      });

      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card variant="cream" className="max-w-lg mx-auto p-8 text-center border-slate-200 shadow-md rounded-2xl bg-white">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-[#2d336b] mb-3">Onboarding Complete!</h2>
        <p className="text-slate-600 text-sm mb-8 leading-relaxed">
          Your wedding event details have been successfully configured. You can now log in to the dashboard to plan tasks, customize ceremonies, coordinate vendors, and build your showcase page.
        </p>
        <Link href="/login">
          <Button variant="primary" className="w-full py-3 text-base font-semibold">
            Log In to Dashboard
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card variant="default" className="max-w-xl mx-auto p-6 md:p-8 border-slate-200 shadow-sm bg-white rounded-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 text-center">Let{"'"}s setup your Wedding Event</h2>
          <p className="text-xs text-slate-500 text-center mt-1">Please enter the essential details to configure your WedPlanAI dashboard.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Partner A Name</label>
            <input
              type="text"
              required
              value={partnerA}
              onChange={(e) => setPartnerA(e.target.value)}
              placeholder="e.g. Jane"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6771ab]/20 focus:border-[#6771ab]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Partner B Name</label>
            <input
              type="text"
              required
              value={partnerB}
              onChange={(e) => setPartnerB(e.target.value)}
              placeholder="e.g. John"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6771ab]/20 focus:border-[#6771ab]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Wedding Date</label>
          <input
            type="date"
            required
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6771ab]/20 focus:border-[#6771ab]"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Location / Venue</label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Chicago, IL or Grand Plaza Ballroom"
            className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6771ab]/20 focus:border-[#6771ab]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tradition</label>
            <select
              value={tradition}
              onChange={(e) => setTradition(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 bg-white rounded-xl outline-none focus:ring-2 focus:ring-[#6771ab]/20 focus:border-[#6771ab]"
            >
              {traditionsList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Budget ($)</label>
            <input
              type="number"
              min="0"
              required
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              placeholder="e.g. 35000"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6771ab]/20 focus:border-[#6771ab]"
            />
          </div>
        </div>

        {tradition === "other" && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Custom Tradition Name</label>
            <input
              type="text"
              required
              value={customTradition}
              onChange={(e) => setCustomTradition(e.target.value)}
              placeholder="e.g. Jewish-Italian Intercultural"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6771ab]/20 focus:border-[#6771ab]"
            />
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
            ⚠️ {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          variant="primary"
          className="w-full py-3 text-base font-semibold transition-all mt-4"
        >
          {isSubmitting ? "Saving details..." : "Submit Wedding Details"}
        </Button>
      </form>
    </Card>
  );
}
