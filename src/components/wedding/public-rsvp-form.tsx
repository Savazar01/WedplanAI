"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { findGuestByCodeAction, updateGuestRsvpPublicAction } from "@/app/actions/guests";

interface PublicRsvpFormProps {
  weddingId: string;
  rsvpTitle?: string | null;
  rsvpDescription?: string | null;
  scrollToOnAttending?: string;
}

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  rsvpStatus: string;
  plusOneCount: number;
  dietaryRestrictions: string | null;
}

export default function PublicRsvpForm({ 
  weddingId,
  rsvpTitle,
  rsvpDescription,
  scrollToOnAttending
}: PublicRsvpFormProps) {
  const [loginCode, setLoginCode] = React.useState("");
  const [guest, setGuest] = React.useState<Guest | null>(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [autoVerified, setAutoVerified] = React.useState(false);

  // RSVP Form state
  const [rsvpStatus, setRsvpStatus] = React.useState<"attending" | "declined">("attending");

  React.useEffect(() => {
    if (saveSuccess && rsvpStatus === "attending" && scrollToOnAttending) {
      const el = document.getElementById(scrollToOnAttending);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    }
  }, [saveSuccess, rsvpStatus, scrollToOnAttending]);
  const [plusOneCount, setPlusOneCount] = React.useState(0);
  const [dietaryRestrictions, setDietaryRestrictions] = React.useState("");

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code && code.length === 6) {
      setTimeout(() => {
        setLoginCode(code.toUpperCase());
      }, 0);
    }
  }, []);

  React.useEffect(() => {
    if (loginCode.length === 6 && !autoVerified && !guest) {
      setTimeout(() => {
        setAutoVerified(true);
      }, 0);
      const verify = async () => {
        setError("");
        setLoading(true);
        try {
          const res = await findGuestByCodeAction(weddingId, loginCode);
          if (res?.guest) {
            setGuest(res.guest as Guest);
            setRsvpStatus(
              res.guest.rsvpStatus === "declined" ? "declined" : "attending"
            );
            setPlusOneCount(res.guest.plusOneCount);
            setDietaryRestrictions(res.guest.dietaryRestrictions || "");
          } else if (res?.error) {
            setError(res.error);
          }
        } catch (err) {
          console.error(err);
          setError("Failed to verify login code.");
        } finally {
          setLoading(false);
        }
      };
      verify();
    }
  }, [loginCode, autoVerified, guest, weddingId]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaveSuccess(false);

    if (loginCode.trim().length !== 6) {
      setError("Please enter a valid 6-character login code.");
      return;
    }

    setLoading(true);
    try {
      const res = await findGuestByCodeAction(weddingId, loginCode);
      if (res?.error) {
        setError(res.error);
        setGuest(null);
      } else if (res?.guest) {
        setGuest(res.guest as Guest);
        setRsvpStatus(
          res.guest.rsvpStatus === "declined" ? "declined" : "attending"
        );
        setPlusOneCount(res.guest.plusOneCount);
        setDietaryRestrictions(res.guest.dietaryRestrictions || "");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to verify login code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRsvp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest) return;
    setError("");
    setLoading(true);

    try {
      const res = await updateGuestRsvpPublicAction(guest.id, {
        rsvpStatus,
        plusOneCount: rsvpStatus === "declined" ? 0 : plusOneCount,
        dietaryRestrictions: dietaryRestrictions || undefined,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        setSaveSuccess(true);
        // Update local guest record status
        setGuest((prev) =>
          prev
            ? {
                ...prev,
                rsvpStatus,
                plusOneCount: rsvpStatus === "declined" ? 0 : plusOneCount,
                dietaryRestrictions: dietaryRestrictions || null,
              }
            : null
        );
      }
    } catch (err) {
      console.error(err);
      setError("Failed to save your RSVP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border border-amber-200 rounded-3xl p-6 md:p-8 shadow-xl max-w-xl mx-auto font-sans relative overflow-hidden">
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-400 rounded-tl-xl m-2 opacity-50" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-400 rounded-tr-xl m-2 opacity-50" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-400 rounded-bl-xl m-2 opacity-50" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-400 rounded-br-xl m-2 opacity-50" />

      <h3 className="text-xl font-bold text-center text-[var(--color-primary)] font-serif mb-6 tracking-wide">
        {rsvpTitle || "Will You Celebrate With Us?"}
      </h3>

      {!guest ? (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-4 font-light leading-relaxed">
              {rsvpDescription || "Please enter the unique 6-character Login Code from your invitation card to unlock your RSVP."}
            </p>
            <div className="max-w-[240px] mx-auto">
              <Input
                type="text"
                maxLength={6}
                placeholder="e.g. G1H3B8"
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value.toUpperCase())}
                className="text-center text-xl tracking-widest font-mono font-bold border-amber-200 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] rounded-xl bg-amber-50/20"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center text-xs">
              {error}
            </div>
          )}

          <div className="text-center pt-2">
            <Button
              type="submit"
              disabled={loading || loginCode.length !== 6}
              className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 shadow-md transition-all active:scale-[0.97]"
            >
              {loading ? "Verifying..." : "Unlock Invitation"}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveRsvp} className="space-y-5">
          <div className="bg-[var(--color-secondary)]/10 p-4 rounded-2xl border border-[var(--color-secondary)]/20 text-center">
            <span className="block text-xs uppercase tracking-widest text-[var(--color-secondary)] font-bold">Honored Guest</span>
            <span className="text-lg font-bold text-slate-800 font-serif block mt-1">{guest.name}</span>
          </div>

          {saveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-center text-sm font-medium">
              🎉 Thank you! Your RSVP details have been recorded.
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-primary)] uppercase tracking-widest mb-1.5">
                Attendance
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setRsvpStatus("attending"); setSaveSuccess(false); }}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    rsvpStatus === "attending"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  🟢 Attending
                </button>
                <button
                  type="button"
                  onClick={() => { setRsvpStatus("declined"); setSaveSuccess(false); }}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    rsvpStatus === "declined"
                      ? "bg-red-50 border-red-500 text-red-700 ring-2 ring-red-500/20"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  🔴 Declined
                </button>
              </div>
            </div>

            {rsvpStatus === "attending" && (
              <div>
                <label className="block text-xs font-semibold text-[var(--color-primary)] uppercase tracking-widest mb-1.5">
                  Plus One Count
                </label>
                <Select
                  value={String(plusOneCount)}
                  onChange={(e) => { setPlusOneCount(Number(e.target.value)); setSaveSuccess(false); }}
                  className="rounded-xl border-slate-200"
                >
                  <option value="0">No Plus One</option>
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3">3 People</option>
                </Select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[var(--color-primary)] uppercase tracking-widest mb-1.5">
                Dietary Restrictions / Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Vegetarian, Gluten-free, none"
                value={dietaryRestrictions}
                onChange={(e) => { setDietaryRestrictions(e.target.value); setSaveSuccess(false); }}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center text-xs">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setGuest(null);
                setLoginCode("");
                setError("");
                setSaveSuccess(false);
              }}
              className="w-full sm:w-1/3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-all active:scale-[0.97]"
            >
              Back
            </button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-2/3 py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 shadow-md transition-all active:scale-[0.97] text-sm font-bold"
            >
              {loading ? "Saving..." : "Confirm RSVP"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
