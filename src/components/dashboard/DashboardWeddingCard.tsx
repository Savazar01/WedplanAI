"use client";

import * as React from "react";
import EditWeddingModal from "./EditWeddingModal";
import Countdown from "./countdown";

import WeddingActions from "./WeddingActions";

interface Wedding {
  id: string;
  partnerA: string;
  partnerB: string;
  location: string;
  weddingDate: Date;
  budget: number;
  guestCount: number;
  tradition: string;
  isArchived?: boolean | null;
  isSample?: boolean | null;
}

export default function DashboardWeddingCard({ wedding }: { wedding: Wedding }) {
  const [editOpen, setEditOpen] = React.useState(false);

  return (
    <div className="relative">
      {/* Edit button & Wedding Actions — top-right */}
      <div className="absolute top-0 right-0 flex items-center gap-2">
        <button
          onClick={() => setEditOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#6771ab] border border-[#6771ab]/30 rounded-xl hover:bg-[#6771ab]/10 transition-all cursor-pointer"
        >
          ✏️ Edit Details
        </button>
        <WeddingActions
          weddingId={wedding.id}
          isArchived={wedding.isArchived || false}
          isSample={wedding.isSample || (wedding.partnerA === "Rahul" && wedding.partnerB === "Priya")}
        />
      </div>

      {/* Wedding info */}
      <span className="inline-flex px-2 py-0.5 rounded-sm bg-violet-100 text-[#2d336b] text-[10px] font-semibold uppercase tracking-wider">
        {wedding.tradition} wedding
      </span>
      <h2 className="text-2xl font-bold text-slate-800 mt-2">
        {wedding.partnerA} &amp; {wedding.partnerB}
      </h2>
      <p className="text-sm text-slate-500 mt-1">
        📍 {wedding.location} | 📅{" "}
        {new Date(wedding.weddingDate).toLocaleDateString(undefined, { dateStyle: "long" })}
      </p>

      {/* Countdown */}
      <div className="mt-6">
        <span className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">
          Countdown to Big Day
        </span>
        <Countdown weddingDate={wedding.weddingDate} />
      </div>

      <EditWeddingModal
        wedding={wedding}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}
