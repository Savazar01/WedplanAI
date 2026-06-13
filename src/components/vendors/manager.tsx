"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createVendorAction, deleteVendorAction } from "@/app/actions/vendors";
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
}

interface ManagerProps {
  initialVendors: Vendor[];
  totalBudget: number;
  country?: string;
}

const categories = ["catering", "photography", "decoration", "apparel", "venue", "makeup", "music", "transport", "other"] as const;

export default function VendorManager({ initialVendors, totalBudget, country = "India" }: ManagerProps) {
  const [vendorsList, setVendorsList] = React.useState<Vendor[]>(initialVendors);
  const [isAddOpen, setIsAddOpen] = React.useState(false);

  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("other");
  const [contactPerson, setContactPerson] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [totalCost, setTotalCost] = React.useState(0);
  const [paidAmount, setPaidAmount] = React.useState(0);
  const [notes, setNotes] = React.useState("");
  
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);

  const [prevInitialVendors, setPrevInitialVendors] = React.useState(initialVendors);
  if (initialVendors !== prevInitialVendors) {
    setVendorsList(initialVendors);
    setPrevInitialVendors(initialVendors);
  }

  const contractedCost = vendorsList.reduce((sum, v) => sum + v.totalCost, 0);
  const paidAmountSum = vendorsList.reduce((sum, v) => sum + v.paidAmount, 0);
  const outstandingBalance = contractedCost - paidAmountSum;
  const depletionPercentage = totalBudget > 0 ? Math.min(Math.round((contractedCost / totalBudget) * 100), 100) : 0;
  const isBreached = contractedCost > totalBudget;

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
        setToast({ message: "Vendor deleted.", type: "success" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="flex flex-col h-full font-sans space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vendors & Budget</h1>
          <p className="text-xs text-slate-500">Track and manage vendor contracts against your overall limit.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} variant="primary">
          + Add Vendor Contract
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card variant={isBreached ? "cream" : "default"} className={`md:col-span-3 p-6 flex flex-col justify-between border shadow-sm ${
          isBreached ? "border-red-200 bg-red-50/10" : "border-slate-200"
        }`}>
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isBreached ? "text-red-600" : "text-[#6771ab]"}`}>
              {isBreached ? "⚠️ Budget Depletion Alert" : "Budget Depletion Gauge"}
            </h3>
            
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${isBreached ? "text-red-600" : "text-slate-800"}`}>
                {totalBudget > 0 ? Math.round((contractedCost / totalBudget) * 100) : 0}%
              </span>
              <span className="text-xs text-slate-400">depleted</span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${isBreached ? "bg-red-500" : "bg-[#6771ab]"}`}
                style={{ width: `${depletionPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Turns red if contracted cost exceeds your total wedding budget limit.
            </p>
          </div>
        </Card>

        <Card variant="default" className="md:col-span-2 p-6 border-slate-200 shadow-sm bg-white space-y-3 font-sans">
          <h3 className="text-xs font-bold text-[#6771ab] uppercase tracking-widest mb-2">Budget Summary</h3>
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Budget:</span>
              <span className="font-semibold text-slate-800">{formatCurrency(totalBudget, country)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Contracted Cost:</span>
              <span className={`font-semibold ${isBreached ? "text-red-600" : "text-slate-800"}`}>
                {formatCurrency(contractedCost, country)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Paid So Far:</span>
              <span className="font-semibold text-emerald-600">{formatCurrency(paidAmountSum, country)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-1.5 mt-1.5">
              <span className="font-medium text-slate-700">Balance Due:</span>
              <span className="font-bold text-slate-800">{formatCurrency(outstandingBalance, country)}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card variant="default" className="overflow-hidden bg-white shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Company & Category</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Contact Person</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Contract Cost</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Amount Paid</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Balance</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {vendorsList.map((v) => (
                <tr key={v.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                    <div className="flex flex-col">
                      <span>{v.name}</span>
                      <span className="text-[10px] text-slate-400 capitalize">{v.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-sans">
                    <div className="flex flex-col text-xs">
                      <span className="font-medium">{v.contactPerson || "-"}</span>
                      <span>{v.email || v.phone || ""}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-sans font-medium">{formatCurrency(v.totalCost, country)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-sans font-medium">{formatCurrency(v.paidAmount, country)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-sans font-bold">{formatCurrency(v.totalCost - v.paidAmount, country)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex px-2 py-0.5 rounded-sm text-xs font-semibold font-sans ${
                      v.paymentStatus === "paid"
                        ? "bg-emerald-100 text-emerald-800"
                        : v.paymentStatus === "partially_paid"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {v.paymentStatus === "partially_paid" ? "Partially Paid" : v.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteVendor(v.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {vendorsList.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 text-xs font-sans">
                    No vendor contracts added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

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
                onChange={(e) => setCategory(e.target.value as "catering" | "photography" | "decoration" | "apparel" | "venue" | "makeup" | "music" | "transport" | "other")}
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

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDeleteVendor}
        title="Delete Vendor"
        message="Are you sure you want to delete this vendor? This action cannot be undone."
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
