"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Toast } from "@/components/ui/toast";
import { Edit2, Trash2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  persona: string;
  weddingAccess: string;
  createdAt: Date;
}

interface Wedding {
  id: string;
  partnerA: string;
  partnerB: string;
}

interface UserTableClientProps {
  users: User[];
  weddings: Wedding[];
  adminPersona: string;
  editAction: (
    userId: string,
    name: string,
    role: string,
    persona: string,
    weddingAccess: string
  ) => Promise<{ success?: boolean; error?: string }>;
  deleteAction: (userId: string) => Promise<{ success?: boolean; error?: string }>;
}

export default function UserTableClient({
  users,
  weddings,
  adminPersona,
  editAction,
  deleteAction,
}: UserTableClientProps) {
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [deletingUser, setDeletingUser] = React.useState<User | null>(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // Edit form states
  const [editName, setEditName] = React.useState("");
  const [editRole, setEditRole] = React.useState("");
  const [editPersona, setEditPersona] = React.useState("");
  const [editWeddingAccess, setEditWeddingAccess] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditRole(user.role);
    setEditPersona(user.persona || "diy");
    setEditWeddingAccess(user.weddingAccess || "all");
    setError(null);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await editAction(
        editingUser.id,
        editName,
        editRole,
        editPersona,
        editWeddingAccess
      );
      if (res.error) {
        setError(res.error);
        setToast({ message: res.error, type: "error" });
      } else {
        setToast({ message: "User updated successfully!", type: "success" });
        setIsEditDialogOpen(false);
        setEditingUser(null);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update user.";
      setError(msg);
      setToast({ message: msg, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      const res = await deleteAction(deletingUser.id);
      if (res.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setToast({ message: "User deleted successfully!", type: "success" });
        setIsDeleteDialogOpen(false);
        setDeletingUser(null);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete user.";
      setToast({ message: msg, type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Persona</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Created At</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{u.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex px-2 py-0.5 rounded-sm text-xs font-semibold ${
                    u.role === "admin"
                      ? "bg-violet-100 text-[#2d336b]"
                      : u.role === "client"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 capitalize">
                  {u.persona ? u.persona.replace("_", " ") : "diy"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Edit User"
                    onClick={() => handleEditClick(u)}
                  >
                    <Edit2 className="h-4 w-4 text-slate-500 hover:text-[#6771ab]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete User"
                    onClick={() => handleDeleteClick(u)}
                  >
                    <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Dialog */}
      <Dialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsEditDialogOpen(false);
            setEditingUser(null);
          }
        }}
        title="Edit Team Member"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">
              Full Name
            </label>
            <Input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">
              User Persona
            </label>
            <Select
              value={editPersona}
              onChange={(e) => setEditPersona(e.target.value)}
              required
              disabled={isSubmitting}
            >
              <option value="diy">Plan My Wedding (DIY)</option>
              <option value="wedding_planner">Wedding Planner</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">
              Assign Role
            </label>
            <Select
              value={editRole}
              onChange={(e) => {
                const newRole = e.target.value;
                setEditRole(newRole);
                if (newRole === "client" && editWeddingAccess === "all") {
                  setEditWeddingAccess("");
                }
              }}
              required
              disabled={isSubmitting}
            >
              <option value="user">User</option>
              {adminPersona === "wedding_planner" && (
                <>
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </>
              )}
            </Select>
          </div>

          {editRole !== "admin" && (
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">
                Assigned Wedding(s)
              </label>
              {editRole === "client" ? (
                <Select
                  value={editWeddingAccess}
                  onChange={(e) => setEditWeddingAccess(e.target.value)}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select a Wedding</option>
                  {weddings.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.partnerA} & {w.partnerB}
                    </option>
                  ))}
                </Select>
              ) : (
                <Select
                  value={editWeddingAccess}
                  onChange={(e) => setEditWeddingAccess(e.target.value)}
                  required
                  disabled={isSubmitting}
                >
                  <option value="all">All Weddings</option>
                  {weddings.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.partnerA} & {w.partnerB}
                    </option>
                  ))}
                </Select>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingUser(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(false);
            setDeletingUser(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Team Member"
        message={`Are you sure you want to delete ${deletingUser?.name}? This will permanently remove their access and details. This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={isDeleting}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
