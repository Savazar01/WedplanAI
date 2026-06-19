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

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  category: string;
  dueDate: Date | null;
  isCustom: boolean;
}

interface MonthCalendarOnlyProps {
  initialRituals: Ritual[];
  initialTasks: Task[];
}

export default function MonthCalendarOnly({ initialRituals, initialTasks }: MonthCalendarOnlyProps) {
  const router = useRouter();
  const [ritualsList, setRitualsList] = React.useState<Ritual[]>(initialRituals);
  const [tasksList, setTasksList] = React.useState<Task[]>(initialTasks);

  // Keep state synced with server components
  const [prevInitialRituals, setPrevInitialRituals] = React.useState(initialRituals);
  if (initialRituals !== prevInitialRituals) {
    setRitualsList(initialRituals);
    setPrevInitialRituals(initialRituals);
  }

  const [prevInitialTasks, setPrevInitialTasks] = React.useState(initialTasks);
  if (initialTasks !== prevInitialTasks) {
    setTasksList(initialTasks);
    setPrevInitialTasks(initialTasks);
  }

  // Active view tab state
  const [activeTab, setActiveTab] = React.useState<'month' | 'week' | 'day'>('month');

  // Month navigation state - default to first ritual's date if available
  const [currentDate, setCurrentDate] = React.useState(() => {
    if (initialRituals.length > 0) {
      const firstRitualDate = new Date(initialRituals.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0].startTime);
      return firstRitualDate;
    }
    return new Date();
  });
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

  // Detail Dialog states
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [detailRitual, setDetailRitual] = React.useState<Ritual | null>(null);

  const [isTaskDetailOpen, setIsTaskDetailOpen] = React.useState(false);
  const [detailTask, setDetailTask] = React.useState<Task | null>(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrev = () => {
    if (activeTab === "month") {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    } else if (activeTab === "week") {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7));
    } else {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 1));
    }
  };

  const handleNext = () => {
    if (activeTab === "month") {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else if (activeTab === "week") {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7));
    } else {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 1));
    }
  };

  // Week View dates helper
  const getSunday = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.getFullYear(), d.getMonth(), diff);
  };

  const getWeekRangeString = (d: Date) => {
    const sun = getSunday(d);
    const sat = new Date(sun.getFullYear(), sun.getMonth(), sun.getDate() + 6);
    
    const format = (date: Date) => {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };
    return `${format(sun)} - ${format(sat)}`;
  };

  const getWeekDays = (d: Date) => {
    const sun = getSunday(d);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(new Date(sun.getFullYear(), sun.getMonth(), sun.getDate() + i));
    }
    return days;
  };

  const getDayString = (d: Date) => {
    return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
  };

  const getHeaderTitle = () => {
    if (activeTab === "month") {
      return `${monthNames[month]} ${year}`;
    } else if (activeTab === "week") {
      return getWeekRangeString(currentDate);
    } else {
      return getDayString(currentDate);
    }
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

  const openCreateModalForDate = (day: number) => {
    setSelectedRitual(null);
    setName("");
    setDescription("");
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
    setStartTime(`${dateStr}T12:00`);
    setEndTime(`${dateStr}T13:00`);
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

  const openDetailModal = (ritual: Ritual, e: React.MouseEvent) => {
    e.stopPropagation();
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
        setIsDetailOpen(false);
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

  // Day View Current Lists
  const currentDayRituals = ritualsList.filter((r) => {
    const d = new Date(r.startTime);
    return (
      d.getFullYear() === year &&
      d.getMonth() === month &&
      d.getDate() === currentDate.getDate()
    );
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const currentDayTasks = tasksList.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return (
      d.getFullYear() === year &&
      d.getMonth() === month &&
      d.getDate() === currentDate.getDate()
    );
  }).sort((a, b) => {
    if (!a.dueDate || !b.dueDate) return 0;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const formatTaskCategory = (category: string) => {
    const mapping: Record<string, string> = {
      venue: "🏰 Venue",
      catering: "🍽️ Catering & Food",
      decor: "🌸 Decoration",
      apparel: "👗 Apparel & Styling",
      invitations: "✉️ Invitations & Stationery",
      music: "🎵 Music & Entertainment",
      rituals: "✨ Ceremonies",
      other: "📋 Other Task",
    };
    return mapping[category] || category.toUpperCase();
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-50 text-green-700 border-green-200/60";
      case "in_progress":
        return "bg-blue-50 text-blue-700 border-blue-200/60";
      case "todo":
      default:
        return "bg-slate-100 text-slate-600 border-slate-200/60";
    }
  };

  const formatTaskStatus = (status: string) => {
    switch (status) {
      case "done":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "todo":
      default:
        return "To-Do";
    }
  };

  return (
    <div className="flex flex-col h-full font-sans space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Wedding Calendar</h1>
          <p className="text-xs text-slate-500">Visualize your scheduled ceremonies and task deadlines.</p>
        </div>
        <Button onClick={openCreateModal} variant="primary">
          + Add Ceremony
        </Button>
      </div>

      <Card variant="default" className="p-6 bg-white border-slate-200 shadow-sm flex flex-col">
        {/* Tab Selector Buttons & Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
          <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("month")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "month"
                  ? "bg-[#6771ab] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setActiveTab("week")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "week"
                  ? "bg-[#6771ab] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setActiveTab("day")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "day"
                  ? "bg-[#6771ab] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Day
            </button>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 font-sans">
            <h2 className="text-base font-bold text-slate-800 font-sans">
              {getHeaderTitle()}
            </h2>
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200/60 font-sans">
              <Button onClick={handlePrev} variant="ghost" className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-100" title="Previous">
                ◀
              </Button>
              <Button onClick={() => setCurrentDate(new Date())} variant="ghost" className="px-2.5 h-8 text-xs font-semibold text-slate-600 hover:bg-slate-100" title="Today">
                Today
              </Button>
              <Button onClick={handleNext} variant="ghost" className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-100" title="Next">
                ▶
              </Button>
            </div>
          </div>
        </div>

        {activeTab === "month" && (
          <>
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

                const dayTasks = cell.day
                  ? tasksList.filter((t) => {
                      if (!t.dueDate) return false;
                      const d = new Date(t.dueDate);
                      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === cell.day;
                    })
                  : [];

                return (
                  <div
                    key={idx}
                    onClick={() => cell.day && openCreateModalForDate(cell.day)}
                    className={`min-h-[90px] border border-slate-100 rounded-xl p-1.5 flex flex-col justify-between cursor-pointer transition-colors hover:bg-slate-50/80 ${
                      cell.isCurrent ? "bg-white" : "bg-slate-50/50 text-slate-300 pointer-events-none"
                    }`}
                  >
                    <div className="text-right text-xs font-bold font-sans text-slate-500">
                      {cell.day}
                    </div>
                    
                    <div className="flex-1 mt-1 space-y-1 overflow-y-auto max-h-[70px] pr-0.5">
                      {dayRituals.map((r) => (
                        <div
                          key={r.id}
                          onClick={(e) => openDetailModal(r, e)}
                          className="bg-violet-50 text-[#2d336b] hover:bg-violet-100/80 border border-violet-100/60 rounded-lg px-2 py-1 text-[10px] font-semibold truncate cursor-pointer transition-colors"
                          title={`${r.name} at ${new Date(r.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        >
                          {r.name}
                        </div>
                      ))}
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailTask(t);
                            setIsTaskDetailOpen(true);
                          }}
                          className="bg-amber-50 text-amber-800 hover:bg-amber-100/80 border border-amber-200/60 rounded-lg px-2 py-1 text-[10px] font-semibold flex items-center gap-1.5 truncate cursor-pointer transition-colors"
                          title={`📋 Task: ${t.title}`}
                        >
                          <span className="truncate">📋 Task: {t.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === "week" && (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 pt-2">
            {getWeekDays(currentDate).map((dayDate, index) => {
              const dayRituals = ritualsList.filter((r) => {
                const d = new Date(r.startTime);
                return (
                  d.getFullYear() === dayDate.getFullYear() &&
                  d.getMonth() === dayDate.getMonth() &&
                  d.getDate() === dayDate.getDate()
                );
              }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

              const dayTasks = tasksList.filter((t) => {
                if (!t.dueDate) return false;
                const d = new Date(t.dueDate);
                return (
                  d.getFullYear() === dayDate.getFullYear() &&
                  d.getMonth() === dayDate.getMonth() &&
                  d.getDate() === dayDate.getDate()
                );
              }).sort((a, b) => {
                if (!a.dueDate || !b.dueDate) return 0;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
              });

              const isToday = new Date().toDateString() === dayDate.toDateString();

              return (
                <div
                  key={index}
                  className={`flex flex-col border border-slate-100 rounded-2xl p-4 bg-white min-h-[220px] transition-all ${
                    isToday ? "ring-2 ring-[#6771ab] ring-offset-2" : ""
                  }`}
                >
                  {/* Column Day Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                    <span className="text-xs font-semibold text-[#6771ab] uppercase tracking-wider">
                      {dayDate.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span className={`text-sm font-bold h-7 w-7 rounded-full flex items-center justify-center ${
                      isToday ? "bg-[#6771ab] text-white" : "text-slate-800"
                    }`}>
                      {dayDate.getDate()}
                    </span>
                  </div>

                  {/* Rituals and Tasks list */}
                  <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] pr-0.5">
                    {dayRituals.length === 0 && dayTasks.length === 0 ? (
                      <span className="text-[10px] text-slate-400 italic block text-center mt-4">
                        No events
                      </span>
                    ) : (
                      <>
                        {dayRituals.map((r) => (
                          <div
                            key={r.id}
                            onClick={(e) => openDetailModal(r, e)}
                            className="bg-violet-50 text-[#2d336b] hover:bg-violet-100/80 border border-violet-100/60 rounded-lg p-2 text-xs font-semibold cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95"
                            title={`${r.name} at ${new Date(r.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          >
                            <div className="font-bold flex items-center justify-between">
                              <span>✨ {r.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                              ⏰ {new Date(r.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))}
                        {dayTasks.map((t) => (
                          <div
                            key={t.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailTask(t);
                              setIsTaskDetailOpen(true);
                            }}
                            className="bg-amber-50 text-amber-800 hover:bg-amber-100/80 border border-amber-200/60 rounded-lg p-2 text-xs font-semibold flex flex-col cursor-pointer transition-all hover:-translate-y-0.5 active:scale-95"
                            title={`📋 Task: ${t.title}`}
                          >
                            <div className="font-bold flex items-center gap-1">
                              <span>📋</span>
                              <span className="truncate">{t.title}</span>
                            </div>
                            <div className="text-[10px] text-amber-700/80 font-normal mt-0.5">
                              Due: {new Date(t.dueDate!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "day" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
            {/* Left Side: Ceremonies & Rituals */}
            <div className="lg:col-span-7 space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#6771ab] uppercase tracking-wider flex items-center gap-2">
                    <span>✨</span> Ceremonies
                  </h3>
                <span className="text-xs bg-violet-100 text-[#2d336b] px-2 py-0.5 rounded-full font-bold">
                  {currentDayRituals.length} Scheduled
                </span>
              </div>

              {currentDayRituals.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
                  <span className="text-3xl mb-2">🌸</span>
                  <h4 className="text-sm font-bold text-slate-700">No Ceremonies Scheduled</h4>
                  <p className="text-xs text-slate-400 mt-1">Keep it relaxing or add a ceremony for today.</p>
                  <Button onClick={() => openCreateModalForDate(currentDate.getDate())} variant="ghost" className="text-xs mt-3 text-[#6771ab] font-bold">
                    + Schedule Ceremony
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentDayRituals.map((r) => (
                    <div
                      key={r.id}
                      onClick={(e) => openDetailModal(r, e)}
                      className="group border border-slate-100 rounded-2xl p-4 bg-white hover:border-violet-200 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 group-hover:text-[#6771ab] transition-colors">
                          {r.name}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{r.description || "No description provided."}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1 font-sans">
                          <span className="flex items-center gap-1">
                            📍 {r.location}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                        <span className="text-xs font-bold text-slate-700 font-sans">
                          {new Date(r.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-slate-400 font-sans">
                          to {new Date(r.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side: Pre-Wedding Tasks & Deadlines */}
            <div className="lg:col-span-5 space-y-4">
              <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#6771ab] uppercase tracking-wider flex items-center gap-2">
                  <span>📋</span> Pre-Wedding Tasks
                </h3>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                  {currentDayTasks.length} Due
                </span>
              </div>

              {currentDayTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
                  <span className="text-3xl mb-2">🎉</span>
                  <h4 className="text-sm font-bold text-slate-700">All Tasks Caught Up</h4>
                  <p className="text-xs text-slate-400 mt-1">No tasks or deadlines due on this date.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentDayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setDetailTask(t);
                        setIsTaskDetailOpen(true);
                      }}
                      className="group border border-slate-100 rounded-2xl p-4 bg-[#fefce8]/60 hover:bg-[#fefce8] hover:border-amber-200 hover:shadow-md transition-all cursor-pointer flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-lg border ${getStatusBadgeStyles(t.status)}`}>
                            {formatTaskStatus(t.status)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold font-sans">
                            {formatTaskCategory(t.category)}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 group-hover:text-amber-900 transition-colors truncate">
                          {t.title}
                        </h4>
                        {t.description && (
                          <p className="text-xs text-slate-500 line-clamp-1">{t.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

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
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-sans leading-relaxed break-words font-sans">
                  {detailRitual.description}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
              <Button type="button" variant="ghost" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
              <Button type="button" variant="ghost" className="text-red-500 font-bold hover:text-red-600 font-sans" onClick={(e) => handleDeleteRitual(detailRitual.id, e)}>
                Delete
              </Button>
              <Button type="button" variant="primary" onClick={(e) => openEditModal(detailRitual, e)}>
                Edit Details
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Task Detail Popup Modal */}
      <Dialog isOpen={isTaskDetailOpen} onClose={() => setIsTaskDetailOpen(false)} title="Task Details">
        {detailTask && (
          <div className="space-y-4">
            <div>
              <span className="block text-[10px] font-semibold text-[#6771ab] uppercase tracking-widest mb-0.5">Task Title</span>
              <h4 className="text-lg font-bold text-slate-800">{detailTask.title}</h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] font-semibold text-[#6771ab] uppercase tracking-widest mb-0.5">Category</span>
                <span className="text-sm font-semibold text-slate-700">
                  {formatTaskCategory(detailTask.category)}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-[#6771ab] uppercase tracking-widest mb-0.5">Status</span>
                <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-lg border mt-1 ${getStatusBadgeStyles(detailTask.status)}`}>
                  {formatTaskStatus(detailTask.status)}
                </span>
              </div>
            </div>

            {detailTask.dueDate && (
              <div>
                <span className="block text-[10px] font-semibold text-[#6771ab] uppercase tracking-widest mb-0.5">Due Date</span>
                <span className="text-sm font-medium text-slate-700 font-sans">
                  📅 {new Date(detailTask.dueDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}

            {detailTask.description && (
              <div>
                <span className="block text-[10px] font-semibold text-[#6771ab] uppercase tracking-widest mb-0.5">Description</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-sans leading-relaxed break-words whitespace-pre-wrap font-sans">
                  {detailTask.description}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6 font-sans">
              <Button type="button" variant="ghost" onClick={() => setIsTaskDetailOpen(false)}>
                Close
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
