"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "./actions";

interface Category {
  id: string;
  key: string;
  name: string;
  followUpQuestions: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoriesAdminClientProps {
  initialCategories: Category[];
}

export default function CategoriesAdminClient({
  initialCategories,
}: CategoriesAdminClientProps) {
  const [categories, setCategories] = React.useState<Category[]>(initialCategories);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Form fields
  const [key, setKey] = React.useState("");
  const [name, setName] = React.useState("");
  const [followUpQuestions, setFollowUpQuestions] = React.useState("[]");

  // Sync state with props using a structural ID comparison to avoid raw reference check and render ref write.
  const [prevInitialCategories, setPrevInitialCategories] = React.useState(initialCategories);
  const initialIdsStr = initialCategories.map((c) => c.id).join(",");
  const prevIdsStr = prevInitialCategories.map((c) => c.id).join(",");
  if (initialIdsStr !== prevIdsStr) {
    setCategories(initialCategories);
    setPrevInitialCategories(initialCategories);
  }

  const handleOpenAdd = () => {
    setSelectedCategory(null);
    setKey("");
    setName("");
    setFollowUpQuestions("[]");
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setSelectedCategory(c);
    setKey(c.key);
    setName(c.name);
    setFollowUpQuestions(c.followUpQuestions || "[]");
    setError(null);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (c: Category) => {
    setSelectedCategory(c);
    setIsDeleteOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = {
      key: key.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
      name: name.trim(),
      followUpQuestions: followUpQuestions.trim() || undefined,
    };

    if (!data.key || !data.name) {
      setError("Key and Name are required.");
      setLoading(false);
      return;
    }

    try {
      let res;
      if (selectedCategory) {
        res = await updateCategoryAction(selectedCategory.id, data);
      } else {
        res = await createCategoryAction(data);
      }

      if (res?.error) {
        setError(res.error);
      } else {
        setIsFormOpen(false);
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
    if (!selectedCategory) return;
    setLoading(true);
    try {
      const res = await deleteCategoryAction(selectedCategory.id);
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

  const getQuestionCount = (jsonStr: string | null) => {
    if (!jsonStr) return "0 questions";
    try {
      const parsed = JSON.parse(jsonStr);
      const len = Array.isArray(parsed) ? parsed.length : 0;
      return `${len} question${len === 1 ? "" : "s"}`;
    } catch {
      return "Invalid JSON";
    }
  };

  return (
    <main className="w-full max-w-7xl mr-auto p-6 md:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Categories Administration</h1>
          <p className="text-sm text-slate-500 mt-1">Manage categories and their dynamic follow-up questions for tasks.</p>
        </div>
        <Button onClick={handleOpenAdd} className="rounded-xl shadow-md">
          Add Category
        </Button>
      </div>

      <Card className="overflow-hidden bg-white shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Key</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Questions count</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                    No categories found. Create one to get started!
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">{c.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6771ab] font-mono">{c.key}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-violet-50 text-[#2d336b]">
                        {getQuestionCount(c.followUpQuestions)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="text-[#6771ab] hover:text-[#566198] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenDelete(c)}
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
        title={selectedCategory ? "Edit Category" : "Add New Category"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Category Name</label>
            <Input
              type="text"
              placeholder="e.g. Venue"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Key</label>
            <Input
              type="text"
              placeholder="e.g. venue"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              disabled={!!selectedCategory}
              required
            />
            {!selectedCategory && (
              <p className="text-[10px] text-slate-400">Unique lowercase identifier, alphanumeric only.</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Follow-Up Questions (JSON Array)
            </label>
            <textarea
              className="w-full h-48 p-3 text-xs font-mono border border-slate-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#6771ab] transition-all bg-slate-50"
              value={followUpQuestions}
              onChange={(e) => setFollowUpQuestions(e.target.value)}
              placeholder='[{"id":"food_served","label":"Is food served?","type":"boolean"},{"id":"dress_code","label":"Dress code","type":"text"}]'
            />
            <p className="text-[10px] text-slate-400">JSON array of question definitions containing &quot;id&quot;, &quot;label&quot;, and &quot;type&quot; (e.g. &quot;text&quot;, &quot;boolean&quot;, &quot;number&quot;, etc.).</p>
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
              {loading ? "Saving..." : "Save Category"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${selectedCategory?.name}"? This action cannot be undone.`}
        loading={loading}
      />
    </main>
  );
}
