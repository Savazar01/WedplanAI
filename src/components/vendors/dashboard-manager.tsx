"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createVendorAction, deleteVendorAction, updateVendorAction } from "@/app/actions/vendors";
import { formatCurrency } from "@/lib/format";

interface Vendor {
  id: string;
  name: string;
  category: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  totalCost: number;
  paidAmount: number;
  paymentStatus: string;
  notes: string | null;
  ceremonyId: string | null;
}

interface ManagerProps {
  initialVendors: Vendor[];
  totalBudget: number;
  country?: string;
  ceremonies?: { id: string; name: string }[];
}

const categories = ["catering", "photography", "decoration", "apparel", "venue", "makeup", "music", "transport", "other"] as const;

export default function DashboardVendorManager({ 
  initialVendors, 
  totalBudget, 
  country = "India",
  ceremonies = []
}: ManagerProps) {
  const [vendorsList, setVendorsList] = React.useState<Vendor[]>(initialVendors);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingVendor, setEditingVendor] = React.useState<Vendor | null>(null);

  // Add Form state
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("other");
  const [contactPerson, setContactPerson] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [totalCost, setTotalCost] = React.useState(0);
  const [paidAmount, setPaidAmount] = React.useState(0);
  const [notes, setNotes] = React.useState("");
  const [ceremonyId, setCeremonyId] = React.useState("");

  // Edit Form state
  const [editName, setEditName] = React.useState("");
  const [editCategory, setEditCategory] = React.useState("other");
  const [editContactPerson, setEditContactPerson] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editTotalCost, setEditTotalCost] = React.useState(0);
  const [editPaidAmount, setEditPaidAmount] = React.useState(0);
  const [editNotes, setEditNotes] = React.useState("");
  const [editCeremonyId, setEditCeremonyId] = React.useState("");

  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);

  // Safe client component state synchronization using a value signature
  const vendorsSignature = React.useMemo(() => {
    return initialVendors
      .map(
        (v) =>
          `${v.id}-${v.name}-${v.category}-${v.totalCost}-${v.paidAmount}-${v.paymentStatus}-${v.ceremonyId || ""}`
      )
      .join("|");
  }, [initialVendors]);

  const [prevSignature, setPrevSignature] = React.useState(vendorsSignature);
  if (vendorsSignature !== prevSignature) {
    setVendorsList(initialVendors);
    setPrevSignature(vendorsSignature);
  }

  const contractedCost = vendorsList.reduce((sum, v) => sum + v.totalCost, 0);
  const paidAmountSum = vendorsList.reduce((sum, v) => sum + v.paidAmount, 0);
  const outstandingBalance = contractedCost - paidAmountSum;
  const depletionPercentage = totalBudget > 0 ? Math.round((contractedCost / totalBudget) * 100) : 0;
  const isBreached = contractedCost > totalBudget;
  const barPercentage = Math.min(depletionPercentage, 100);

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Company/Vendor name is required.");
      return;
    }

    if (paidAmount > totalCost) {
      setError("Paid amount cannot exceed total contract cost.");
      return;
    }

    setLoading(true);
    try {
      const res = await createVendorAction({
        name,
        category,
        contactPerson: contactPerson || undefined,
        phone: phone || undefined,
        email: email || undefined,
        totalCost,
        paidAmount,
        notes: notes || undefined,
        ceremonyId: ceremonyId || null,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        setIsAddOpen(false);
        setName("");
        setCategory("other");
        setContactPerson("");
        setPhone("");
        setEmail("");
        setTotalCost(0);
        setPaidAmount(0);
        setNotes("");
        setCeremonyId("");
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setEditName(vendor.name || "");
    setEditCategory(vendor.category || "other");
    setEditContactPerson(vendor.contactPerson || "");
    setEditPhone(vendor.phone || "");
    setEditEmail(vendor.email || "");
    setEditTotalCost(vendor.totalCost || 0);
    setEditPaidAmount(vendor.paidAmount || 0);
    setEditNotes(vendor.notes || "");
    setEditCeremonyId(vendor.ceremonyId || "");
  };

  const handleUpdateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;
    setError("");

    if (!editName.trim()) {
      setError("Company/Vendor name is required.");
      return;
    }

    if (editPaidAmount > editTotalCost) {
      setError("Paid amount cannot exceed total contract cost.");
      return;
    }

    setLoading(true);
    try {
      const res = await updateVendorAction(editingVendor.id, {
        name: editName,
        category: editCategory,
        contactPerson: editContactPerson || undefined,
        phone: editPhone || undefined,
        email: editEmail || undefined,
        totalCost: editTotalCost,
        paidAmount: editPaidAmount,
        notes: editNotes || undefined,
        ceremonyId: editCeremonyId || null,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        setEditingVendor(null);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVendor = async (vendorId: string) => {
    setDeleteConfirm(vendorId);
  };

  const confirmDeleteVendor = async () => {
    if (!deleteConfirm) return;
    try {
      const res = await deleteVendorAction(deleteConfirm);
      if (res?.error) {
        setToast({ message: res.error, type: "error" });
      } else {
        setVendorsList((prev) => prev.filter((v) => v.id !== deleteConfirm));
        setToast({ message: "Vendor contract deleted.", type: "success" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const downloadReport = () => {
    const escapeCsv = (str: string | null | undefined) => {
      if (str === null || str === undefined) return "";
      const val = String(str).replace(/"/g, '""');
      return val.includes(",") || val.includes("\n") || val.includes('"') ? `"${val}"` : val;
    };

    const csvContent = [
      [
        "Vendor Name",
        "Category",
        "Contact Person",
        "Phone",
        "Email",
        "Total Cost",
        "Paid Amount",
        "Outstanding Balance",
        "Payment Status",
        "Associated Ceremony",
        "Notes"
      ].join(",")
    ];

    vendorsList.forEach((v) => {
      const balance = v.totalCost - v.paidAmount;
      const ceremonyName = v.ceremonyId ? ceremonies.find((c) => c.id === v.ceremonyId)?.name || "" : "None";
      
      csvContent.push([
        escapeCsv(v.name),
        escapeCsv(v.category),
        escapeCsv(v.contactPerson),
        escapeCsv(v.phone),
        escapeCsv(v.email),
        v.totalCost,
        v.paidAmount,
        balance,
        escapeCsv(v.paymentStatus),
        escapeCsv(ceremonyName),
        escapeCsv(v.notes)
      ].join(","));
    });

    const blob = new Blob([csvContent.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "wedding_budget_and_vendors_report.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full font-sans space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vendors & Budget</h1>
          <p className="text-xs text-slate-500">Track and manage vendor contracts against your overall limit.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={downloadReport} variant="secondary" className="font-semibold text-xs py-2">
            📥 Download Report
          </Button>
          <Button onClick={() => setIsAddOpen(true)} variant="primary">
            + Add Vendor Contract
          </Button>
        </div>
      </div>

      {/* Header calculation widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className={`md:col-span-2 p-6 flex flex-col justify-between border shadow-sm rounded-2xl ${
            isBreached ? "border-red-200 bg-red-50/10" : "border-slate-200 bg-white"
          }`}
        >
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isBreached ? "text-red-600" : "text-[#6771ab]"}`}>
              {isBreached ? "⚠️ Budget Depletion Alert (Breached)" : "Budget Depletion Gauge"}
            </h3>
            
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${isBreached ? "text-red-600" : "text-slate-800"}`}>
                {depletionPercentage}%
              </span>
              <span className="text-xs text-slate-400">depleted</span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${isBreached ? "bg-red-500" : "bg-[#6771ab]"}`}
                style={{ width: `${barPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Turns red if contracted cost exceeds your total wedding budget limit.
            </p>
          </div>
        </Card>

        <Card className="p-6 border border-slate-200 shadow-sm bg-white space-y-3 font-sans rounded-2xl">
          <h3 className="text-xs font-bold text-[#6771ab] uppercase tracking-widest mb-2">Budget Summary</h3>
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Allocated Budget:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(totalBudget, country)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Contracted Spending:</span>
              <span className={`font-semibold ${isBreached ? "text-red-600" : "text-slate-800"}`}>
                {formatCurrency(contractedCost, country)}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-1.5">
              <span className="text-slate-500">Remaining Budget:</span>
              <span className={`font-bold ${isBreached ? "text-red-600" : "text-emerald-600"}`}>
                {formatCurrency(totalBudget - contractedCost, country)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Paid Amount:</span>
              <span className="font-semibold text-slate-700">{formatCurrency(paidAmountSum, country)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-1 mt-1">
              <span className="text-slate-500">Outstanding Balance:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(outstandingBalance, country)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Vendor Cards view */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendorsList.map((vendor) => {
          const balance = vendor.totalCost - vendor.paidAmount;
          const linkedCeremony = ceremonies.find((c) => c.id === vendor.ceremonyId);

          return (
            <Card 
              key={vendor.id} 
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-slate-800 text-lg truncate" title={vendor.name}>
                    {vendor.name}
                  </h3>
                  <span className="inline-flex px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-violet-100 text-[#2d336b] uppercase tracking-wider capitalize">
                    {vendor.category}
                  </span>
                </div>
                
                <div className="text-xs space-y-1 text-slate-500 font-sans">
                  {vendor.contactPerson && (
                    <p>
                      <span className="font-semibold text-slate-700">Contact: </span>
                      {vendor.contactPerson}
                    </p>
                  )}
                  {vendor.phone && (
                    <p>
                      <span className="font-semibold text-slate-700">Phone: </span>
                      {vendor.phone}
                    </p>
                  )}
                  {vendor.email && (
                    <p>
                      <span className="font-semibold text-slate-700">Email: </span>
                      {vendor.email}
                    </p>
                  )}
                  {linkedCeremony && (
                    <p className="mt-1">
                      <span className="font-semibold text-slate-700">Ceremony: </span>
                      <span className="bg-[#6771ab]/10 text-[#2d336b] px-2.5 py-0.5 rounded-full text-[10px] font-semibold w-fit inline-block">
                        🎉 {linkedCeremony.name}
                      </span>
                    </p>
                  )}
                  {vendor.notes && (
                    <p className="italic text-slate-400 mt-1.5 line-clamp-2" title={vendor.notes}>
                      &ldquo;{vendor.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3 font-sans">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Cost</span>
                    <span className="font-semibold text-slate-800 text-sm">{formatCurrency(vendor.totalCost, country)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Paid</span>
                    <span className="font-semibold text-slate-800 text-sm">{formatCurrency(vendor.paidAmount, country)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Balance</span>
                    <span className="font-semibold text-slate-800 text-sm">{formatCurrency(balance, country)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase ${
                    vendor.paymentStatus === "paid"
                      ? "bg-emerald-100 text-emerald-800"
                      : vendor.paymentStatus === "partially_paid"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {vendor.paymentStatus === "partially_paid" ? "Partially Paid" : vendor.paymentStatus}
                  </span>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleStartEdit(vendor)}
                      className="text-[#6771ab] hover:text-[#566198] text-xs font-semibold px-2 py-1 h-auto"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteVendor(vendor.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 h-auto"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {vendorsList.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 text-xs font-sans">
            No vendor contracts added yet. Click &ldquo;Add Vendor Contract&rdquo; to begin.
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Vendor Contract">
        <form onSubmit={handleAddVendor} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Company / Vendor Name</label>
            <Input
              type="text"
              placeholder="e.g. Royal Banquet Hall"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Category</label>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Contact Person</label>
              <Input
                type="text"
                placeholder="e.g. Manager Name"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Email (optional)</label>
              <Input
                type="email"
                placeholder="contact@vendor.com"
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

          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Associated Ceremony</label>
            <Select
              value={ceremonyId}
              onChange={(e) => setCeremonyId(e.target.value)}
              disabled={loading}
            >
              <option value="">None (General Vendor)</option>
              {ceremonies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Contract Total Cost</label>
              <Input
                type="number"
                value={totalCost}
                onChange={(e) => setTotalCost(Number(e.target.value))}
                min={0}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Amount Paid So Far</label>
              <Input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                min={0}
                required
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Notes (optional)</label>
            <Input
              type="text"
              placeholder="e.g. Stage dimensions, inclusion details"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              {loading ? "Adding Contract..." : "Save Contract"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog isOpen={!!editingVendor} onClose={() => setEditingVendor(null)} title="Edit Vendor Contract">
        <form onSubmit={handleUpdateVendor} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Company / Vendor Name</label>
            <Input
              type="text"
              placeholder="e.g. Royal Banquet Hall"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Category</label>
              <Select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                disabled={loading}
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Contact Person</label>
              <Input
                type="text"
                placeholder="e.g. Manager Name"
                value={editContactPerson}
                onChange={(e) => setEditContactPerson(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Email (optional)</label>
              <Input
                type="email"
                placeholder="contact@vendor.com"
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

          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Associated Ceremony</label>
            <Select
              value={editCeremonyId}
              onChange={(e) => setEditCeremonyId(e.target.value)}
              disabled={loading}
            >
              <option value="">None (General Vendor)</option>
              {ceremonies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Contract Total Cost</label>
              <Input
                type="number"
                value={editTotalCost}
                onChange={(e) => setEditTotalCost(Number(e.target.value))}
                min={0}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Amount Paid So Far</label>
              <Input
                type="number"
                value={editPaidAmount}
                onChange={(e) => setEditPaidAmount(Number(e.target.value))}
                min={0}
                required
                disabled={loading}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Notes (optional)</label>
            <Input
              type="text"
              placeholder="e.g. Stage dimensions, inclusion details"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
            <Button type="button" variant="ghost" onClick={() => setEditingVendor(null)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDeleteVendor}
        title="Delete Vendor Contract"
        message="Are you sure you want to delete this vendor contract? This action cannot be undone."
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
