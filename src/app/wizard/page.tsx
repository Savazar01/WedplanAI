"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createWeddingAction } from "@/app/actions/wedding";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { formatCurrency } from "@/lib/format";

const traditions = [
  { id: "hindu", label: "Hindu", desc: "Mehndi, Haldi & Sangeet, Saat Phere, Reception" },
  { id: "muslim", label: "Muslim", desc: "Imam Zamin & Manjha, Nikah, Valima" },
  { id: "sikh", label: "Sikh", desc: "Maiya & Vatna, Anand Karaj, Reception" },
  { id: "christian", label: "Christian", desc: "Rehearsal Dinner, Church Ceremony, Reception" },
  { id: "secular", label: "Secular", desc: "Welcome Toast, Exchange of Vows, Reception Dinner" },
] as const;

const defaultTasks = {
  hindu: [
    { title: "Book Mehndi Artist", category: "rituals" },
    { title: "Buy Wedding Lehenga & Sherwani", category: "apparel" },
    { title: "Hire Dhol Players & DJ", category: "music" },
    { title: "Arrange Catering & Sweets (Mithai)", category: "catering" },
    { title: "Select Mandap Decorator", category: "decor" },
  ],
  muslim: [
    { title: "Coordinate with Qazi & Print Nikah Nama", category: "rituals" },
    { title: "Purchase Wedding Attire (Sherwani/Gharara)", category: "apparel" },
    { title: "Select Stage & Floral Decorator", category: "decor" },
    { title: "Book Catering Menu for Valima Feast", category: "catering" },
  ],
  sikh: [
    { title: "Book Gurdwara & Coordinate with Ragis", category: "venue" },
    { title: "Purchase Rumalla Sahib for Guru Granth Sahib", category: "rituals" },
    { title: "Finalize Langar or Catering Menu", category: "catering" },
    { title: "Buy Anand Karaj Bridal/Groom Suit", category: "apparel" },
  ],
  christian: [
    { title: "Secure Church Venue & Priest", category: "venue" },
    { title: "Purchase Wedding Dress & Tuxedo", category: "apparel" },
    { title: "Order Wedding Cake & Floral Bouquets", category: "catering" },
    { title: "Hire Wedding Choir & Organist", category: "music" },
  ],
  secular: [
    { title: "Select Secular Celebrant", category: "rituals" },
    { title: "Write Wedding Vows", category: "other" },
    { title: "Arrange Catering & Open Bar", category: "catering" },
    { title: "Coordinate Photographer/Videographer Contracts", category: "other" },
  ],
};

const defaultRituals = {
  hindu: [
    { name: "Mehndi", description: "Traditional henna pre-wedding celebration", offsetDays: -2, startHour: 14, startMin: 0, endHour: 18, endMin: 0 },
    { name: "Haldi", description: "Traditional cleansing ceremony", offsetDays: -1, startHour: 10, startMin: 0, endHour: 13, endMin: 0 },
    { name: "Sangeet", description: "Musical celebration night", offsetDays: -1, startHour: 18, startMin: 0, endHour: 22, endMin: 0 },
    { name: "Mandap Pheras", description: "Main Vedic wedding ceremony rituals around the holy fire", offsetDays: 0, startHour: 10, startMin: 0, endHour: 14, endMin: 0 },
    { name: "Reception", description: "Grand wedding dinner reception", offsetDays: 0, startHour: 19, startMin: 0, endHour: 23, endMin: 0 },
  ],
  muslim: [
    { name: "Manjha", description: "Traditional pre-wedding ceremonies", offsetDays: -2, startHour: 16, startMin: 0, endHour: 20, endMin: 0 },
    { name: "Nikah", description: "Official marriage contract ceremony", offsetDays: 0, startHour: 11, startMin: 0, endHour: 13, endMin: 0 },
    { name: "Valima", description: "Post-wedding grand feast reception", offsetDays: 1, startHour: 19, startMin: 0, endHour: 23, endMin: 0 },
  ],
  sikh: [
    { name: "Maiya", description: "Traditional pre-wedding cleansing ceremonies", offsetDays: -1, startHour: 10, startMin: 0, endHour: 13, endMin: 0 },
    { name: "Anand Karaj", description: "Holy wedding ceremony at the Gurdwara", offsetDays: 0, startHour: 9, startMin: 0, endHour: 13, endMin: 0 },
    { name: "Reception", description: "Post-wedding dinner party celebration", offsetDays: 0, startHour: 18, startMin: 0, endHour: 23, endMin: 0 },
  ],
  christian: [
    { name: "Rehearsal Dinner", description: "Formal dinner with family and bridal party", offsetDays: -1, startHour: 18, startMin: 0, endHour: 21, endMin: 0 },
    { name: "Church Ceremony", description: "Marriage ceremony in the church", offsetDays: 0, startHour: 14, startMin: 0, endHour: 16, endMin: 0 },
    { name: "Reception", description: "Evening reception celebration with cake and dancing", offsetDays: 0, startHour: 18, startMin: 0, endHour: 23, endMin: 0 },
  ],
  secular: [
    { name: "Toast", description: "Ice-breaker drinks with incoming guests", offsetDays: -1, startHour: 18, startMin: 0, endHour: 20, endMin: 0 },
    { name: "Vows", description: "Ceremonial reading of wedding vows", offsetDays: 0, startHour: 16, startMin: 0, endHour: 17, endMin: 30 },
    { name: "Reception", description: "Dinner, toast, and dancing", offsetDays: 0, startHour: 18, startMin: 0, endHour: 23, endMin: 30 },
  ],
};

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);

  // Form states
  const [partnerA, setPartnerA] = React.useState("");
  const [partnerB, setPartnerB] = React.useState("");
  const [weddingDate, setWeddingDate] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [locationName, setLocationName] = React.useState("");
  const [street, setStreet] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [country, setCountry] = React.useState("India");
  const [pincode, setPincode] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [tradition, setTradition] = React.useState<"hindu" | "muslim" | "sikh" | "christian" | "secular">("secular");
  const [budget, setBudget] = React.useState(1000000);
  const [guestCount, setGuestCount] = React.useState(150);

  // Customized list states
  const [customTasks, setCustomTasks] = React.useState<{ title: string; category: string }[]>([]);
  const [customRituals, setCustomRituals] = React.useState<{
    name: string;
    description?: string;
    offsetDays?: number;
    startHour?: number;
    startMin?: number;
    endHour?: number;
    endMin?: number;
    location?: string;
  }[]>([]);
  const [newRitualName, setNewRitualName] = React.useState("");
  const [newTaskTitle, setNewTaskTitle] = React.useState("");

  const handleAddRitual = () => {
    if (!newRitualName.trim()) return;
    setCustomRituals([
      ...customRituals,
      {
        name: newRitualName.trim(),
        description: "Custom ritual",
        offsetDays: 0,
        startHour: 9,
        startMin: 0,
        endHour: 17,
        endMin: 0,
        location: location || "",
      },
    ]);
    setNewRitualName("");
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    setCustomTasks([
      ...customTasks,
      {
        title: newTaskTitle.trim(),
        category: "other",
      },
    ]);
    setNewTaskTitle("");
  };

  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setCustomTasks(defaultTasks[tradition]);
      setCustomRituals(defaultRituals[tradition]);
    }, 0);
  }, [tradition]);


  React.useEffect(() => {
    const checkUser = async () => {
      const session = await authClient.getSession();
      if (!session || !session.data) {
        router.push("/login");
      }
    };
    checkUser();
  }, [router]);

  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (!partnerA.trim() || !partnerB.trim()) {
        setError("Both partner names are required.");
        return false;
      }
    }
    if (step === 2) {
      if (!weddingDate) {
        setError("Wedding date is required.");
        return false;
      }
      if (new Date(weddingDate) <= new Date()) {
        setError("Wedding date must be in the future.");
        return false;
      }
      if (!country.trim()) {
        setError("Country is required.");
        return false;
      }
      if (!location.trim()) {
        setError("Wedding location/city is required.");
        return false;
      }
    }
    if (step === 4) {
      if (budget <= 0) {
        setError("Budget must be a positive number.");
        return false;
      }
      if (guestCount <= 0) {
        setError("Guest count must be a positive number.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setError("");
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const res = await createWeddingAction({
        partnerA,
        partnerB,
        tradition,
        weddingDate,
        budget,
        guestCount,
        location,
        locationName: locationName || undefined,
        street: street || undefined,
        city: city || undefined,
        state: state || undefined,
        country,
        pincode: pincode || undefined,
        description: description || undefined,
        customTasks,
        customRituals,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card variant="default" className="w-full max-w-2xl bg-white p-8 shadow-xl border border-slate-100 flex flex-col">
        {/* Top Progress Indicator */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <React.Fragment key={s}>
              <div className="flex items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center font-semibold text-xs transition-all ${
                    step >= s 
                      ? "bg-[#6771ab] text-white" 
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {s}
                </div>
                <span className="hidden sm:inline text-xs ml-2 font-medium text-slate-500">
                  {s === 1 && "Partners"}
                  {s === 2 && "Date & Place"}
                  {s === 3 && "Tradition"}
                  {s === 4 && "Budget & Guests"}
                  {s === 5 && "Review"}
                </span>
              </div>
              {s < 5 && <div className={`flex-1 h-[2px] mx-2 ${step > s ? "bg-[#6771ab]" : "bg-slate-100"}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Wizard Form Content */}
        <div className="flex-1 min-h-[300px]">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#6771ab] mb-1">Partner Details</h2>
                <p className="text-sm text-slate-500">Let&apos;s start with the happy couple&apos;s names.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Partner A Name</label>
                  <Input
                    type="text"
                    placeholder="Enter partner A name"
                    value={partnerA}
                    onChange={(e) => setPartnerA(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Partner B Name</label>
                  <Input
                    type="text"
                    placeholder="Enter partner B name"
                    value={partnerB}
                    onChange={(e) => setPartnerB(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#6771ab] mb-1">Date & Location</h2>
                <p className="text-sm text-slate-500">When and where will the wedding take place? Start by selecting the country.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Wedding Date</label>
                  <Input
                    type="date"
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6771ab] focus:border-transparent"
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
                    <option value="South Africa">South Africa</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Japan">Japan</option>
                    <option value="China">China</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Turkey">Turkey</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Location Name / Venue</label>
                <Input
                  type="text"
                  placeholder="e.g. The Grand Palace"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Street Address</label>
                <Input
                  type="text"
                  placeholder="e.g. 123 Wedding Lane"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest">City</label>
                  <Input
                    type="text"
                    placeholder="e.g. Udaipur"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest">State</label>
                  <Input
                    type="text"
                    placeholder="e.g. Rajasthan"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Pincode / Zipcode</label>
                  <Input
                    type="text"
                    placeholder="e.g. 313001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest">
                  Location (for display) <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Udaipur, India"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#6771ab] mb-1">Select Wedding Tradition</h2>
                <p className="text-sm text-slate-500">Choose a cultural tradition. This will pre-populate your tasks and rituals.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {traditions.map((t) => {
                  const isSelected = tradition === t.id;
                  return (
                    <Card
                      key={t.id}
                      onClick={() => setTradition(t.id)}
                      variant={isSelected ? "cream" : "default"}
                      className={`p-4 cursor-pointer hover:border-[#6771ab] transition-all hover:scale-[1.01] ${
                        isSelected ? "border-[#6771ab] ring-1 ring-[#6771ab]" : "border-slate-200"
                      }`}
                    >
                      <h4 className="font-semibold text-base text-[#2d336b]">{t.label}</h4>
                      <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#6771ab] mb-1">Budget & Estimated Guests</h2>
                <p className="text-sm text-slate-500">Provide approximate budget limits and counts.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Total Budget</label>
                  <Input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Estimated Guest Count</label>
                  <Input
                    type="number"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#6771ab] mb-1">Review & Confirm</h2>
                <p className="text-sm text-slate-500">Add a description for your wedding showcase, then review and confirm.</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest">
                  Wedding Description <span className="text-slate-400 normal-case">(optional - shown on showcase page)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your wedding story, theme, or special message for guests..."
                  className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6771ab] focus:border-transparent resize-y"
                />
              </div>
              <Card variant="cream" className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                  <div>
                    <span className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-0.5">Partners</span>
                    <span className="font-medium text-slate-800">{partnerA} & {partnerB}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-0.5">Tradition</span>
                    <span className="font-medium text-slate-800 capitalize">{tradition}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-0.5">Wedding Date</span>
                    <span className="font-medium text-slate-800">{weddingDate}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-0.5">Country</span>
                    <span className="font-medium text-slate-800">{country}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-0.5">Location</span>
                    <span className="font-medium text-slate-800">{location}</span>
                  </div>
                  {(locationName || street || city || state || pincode) && (
                    <div className="col-span-2">
                      <span className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-0.5">Full Address</span>
                      <span className="font-medium text-slate-800">
                        {[locationName, street, city, state, pincode].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-0.5">Total Budget</span>
                    <span className="font-medium text-slate-800">{formatCurrency(Number(budget), country)}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-0.5">Estimated Guests</span>
                    <span className="font-medium text-slate-800">{guestCount}</span>
                  </div>
                </div>
                
                <div className="border-t border-slate-200 pt-4 mt-2 space-y-4">
                  <span className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Workspace Seeding Preview</span>
                  
                  {/* Rituals Section */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[#2d336b]">Rituals ({customRituals.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 p-3 bg-white rounded-xl border border-slate-200 min-h-[46px] max-h-[150px] overflow-y-auto">
                      {customRituals.map((r, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#eef0f7] text-[#2d336b]">
                          {r.name}
                          <button
                            type="button"
                            onClick={() => setCustomRituals(customRituals.filter((_, i) => i !== idx))}
                            className="text-[#6771ab] hover:text-[#ef4444] transition-colors font-bold text-[10px] ml-1"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                      {customRituals.length === 0 && (
                        <span className="text-xs text-slate-400 italic">No rituals scheduled</span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2 max-w-md">
                      <Input
                        type="text"
                        placeholder="Add new ritual name..."
                        value={newRitualName}
                        onChange={(e) => setNewRitualName(e.target.value)}
                        className="h-8 text-xs bg-white border-slate-200 rounded-xl flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddRitual();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddRitual}
                        variant="primary"
                        className="h-8 px-3 text-xs rounded-xl flex-none bg-[#6771ab] text-white hover:bg-[#566198]"
                      >
                        + Add
                      </Button>
                    </div>
                  </div>

                  {/* Tasks Section */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[#2d336b]">Tasks ({customTasks.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 p-3 bg-white rounded-xl border border-slate-200 min-h-[46px] max-h-[150px] overflow-y-auto">
                      {customTasks.map((t, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#fefce8] text-[#475569] border border-yellow-200">
                          {t.title}
                          <button
                            type="button"
                            onClick={() => setCustomTasks(customTasks.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-[#ef4444] transition-colors font-bold text-[10px] ml-1"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                      {customTasks.length === 0 && (
                        <span className="text-xs text-slate-400 italic">No tasks created</span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2 max-w-md">
                      <Input
                        type="text"
                        placeholder="Add new task title..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="h-8 text-xs bg-white border-slate-200 rounded-xl flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTask();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={handleAddTask}
                        variant="primary"
                        className="h-8 px-3 text-xs rounded-xl flex-none bg-[#6771ab] text-white hover:bg-[#566198]"
                      >
                        + Add
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Error notification */}
        {error && (
          <div className="my-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">
            {error}
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-8">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || submitting}
            className="text-slate-600"
          >
            Back
          </Button>

          {step < 5 ? (
            <Button type="button" onClick={handleNext} variant="primary">
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              variant="primary"
              disabled={submitting}
            >
              {submitting ? "Seeding Workspace..." : "Confirm & Launch"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
