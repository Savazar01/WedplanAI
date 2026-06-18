"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { createRitualAction, updateRitualAction, deleteRitualAction } from "@/app/actions/calendar";

interface Ritual {
  id: string;
  name: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  location: string;
  isCustom: boolean;
}

interface EventItineraryOnlyProps {
  initialRituals: Ritual[];
}

export default function EventItineraryOnly({ initialRituals }: EventItineraryOnlyProps) {
  const router = useRouter();
  const [ritualsList, setRitualsList] = React.useState<Ritual[]>(initialRituals);

  // Keep state synced with server components
  const [prevInitialRituals, setPrevInitialRituals] = React.useState(initialRituals);
  if (initialRituals !== prevInitialRituals) {
    setRitualsList(initialRituals);
    setPrevInitialRituals(initialRituals);
  }

  // Ritual Dialog form state
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedRitual, setSelectedRitual] = React.useState<Ritual | null>(null); // Null means creating
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [location, setLocation] = React.useState("");
  
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);

  // Helper formatting dates for datetime-local fields
  const formatToDatetimeLocal = (date: Date) => {
    const d = new Date(date);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const openCreateModal = () => {
    setSelectedRitual(null);
    setName("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setError("");
    setIsFormOpen(true);
  };

  const openEditModal = (ritual: Ritual, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRitual(ritual);
    setName(ritual.name);
    setDescription(ritual.description || "");
    setStartTime(formatToDatetimeLocal(ritual.startTime));
    setEndTime(formatToDatetimeLocal(ritual.endTime));
    setLocation(ritual.location);
    setError("");
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !startTime || !endTime || !location.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError("End time must be after the start time.");
      return;
    }

    setLoading(true);
    try {
      if (selectedRitual) {
        // Edit mode
        const res = await updateRitualAction(selectedRitual.id, {
          name,
          description,
          startTime,
          endTime,
          location,
        });
        if (res?.error) {
          setError(res.error);
        } else {
          setIsFormOpen(false);
          router.refresh();
        }
      } else {
        // Create mode
        const res = await createRitualAction({
          name,
          description,
          startTime,
          endTime,
          location,
        });
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
        setToast({ message: "Itinerary Event deleted.", type: "success" });
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
          <h1 className="text-2xl font-bold text-slate-800">Wedding Event Itinerary</h1>
          <p className="text-xs text-slate-500">Chronological order of your itinerary events and ceremonies.</p>
        </div>
        <Button onClick={openCreateModal} variant="primary">
          + Add Itinerary Event
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

          return (
            <div key={r.id} className="relative">
              {/* Timeline point indicator */}
              <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#6771ab] ring-4 ring-white" />

              <Card variant="cream" className="p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-shadow">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-[#2d336b]">{r.name}</h4>
                    {r.isCustom && (
                      <span className="bg-slate-200 text-slate-700 text-[9px] px-1.5 py-0.5 rounded-sm font-semibold uppercase">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-sans">
                    🕒 {startStr} - {endStr} | 📍 {r.location}
                  </p>
                  {r.description && (
                    <p className="text-xs text-slate-600 font-sans mt-2 break-words max-w-xl">
                      {r.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button onClick={(e) => openEditModal(r, e)} variant="ghost" size="sm" className="text-[#6771ab] font-bold text-xs">
                    Edit
                  </Button>
                  <Button onClick={(e) => handleDeleteRitual(r.id, e)} variant="ghost" size="sm" className="text-red-500 font-bold text-xs hover:text-red-600">
                    Delete
                  </Button>
                </div>
              </Card>
            </div>
          );
        })}

        {sortedTimelineRituals.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm bg-white rounded-xl border border-slate-100">
            No itinerary events scheduled yet. Click &quot;Add Itinerary Event&quot; to get started.
          </div>
        )}
      </div>

      {/* Create / Edit Dialog Form */}
      <Dialog isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedRitual ? "Edit Itinerary Event" : "Add Itinerary Event"}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
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
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Description</label>
            <Input
              type="text"
              placeholder="Ceremony flow, rules, dress codes (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Start Time</label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">End Time</label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Location / Venue Name</label>
            <Input
              type="text"
              placeholder="e.g. Grand Plaza Ballroom"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-sans">
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
        title="Delete Itinerary Event"
        message="Are you sure you want to delete this itinerary event? This action cannot be undone."
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
