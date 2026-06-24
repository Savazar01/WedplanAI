"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  createTraditionAction,
  updateTraditionAction,
  deleteTraditionAction,
} from "./actions";

interface SeedTask {
  title: string;
  category: string;
  ceremonyName?: string;
}

interface SeedCeremony {
  name: string;
  description: string;
  offsetDays: number;
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
}

interface Tradition {
  id: string;
  key: string;
  name: string;
  description: string | null;
  seedTasks: string | null;
  seedCeremonies: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TraditionsAdminClientProps {
  initialTraditions: Tradition[];
}

const AVAILABLE_CATEGORIES = [
  "venue",
  "catering",
  "attire",
  "decor",
  "photography",
  "music",
  "transportation",
  "flowers",
  "invitations",
  "ceremony",
  "honeymoon",
  "beauty",
  "stationery",
  "gifts",
  "accommodation",
  "other",
];

export default function TraditionsAdminClient({
  initialTraditions,
}: TraditionsAdminClientProps) {
  const [traditions, setTraditions] = React.useState<Tradition[]>(initialTraditions);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedTradition, setSelectedTradition] = React.useState<Tradition | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Form fields
  const [key, setKey] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [seedTaskRows, setSeedTaskRows] = React.useState<SeedTask[]>([]);
  const [seedCeremonyRows, setSeedCeremonyRows] = React.useState<SeedCeremony[]>([]);

  // Sync state with props using a structural ID comparison to avoid raw reference check and render ref write.
  const [prevInitialTraditions, setPrevInitialTraditions] = React.useState(initialTraditions);
  const initialIdsStr = initialTraditions.map((t) => t.id).join(",");
  const prevIdsStr = prevInitialTraditions.map((t) => t.id).join(",");
  if (initialIdsStr !== prevIdsStr) {
    setTraditions(initialTraditions);
    setPrevInitialTraditions(initialTraditions);
  }

  const handleOpenAdd = () => {
    setSelectedTradition(null);
    setKey("");
    setName("");
    setDescription("");
    setSeedTaskRows([]);
    setSeedCeremonyRows([]);
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (t: Tradition) => {
    setSelectedTradition(t);
    setKey(t.key);
    setName(t.name);
    setDescription(t.description || "");

    let parsedTasks: SeedTask[] = [];
    try {
      if (t.seedTasks) {
        parsedTasks = JSON.parse(t.seedTasks);
      }
    } catch (e) {
      console.error("Error parsing seedTasks:", e);
    }
    setSeedTaskRows(parsedTasks);

    let parsedCeremonies: SeedCeremony[] = [];
    try {
      if (t.seedCeremonies) {
        parsedCeremonies = JSON.parse(t.seedCeremonies);
      }
    } catch (e) {
      console.error("Error parsing seedCeremonies:", e);
    }
    setSeedCeremonyRows(parsedCeremonies);

    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (t: Tradition) => {
    setSelectedTradition(t);
    setIsDeleteOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = {
      key: key.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
      name: name.trim(),
      description: description.trim() || undefined,
      seedTasks: seedTaskRows.length > 0 ? JSON.stringify(seedTaskRows) : "[]",
      seedCeremonies: seedCeremonyRows.length > 0 ? JSON.stringify(seedCeremonyRows) : "[]",
    };

    if (!data.key || !data.name) {
      setError("Key and Name are required.");
      setLoading(false);
      return;
    }

    try {
      let res;
      if (selectedTradition) {
        res = await updateTraditionAction(selectedTradition.id, data);
      } else {
        res = await createTraditionAction(data);
      }

      if (res?.error) {
        setError(res.error);
      } else {
        setIsFormOpen(false);
        // Optimistically update list or let refresh update it
        // We'll rely on the server action path revalidation, but since we are client state synced, let's reload/update local state too:
        window.location.reload();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTradition) return;
    setLoading(true);
    try {
      const res = await deleteTraditionAction(selectedTradition.id);
      if (res?.error) {
        alert(res.error);
      } else {
        setIsDeleteOpen(false);
        window.location.reload();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const getCountString = (jsonStr: string | null) => {
    if (!jsonStr) return "0 items";
    try {
      const parsed = JSON.parse(jsonStr);
      const len = Array.isArray(parsed) ? parsed.length : 0;
      return `${len} item${len === 1 ? "" : "s"}`;
    } catch {
      return "Invalid JSON";
    }
  };

  return (
    <main className="w-full max-w-7xl mr-auto p-6 md:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Traditions Administration</h1>
          <p className="text-sm text-slate-500 mt-1">Manage traditions that users can select to pre-populate their wedding tasks and ceremonies.</p>
        </div>
        <Button onClick={handleOpenAdd} className="rounded-xl shadow-md">
          Add Tradition
        </Button>
      </div>

      <Card className="overflow-hidden bg-white shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Key</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Description</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Tasks Seed</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Ceremonies Seed</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {traditions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    No traditions found. Create one to get started!
                  </td>
                </tr>
              ) : (
                traditions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{t.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6771ab] font-mono">{t.key}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{t.description || "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-blue-50 text-blue-700">
                        {getCountString(t.seedTasks)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-purple-50 text-purple-700">
                        {getCountString(t.seedCeremonies)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="text-[#6771ab] hover:text-[#566198] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenDelete(t)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Form Dialog */}
      <Dialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedTradition ? "Edit Tradition" : "Add New Tradition"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Tradition Name</label>
            <Input
              type="text"
              placeholder="e.g. Parsi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Key</label>
            <Input
              type="text"
              placeholder="e.g. parsi"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              disabled={!!selectedTradition}
              required
            />
            {!selectedTradition && (
              <p className="text-[10px] text-slate-400">Unique lowercase identifier, alphanumeric only.</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Description</label>
            <Input
              type="text"
              placeholder="Brief description of the tradition..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Seed Ceremonies
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setSeedCeremonyRows([...seedCeremonyRows, { name: "", description: "", offsetDays: 0, startHour: 12, startMin: 0, endHour: 13, endMin: 0 }])}
                className="h-7 px-2 text-xs"
              >
                + Add Ceremony
              </Button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {seedCeremonyRows.map((row, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 relative">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 flex gap-2">
                      <div className="flex-1">
                        <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Name</label>
                        <Input
                          type="text"
                          placeholder="Ceremony Name (e.g. Sangeet)"
                          value={row.name}
                          onChange={(e) => {
                            const newRows = [...seedCeremonyRows];
                            newRows[idx].name = e.target.value;
                            setSeedCeremonyRows(newRows);
                          }}
                          required
                          className="h-8 text-xs bg-white"
                        />
                      </div>
                      <div className="w-24">
                        <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Offset Days</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={row.offsetDays}
                          onChange={(e) => {
                            const newRows = [...seedCeremonyRows];
                            newRows[idx].offsetDays = Number(e.target.value);
                            setSeedCeremonyRows(newRows);
                          }}
                          className="h-8 text-xs bg-white"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSeedCeremonyRows(seedCeremonyRows.filter((_, i) => i !== idx));
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg text-xs self-end"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">Start Time</label>
                      <div className="flex gap-1">
                        <select
                          value={row.startHour}
                          onChange={(e) => {
                            const newRows = [...seedCeremonyRows];
                            newRows[idx].startHour = Number(e.target.value);
                            setSeedCeremonyRows(newRows);
                          }}
                          className="h-8 border border-slate-200 rounded-lg px-2 text-xs bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 flex-1"
                        >
                          {Array.from({ length: 24 }).map((_, i) => (
                            <option key={i} value={i}>
                              {String(i).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                        <span className="text-slate-400 self-center">:</span>
                        <select
                          value={row.startMin}
                          onChange={(e) => {
                            const newRows = [...seedCeremonyRows];
                            newRows[idx].startMin = Number(e.target.value);
                            setSeedCeremonyRows(newRows);
                          }}
                          className="h-8 border border-slate-200 rounded-lg px-2 text-xs bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 flex-1"
                        >
                          {[0, 15, 30, 45].map((m) => (
                            <option key={m} value={m}>
                              {String(m).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">End Time</label>
                      <div className="flex gap-1">
                        <select
                          value={row.endHour}
                          onChange={(e) => {
                            const newRows = [...seedCeremonyRows];
                            newRows[idx].endHour = Number(e.target.value);
                            setSeedCeremonyRows(newRows);
                          }}
                          className="h-8 border border-slate-200 rounded-lg px-2 text-xs bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 flex-1"
                        >
                          {Array.from({ length: 24 }).map((_, i) => (
                            <option key={i} value={i}>
                              {String(i).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                        <span className="text-slate-400 self-center">:</span>
                        <select
                          value={row.endMin}
                          onChange={(e) => {
                            const newRows = [...seedCeremonyRows];
                            newRows[idx].endMin = Number(e.target.value);
                            setSeedCeremonyRows(newRows);
                          }}
                          className="h-8 border border-slate-200 rounded-lg px-2 text-xs bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 flex-1"
                        >
                          {[0, 15, 30, 45].map((m) => (
                            <option key={m} value={m}>
                              {String(m).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Description (optional)</label>
                    <Input
                      type="text"
                      placeholder="e.g. Henna painting & music"
                      value={row.description}
                      onChange={(e) => {
                        const newRows = [...seedCeremonyRows];
                        newRows[idx].description = e.target.value;
                        setSeedCeremonyRows(newRows);
                      }}
                      className="h-8 text-xs bg-white"
                    />
                  </div>
                </div>
              ))}
              {seedCeremonyRows.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-2 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  No ceremonies added yet. Click &quot;+ Add Ceremony&quot; to start.
                </p>
              )}
            </div>
            <p className="text-[10px] text-slate-400">
              Ceremonies added here will populate the Wedding Ceremony Planner when this tradition is selected.
              Offset Days: 0 = wedding day, -1 = day before, -2 = two days before, 1 = day after.
            </p>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Seed Tasks
              </label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setSeedTaskRows([...seedTaskRows, { title: "", category: "other" }])}
                className="h-7 px-2 text-xs"
              >
                + Add Task
              </Button>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {seedTaskRows.map((row, idx) => (
                <div key={idx} className="flex gap-2 items-center p-2 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Input
                    type="text"
                    placeholder="Task Title (e.g. Book Venue)"
                    value={row.title}
                    onChange={(e) => {
                      const newRows = [...seedTaskRows];
                      newRows[idx].title = e.target.value;
                      setSeedTaskRows(newRows);
                    }}
                    required
                    className="h-8 text-xs flex-1 bg-white"
                  />
                  <select
                    value={row.category}
                    onChange={(e) => {
                      const newRows = [...seedTaskRows];
                      newRows[idx].category = e.target.value;
                      setSeedTaskRows(newRows);
                    }}
                    className="h-8 border border-slate-200 rounded-lg px-2 text-xs bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 min-w-[120px]"
                  >
                    {AVAILABLE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <select
                    value={row.ceremonyName || ""}
                    onChange={(e) => {
                      const newRows = [...seedTaskRows];
                      newRows[idx].ceremonyName = e.target.value || undefined;
                      setSeedTaskRows(newRows);
                    }}
                    className="h-8 border border-slate-200 rounded-lg px-2 text-xs bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 min-w-[120px]"
                  >
                    <option value="">No Ceremony</option>
                    {seedCeremonyRows
                      .filter((c) => c.name.trim())
                      .map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setSeedTaskRows(seedTaskRows.filter((_, i) => i !== idx));
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {seedTaskRows.length === 0 && (
                <p className="text-xs text-slate-400 italic text-center py-2 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  No tasks added yet. Click &quot;+ Add Task&quot; to start.
                </p>
              )}
            </div>
            <p className="text-[10px] text-slate-400">Tasks added here will be auto-created in the Wedding Task Planner when this tradition is selected.</p>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsFormOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Tradition"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Tradition"
        message={`Are you sure you want to delete the tradition "${selectedTradition?.name}"? This action cannot be undone.`}
        loading={loading}
      />
    </main>
  );
}
