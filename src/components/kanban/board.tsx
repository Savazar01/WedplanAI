"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createTaskAction, updateTaskStatusAction, deleteTaskAction, updateTaskAction } from "@/app/actions/kanban";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  category: string;
  dueDate: Date | null;
  isCustom: boolean;
}

interface BoardProps {
  initialTasks: Task[];
}

const COLUMNS = [
  {
    id: "backlog",
    label: "Backlog",
    icon: "📋",
    gradient: "from-slate-50 to-slate-100",
    headerGradient: "from-slate-600 to-slate-700",
    accent: "border-slate-300",
    countBg: "bg-slate-500",
    dotColor: "bg-slate-400",
  },
  {
    id: "todo",
    label: "To Do",
    icon: "📌",
    gradient: "from-blue-50 to-indigo-50",
    headerGradient: "from-[#6771ab] to-[#2d336b]",
    accent: "border-indigo-200",
    countBg: "bg-[#6771ab]",
    dotColor: "bg-blue-400",
  },
  {
    id: "in_progress",
    label: "In Progress",
    icon: "⚡",
    gradient: "from-amber-50 to-orange-50",
    headerGradient: "from-amber-500 to-orange-500",
    accent: "border-amber-200",
    countBg: "bg-amber-500",
    dotColor: "bg-amber-400",
  },
  {
    id: "done",
    label: "Done",
    icon: "✅",
    gradient: "from-emerald-50 to-green-50",
    headerGradient: "from-emerald-500 to-green-600",
    accent: "border-emerald-200",
    countBg: "bg-emerald-500",
    dotColor: "bg-emerald-400",
  },
] as const;

const categories = ["venue", "catering", "decor", "apparel", "invitations", "music", "rituals", "other"] as const;

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  venue:       { bg: "bg-amber-100",   text: "text-amber-800",   dot: "bg-amber-400" },
  catering:    { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-400" },
  decor:       { bg: "bg-sky-100",     text: "text-sky-800",     dot: "bg-sky-400" },
  apparel:     { bg: "bg-indigo-100",  text: "text-indigo-800",  dot: "bg-indigo-400" },
  invitations: { bg: "bg-purple-100",  text: "text-purple-800",  dot: "bg-purple-400" },
  music:       { bg: "bg-pink-100",    text: "text-pink-800",    dot: "bg-pink-400" },
  rituals:     { bg: "bg-violet-100",  text: "text-violet-800",  dot: "bg-violet-400" },
  other:       { bg: "bg-slate-100",   text: "text-slate-700",   dot: "bg-slate-400" },
};

export default function KanbanBoard({ initialTasks }: BoardProps) {
  const [tasksList, setTasksList] = React.useState<Task[]>(initialTasks);
  const [activeMobileCol, setActiveMobileCol] = React.useState<string>("todo");
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [dragOverCol, setDragOverCol] = React.useState<string | null>(null);

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("other");
  const [dueDate, setDueDate] = React.useState("");

  const [editTitle, setEditTitle] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [editCategory, setEditCategory] = React.useState("other");
  const [editDueDate, setEditDueDate] = React.useState("");

  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);

  const [prevInitialTasks, setPrevInitialTasks] = React.useState(initialTasks);
  if (initialTasks !== prevInitialTasks) {
    setTasksList(initialTasks);
    setPrevInitialTasks(initialTasks);
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDragLeave = () => setDragOverCol(null);

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;
    const originalTasks = [...tasksList];
    const draggedTask = tasksList.find((t) => t.id === taskId);
    if (!draggedTask || draggedTask.status === targetStatus) return;
    setTasksList((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t)));
    try {
      const res = await updateTaskStatusAction(taskId, targetStatus);
      if (res?.error) { setTasksList(originalTasks); }
    } catch { setTasksList(originalTasks); }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Task title is required."); return; }
    setLoading(true);
    try {
      const res = await createTaskAction({ title, description, category, dueDate: dueDate || undefined });
      if (res?.error) { setError(res.error); }
      else { setIsCreateOpen(false); setTitle(""); setDescription(""); setCategory("other"); setDueDate(""); window.location.reload(); }
    } catch { setError("An unexpected error occurred."); }
    finally { setLoading(false); }
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setError("");
    if (!editTitle.trim()) { setError("Task title is required."); return; }
    setLoading(true);
    try {
      const res = await updateTaskAction(selectedTask.id, { title: editTitle, description: editDescription, category: editCategory, dueDate: editDueDate || undefined });
      if (res?.error) { setError(res.error); }
      else {
        setTasksList((prev) => prev.map((t) => t.id === selectedTask.id ? { ...t, title: editTitle, description: editDescription || null, category: editCategory, dueDate: editDueDate ? new Date(editDueDate) : null } : t));
        setIsEditOpen(false); setSelectedTask(null); window.location.reload();
      }
    } catch { setError("An unexpected error occurred."); }
    finally { setLoading(false); }
  };

  const handleDeleteTask = async (taskId: string) => {
    setDeleteConfirm(taskId);
  };

  const confirmDeleteTask = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await deleteTaskAction(deleteConfirm);
      if (res?.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setTasksList((prev) => prev.filter((t) => t.id !== deleteConfirm));
        setToast({ message: "Task deleted.", type: "success" });
      }
    } catch {
      /* ignore */
    } finally {
      setDeleteConfirm(null);
    }
  };

  const isOverdue = (date: Date | null, status: string) =>
    date && status !== "done" && new Date(date) < new Date();

  const totalTasks = tasksList.length;
  const doneTasks = tasksList.filter(t => t.status === "done").length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col h-full font-sans">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Wedding Tasks</h1>
          <p className="text-xs text-slate-500 mt-0.5">Click a card to edit · Drag to change status</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Mini progress pill */}
          <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 shadow-sm">
            <div className="w-24 bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-[#6771ab] to-emerald-500 h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-slate-600">{progress}%</span>
            <span className="text-[11px] text-slate-400">{doneTasks}/{totalTasks}</span>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6771ab] to-[#2d336b] text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            + Add Task
          </button>
        </div>
      </div>

      {/* ── Mobile Tabs ── */}
      <div className="block md:hidden mb-6 bg-slate-100/80 border border-slate-200 p-1.5 rounded-2xl">
        <div className="flex gap-1">
          {COLUMNS.map((col) => {
            const isActive = activeMobileCol === col.id;
            const count = tasksList.filter((t) => t.status === col.id).length;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setActiveMobileCol(col.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-white text-[#2d336b] shadow-sm ring-1 ring-black/5"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span className="flex items-center gap-1">
                  <span className="text-sm">{col.icon}</span>
                  <span className="truncate">{col.label}</span>
                </span>
                <span className={`mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${
                  isActive
                    ? "bg-[#6771ab] text-white"
                    : "bg-slate-200/80 text-slate-600"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Columns ── */}
      <div className="flex flex-col md:flex-row gap-5 md:overflow-x-auto pb-6 select-none items-start">
        {COLUMNS.map((col) => {
          const colTasks = tasksList.filter((t) => t.status === col.id);
          const isDragTarget = dragOverCol === col.id;
          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`w-full md:w-[300px] shrink-0 rounded-2xl flex flex-col transition-all duration-200 ${
                col.id === activeMobileCol ? "flex" : "hidden md:flex"
              } ${
                isDragTarget ? "ring-2 ring-[#6771ab] ring-offset-2 scale-[1.01]" : ""
              }`}
            >
              {/* Column header */}
              <div className={`bg-gradient-to-r ${col.headerGradient} rounded-t-2xl px-4 py-3 flex items-center justify-between`}>
                <h3 className="font-bold text-white text-sm tracking-wide flex items-center gap-2">
                  <span className="text-base">{col.icon}</span>
                  <span>{col.label}</span>
                </h3>
                <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                  {colTasks.length}
                </span>
              </div>

              {/* Cards area */}
              <div
                className={`flex-1 bg-gradient-to-b ${col.gradient} border-x border-b ${col.accent} rounded-b-2xl p-3 space-y-2.5 min-h-[520px] overflow-y-auto`}
              >
                {colTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-white/60 border border-dashed border-slate-300 flex items-center justify-center mb-3 text-xl">
                      {col.icon}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Drop tasks here</p>
                  </div>
                )}

                {colTasks.map((task) => {
                  const overdue = isOverdue(task.dueDate, task.status);
                  const catStyle = CATEGORY_STYLES[task.category] ?? CATEGORY_STYLES.other;
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => {
                        setSelectedTask(task);
                        setEditTitle(task.title);
                        setEditDescription(task.description || "");
                        setEditCategory(task.category);
                        setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
                        setIsEditOpen(true);
                      }}
                      className={`group relative bg-white rounded-xl p-3.5 shadow-sm border cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 ${
                        overdue ? "border-red-300 bg-red-50/30" : "border-white/80"
                      }`}
                    >
                      {/* Delete button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                        className="absolute top-2.5 right-2.5 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all outline-none z-10"
                        title="Delete task"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      {/* Overdue banner */}
                      {overdue && (
                        <div className="flex items-center gap-1 mb-2 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg px-2 py-0.5">
                          <span>⚠️</span> Overdue
                        </div>
                      )}

                      <h4 className="font-semibold text-[13px] text-slate-800 pr-6 leading-snug break-words">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Footer row */}
                      <div className="flex flex-col gap-2 mt-3 pt-2.5 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${catStyle.bg} ${catStyle.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                            {task.category}
                          </span>
                          {task.dueDate && (
                            <span className={`text-[10px] font-medium ${overdue ? "text-red-500" : "text-slate-400"}`}>
                              📅 {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                          )}
                          {task.isCustom && (
                            <span className="text-[10px] font-medium text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded-full">Custom</span>
                          )}
                        </div>
                        
                        <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                          <select
                            value={task.status}
                            onChange={async (e) => {
                              e.stopPropagation();
                              const targetStatus = e.target.value;
                              const originalTasks = [...tasksList];
                              setTasksList((prev) =>
                                prev.map((t) => (t.id === task.id ? { ...t, status: targetStatus } : t))
                              );
                              try {
                                const res = await updateTaskStatusAction(task.id, targetStatus);
                                if (res?.error) {
                                  setTasksList(originalTasks);
                                } 
                              } catch {
                                setTasksList(originalTasks);
                              }
                            }}
                            className="bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 rounded-lg px-1.5 py-0.5 outline-none focus-visible:ring-1 focus-visible:ring-[#6771ab] cursor-pointer hover:bg-slate-100 transition-colors"
                          >
                            {COLUMNS.map((col) => (
                              <option key={col.id} value={col.id}>
                                {col.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Drag handle hint */}
                      <div className="absolute bottom-2 right-2.5 opacity-0 group-hover:opacity-30 transition-opacity">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 5a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2zM9 12a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2zM9 19a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Create Task Dialog ── */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Task Title</label>
            <Input type="text" placeholder="e.g. Call wedding cake designer" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={loading} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Description</label>
            <Input type="text" placeholder="Provide more context (optional)" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Category</label>
              <Select value={category} onChange={(e) => setCategory(e.target.value)} disabled={loading}>
                {categories.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Due Date</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={loading} />
            </div>
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">{error}</div>}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>{loading ? "Creating..." : "Save Task"}</Button>
          </div>
        </form>
      </Dialog>

      {/* ── Edit Task Dialog ── */}
      <Dialog isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedTask(null); }} title={`Edit: ${selectedTask?.title ?? "Task"}`}>
        <form onSubmit={handleEditTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Task Title</label>
            <Input type="text" placeholder="Task title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required disabled={loading} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Description</label>
            <Input type="text" placeholder="Provide more context (optional)" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} disabled={loading} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Category</label>
              <Select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} disabled={loading}>
                {categories.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Due Date</label>
              <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} disabled={loading} />
            </div>
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">{error}</div>}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
            <Button type="button" variant="ghost" onClick={() => { setIsEditOpen(false); setSelectedTask(null); }} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
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
