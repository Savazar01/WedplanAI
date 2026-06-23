"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { 
  createTaskAction, 
  updateTaskStatusAction, 
  deleteTaskAction, 
  updateTaskAction,
  createColumnAction,
  updateColumnAction,
  deleteColumnAction,
  reorderColumnsAction
} from "@/app/actions/kanban";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  category: string;
  dueDate: Date | null;
  isCustom: boolean;
  ceremonyId: string | null;
  assignedUserId: string | null;
  categoryData: string | null;
  cateringMenuId?: string | null;
}

interface Column {
  id: string;
  weddingId: string;
  name: string;
  color: string;
  position: number;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BoardProps {
  initialTasks: Task[];
  initialColumns?: Column[];
  ceremonies?: { id: string; name: string }[];
  teamMembers?: { id: string; name: string; email: string }[];
  cateringMenus?: any[];
}

const DEFAULT_COLUMNS: Column[] = [
  {
    id: "backlog",
    weddingId: "",
    name: "Backlog",
    color: "#6771ab",
    position: 0,
    type: "backlog",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "todo",
    weddingId: "",
    name: "To Do",
    color: "#6771ab",
    position: 1,
    type: "todo",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "in_progress",
    weddingId: "",
    name: "In Progress",
    color: "#f59e0b",
    position: 2,
    type: "in_progress",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "done",
    weddingId: "",
    name: "Done",
    color: "#22c55e",
    position: 3,
    type: "done",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const categories = ["venue", "catering", "decor", "apparel", "invitations", "music", "ceremonies", "other"] as const;

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  venue:       { bg: "bg-amber-100",   text: "text-amber-800",   dot: "bg-amber-400" },
  catering:    { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-400" },
  decor:       { bg: "bg-sky-100",     text: "text-sky-800",     dot: "bg-sky-400" },
  apparel:     { bg: "bg-indigo-100",  text: "text-indigo-800",  dot: "bg-indigo-400" },
  invitations: { bg: "bg-purple-100",  text: "text-purple-800",  dot: "bg-purple-400" },
  music:       { bg: "bg-pink-100",    text: "text-pink-800",    dot: "bg-pink-400" },
  ceremonies:  { bg: "bg-violet-100",  text: "text-violet-800",  dot: "bg-violet-400" },
  other:       { bg: "bg-slate-100",   text: "text-slate-700",   dot: "bg-slate-400" },
};

interface FollowUpQuestion {
  id: string;
  label: string;
  type: "text" | "select";
  options?: string[];
}

const DEFAULT_FOLLOW_UP_QUESTIONS: Record<string, FollowUpQuestion[]> = {
  catering: [
    {
      id: "dietaryType",
      label: "Dietary Option",
      type: "select",
      options: ["Vegetarian", "Non-Vegetarian", "Both/All-inclusive"]
    },
    {
      id: "serviceStyle",
      label: "Service Style",
      type: "select",
      options: ["Buffet", "Plated Service", "Family Style", "Food Stations"]
    }
  ],
  venue: [
    {
      id: "venueType",
      label: "Venue Preference",
      type: "select",
      options: ["Indoor Ballroom", "Outdoor Lawn/Garden", "Beachside", "Temple/Church"]
    },
    {
      id: "estimatedGuests",
      label: "Estimated Guest Count",
      type: "text"
    }
  ],
  decor: [
    {
      id: "colorScheme",
      label: "Color Theme/Palette",
      type: "text"
    },
    {
      id: "floralSetup",
      label: "Floral Setup Required?",
      type: "select",
      options: ["Yes, extensive", "Minimal floral", "No floral"]
    }
  ],
  music: [
    {
      id: "entertainmentType",
      label: "Entertainment Type",
      type: "select",
      options: ["DJ", "Live Band", "Classical Instrumentalists", "Acoustic Soloist"]
    }
  ],
  apparel: [
    {
      id: "fittingRequired",
      label: "Fitting Session Required?",
      type: "select",
      options: ["Yes", "No"]
    }
  ]
};

export default function PlanningBoard({ 
  initialTasks, 
  initialColumns = DEFAULT_COLUMNS,
  ceremonies = [],
  teamMembers = [],
  cateringMenus = [],
}: BoardProps) {
  const [tasksList, setTasksList] = React.useState<Task[]>(initialTasks);
  const [columnsList, setColumnsList] = React.useState<Column[]>(initialColumns);
  const [activeMobileCol, setActiveMobileCol] = React.useState<string>(initialColumns[0]?.id || "todo");

  const getCeremonyName = (cId: string) => {
    return ceremonies.find(c => c.id === cId)?.name || "Unknown Ceremony";
  };

  const [dbCategories, setDbCategories] = React.useState<{ key: string; name: string; followUpQuestions: string | null }[]>([]);
  React.useEffect(() => {
    async function load() {
      const { getPublicCategories } = await import("@/app/actions/wedding");
      const list = await getPublicCategories();
      setDbCategories(list);
    }
    load();
  }, []);

  const getFollowUpQuestions = React.useCallback((catKey: string): FollowUpQuestion[] => {
    const dbCat = dbCategories.find(c => c.key === catKey);
    if (dbCat && dbCat.followUpQuestions) {
      try {
        const parsed = JSON.parse(dbCat.followUpQuestions);
        if (Array.isArray(parsed)) {
          return parsed.map(q => ({
            id: q.id,
            label: q.label,
            type: q.type === "boolean" ? "select" : q.type,
            options: q.type === "boolean" ? ["Yes", "No"] : q.options
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_FOLLOW_UP_QUESTIONS[catKey as keyof typeof DEFAULT_FOLLOW_UP_QUESTIONS] || [];
  }, [dbCategories]);
  
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [dragOverCol, setDragOverCol] = React.useState<string | null>(null);

  // Column CRUD states
  const [isAddColOpen, setIsAddColOpen] = React.useState(false);
  const [newColName, setNewColName] = React.useState("");
  const [newColColor, setNewColColor] = React.useState("#6771ab");
  const [selectedCol, setSelectedCol] = React.useState<Column | null>(null);
  const [isEditColOpen, setIsEditColOpen] = React.useState(false);
  const [editColName, setEditColName] = React.useState("");
  const [editColColor, setEditColColor] = React.useState("#6771ab");

  // Create Form State
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState("other");
  const [customCategory, setCustomCategory] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [ceremonyId, setCeremonyId] = React.useState("");
  const [assignedUserId, setAssignedUserId] = React.useState("");
  const [categoryAnswers, setCategoryAnswers] = React.useState<Record<string, string>>({});
  const [cateringMenuId, setCateringMenuId] = React.useState("");

  // Edit Form State
  const [editTitle, setEditTitle] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [editCategory, setEditCategory] = React.useState("other");
  const [editCustomCategory, setEditCustomCategory] = React.useState("");
  const [editDueDate, setEditDueDate] = React.useState("");
  const [editCeremonyId, setEditCeremonyId] = React.useState("");
  const [editAssignedUserId, setEditAssignedUserId] = React.useState("");
  const [editCategoryAnswers, setEditCategoryAnswers] = React.useState<Record<string, string>>({});
  const [editCateringMenuId, setEditCateringMenuId] = React.useState("");

  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);

  // Safe client component state synchronization with structural signature
  const tasksSignature = React.useMemo(() => {
    return initialTasks
      .map(
        (t) =>
          `${t.id}-${t.status}-${t.title}-${t.category}-${t.dueDate?.getTime() || ""}-${t.ceremonyId || ""}-${
            t.assignedUserId || ""
          }-${t.categoryData || ""}-${t.cateringMenuId || ""}`
      )
      .join("|");
  }, [initialTasks]);

  const [prevTasksSignature, setPrevTasksSignature] = React.useState(tasksSignature);
  if (tasksSignature !== prevTasksSignature) {
    setTasksList(initialTasks);
    setPrevTasksSignature(tasksSignature);
  }

  const columnsSignature = React.useMemo(() => {
    return initialColumns.map((c) => `${c.id}-${c.name}-${c.color}-${c.position}`).join("|");
  }, [initialColumns]);

  const [prevColumnsSignature, setPrevColumnsSignature] = React.useState(columnsSignature);
  if (columnsSignature !== prevColumnsSignature) {
    setColumnsList(initialColumns);
    setPrevColumnsSignature(columnsSignature);
  }

  const getColumnIcon = (type: string) => {
    switch (type) {
      case "backlog": return "📋";
      case "todo": return "📌";
      case "in_progress": return "⚡";
      case "done": return "✅";
      default: return "✨";
    }
  };

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
    
    let resolvedCategory = category;
    if (category === "other") {
      if (!customCategory.trim()) {
        setError("Please specify a custom category name.");
        return;
      }
      resolvedCategory = customCategory.trim();
    }

    setLoading(true);
    try {
      const res = await createTaskAction({ 
        title, 
        description, 
        category: resolvedCategory, 
        dueDate: dueDate || undefined,
        ceremonyId: ceremonyId || null,
        assignedUserId: assignedUserId || null,
        categoryData: Object.keys(categoryAnswers).length > 0 ? JSON.stringify(categoryAnswers) : null,
        cateringMenuId: cateringMenuId || null,
      });
      if (res?.error) { setError(res.error); }
      else { 
        setIsCreateOpen(false); 
        setTitle(""); 
        setDescription(""); 
        setCategory("other"); 
        setCustomCategory("");
        setDueDate(""); 
        setCeremonyId("");
        setAssignedUserId("");
        setCategoryAnswers({});
        setCateringMenuId("");
        window.location.reload(); 
      }
    } catch { setError("An unexpected error occurred."); }
    finally { setLoading(false); }
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    setError("");
    if (!editTitle.trim()) { setError("Task title is required."); return; }

    let resolvedCategory = editCategory;
    if (editCategory === "other") {
      if (!editCustomCategory.trim()) {
        setError("Please specify a custom category name.");
        return;
      }
      resolvedCategory = editCustomCategory.trim();
    }

    setLoading(true);
    try {
      const res = await updateTaskAction(selectedTask.id, { 
        title: editTitle, 
        description: editDescription, 
        category: resolvedCategory, 
        dueDate: editDueDate || undefined,
        ceremonyId: editCeremonyId || null,
        assignedUserId: editAssignedUserId || null,
        categoryData: Object.keys(editCategoryAnswers).length > 0 ? JSON.stringify(editCategoryAnswers) : null,
        cateringMenuId: editCateringMenuId || null,
      });
      if (res?.error) { setError(res.error); }
      else {
        setTasksList((prev) => 
          prev.map((t) => 
            t.id === selectedTask.id 
              ? { 
                  ...t, 
                  title: editTitle, 
                  description: editDescription || null, 
                  category: resolvedCategory, 
                  dueDate: editDueDate ? new Date(editDueDate) : null,
                  ceremonyId: editCeremonyId || null,
                  assignedUserId: editAssignedUserId || null,
                  categoryData: Object.keys(editCategoryAnswers).length > 0 ? JSON.stringify(editCategoryAnswers) : null,
                  cateringMenuId: editCateringMenuId || null,
                } 
              : t
          )
        );
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

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await createColumnAction({ name: newColName, color: newColColor });
      if (res?.error) {
        setError(res.error);
      } else {
        setIsAddColOpen(false);
        setNewColName("");
        setNewColColor("#6771ab");
        setToast({ message: "Column added.", type: "success" });
        window.location.reload();
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCol || !editColName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await updateColumnAction(selectedCol.id, { name: editColName, color: editColColor });
      if (res?.error) {
        setError(res.error);
      } else {
        setColumnsList((prev) => prev.map((c) => c.id === selectedCol.id ? { ...c, name: editColName, color: editColColor } : c));
        setIsEditColOpen(false);
        setSelectedCol(null);
        setToast({ message: "Column updated.", type: "success" });
        window.location.reload();
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColumn = async (colId: string) => {
    const hasTasks = tasksList.some((t) => t.status === colId);
    if (hasTasks) {
      setToast({ message: "Cannot delete column containing tasks. Please move them first.", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await deleteColumnAction(colId);
      if (res?.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setColumnsList((prev) => prev.filter((c) => c.id !== colId));
        setToast({ message: "Column deleted.", type: "success" });
        setIsEditColOpen(false);
        setSelectedCol(null);
        window.location.reload();
      }
    } catch {
      setToast({ message: "Failed to delete column.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleMoveColumn = async (direction: "left" | "right", colId: string) => {
    const index = columnsList.findIndex((c) => c.id === colId);
    if (index === -1) return;
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columnsList.length) return;

    const updatedCols = [...columnsList];
    const temp = updatedCols[index];
    updatedCols[index] = updatedCols[targetIndex];
    updatedCols[targetIndex] = temp;

    setColumnsList(updatedCols);

    try {
      const res = await reorderColumnsAction(updatedCols.map((c) => c.id));
      if (res?.error) {
        setToast({ message: res.error, type: "error" });
        setColumnsList(columnsList); // revert
      } else {
        setToast({ message: "Column reordered.", type: "success" });
      }
    } catch {
      setToast({ message: "Failed to reorder columns.", type: "error" });
      setColumnsList(columnsList); // revert
    }
  };

  const isOverdue = (date: Date | null, status: string) => {
    if (!date) return false;
    const doneCol = columnsList.find((col) => col.type === "done");
    const isDone = doneCol ? status === doneCol.id : status === "done";
    return !isDone && new Date(date) < new Date();
  };

  const isPredefinedCategory = (cat: string) => {
    return ["venue", "catering", "decor", "apparel", "invitations", "music", "ceremonies"].includes(cat);
  };

  const getCategoryDisplayName = (cat: string) => {
    if (cat === "ceremonies") return "Ceremonies";
    if (cat === "decor") return "Decoration";
    const dbCat = dbCategories.find(c => c.key === cat);
    if (dbCat) return dbCat.name;
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const totalTasks = tasksList.length;
  const doneCol = columnsList.find((c) => c.type === "done");
  const doneTasks = tasksList.filter(t => doneCol ? t.status === doneCol.id : t.status === "done").length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const createQuestions = getFollowUpQuestions(category);
  const editQuestions = getFollowUpQuestions(editCategory);

  return (
    <div className="flex flex-col h-full font-sans">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Wedding Task Planner</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">Click a card to edit · Drag to change status</p>
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
            <span className="text-[11px] font-bold text-slate-600 font-sans">{progress}%</span>
            <span className="text-[11px] text-slate-400 font-sans">{doneTasks}/{totalTasks}</span>
          </div>
          <button
            onClick={() => {
              setCategory("other");
              setCustomCategory("");
              setCategoryAnswers({});
              setIsCreateOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6771ab] to-[#2d336b] text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all font-sans"
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
        <div className="flex gap-1 overflow-x-auto pb-1">
          {columnsList.map((col) => {
            const isActive = activeMobileCol === col.id;
            const count = tasksList.filter((t) => t.status === col.id).length;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setActiveMobileCol(col.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-white text-[#2d336b] shadow-sm ring-1 ring-black/5"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span className="flex items-center gap-1 font-sans">
                  <span className="text-sm">{getColumnIcon(col.type)}</span>
                  <span className="truncate max-w-[80px]">{col.name}</span>
                </span>
                <span 
                  className={`mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold font-sans transition-all ${
                    isActive
                      ? "bg-[#6771ab] text-white"
                      : "bg-slate-200/80 text-slate-600"
                  }`}
                  style={isActive ? { backgroundColor: col.color } : {}}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Columns ── */}
      <div className="flex flex-col md:flex-row gap-5 md:overflow-x-auto pb-6 select-none items-start">
        {columnsList.map((col) => {
          const colTasks = tasksList.filter((t) => t.status === col.id);
          const isDragTarget = dragOverCol === col.id;
          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`w-full md:w-[300px] shrink-0 rounded-2xl flex flex-col border transition-all duration-200 ${
                col.id === activeMobileCol ? "flex" : "hidden md:flex"
              } ${
                isDragTarget ? "ring-2 ring-[#6771ab] ring-offset-2 scale-[1.01]" : ""
              }`}
              style={{ backgroundColor: `${col.color}08`, borderColor: `${col.color}20` }}
            >
              {/* Column header */}
              <div 
                className="rounded-t-2xl px-4 py-3 flex items-center text-white"
                style={{ backgroundColor: col.color }}
              >
                <h3 className="font-bold text-sm tracking-wide flex items-center gap-2 font-sans">
                  <span className="text-base">{getColumnIcon(col.type)}</span>
                  <span>{col.name}</span>
                </h3>
                <span className="ml-auto mr-1.5 bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm font-sans">
                  {colTasks.length}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCol(col);
                    setEditColName(col.name);
                    setEditColColor(col.color);
                    setIsEditColOpen(true);
                  }}
                  className="p-1 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  title="Column Settings"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>

              {/* Cards area */}
              <div
                className="flex-1 rounded-b-2xl p-3 space-y-2.5 min-h-[520px] overflow-y-auto"
              >
                {colTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div 
                      className="w-12 h-12 rounded-2xl bg-white/60 border border-dashed border-slate-300 flex items-center justify-center mb-3 text-xl"
                      style={{ borderColor: `${col.color}40` }}
                    >
                      {getColumnIcon(col.type)}
                    </div>
                    <p className="text-xs text-slate-400 font-medium font-sans">Drop tasks here</p>
                  </div>
                )}

                {colTasks.map((task) => {
                  const overdue = isOverdue(task.dueDate, task.status);
                  const isPredefined = isPredefinedCategory(task.category);
                  const catKey = isPredefined ? task.category : "other";
                  const catStyle = CATEGORY_STYLES[catKey] ?? CATEGORY_STYLES.other;

                  const assignedUser = teamMembers.find((m) => m.id === task.assignedUserId);
                  const associatedCeremony = ceremonies.find((c) => c.id === task.ceremonyId);

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onClick={() => {
                        setSelectedTask(task);
                        setEditTitle(task.title);
                        setEditDescription(task.description || "");
                        
                        if (isPredefined) {
                          setEditCategory(task.category);
                          setEditCustomCategory("");
                        } else {
                          setEditCategory("other");
                          setEditCustomCategory(task.category);
                        }

                        setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
                        setEditCeremonyId(task.ceremonyId || "");
                        setEditAssignedUserId(task.assignedUserId || "");
                        setEditCateringMenuId(task.cateringMenuId || "");
                        try {
                          setEditCategoryAnswers(task.categoryData ? JSON.parse(task.categoryData) : {});
                        } catch {
                          setEditCategoryAnswers({});
                        }
                        setIsEditOpen(true);
                      }}
                      className={`group relative bg-white rounded-xl p-3.5 shadow-sm border cursor-grab active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 ${
                        overdue ? "border-red-300 bg-red-50/30" : "border-slate-200"
                      }`}
                    >
                      {/* Delete button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                        className="absolute top-2.5 right-2.5 p-1 text-slate-300 hover:text-[#ef4444] hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all outline-none z-10"
                        title="Delete task"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      {/* Overdue banner */}
                      {overdue && (
                        <div className="flex items-center gap-1 mb-2 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 rounded-lg px-2 py-0.5 font-sans">
                          <span>⚠️</span> Overdue
                        </div>
                      )}

                      <h4 className="font-semibold text-[13px] text-slate-800 pr-6 leading-snug break-words font-sans">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-sans">
                          {task.description}
                        </p>
                      )}

                      {/* Associated details */}
                      <div className="flex flex-col gap-1 mt-2 text-[10px] text-slate-500 font-sans">
                        {associatedCeremony && (
                          <span className="flex items-center gap-1 bg-[#6771ab]/10 text-[#2d336b] px-2 py-0.5 rounded-full w-fit font-semibold">
                            🎉 {associatedCeremony.name}
                          </span>
                        )}
                        {assignedUser && (
                          <span className="flex items-center gap-1 text-slate-600 font-medium">
                            👤 Assigned: {assignedUser.name}
                          </span>
                        )}
                      </div>

                      {/* Follow-up question answers details */}
                      {task.categoryData && (
                        <div className="mt-2 text-[10px] bg-slate-50 border border-slate-200/50 rounded-lg p-2 space-y-0.5">
                          {Object.entries(JSON.parse(task.categoryData)).map(([key, val]) => {
                            const questionList = getFollowUpQuestions(task.category);
                            const question = questionList.find(q => q.id === key);
                            const label = question ? question.label : key;
                            return (
                              <div key={key} className="text-slate-600 font-sans leading-tight">
                                <strong>{label}:</strong> {String(val)}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Footer row */}
                      <div className="flex flex-col gap-2 mt-3 pt-2.5 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${catStyle.bg} ${catStyle.text} font-sans`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${catStyle.dot}`} />
                            {getCategoryDisplayName(task.category)}
                          </span>
                          {task.dueDate && (
                            <span className={`text-[10px] font-medium font-sans ${overdue ? "text-red-500" : "text-slate-400"}`}>
                              📅 {new Date(task.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                          )}
                          {task.isCustom && (
                            <span className="text-[10px] font-semibold text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded-full font-sans">Custom</span>
                          )}
                        </div>
                        
                        <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-sans">Status</span>
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
                            className="bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 rounded-lg px-1.5 py-0.5 outline-none focus-visible:ring-1 focus-visible:ring-[#6771ab] cursor-pointer hover:bg-slate-100 transition-colors font-sans"
                          >
                            {columnsList.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
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

        {/* Add Column Button Card */}
        <div 
          onClick={() => setIsAddColOpen(true)}
          className="w-full md:w-[300px] shrink-0 border-2 border-dashed border-slate-300 hover:border-[#6771ab] hover:bg-slate-50 rounded-2xl flex flex-col items-center justify-center p-6 min-h-[150px] transition-all cursor-pointer group"
        >
          <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">➕</span>
          <span className="text-sm font-bold text-slate-600 font-sans">Add Column</span>
        </div>
      </div>

      {/* ── Create Task Dialog ── */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Task Title</label>
            <Input type="text" placeholder="e.g. Call wedding cake designer" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={loading} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Description</label>
            <Input type="text" placeholder="Provide more context (optional)" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Category</label>
              <Select 
                value={category} 
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCategoryAnswers({});
                }} 
                disabled={loading}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "ceremonies" ? "Ceremonies" : (c === "decor" ? "Decoration" : c.charAt(0).toUpperCase() + c.slice(1))}
                  </option>
                ))}
                {dbCategories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Due Date</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={loading} />
            </div>
          </div>

          {/* Custom Category Input if "Other" is selected */}
          {category === "other" && (
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Custom Category Name</label>
              <Input
                type="text"
                placeholder="e.g. Photography, Makeup, Transport"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          {/* Ceremony & Assignee Associations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Associated Ceremony</label>
              <select
                value={ceremonyId}
                onChange={(e) => setCeremonyId(e.target.value)}
                disabled={loading}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6771ab]"
              >
                <option value="">None (General Task)</option>
                {ceremonies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
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
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {category === "catering" && (
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Link to Catering Menu</label>
              {cateringMenus.length > 0 ? (
                <select
                  value={cateringMenuId}
                  onChange={(e) => setCateringMenuId(e.target.value)}
                  disabled={loading}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6771ab]"
                >
                  <option value="">Do not link (General Catering Task)</option>
                  {cateringMenus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.cuisine || "Catering Menu"} (Ceremony: {getCeremonyName(m.ceremonyId)})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-slate-500 font-sans">
                  No catering menus have been planned yet. You can plan one in the{" "}
                  <a href="/dashboard/menu-plan" className="text-[#6771ab] hover:underline font-semibold">
                    Catering Menu Planner
                  </a>.
                </p>
              )}
            </div>
          )}

          {/* Dynamic Follow-up Questions */}
          {createQuestions.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <p className="text-[11px] font-bold text-[#6771ab] uppercase tracking-wider mb-2">Category Follow-up Details</p>
              {createQuestions.map((q) => (
                <div key={q.id}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{q.label}</label>
                  {q.type === "select" ? (
                    <select
                      value={categoryAnswers[q.id] || ""}
                      onChange={(e) => setCategoryAnswers({ ...categoryAnswers, [q.id]: e.target.value })}
                      disabled={loading}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6771ab]"
                    >
                      <option value="">Select option...</option>
                      {q.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type="text"
                      placeholder={`Enter ${q.label.toLowerCase()}`}
                      value={categoryAnswers[q.id] || ""}
                      onChange={(e) => setCategoryAnswers({ ...categoryAnswers, [q.id]: e.target.value })}
                      disabled={loading}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {error && <div className="p-3 bg-red-50 border border-red-200 text-[#ef4444] rounded-xl text-xs">{error}</div>}
          
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>{loading ? "Creating..." : "Save Task"}</Button>
          </div>
        </form>
      </Dialog>

      {/* ── Edit Task Dialog ── */}
      <Dialog isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedTask(null); }} title={`Edit: ${selectedTask?.title ?? "Task"}`}>
        <form onSubmit={handleEditTask} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Task Title</label>
            <Input type="text" placeholder="Task title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required disabled={loading} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Description</label>
            <Input type="text" placeholder="Provide more context (optional)" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} disabled={loading} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Category</label>
              <Select 
                value={editCategory} 
                onChange={(e) => {
                  setEditCategory(e.target.value);
                  setEditCategoryAnswers({});
                }} 
                disabled={loading}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "ceremonies" ? "Ceremonies" : (c === "decor" ? "Decoration" : c.charAt(0).toUpperCase() + c.slice(1))}
                  </option>
                ))}
                {dbCategories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Due Date</label>
              <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} disabled={loading} />
            </div>
          </div>

          {/* Custom Category Input if "Other" is selected */}
          {editCategory === "other" && (
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Custom Category Name</label>
              <Input
                type="text"
                placeholder="e.g. Photography, Makeup, Transport"
                value={editCustomCategory}
                onChange={(e) => setEditCustomCategory(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          {/* Ceremony & Assignee Associations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Associated Ceremony</label>
              <select
                value={editCeremonyId}
                onChange={(e) => setEditCeremonyId(e.target.value)}
                disabled={loading}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6771ab]"
              >
                <option value="">None (General Task)</option>
                {ceremonies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Assigned Team Member</label>
              <select
                value={editAssignedUserId}
                onChange={(e) => setEditAssignedUserId(e.target.value)}
                disabled={loading}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6771ab]"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {editCategory === "catering" && (
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Link to Catering Menu</label>
                {cateringMenus.length > 0 ? (
                  <select
                    value={editCateringMenuId}
                    onChange={(e) => setEditCateringMenuId(e.target.value)}
                    disabled={loading}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6771ab]"
                  >
                    <option value="">Do not link (General Catering Task)</option>
                    {cateringMenus.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.cuisine || "Catering Menu"} (Ceremony: {getCeremonyName(m.ceremonyId)})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-slate-500 font-sans">
                    No catering menus have been planned yet. You can plan one in the{" "}
                    <a href="/dashboard/menu-plan" className="text-[#6771ab] hover:underline font-semibold">
                      Catering Menu Planner
                    </a>.
                  </p>
                )}
              </div>
              {editCateringMenuId && (
                <div className="text-xs">
                  <a href="/dashboard/menu-plan" className="text-[#6771ab] hover:underline font-semibold">
                    → View Linked Menu Plan
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Dynamic Follow-up Questions */}
          {editQuestions.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <p className="text-[11px] font-bold text-[#6771ab] uppercase tracking-wider mb-2">Category Follow-up Details</p>
              {editQuestions.map((q) => (
                <div key={q.id}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{q.label}</label>
                  {q.type === "select" ? (
                    <select
                      value={editCategoryAnswers[q.id] || ""}
                      onChange={(e) => setEditCategoryAnswers({ ...editCategoryAnswers, [q.id]: e.target.value })}
                      disabled={loading}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6771ab]"
                    >
                      <option value="">Select option...</option>
                      {q.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type="text"
                      placeholder={`Enter ${q.label.toLowerCase()}`}
                      value={editCategoryAnswers[q.id] || ""}
                      onChange={(e) => setEditCategoryAnswers({ ...editCategoryAnswers, [q.id]: e.target.value })}
                      disabled={loading}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {error && <div className="p-3 bg-red-50 border border-red-200 text-[#ef4444] rounded-xl text-xs">{error}</div>}
          
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
            <Button type="button" variant="ghost" onClick={() => { setIsEditOpen(false); setSelectedTask(null); }} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </Dialog>

      {/* ── Add Column Dialog ── */}
      <Dialog isOpen={isAddColOpen} onClose={() => setIsAddColOpen(false)} title="Add New Column">
        <form onSubmit={handleAddColumn} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Column Name</label>
            <Input type="text" placeholder="e.g. Needs Review" value={newColName} onChange={(e) => setNewColName(e.target.value)} required disabled={loading} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Column Theme Color</label>
            <div className="flex items-center gap-3">
              <Input type="color" value={newColColor} onChange={(e) => setNewColColor(e.target.value)} className="w-16 h-10 p-1 cursor-pointer" disabled={loading} />
              <Input type="text" placeholder="#6771ab" value={newColColor} onChange={(e) => setNewColColor(e.target.value)} className="flex-1" disabled={loading} />
            </div>
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-200 text-[#ef4444] rounded-xl text-xs">{error}</div>}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddColOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>{loading ? "Adding..." : "Save Column"}</Button>
          </div>
        </form>
      </Dialog>

      {/* ── Edit Column Dialog ── */}
      <Dialog isOpen={isEditColOpen} onClose={() => { setIsEditColOpen(false); setSelectedCol(null); }} title={`Column Settings: ${selectedCol?.name ?? ""}`}>
        <form onSubmit={handleEditColumn} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Column Name</label>
            <Input type="text" placeholder="Column name" value={editColName} onChange={(e) => setEditColName(e.target.value)} required disabled={loading} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Column Theme Color</label>
            <div className="flex items-center gap-3">
              <Input type="color" value={editColColor} onChange={(e) => setEditColColor(e.target.value)} className="w-16 h-10 p-1 cursor-pointer" disabled={loading} />
              <Input type="text" placeholder="#6771ab" value={editColColor} onChange={(e) => setEditColColor(e.target.value)} className="flex-1" disabled={loading} />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-2">Reorder Column</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (selectedCol) {
                    handleMoveColumn("left", selectedCol.id);
                    setIsEditColOpen(false);
                  }
                }}
                disabled={columnsList.findIndex(c => c.id === selectedCol?.id) === 0}
                className="flex-1"
              >
                ⬅️ Move Left
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (selectedCol) {
                    handleMoveColumn("right", selectedCol.id);
                    setIsEditColOpen(false);
                  }
                }}
                disabled={columnsList.findIndex(c => c.id === selectedCol?.id) === columnsList.length - 1}
                className="flex-1"
              >
                Move Right ➡️
              </Button>
            </div>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 text-[#ef4444] rounded-xl text-xs">{error}</div>}
          
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
            <Button 
              type="button" 
              variant="error" 
              onClick={() => {
                if (selectedCol) {
                  handleDeleteColumn(selectedCol.id);
                }
              }} 
              disabled={loading}
            >
              Delete Column
            </Button>
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" onClick={() => { setIsEditColOpen(false); setSelectedCol(null); }} disabled={loading}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
            </div>
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

