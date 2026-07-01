"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { AIAssistantButton } from "@/components/ui/ai-assistant-button";
import { createRitualAction, updateRitualAction, deleteRitualAction } from "@/app/actions/calendar";
import { useTranslation } from "@/components/i18n/LanguageProvider";

interface Ritual {
  id: string;
  name: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  location: string;
  isCustom: boolean;
  isFoodServed: boolean;
  dressCode: string | null;
  extraChecklist: string | null;
  assignedUserId: string | null;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
}

interface EventItineraryOnlyProps {
  initialRituals: Ritual[];
  teamMembers: TeamMember[];
  locationOptions?: string[];
  defaultLocation?: string;
}

export default function EventItineraryOnly({ 
  initialRituals, 
  teamMembers = [],
  locationOptions = [],
  defaultLocation = ""
}: EventItineraryOnlyProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [ritualsList, setRitualsList] = React.useState<Ritual[]>(initialRituals);

  const allVenueOptions = React.useMemo(() => {
    const venueList = defaultLocation ? [defaultLocation] : [];
    locationOptions.forEach((loc) => {
      if (loc && !venueList.includes(loc)) {
        venueList.push(loc);
      }
    });
    return venueList;
  }, [defaultLocation, locationOptions]);


  // Keep state synced with server components using a structural signature
  const initialRitualsSignature = React.useMemo(() => {
    return initialRituals
      .map(
        (r) =>
          `${r.id}-${r.name}-${r.startTime.getTime()}-${r.endTime.getTime()}-${r.isFoodServed}-${r.dressCode || ""}-${
            r.extraChecklist || ""
          }-${r.assignedUserId || ""}`
      )
      .join("|");
  }, [initialRituals]);

  const [prevSignature, setPrevSignature] = React.useState(initialRitualsSignature);
  if (initialRitualsSignature !== prevSignature) {
    setRitualsList(initialRituals);
    setPrevSignature(initialRitualsSignature);
  }

  // Ritual Dialog form state
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedRitual, setSelectedRitual] = React.useState<Ritual | null>(null); // Null means creating
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [isFoodServed, setIsFoodServed] = React.useState(false);
  const [dressCode, setDressCode] = React.useState("");
  const [extraChecklist, setExtraChecklist] = React.useState<string[]>([]);
  const [assignedUserId, setAssignedUserId] = React.useState("");

  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);

  // Helper formatting dates for input fields
  const getLocalDateString = (d: Date) => {
    const dateObj = new Date(d);
    return dateObj.toLocaleDateString("en-CA");
  };

  const getLocalTimeString = (d: Date) => {
    const dateObj = new Date(d);
    const hh = String(dateObj.getHours()).padStart(2, "0");
    const mm = String(dateObj.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const openCreateModal = () => {
    setSelectedRitual(null);
    setName("");
    setDescription("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setIsFoodServed(false);
    setDressCode("");
    setExtraChecklist([]);
    setAssignedUserId("");
    setError("");
    setIsFormOpen(true);
  };

  const openEditModal = (ritual: Ritual, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRitual(ritual);
    setName(ritual.name);
    setDescription(ritual.description || "");
    const dateObj = new Date(ritual.startTime);
    setDate(getLocalDateString(dateObj));
    setStartTime(getLocalTimeString(dateObj));
    setEndTime(getLocalTimeString(new Date(ritual.endTime)));
    setLocation(ritual.location);
    setIsFoodServed(ritual.isFoodServed);
    setDressCode(ritual.dressCode || "");
    try {
      setExtraChecklist(ritual.extraChecklist ? JSON.parse(ritual.extraChecklist) : []);
    } catch {
      setExtraChecklist([]);
    }
    setAssignedUserId(ritual.assignedUserId || "");
    setError("");
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !date || !startTime || !endTime || !location.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    const startTimestamp = `${date}T${startTime}`;
    const endTimestamp = `${date}T${endTime}`;

    if (new Date(endTimestamp) <= new Date(startTimestamp)) {
      setError("End time must be after the start time.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        description,
        startTime: startTimestamp,
        endTime: endTimestamp,
        location,
        isFoodServed,
        dressCode: dressCode.trim() || null,
        extraChecklist: JSON.stringify(extraChecklist.filter((item) => item.trim() !== "")),
        assignedUserId: assignedUserId || null,
      };

      if (selectedRitual) {
        // Edit mode
        const res = await updateRitualAction(selectedRitual.id, payload);
        if (res?.error) {
          setError(res.error);
        } else {
          setIsFormOpen(false);
          router.refresh();
        }
      } else {
        // Create mode
        const res = await createRitualAction(payload);
        if (res?.error) {
          setError(res.error);
        } else {
          setIsFormOpen(false);
          router.refresh();
        }
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRitual = async (ritualId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteConfirm(ritualId);
  };

  const confirmDeleteRitual = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await deleteRitualAction(deleteConfirm);
      if (res?.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setIsFormOpen(false);
        setRitualsList((prev) => prev.filter((r) => r.id !== deleteConfirm));
        setToast({ message: "Ceremony deleted.", type: "success" });
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Sort rituals chronologically
  const sortedTimelineRituals = [...ritualsList].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <div className="flex flex-col h-full font-sans space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t("ceremonyPlanner")}</h1>
          <p className="text-xs text-slate-500 font-sans">Chronological order of your ceremonies and events.</p>
        </div>
        <Button onClick={openCreateModal} variant="primary">
          + Add Ceremony
        </Button>
      </div>

      <div className="relative pl-6 sm:pl-8 border-l-2 border-[#6771ab] ml-4 space-y-6">
        {sortedTimelineRituals.map((r) => {
          const startStr = new Date(r.startTime).toLocaleString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          const endStr = new Date(r.endTime).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          });

          // Get assignee details
          const assignedUser = teamMembers.find((m) => m.id === r.assignedUserId);

          // Get extra checklist items
          let parsedChecklist: string[] = [];
          try {
            parsedChecklist = r.extraChecklist ? (JSON.parse(r.extraChecklist) as string[]).filter(Boolean) : [];
          } catch {
            parsedChecklist = [];
          }

          return (
            <div key={r.id} className="relative">
              {/* Timeline point indicator */}
              <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#6771ab] ring-4 ring-white" />

              <Card variant="cream" className="p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-start gap-4 hover:shadow-md transition-shadow">
                <div className="space-y-1 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-base text-[#2d336b]">{r.name}</h4>
                    {r.isCustom && (
                      <span className="bg-slate-200 text-slate-700 text-[9px] px-1.5 py-0.5 rounded-sm font-semibold uppercase">
                        Custom
                      </span>
                    )}
                    {r.isFoodServed && (
                      <span className="bg-[#e2e8f0] text-slate-800 text-[10px] px-2 py-0.5 rounded-full font-medium">
                        🍽️ Food Served
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-sans">
                    🕒 {startStr} - {endStr} | 📍 {r.location}
                  </p>
                  
                  {r.dressCode && (
                    <p className="text-xs text-slate-600 font-sans">
                      👔 <strong>Dress Code:</strong> {r.dressCode}
                    </p>
                  )}

                  {assignedUser && (
                    <p className="text-xs text-slate-600 font-sans">
                      👤 <strong>Assigned to:</strong> {assignedUser.name} ({assignedUser.email})
                    </p>
                  )}

                  {r.description && (
                    <p className="text-xs text-slate-600 font-sans mt-2 break-words max-w-xl">
                      {r.description}
                    </p>
                  )}

                  {parsedChecklist.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 max-w-xl">
                      <p className="text-[11px] font-bold text-[#6771ab] uppercase tracking-wider mb-1.5">Ceremony Checklist</p>
                      <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-1">
                        {parsedChecklist.map((item, idx) => (
                          <li key={idx} className="break-words font-sans">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start">
                  {r.isFoodServed && (
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/menu-plan?ceremonyId=${r.id}`);
                      }} 
                      variant="ghost" 
                      size="sm" 
                      className="text-[#10b981] font-bold text-xs hover:text-[#059669]"
                    >
                      Plan Menu
                    </Button>
                  )}
                  <Button onClick={(e) => openEditModal(r, e)} variant="ghost" size="sm" className="text-[#6771ab] font-bold text-xs">
                    Edit
                  </Button>
                  <Button onClick={(e) => handleDeleteRitual(r.id, e)} variant="ghost" size="sm" className="text-[#ef4444] font-bold text-xs hover:text-red-600">
                    Delete
                  </Button>
                </div>
              </Card>
            </div>
          );
        })}

        {sortedTimelineRituals.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm bg-white rounded-xl border border-slate-100 font-sans">
            No ceremonies scheduled yet. Click &quot;Add Ceremony&quot; to get started.
          </div>
        )}
      </div>

      {/* Create / Edit Dialog Form */}
      <Dialog isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedRitual ? "Edit Ceremony" : "Add Ceremony"}>
        <form onSubmit={handleFormSubmit} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Ceremony Name</label>
            <Input
              type="text"
              placeholder="e.g. Sangeet, Wedding Vows, Cocktail Party"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Description</label>
              <AIAssistantButton
                value={description}
                title="Ceremony Description"
                onApply={(newText, mode) => {
                  setDescription(mode === "replace" ? newText : description + (description ? " " : "") + newText);
                }}
              />
            </div>
            <Input
              type="text"
              placeholder="Ceremony flow, rules, etc. (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Start Time</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">End Time</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Location / Venue Name</label>
            {allVenueOptions.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={allVenueOptions.includes(location) ? location : (location ? "__other__" : "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "__other__") {
                      setLocation("");
                    } else {
                      setLocation(val);
                    }
                  }}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6771ab]/40"
                >
                  <option value="">Select location...</option>
                  {allVenueOptions.map((loc, i) => (
                    <option key={i} value={loc}>{loc}</option>
                  ))}
                  <option value="__other__">Other / Custom Location</option>
                </select>
                {(!allVenueOptions.includes(location) || location === "") && (
                  <Input
                    type="text"
                    placeholder="e.g. Poolside Cabana"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    disabled={loading}
                  />
                )}
              </div>
            ) : (
              <Input
                type="text"
                placeholder="e.g. Grand Plaza Ballroom"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                disabled={loading}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Dress Code</label>
              <Input
                type="text"
                placeholder="e.g. Traditional, Smart Casual"
                value={dressCode}
                onChange={(e) => setDressCode(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="isFoodServed"
                checked={isFoodServed}
                onChange={(e) => setIsFoodServed(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 rounded border-slate-300 text-[#6771ab] focus:ring-[#6771ab] focus:ring-2 accent-[#6771ab]"
              />
              <label htmlFor="isFoodServed" className="text-sm font-semibold text-slate-700 select-none cursor-pointer">
                Is Food Served?
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Assigned Team Member</label>
            <select
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
              disabled={loading}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6771ab]"
            >
              <option value="">Unassigned</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} ({member.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Ceremony Checklist</label>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {extraChecklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Checklist item description"
                    value={item}
                    onChange={(e) => {
                      const newList = [...extraChecklist];
                      newList[idx] = e.target.value;
                      setExtraChecklist(newList);
                    }}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setExtraChecklist(extraChecklist.filter((_, i) => i !== idx));
                    }}
                    className="text-red-500 hover:text-red-600 font-bold px-2"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setExtraChecklist([...extraChecklist, ""])}
              disabled={loading}
              className="mt-2 text-[#6771ab] border border-slate-200 hover:bg-slate-50 font-bold w-full"
            >
              + Add Checklist Item
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-[#ef4444] rounded-xl text-xs font-sans">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : "Save Ceremony"}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDeleteRitual}
        title="Delete Ceremony"
        message="Are you sure you want to delete this ceremony? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

