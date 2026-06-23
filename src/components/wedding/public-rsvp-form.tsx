"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { findGuestByCodeAction, saveGuestRsvpAction } from "@/app/actions/guests";

interface Ceremony {
  id: string;
  name: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  location: string;
}

interface PublicRsvpFormProps {
  weddingId: string;
  rsvpTitle?: string | null;
  rsvpDescription?: string | null;
  scrollToOnAttending?: string;
  ceremonies: Ceremony[];
}

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  rsvpStatus: string;
  plusOneCount: number;
  dietaryRestrictions: string | null;
  invitedCeremonies: string;
}

export default function PublicRsvpForm({ 
  weddingId,
  rsvpTitle,
  rsvpDescription,
  scrollToOnAttending,
  ceremonies
}: PublicRsvpFormProps) {
  const [loginCode, setLoginCode] = React.useState("");
  const [guest, setGuest] = React.useState<Guest | null>(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [autoVerified, setAutoVerified] = React.useState(false);

  // RSVP Form state
  const [plusOneCount, setPlusOneCount] = React.useState(0);
  const [dietaryRestrictions, setDietaryRestrictions] = React.useState("");
  const [ceremonyRsvps, setCeremonyRsvps] = React.useState<Record<string, { rsvpStatus: "attending" | "declined"; guestCount: number }>>({});

  React.useEffect(() => {
    if (saveSuccess && scrollToOnAttending) {
      const el = document.getElementById(scrollToOnAttending);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    }
  }, [saveSuccess, scrollToOnAttending]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code && code.length === 6) {
      setTimeout(() => {
        setLoginCode(code.toUpperCase());
      }, 0);
    }
  }, []);

  const getInvitedCeremoniesForGuest = React.useCallback((guestRecord: Guest | null) => {
    if (!guestRecord) return [];
    if (guestRecord.invitedCeremonies === "all") return ceremonies;
    const ids = guestRecord.invitedCeremonies.split(",");
    return ceremonies.filter((c) => ids.includes(c.id));
  }, [ceremonies]);

  const initializeRsvpsState = React.useCallback((guestRecord: Guest, rsvpsList: { ceremonyId: string; rsvpStatus: string; guestCount: number }[]) => {
    const guestInvited = getInvitedCeremoniesForGuest(guestRecord);
    const initialRsvps: Record<string, { rsvpStatus: "attending" | "declined"; guestCount: number }> = {};
    
    guestInvited.forEach((c) => {
      const existing = rsvpsList?.find((r) => r.ceremonyId === c.id);
      if (existing) {
        initialRsvps[c.id] = {
          rsvpStatus: existing.rsvpStatus as "attending" | "declined",
          guestCount: Math.min(existing.guestCount, 1 + guestRecord.plusOneCount),
        };
      } else {
        initialRsvps[c.id] = {
          rsvpStatus: "attending",
          guestCount: 1,
        };
      }
    });
    setCeremonyRsvps(initialRsvps);
  }, [getInvitedCeremoniesForGuest]);

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
            const guestRecord = res.guest as Guest;
            setGuest(guestRecord);
            setPlusOneCount(guestRecord.plusOneCount);
            setDietaryRestrictions(guestRecord.dietaryRestrictions || "");
            initializeRsvpsState(guestRecord, (res.rsvps as { ceremonyId: string; rsvpStatus: string; guestCount: number }[]) || []);
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
  }, [loginCode, autoVerified, guest, weddingId, ceremonies, initializeRsvpsState]);

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
        const guestRecord = res.guest as Guest;
        setGuest(guestRecord);
        setPlusOneCount(guestRecord.plusOneCount);
        setDietaryRestrictions(guestRecord.dietaryRestrictions || "");
        initializeRsvpsState(guestRecord, res.rsvps || []);
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
      const guestInvited = getInvitedCeremoniesForGuest(guest);
      const rsvpsPayload: { ceremonyId: string; rsvpStatus: "attending" | "declined"; guestCount: number }[] = [];
      const maxParty = 1 + plusOneCount;

      for (const c of guestInvited) {
        const r = ceremonyRsvps[c.id];
        if (!r) continue;

        if (r.rsvpStatus === "attending") {
          if (r.guestCount < 1 || r.guestCount > maxParty) {
            setError(`Attending count for "${c.name}" must be between 1 and ${maxParty}.`);
            setLoading(false);
            return;
          }
        }
        rsvpsPayload.push({
          ceremonyId: c.id,
          rsvpStatus: r.rsvpStatus,
          guestCount: r.rsvpStatus === "attending" ? r.guestCount : 0,
        });
      }

      const res = await saveGuestRsvpAction(guest.id, rsvpsPayload, {
        plusOneCount,
        dietaryRestrictions: dietaryRestrictions || undefined,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        setSaveSuccess(true);
        const hasAttending = rsvpsPayload.some((r) => r.rsvpStatus === "attending");
        const mainStatus = hasAttending ? "attending" : rsvpsPayload.length > 0 ? "declined" : "pending";
        setGuest((prev) =>
          prev
            ? {
                ...prev,
                rsvpStatus: mainStatus,
                plusOneCount,
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

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-primary)] uppercase tracking-widest mb-1.5">
                Plus One Count (For your party)
              </label>
              <Select
                value={String(plusOneCount)}
                onChange={(e) => { setPlusOneCount(Number(e.target.value)); setSaveSuccess(false); }}
                className="rounded-xl border-slate-200"
              >
                <option value="0">No Plus One (Party size: 1)</option>
                <option value="1">1 Person (Party size: 2)</option>
                <option value="2">2 People (Party size: 3)</option>
                <option value="3">3 People (Party size: 4)</option>
              </Select>
              <p className="text-xs text-slate-500 mt-1 font-light">Include any additional guests you are bringing.</p>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-semibold text-[var(--color-primary)] uppercase tracking-widest mb-1">
                Ceremonies Attendance
              </label>
              
              {(() => {
                const guestInvited = getInvitedCeremoniesForGuest(guest);

                if (guestInvited.length === 0) {
                  return (
                    <div className="text-sm text-slate-500 text-center italic py-4 bg-slate-50 rounded-xl">
                      No invited ceremonies found.
                    </div>
                  );
                }

                return guestInvited.map((c) => {
                  const state = ceremonyRsvps[c.id] || { rsvpStatus: "attending", guestCount: 1 };
                  const maxParty = 1 + plusOneCount;

                  const handleStatusChange = (status: "attending" | "declined") => {
                    setSaveSuccess(false);
                    setCeremonyRsvps((prev) => ({
                      ...prev,
                      [c.id]: {
                        ...prev[c.id] || { guestCount: 1 },
                        rsvpStatus: status,
                      }
                    }));
                  };

                  const handleCountChange = (count: number) => {
                    setSaveSuccess(false);
                    setCeremonyRsvps((prev) => ({
                      ...prev,
                      [c.id]: {
                        ...prev[c.id] || { rsvpStatus: "attending" },
                        guestCount: count,
                      }
                    }));
                  };

                  return (
                    <div key={c.id} className="p-4 bg-slate-50/50 border border-slate-200/60 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm">{c.name}</h4>
                          <p className="text-xs text-slate-500">{c.location}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleStatusChange("attending")}
                            className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                              state.rsvpStatus === "attending"
                                ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-bold"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            Attending
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange("declined")}
                            className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                              state.rsvpStatus === "declined"
                                ? "bg-red-50 border-red-500 text-red-700 font-bold"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            Declined
                          </button>
                        </div>

                        {state.rsvpStatus === "attending" && (
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-slate-500 whitespace-nowrap">Guests count:</label>
                            <Select
                              value={String(state.guestCount)}
                              onChange={(e) => handleCountChange(Number(e.target.value))}
                              className="text-xs py-1 h-9 rounded-xl border-slate-200"
                            >
                              {Array.from({ length: maxParty }, (_, i) => i + 1).map((val) => (
                                <option key={val} value={String(val)}>
                                  {val} {val === 1 ? "Guest" : "Guests"}
                                </option>
                              ))}
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

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
