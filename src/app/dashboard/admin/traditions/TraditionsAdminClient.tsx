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
  const [seedTasks, setSeedTasks] = React.useState("[]");
  const [seedCeremonies, setSeedCeremonies] = React.useState("[]");

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
    setSeedTasks("[]");
    setSeedCeremonies("[]");
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (t: Tradition) => {
    setSelectedTradition(t);
    setKey(t.key);
    setName(t.name);
    setDescription(t.description || "");
    setSeedTasks(t.seedTasks || "[]");
    setSeedCeremonies(t.seedCeremonies || "[]");
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
      seedTasks: seedTasks.trim() || undefined,
      seedCeremonies: seedCeremonies.trim() || undefined,
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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Seed Tasks (JSON Array)
            </label>
            <textarea
              className="w-full h-32 p-3 text-xs font-mono border border-slate-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#6771ab] transition-all bg-slate-50"
              value={seedTasks}
              onChange={(e) => setSeedTasks(e.target.value)}
              placeholder='[{"title": "Book Venue", "category": "venue"}]'
            />
            <p className="text-[10px] text-slate-400">JSON array of tasks containing &quot;title&quot; and &quot;category&quot; keys.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Seed Ceremonies (JSON Array)
            </label>
            <textarea
              className="w-full h-32 p-3 text-xs font-mono border border-slate-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#6771ab] transition-all bg-slate-50"
              value={seedCeremonies}
              onChange={(e) => setSeedCeremonies(e.target.value)}
              placeholder='[{"name": "Mehndi", "description": "Henna party", "offsetDays": -2, "startHour": 14, "startMin": 0, "endHour": 18, "endMin": 0}]'
            />
            <p className="text-[10px] text-slate-400">JSON array of ceremonies. Can contain &quot;offsetDays&quot;, &quot;startHour&quot;, &quot;startMin&quot;, &quot;endHour&quot;, &quot;endMin&quot;, &quot;name&quot;, &quot;description&quot;.</p>
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
