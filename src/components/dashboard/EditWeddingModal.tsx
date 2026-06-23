"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { updateWeddingAction } from "@/app/actions/wedding";

interface Wedding {
  id: string;
  partnerA: string;
  partnerB: string;
  location: string;
  weddingDate: Date;
  budget: number;
  guestCount: number;
  tradition: string;
  locationName?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  description?: string | null;
}

interface Props {
  wedding: Wedding;
  isOpen: boolean;
  onClose: () => void;
}

const TRADITIONS = [
  { value: "hindu", label: "Hindu" },
  { value: "muslim", label: "Muslim" },
  { value: "sikh", label: "Sikh" },
  { value: "christian", label: "Christian" },
  { value: "secular", label: "Secular" },
] as const;

function toDateInputValue(date: Date): string {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function EditWeddingModal({ wedding, isOpen, onClose }: Props) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = React.useState({
    partnerA: wedding.partnerA,
    partnerB: wedding.partnerB,
    location: wedding.location,
    weddingDate: toDateInputValue(new Date(wedding.weddingDate)),
    budget: wedding.budget,
    guestCount: wedding.guestCount,
    tradition: wedding.tradition,
    locationName: wedding.locationName || "",
    street: wedding.street || "",
    city: wedding.city || "",
    state: wedding.state || "",
    country: wedding.country || "India",
    pincode: wedding.pincode || "",
    description: wedding.description || "",
  });

  const [dbTraditions, setDbTraditions] = React.useState<{ id: string; key: string; name: string }[]>([]);
  const [customTraditionName, setCustomTraditionName] = React.useState("");

  React.useEffect(() => {
    async function load() {
      try {
        const { getPublicTraditions } = await import("@/app/actions/wedding");
        const list = await getPublicTraditions();
        setDbTraditions(list);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  React.useEffect(() => {
    setTimeout(() => {
      setForm({
        partnerA: wedding.partnerA,
        partnerB: wedding.partnerB,
        location: wedding.location,
        weddingDate: toDateInputValue(new Date(wedding.weddingDate)),
        budget: wedding.budget,
        guestCount: wedding.guestCount,
        tradition: wedding.tradition,
        locationName: wedding.locationName || "",
        street: wedding.street || "",
        city: wedding.city || "",
        state: wedding.state || "",
        country: wedding.country || "India",
        pincode: wedding.pincode || "",
        description: wedding.description || "",
      });

      const isBuiltIn = ["hindu", "muslim", "sikh", "christian", "secular"].includes(wedding.tradition);
      const isDbConfigured = dbTraditions.some(t => t.key === wedding.tradition);
      if (!isBuiltIn && !isDbConfigured) {
        setCustomTraditionName(wedding.tradition);
      } else {
        setCustomTraditionName("");
      }
    }, 0);
  }, [wedding, isOpen, dbTraditions]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const isBuiltIn = ["hindu", "muslim", "sikh", "christian", "secular"].includes(form.tradition);
      const isDbConfigured = dbTraditions.some(t => t.key === form.tradition);
      const finalTradition = (form.tradition === "other" || (!isBuiltIn && !isDbConfigured))
        ? (customTraditionName.trim() || "other")
        : form.tradition;

      const result = await updateWeddingAction(wedding.id, {
        ...form,
        tradition: finalTradition
      });
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Wedding details updated!" });
        router.refresh();
        setTimeout(() => {
          onClose();
          setMessage(null);
        }, 1000);
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg mx-4 bg-[#fefce8] border border-violet-100 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-violet-100 bg-gradient-to-r from-[#6771ab]/10 to-transparent shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#2d336b]">✏️ Edit Wedding Details</h2>
              <p className="text-xs text-slate-500 mt-0.5">Update your wedding information below</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-violet-100/50 transition-all"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#6771ab] uppercase tracking-widest">Partner A</label>
              <input
                name="partnerA"
                value={form.partnerA}
                onChange={handleChange}
                required
                placeholder="e.g. Priya"
                className="rounded-2xl border border-violet-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6771ab]/30 focus:border-[#6771ab] transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#6771ab] uppercase tracking-widest">Partner B</label>
              <input
                name="partnerB"
                value={form.partnerB}
                onChange={handleChange}
                required
                placeholder="e.g. Arjun"
                className="rounded-2xl border border-violet-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6771ab]/30 focus:border-[#6771ab] transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#6771ab] uppercase tracking-widest">Country</label>
            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              className="rounded-2xl border border-violet-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6771ab]/30 focus:border-[#6771ab] transition-all"
            >
              <option value="India">India</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="UAE">UAE</option>
              <option value="Singapore">Singapore</option>
              <option value="Malaysia">Malaysia</option>
              <option value="Pakistan">Pakistan</option>
              <option value="Bangladesh">Bangladesh</option>
              <option value="Sri Lanka">Sri Lanka</option>
              <option value="Nepal">Nepal</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Brazil">Brazil</option>
              <option value="Japan">Japan</option>
              <option value="Thailand">Thailand</option>
              <option value="Turkey">Turkey</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#6771ab] uppercase tracking-widest">Location Name</label>
            <input
              name="locationName"
              value={form.locationName}
              onChange={handleChange}
              placeholder="e.g. The Grand Palace"
              className="rounded-2xl border border-violet-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6771ab]/30 focus:border-[#6771ab] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#6771ab] uppercase tracking-widest">City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Udaipur"
                className="rounded-2xl border border-violet-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6771ab]/30 focus:border-[#6771ab] transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#6771ab] uppercase tracking-widest">State</label>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="e.g. Rajasthan"
                className="rounded-2xl border border-violet-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6771ab]/30 focus:border-[#6771ab] transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#6771ab] uppercase tracking-widest">Street Address</label>
            <input
              name="street"
              value={form.street}
              onChange={handleChange}
              placeholder="e.g. 123 Wedding Lane"
              className="rounded-2xl border border-violet-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6771ab]/30 focus:border-[#6771ab] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#6771ab] uppercase tracking-widest">Pincode / Zipcode</label>
              <input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="e.g. 313001"
                className="rounded-2xl border border-violet-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6771ab]/30 focus:border-[#6771ab] transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#6771ab] uppercase tracking-widest">Location Display</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                placeholder="e.g. Udaipur, India"
                className="rounded-2xl border border-violet-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6771ab]/30 focus:border-[#6771ab] transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#6771ab] uppercase tracking-widest">
              Description <span className="text-slate-400 normal-case">(optional - shown on showcase page)</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your wedding story or theme..."
              rows={3}
              className="rounded-2xl border border-violet-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6771ab]/30 focus:border-[#6771ab] transition-all resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#6771ab] uppercase tracking-widest">Wedding Date</label>
              <input
                type="date"
                name="weddingDate"
                value={form.weddingDate}
                onChange={handleChange}
                required
                className="rounded-2xl border border-violet-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6771ab]/30 focus:border-[#6771ab] transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#6771ab] uppercase tracking-widest">Tradition</label>
              <select
                name="tradition"
                value={["hindu", "muslim", "sikh", "christian", "secular"].includes(form.tradition) || dbTraditions.some(t => t.key === form.tradition) ? form.tradition : "other"}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value !== "other") {
                    setCustomTraditionName("");
                  }
                }}
                required
                className="rounded-2xl border border-violet-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6771ab]/30 focus:border-[#6771ab] transition-all"
              >
                {TRADITIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
                {dbTraditions.map((t) => (
                  <option key={t.key} value={t.key}>{t.name}</option>
                ))}
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Custom Tradition Input */}
          {(form.tradition === "other" || (!["hindu", "muslim", "sikh", "christian", "secular"].includes(form.tradition) && !dbTraditions.some(t => t.key === form.tradition))) && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#6771ab] uppercase tracking-widest">Custom Tradition Name</label>
              <input
                type="text"
                placeholder="e.g. My Custom Tradition"
                value={customTraditionName}
                onChange={(e) => setCustomTraditionName(e.target.value)}
                required
                className="rounded-2xl border border-violet-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6771ab]/30 focus:border-[#6771ab] transition-all"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#6771ab] uppercase tracking-widest">Budget (₹)</label>
              <input
                type="number"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                min={0}
                required
                className="rounded-2xl border border-violet-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6771ab]/30 focus:border-[#6771ab] transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#6771ab] uppercase tracking-widest">Guest Count</label>
              <input
                type="number"
                name="guestCount"
                value={form.guestCount}
                onChange={handleChange}
                min={0}
                required
                className="rounded-2xl border border-violet-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6771ab]/30 focus:border-[#6771ab] transition-all"
              />
            </div>
          </div>

          {message && (
            <div
              className={`rounded-2xl px-4 py-2.5 text-sm font-medium text-center ${
                message.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-red-50 border border-red-200 text-red-600"
              }`}
            >
              {message.type === "success" ? "✅ " : "⚠️ "}{message.text}
            </div>
          )}
          </div>

          <div className="px-6 py-4 border-t border-violet-100 flex gap-3 shrink-0 bg-[#fefce8]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#6771ab] to-[#2d336b] text-white text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-all shadow-md"
            >
              {pending ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
