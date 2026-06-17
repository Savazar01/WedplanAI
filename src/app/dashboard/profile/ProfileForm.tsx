"use client";

import * as React from "react";
import { updateProfileAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";

interface ProfileFormProps {
  initialName: string;
  initialStreet?: string | null;
  initialCity?: string | null;
  initialState?: string | null;
  initialCountry?: string | null;
  initialPincode?: string | null;
  initialLanguages?: string | null;
}

export default function ProfileForm({
  initialName,
  initialStreet,
  initialCity,
  initialState,
  initialCountry,
  initialPincode,
  initialLanguages,
}: ProfileFormProps) {
  const [name, setName] = React.useState(initialName || "");
  const [street, setStreet] = React.useState(initialStreet || "");
  const [city, setCity] = React.useState(initialCity || "");
  const [state, setState] = React.useState(initialState || "");
  const [country, setCountry] = React.useState(initialCountry || "");
  const [pincode, setPincode] = React.useState(initialPincode || "");
  const [languages, setLanguages] = React.useState(initialLanguages || "");
  const [isPending, setIsPending] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const result = await updateProfileAction({
        name,
        street,
        city,
        state,
        country,
        pincode,
        languages,
      });
      if (result?.error) {
        setToast({ message: result.error, type: "error" });
      } else {
        setToast({ message: "Profile updated successfully!", type: "success" });
      }
    } catch {
      setToast({ message: "An unexpected error occurred.", type: "error" });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#6771ab] uppercase tracking-widest">
            Personal Details
          </h3>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Full Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              disabled={isPending}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Language(s)
            </label>
            <Input
              type="text"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              placeholder="e.g. English, Hindi, Tamil"
              disabled={isPending}
            />
            <p className="text-[10px] text-slate-400">Separate multiple languages with commas</p>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-[#6771ab] uppercase tracking-widest">
            Address
          </h3>
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Street Address
            </label>
            <Input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="123 Main Street, Apt 4B"
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                City
              </label>
              <Input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai"
                disabled={isPending}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                State / Province
              </label>
              <Input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Maharashtra"
                disabled={isPending}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Country
              </label>
              <Input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="India"
                disabled={isPending}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Postal / PIN Code
              </label>
              <Input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="400001"
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            className="bg-[#6771ab] hover:bg-[#566198] text-white px-6 font-semibold"
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>

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
