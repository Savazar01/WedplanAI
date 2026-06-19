"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

interface CoordinatorProps {
  initialRituals: Ritual[];
}

export default function CalendarCoordinator({ initialRituals }: CoordinatorProps) {
  const [ritualsList, setRitualsList] = React.useState<Ritual[]>(initialRituals);

  // Month navigation state
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

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

  // Detail Dialog state
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [detailRitual, setDetailRitual] = React.useState<Ritual | null>(null);

  const [prevInitialRituals, setPrevInitialRituals] = React.useState(initialRituals);
  if (initialRituals !== prevInitialRituals) {
    setRitualsList(initialRituals);
    setPrevInitialRituals(initialRituals);
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Month Grid Calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOffset = new Date(year, month, 1).getDay(); // 0 is Sunday, 6 is Saturday

  const calendarDays: { day: number | null; isCurrent: boolean }[] = [];
  
  // Previous month padding cells
  for (let i = 0; i < firstDayOffset; i++) {
    calendarDays.push({ day: null, isCurrent: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push({ day: d, isCurrent: true });
  }

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
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const openDetailModal = (ritual: Ritual) => {
    setDetailRitual(ritual);
    setIsDetailOpen(true);
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
          window.location.reload();
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
          window.location.reload();
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
        setIsDetailOpen(false);
        setRitualsList((prev) => prev.filter((r) => r.id !== deleteConfirm));
        setToast({ message: "Ceremony deleted.", type: "success" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Filter and sort rituals for chronological event itinerary
  const sortedTimelineRituals = [...ritualsList].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <div className="flex flex-col h-full font-sans space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ceremony Planner</h1>
          <p className="text-xs text-slate-500">Track and schedule ceremonies leading to the big day.</p>
        </div>
        <Button onClick={openCreateModal} variant="primary">
          + Add Ceremony
        </Button>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <div className="flex justify-center sm:justify-start mb-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="grid">Month Calendar</TabsTrigger>
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          </TabsList>
        </div>

        {/* Calendar Grid View */}
        <TabsContent value="grid">
          <Card variant="default" className="p-6 bg-white border-slate-200 shadow-sm flex flex-col">
            {/* Calendar Month Selector Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800">
                {monthNames[month]} {year}
              </h2>
              <div className="flex items-center gap-2">
                <Button onClick={handlePrevMonth} variant="ghost" className="h-8 w-8 p-0" title="Previous Month">
                  ◀
                </Button>
                <Button onClick={handleNextMonth} variant="ghost" className="h-8 w-8 p-0" title="Next Month">
                  ▶
                </Button>
              </div>
            </div>

            {/* Days of Week Row */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-[#6771ab] uppercase tracking-widest pb-3 border-b border-slate-100">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Calendar Cells Grid */}
            <div className="grid grid-cols-7 gap-2 pt-2">
              {calendarDays.map((cell, idx) => {
                const dayRituals = cell.day
                  ? ritualsList.filter((r) => {
                      const d = new Date(r.startTime);
                      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === cell.day;
                    })
                  : [];

                return (
                  <div
                    key={idx}
                    className={`min-h-[90px] border border-slate-100 rounded-xl p-1.5 flex flex-col justify-between ${
                      cell.isCurrent ? "bg-white" : "bg-slate-50/50 text-slate-300"
                    }`}
                  >
                    <div className="text-right text-xs font-bold font-sans text-slate-500">
                      {cell.day}
                    </div>
                    
                    <div className="flex-1 mt-1 space-y-1 overflow-y-auto max-h-[70px] pr-0.5">
                      {dayRituals.map((r) => (
                        <div
                          key={r.id}
                          onClick={() => openDetailModal(r)}
                          className="bg-violet-50 hover:bg-violet-100 border border-violet-100/60 rounded-sm px-1.5 py-0.5 text-[10px] text-[#2d336b] font-medium truncate cursor-pointer transition-colors"
                          title={`${r.name} at ${new Date(r.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        >
                          {r.name}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Itinerary Chronological View */}
        <TabsContent value="timeline">
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
                No ceremonies scheduled yet. Click &quot;Add Ceremony&quot; to get started.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail Popup Modal */}
      <Dialog isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Ceremony Details">
        {detailRitual && (
          <div className="space-y-4">
            <div>
              <span className="block text-[10px] font-semibold text-[#6771ab] uppercase tracking-widest mb-0.5">Ceremony Name</span>
              <h4 className="text-lg font-bold text-slate-800">{detailRitual.name}</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] font-semibold text-[#6771ab] uppercase tracking-widest mb-0.5">Start Time</span>
                <span className="text-sm font-medium text-slate-700 font-sans">
                  {new Date(detailRitual.startTime).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-[#6771ab] uppercase tracking-widest mb-0.5">End Time</span>
                <span className="text-sm font-medium text-slate-700 font-sans">
                  {new Date(detailRitual.endTime).toLocaleString()}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-semibold text-[#6771ab] uppercase tracking-widest mb-0.5">Location</span>
              <span className="text-sm font-medium text-slate-700">📍 {detailRitual.location}</span>
            </div>

            {detailRitual.description && (
              <div>
                <span className="block text-[10px] font-semibold text-[#6771ab] uppercase tracking-widest mb-0.5">Description</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-sans leading-relaxed break-words">
                  {detailRitual.description}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
              <Button type="button" variant="ghost" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
              <Button type="button" variant="ghost" className="text-red-500 font-bold hover:text-red-600" onClick={(e) => handleDeleteRitual(detailRitual.id, e)}>
                Delete
              </Button>
              <Button type="button" variant="primary" onClick={(e) => openEditModal(detailRitual, e)}>
                Edit Details
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Create / Edit Dialog Form */}
      <Dialog isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedRitual ? "Edit Ceremony" : "Add Ceremony"}>
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
