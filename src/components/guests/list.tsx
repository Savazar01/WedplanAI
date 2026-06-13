"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createGuestAction, updateGuestRSVPAction, deleteGuestAction, updateGuestAction } from "@/app/actions/guests";

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  rsvpStatus: string;
  plusOneCount: number;
  dietaryRestrictions: string | null;
  loginCode: string;
}


interface ListProps {
  initialGuests: Guest[];
  weddingId?: string;
}

export default function GuestList({ initialGuests, weddingId }: ListProps) {
  const [guestsList, setGuestsList] = React.useState<Guest[]>(initialGuests);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [inviteGuest, setInviteGuest] = React.useState<Guest | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const showcaseLink = weddingId ? `${baseUrl}/wedding/${weddingId}` : "";

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [rsvpStatus, setRsvpStatus] = React.useState<"pending" | "attending" | "declined">("pending");
  const [plusOneCount, setPlusOneCount] = React.useState(0);
  const [dietaryRestrictions, setDietaryRestrictions] = React.useState("");
  
  const [editingGuest, setEditingGuest] = React.useState<Guest | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");
  const [editRsvpStatus, setEditRsvpStatus] = React.useState<"pending" | "attending" | "declined">("pending");
  const [editPlusOneCount, setEditPlusOneCount] = React.useState(0);
  const [editDietaryRestrictions, setEditDietaryRestrictions] = React.useState("");
  
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [deleteConfirm, setDeleteConfirm] = React.useState<Guest | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleStartEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setEditName(guest.name || "");
    setEditEmail(guest.email || "");
    setEditPhone(guest.phone || "");
    setEditRsvpStatus(guest.rsvpStatus as "pending" | "attending" | "declined");
    setEditPlusOneCount(guest.plusOneCount || 0);
    setEditDietaryRestrictions(guest.dietaryRestrictions || "");
  };

  const handleUpdateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;
    setError("");

    if (!editName.trim()) {
      setError("Guest name is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await updateGuestAction(editingGuest.id, {
        name: editName,
        email: editEmail || undefined,
        phone: editPhone || undefined,
        rsvpStatus: editRsvpStatus,
        plusOneCount: editPlusOneCount,
        dietaryRestrictions: editDietaryRestrictions || undefined,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        setEditingGuest(null);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const [prevInitialGuests, setPrevInitialGuests] = React.useState(initialGuests);
  if (initialGuests !== prevInitialGuests) {
    setGuestsList(initialGuests);
    setPrevInitialGuests(initialGuests);
  }

  const totalCount = guestsList.length;
  const attendingCount = guestsList.filter((g) => g.rsvpStatus === "attending").length;
  const declinedCount = guestsList.filter((g) => g.rsvpStatus === "declined").length;
  const pendingCount = guestsList.filter((g) => g.rsvpStatus === "pending").length;

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Guest name is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await createGuestAction({
        name,
        email: email || undefined,
        phone: phone || undefined,
        rsvpStatus,
        plusOneCount,
        dietaryRestrictions: dietaryRestrictions || undefined,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        setIsAddOpen(false);
        setName("");
        setEmail("");
        setPhone("");
        setRsvpStatus("pending");
        setPlusOneCount(0);
        setDietaryRestrictions("");
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (guestId: string, newStatus: "pending" | "attending" | "declined") => {
    const originalGuests = [...guestsList];
    setGuestsList((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, rsvpStatus: newStatus } : g))
    );

    try {
      const res = await updateGuestRSVPAction(guestId, newStatus);
      if (res?.error) {
        setGuestsList(originalGuests);
        setToast({ message: `Failed to update RSVP status: ${res.error}`, type: "error" });
      }
    } catch (err) {
      console.error(err);
      setGuestsList(originalGuests);
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    const guest = guestsList.find((g) => g.id === guestId);
    if (guest) setDeleteConfirm(guest);
  };

  const confirmDeleteGuest = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await deleteGuestAction(deleteConfirm.id);
      if (res?.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setGuestsList((prev) => prev.filter((g) => g.id !== deleteConfirm.id));
        setToast({ message: "Guest deleted successfully.", type: "success" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filteredGuests = guestsList.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.email && g.email.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "all" || g.rsvpStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full font-sans space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Guest RSVP Manager</h1>
          <p className="text-xs text-slate-500">Coordinate and search your wedding invitations.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} variant="primary">
          + Add Guest
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
            statusFilter === "all"
              ? "bg-[#6771ab] text-white border-[#6771ab]"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          All ({totalCount})
        </button>
        <button
          onClick={() => setStatusFilter("attending")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
            statusFilter === "attending"
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Attending ({attendingCount})
        </button>
        <button
          onClick={() => setStatusFilter("declined")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
            statusFilter === "declined"
              ? "bg-red-600 text-white border-red-600"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Declined ({declinedCount})
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all ${
            statusFilter === "pending"
              ? "bg-amber-500 text-white border-amber-500"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          Pending ({pendingCount})
        </button>
      </div>

      <div className="max-w-md">
        <Input
          type="text"
          placeholder="🔍 Search guests by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card variant="default" className="overflow-hidden bg-white shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Contact Info</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Login Code</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">RSVP Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Plus Ones</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Dietary Restrictions</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredGuests.map((g) => (
                <tr key={g.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">{g.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div className="flex flex-col text-xs font-sans">
                      <span>{g.email || "-"}</span>
                      <span>{g.phone || "-"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      onClick={() => {
                        navigator.clipboard.writeText(g.loginCode);
                        setToast({ message: "Login code copied!", type: "success" });
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#eef0f7] text-[#2d336b] cursor-pointer hover:bg-[#6771ab] hover:text-white transition-colors border border-[#cbd5e1]"
                      title="Click to copy login code"
                    >
                      {g.loginCode}
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Select
                      value={g.rsvpStatus}
                      onChange={(e) => handleStatusChange(g.id, e.target.value as "pending" | "attending" | "declined")}
                      className="text-xs h-8 py-0.5 rounded-lg border-slate-200 bg-slate-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="attending">Attending</option>
                      <option value="declined">Declined</option>
                    </Select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-bold">{g.plusOneCount}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={g.dietaryRestrictions || ""}>
                    {g.dietaryRestrictions || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-1">
                    <Button
                      variant="ghost"
                      onClick={() => { setInviteGuest(g); }}
                      className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold"
                      title="Send Invitation"
                    >
                      Send
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleStartEdit(g)}
                      className="text-[#6771ab] hover:text-[#566198] text-xs font-semibold"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteGuest(g.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold"
                    >
                      Del
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 text-xs font-sans">
                    No matching guests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Guest">
        <form onSubmit={handleAddGuest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Guest Full Name</label>
            <Input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Email (optional)</label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Phone (optional)</label>
              <Input
                type="text"
                placeholder="+1 234 567 890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">RSVP Status</label>
              <Select
                value={rsvpStatus}
                onChange={(e) => setRsvpStatus(e.target.value as "pending" | "attending" | "declined")}
                disabled={loading}
              >
                <option value="pending">Pending</option>
                <option value="attending">Attending</option>
                <option value="declined">Declined</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Plus Ones Count</label>
              <Input
                type="number"
                value={plusOneCount}
                onChange={(e) => setPlusOneCount(Number(e.target.value))}
                min={0}
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Dietary Restrictions (optional)</label>
            <Input
              type="text"
              placeholder="e.g. Vegan, Gluten-free, Nut allergy"
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Adding..." : "Add Guest"}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog isOpen={!!inviteGuest} onClose={() => setInviteGuest(null)} title="Send Invitation">
        {inviteGuest && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm font-semibold text-slate-800 mb-1">
                Send this invitation to <span className="text-[#6771ab]">{inviteGuest.name}</span>
              </p>
              <p className="text-xs text-slate-500">Share the link below — the guest&apos;s login code is pre-filled.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Personal Invitation Link</label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={`${showcaseLink}?code=${inviteGuest.loginCode}`}
                  readOnly
                  className="text-xs font-mono bg-slate-50"
                />
                <Button
                  variant="primary"
                  onClick={() => {
                    navigator.clipboard.writeText(`${showcaseLink}?code=${inviteGuest.loginCode}`);
                    setToast({ message: "Personal invitation link copied!", type: "success" });
                  }}
                  className="shrink-0"
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="p-3 bg-[#eef0f7] border border-[#6771ab]/20 rounded-xl">
              <p className="text-xs font-semibold text-[#2d336b] mb-1">Preview message:</p>
              <p className="text-xs text-slate-600 italic">
                You&apos;re invited to our wedding! View the details at {showcaseLink} and your personal code <span className="font-mono font-bold">{inviteGuest.loginCode}</span> will be pre-filled automatically.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <Button variant="ghost" onClick={() => setInviteGuest(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const text = `You're invited to our wedding!\n\nView all details and RSVP:\n${showcaseLink}?code=${inviteGuest.loginCode}\n\nWe can't wait to celebrate with you!`;
                  navigator.clipboard.writeText(text);
                  setToast({ message: "Full invitation copied to clipboard!", type: "success" });
                }}
              >
                Copy All
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog isOpen={!!editingGuest} onClose={() => setEditingGuest(null)} title="Edit Guest">
        <form onSubmit={handleUpdateGuest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Guest Full Name</label>
            <Input
              type="text"
              placeholder="e.g. John Doe"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Email (optional)</label>
              <Input
                type="email"
                placeholder="john@example.com"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Phone (optional)</label>
              <Input
                type="text"
                placeholder="+1 234 567 890"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">RSVP Status</label>
              <Select
                value={editRsvpStatus}
                onChange={(e) => setEditRsvpStatus(e.target.value as "pending" | "attending" | "declined")}
                disabled={loading}
              >
                <option value="pending">Pending</option>
                <option value="attending">Attending</option>
                <option value="declined">Declined</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Plus Ones Count</label>
              <Input
                type="number"
                value={editPlusOneCount}
                onChange={(e) => setEditPlusOneCount(Number(e.target.value))}
                min={0}
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Dietary Restrictions (optional)</label>
            <Input
              type="text"
              placeholder="e.g. Vegan, Gluten-free, Nut allergy"
              value={editDietaryRestrictions}
              onChange={(e) => setEditDietaryRestrictions(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
            <Button type="button" variant="ghost" onClick={() => setEditingGuest(null)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDeleteGuest}
        title="Delete Guest"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
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
