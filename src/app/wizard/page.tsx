"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createWeddingAction } from "@/app/actions/wedding";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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

const taskCategories = [
  { id: "venue", label: "Venue" },
  { id: "catering", label: "Catering" },
  { id: "decor", label: "Decor" },
  { id: "apparel", label: "Apparel" },
  { id: "invitations", label: "Invitations" },
  { id: "music", label: "Music" },
  { id: "rituals", label: "Rituals" },
  { id: "other", label: "Other" },
];

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);

  // Form states
  const [partnerA, setPartnerA] = React.useState("");
  const [partnerB, setPartnerB] = React.useState("");
  const [weddingDate, setWeddingDate] = React.useState("");
  const [location, setLocation] = React.useState("");
  const locationRef = React.useRef(location);
  React.useEffect(() => {
    locationRef.current = location;
  }, [location]);
  const [locationName, setLocationName] = React.useState("");
  const [street, setStreet] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [country, setCountry] = React.useState("India");
  const [pincode, setPincode] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [tradition, setTradition] = React.useState<string>("secular");
  const [budget, setBudget] = React.useState(1000000);
  const [guestCount, setGuestCount] = React.useState(150);

  // Dynamic db data
  interface DBTradition {
    id: string;
    key: string;
    name: string;
    description: string | null;
    seedTasks: string | null;
    seedCeremonies: string | null;
  }
  interface DBCategory {
    id: string;
    key: string;
    name: string;
  }
  const [dbTraditions, setDbTraditions] = React.useState<DBTradition[]>([]);
  const [dbCategories, setDbCategories] = React.useState<DBCategory[]>([]);
  const [customTraditionName, setCustomTraditionName] = React.useState("");

  React.useEffect(() => {
    async function load() {
      try {
        const { getPublicTraditions, getPublicCategories } = await import("@/app/actions/wedding");
        const [trads, cats] = await Promise.all([getPublicTraditions(), getPublicCategories()]);
        setDbTraditions(trads);
        setDbCategories(cats);
      } catch (e) {
        console.error("Failed to load db traditions/categories in wizard:", e);
      }
    }
    load();
  }, []);

  // Helper function to calculate due date dynamically
  const calculateTaskDueDate = (wDateStr: string, category: string): string => {
    if (!wDateStr) return "";
    const wDate = new Date(wDateStr);
    const now = new Date();
    const diffTime = wDate.getTime() - now.getTime();
    if (diffTime <= 0) {
      return now.toISOString().split("T")[0];
    }
    let ratio = 0.5;
    switch (category) {
      case "rituals":
        ratio = 0.15;
        break;
      case "venue":
        ratio = 0.2;
        break;
      case "decor":
        ratio = 0.25;
        break;
      case "music":
        ratio = 0.35;
        break;
      case "invitations":
        ratio = 0.4;
        break;
      case "apparel":
        ratio = 0.5;
        break;
      case "catering":
        ratio = 0.65;
        break;
      case "other":
      default:
        ratio = 0.8;
        break;
    }
    const targetTime = now.getTime() + diffTime * ratio;
    return new Date(targetTime).toISOString().split("T")[0];
  };

  // Customized list states
  const [customTasks, setCustomTasks] = React.useState<{ title: string; category: string; dueDate: string }[]>([]);
  const [customRituals, setCustomRituals] = React.useState<{
    name: string;
    description: string;
    date: string;
    startTimeOnly: string;
    endTimeOnly: string;
    location: string;
  }[]>([]);

  // Form states for adding new task
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [newTaskCategory, setNewTaskCategory] = React.useState("other");
  const [newTaskDueDate, setNewTaskDueDate] = React.useState("");

  // Form states for adding new ritual
  const [newRitualName, setNewRitualName] = React.useState("");
  const [newRitualDescription, setNewRitualDescription] = React.useState("");
  const [newRitualDate, setNewRitualDate] = React.useState("");
  const [newRitualStartTime, setNewRitualStartTime] = React.useState("09:00");
  const [newRitualEndTime, setNewRitualEndTime] = React.useState("17:00");
  const [newRitualLocation, setNewRitualLocation] = React.useState("");

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    setCustomTasks([
      ...customTasks,
      {
        title: newTaskTitle.trim(),
        category: newTaskCategory,
        dueDate: newTaskDueDate || weddingDate || new Date().toISOString().split("T")[0],
      },
    ]);
    setNewTaskTitle("");
    setNewTaskCategory("other");
    setNewTaskDueDate("");
  };

  const handleAddRitual = () => {
    if (!newRitualName.trim()) return;
    setCustomRituals([
      ...customRituals,
      {
        name: newRitualName.trim(),
        description: newRitualDescription.trim() || "Custom ritual",
        date: newRitualDate || weddingDate || new Date().toISOString().split("T")[0],
        startTimeOnly: newRitualStartTime,
        endTimeOnly: newRitualEndTime,
        location: newRitualLocation.trim() || location || "",
      },
    ]);
    setNewRitualName("");
    setNewRitualDescription("");
    setNewRitualDate("");
    setNewRitualStartTime("09:00");
    setNewRitualEndTime("17:00");
    setNewRitualLocation("");
  };

  const updateTask = (index: number, field: keyof typeof customTasks[0], value: string) => {
    setCustomTasks(
      customTasks.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const deleteTask = (index: number) => {
    setCustomTasks(customTasks.filter((_, i) => i !== index));
  };

  const updateRitual = (index: number, field: keyof typeof customRituals[0], value: string) => {
    setCustomRituals(
      customRituals.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const deleteRitual = (index: number) => {
    setCustomRituals(customRituals.filter((_, i) => i !== index));
  };

  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);

  React.useEffect(() => {
    if (!weddingDate) return;
    setTimeout(() => {
      const dbTrad = dbTraditions.find(t => t.key === tradition);
      let tasksMapped: { title: string; category: string; dueDate: string }[] = [];
      let ritualsMapped: {
        name: string;
        description: string;
        date: string;
        startTimeOnly: string;
        endTimeOnly: string;
        location: string;
      }[] = [];

      if (dbTrad) {
        if (dbTrad.seedTasks) {
          try {
            const parsedTasks = JSON.parse(dbTrad.seedTasks);
            if (Array.isArray(parsedTasks)) {
              tasksMapped = parsedTasks.map(t => ({
                title: t.title || "",
                category: t.category || "other",
                dueDate: calculateTaskDueDate(weddingDate, t.category || "other")
              }));
            }
          } catch (e) {
            console.error(e);
          }
        }
        if (dbTrad.seedCeremonies) {
          try {
            const parsedCers = JSON.parse(dbTrad.seedCeremonies);
            if (Array.isArray(parsedCers)) {
              ritualsMapped = parsedCers.map(r => {
                let dateStr = weddingDate;
                if (typeof r.offsetDays === "number") {
                  const rDate = new Date(weddingDate);
                  rDate.setDate(rDate.getDate() + r.offsetDays);
                  dateStr = rDate.toISOString().split("T")[0];
                }
                const startHStr = String(r.startHour ?? 9).padStart(2, "0");
                const startMStr = String(r.startMin ?? 0).padStart(2, "0");
                const endHStr = String(r.endHour ?? 17).padStart(2, "0");
                const endMStr = String(r.endMin ?? 0).padStart(2, "0");
                return {
                  name: r.name || "",
                  description: r.description || "",
                  date: dateStr,
                  startTimeOnly: `${startHStr}:${startMStr}`,
                  endTimeOnly: `${endHStr}:${endMStr}`,
                  location: r.location || locationRef.current || ""
                };
              });
            }
          } catch (e) {
            console.error(e);
          }
        }
      } else if (tradition !== "other" && defaultTasks[tradition as keyof typeof defaultTasks]) {
        tasksMapped = defaultTasks[tradition as keyof typeof defaultTasks].map((t) => ({
          ...t,
          dueDate: calculateTaskDueDate(weddingDate, t.category),
        }));

        ritualsMapped = defaultRituals[tradition as keyof typeof defaultRituals].map((r) => {
          const offset = r.offsetDays ?? 0;
          const rDate = new Date(weddingDate);
          rDate.setDate(rDate.getDate() + offset);
          const dateStr = rDate.toISOString().split("T")[0];

          const startHStr = String(r.startHour ?? 9).padStart(2, "0");
          const startMStr = String(r.startMin ?? 0).padStart(2, "0");
          const endHStr = String(r.endHour ?? 17).padStart(2, "0");
          const endMStr = String(r.endMin ?? 0).padStart(2, "0");

          return {
            name: r.name,
            description: r.description || "",
            date: dateStr,
            startTimeOnly: `${startHStr}:${startMStr}`,
            endTimeOnly: `${endHStr}:${endMStr}`,
            location: locationRef.current || "",
          };
        });
      }

      setCustomTasks(tasksMapped);
      setCustomRituals(ritualsMapped);
    }, 0);
  }, [tradition, weddingDate, dbTraditions]);

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
    if (step === 5) {
      for (const t of customTasks) {
        if (!t.title.trim()) {
          setError("All tasks must have a title.");
          return false;
        }
      }
    }
    if (step === 6) {
      for (const r of customRituals) {
        if (!r.name.trim()) {
          setError("All events must have a name.");
          return false;
        }
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
      const formattedRituals = customRituals.map((r) => {
        const startStr = `${r.date}T${r.startTimeOnly || "00:00"}`;
        const endStr = `${r.date}T${r.endTimeOnly || "00:00"}`;
        return {
          name: r.name,
          description: r.description,
          startTime: new Date(startStr).toISOString(),
          endTime: new Date(endStr).toISOString(),
          location: r.location,
        };
      });

      const res = await createWeddingAction({
        partnerA,
        partnerB,
        tradition: tradition === "other" ? (customTraditionName.trim() || "other") : tradition,
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
        customTasks: customTasks.map((t) => ({
          title: t.title,
          category: t.category,
          dueDate: t.dueDate,
        })),
        customRituals: formattedRituals,
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
      <Card variant="default" className="w-full max-w-2xl bg-white p-8 shadow-xl border border-slate-100 flex flex-col relative">

        {/* Top Progress Indicator */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
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
                <span className="hidden md:inline text-xs ml-2 font-medium text-slate-500">
                  {s === 1 && "Partners"}
                  {s === 2 && "Date & Place"}
                  {s === 3 && "Tradition"}
                  {s === 4 && "Budget & Guests"}
                  {s === 5 && "Wedding Tasks Plan"}
                  {s === 6 && "Wedding Ceremonies"}
                  {s === 7 && "Review"}
                </span>
              </div>
              {s < 7 && <div className={`flex-1 h-[2px] mx-1 ${step > s ? "bg-[#6771ab]" : "bg-slate-100"}`} />}
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
                <p className="text-sm text-slate-500">Choose a cultural tradition. This will pre-populate your tasks and ceremonies.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ...traditions.map(t => ({ id: t.id, label: t.label, desc: t.desc })),
                  ...dbTraditions.map(t => ({ id: t.key, label: t.name, desc: t.description || "" })),
                  { id: "other", label: "Other", desc: "Create a custom tradition with your own tasks and ceremonies" }
                ].map((t) => {
                  const isSelected = tradition === t.id;
                  return (
                    <Card
                      key={t.id}
                      onClick={() => {
                        setTradition(t.id);
                        if (t.id !== "other") {
                          setCustomTraditionName("");
                        }
                      }}
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
              {tradition === "other" && (
                <div className="space-y-1 mt-4">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest block mb-1">Custom Tradition Name</label>
                  <Input
                    type="text"
                    placeholder="e.g. My Custom Tradition"
                    value={customTraditionName}
                    onChange={(e) => setCustomTraditionName(e.target.value)}
                    required
                  />
                </div>
              )}
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
                <h2 className="text-xl font-bold text-[#6771ab] mb-1">Wedding Tasks Plan</h2>
                <p className="text-sm text-slate-500">
                  Customize the tasks for your wedding. Set due dates to keep your planning on track. You can always manage these tasks from the Wedding Task Planner.
                </p>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {customTasks.map((t, idx) => (
                  <Card key={idx} variant="default" className="p-4 border border-slate-100 shadow-sm relative bg-[#fefce8]">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-6">
                        <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Task Title</label>
                        <Input
                          type="text"
                          value={t.title}
                          onChange={(e) => updateTask(idx, "title", e.target.value)}
                          placeholder="e.g. Book mehndi artist"
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Category</label>
                        <select
                          value={t.category}
                          onChange={(e) => updateTask(idx, "category", e.target.value)}
                          className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6771ab]"
                        >
                          {[
                            ...taskCategories.filter(c => c.id !== "other"),
                            ...dbCategories.map(c => ({ id: c.key, label: c.name })),
                            { id: "other", label: "Other" }
                          ].map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-3 flex items-end gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Due Date</label>
                          <Input
                            type="date"
                            value={t.dueDate}
                            onChange={(e) => updateTask(idx, "dueDate", e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => deleteTask(idx)}
                          className="h-9 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl flex items-center justify-center min-w-[36px]"
                          title="Delete task"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {customTasks.length === 0 && (
                  <p className="text-sm text-slate-400 italic text-center py-4">No tasks added yet. Add one below!</p>
                )}
              </div>

              {/* Add New Task Form */}
              <div className="border-t border-slate-100 pt-4 mt-4 bg-slate-50/50 p-4 rounded-xl border">
                <h4 className="text-xs font-semibold text-[#6771ab] uppercase tracking-wider mb-2">Add New Planning Task</h4>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-6">
                    <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Task Title</label>
                    <Input
                      type="text"
                      placeholder="e.g. Hire Wedding Planner"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Category</label>
                    <select
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value)}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6771ab]"
                    >
                      {[
                        ...taskCategories.filter(c => c.id !== "other"),
                        ...dbCategories.map(c => ({ id: c.key, label: c.name })),
                        { id: "other", label: "Other" }
                      ].map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3 flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Due Date</label>
                      <Input
                        type="date"
                        value={newTaskDueDate}
                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddTask}
                      variant="primary"
                      className="h-9 px-4 text-xs rounded-xl bg-[#6771ab] text-white hover:bg-[#566198]"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#6771ab] mb-1">Wedding Ceremonies</h2>
                <p className="text-sm text-slate-500">
                  Customize details, dates, times, and venues for each ceremony or event. You can always manage these ceremonies from the Wedding Ceremony Planner.
                </p>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {customRituals.map((r, idx) => (
                  <Card key={idx} variant="default" className="p-4 border border-slate-100 shadow-sm relative bg-[#fefce8]">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      <div className="md:col-span-4">
                        <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Event Name</label>
                        <Input
                          type="text"
                          value={r.name}
                          onChange={(e) => updateRitual(idx, "name", e.target.value)}
                          placeholder="e.g. Sangeet"
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="md:col-span-4">
                        <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Description</label>
                        <Input
                          type="text"
                          value={r.description || ""}
                          onChange={(e) => updateRitual(idx, "description", e.target.value)}
                          placeholder="e.g. Dance and music night"
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="md:col-span-4">
                        <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Location / Venue</label>
                        <Input
                          type="text"
                          value={r.location || ""}
                          onChange={(e) => updateRitual(idx, "location", e.target.value)}
                          placeholder="e.g. Royal Banquet Hall"
                          className="h-9 text-xs"
                        />
                      </div>
                      
                      <div className="md:col-span-4">
                        <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Date</label>
                        <Input
                          type="date"
                          value={r.date}
                          onChange={(e) => updateRitual(idx, "date", e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="md:col-span-4">
                        <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Start Time</label>
                        <Input
                          type="time"
                          value={r.startTimeOnly}
                          onChange={(e) => updateRitual(idx, "startTimeOnly", e.target.value)}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="md:col-span-4 flex items-end gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">End Time</label>
                          <Input
                            type="time"
                            value={r.endTimeOnly}
                            onChange={(e) => updateRitual(idx, "endTimeOnly", e.target.value)}
                            className="h-9 text-xs"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => deleteRitual(idx)}
                          className="h-9 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl flex items-center justify-center min-w-[36px]"
                          title="Delete ritual"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {customRituals.length === 0 && (
                  <p className="text-sm text-slate-400 italic text-center py-4">No events scheduled. Add one below!</p>
                )}
              </div>

              {/* Add New Ritual Form */}
              <div className="border-t border-slate-100 pt-4 mt-4 bg-slate-50/50 p-4 rounded-xl border">
                <h4 className="text-xs font-semibold text-[#6771ab] uppercase tracking-wider mb-2">Add New Custom Ceremony</h4>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Event Name</label>
                    <Input
                      type="text"
                      placeholder="e.g. Welcome Drinks"
                      value={newRitualName}
                      onChange={(e) => setNewRitualName(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Description</label>
                    <Input
                      type="text"
                      placeholder="Ice breaker social"
                      value={newRitualDescription}
                      onChange={(e) => setNewRitualDescription(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Location / Venue</label>
                    <Input
                      type="text"
                      placeholder="Hotel Poolside"
                      value={newRitualLocation}
                      onChange={(e) => setNewRitualLocation(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Date</label>
                    <Input
                      type="date"
                      value={newRitualDate}
                      onChange={(e) => setNewRitualDate(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Start Time</label>
                    <Input
                      type="time"
                      value={newRitualStartTime}
                      onChange={(e) => setNewRitualStartTime(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="md:col-span-4 flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">End Time</label>
                      <Input
                        type="time"
                        value={newRitualEndTime}
                        onChange={(e) => setNewRitualEndTime(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddRitual}
                      variant="primary"
                      className="h-9 px-4 text-xs rounded-xl bg-[#6771ab] text-white hover:bg-[#566198]"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 7 && (
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
                      <span className="text-xs font-semibold text-[#2d336b]">Wedding Ceremonies ({customRituals.length})</span>
                    </div>
                    <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200 max-h-[200px] overflow-y-auto">
                      {customRituals.map((r, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs border-b border-slate-100 last:border-0 pb-1.5 last:pb-0">
                          <div>
                            <span className="font-semibold text-[#2d336b]">{r.name}</span>
                            {r.location && <span className="text-slate-400 block sm:inline sm:ml-2">📍 {r.location}</span>}
                          </div>
                          <div className="text-[#6771ab] font-medium">
                            📅 {r.date} ({r.startTimeOnly} - {r.endTimeOnly})
                          </div>
                        </div>
                      ))}
                      {customRituals.length === 0 && (
                        <p className="text-xs text-slate-400 italic text-center">No events scheduled</p>
                      )}
                    </div>
                  </div>

                  {/* Tasks Section */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[#2d336b]">Planning Tasks ({customTasks.length})</span>
                    </div>
                    <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200 max-h-[200px] overflow-y-auto">
                      {customTasks.map((t, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs border-b border-slate-100 last:border-0 pb-1.5 last:pb-0">
                          <span className="font-medium text-slate-800">{t.title}</span>
                          <span className="text-[#6771ab] text-[10px] font-semibold bg-[#eef0f7] px-2 py-0.5 rounded-full flex items-center gap-1">
                            📅 Due: {t.dueDate || "Not set"}
                          </span>
                        </div>
                      ))}
                      {customTasks.length === 0 && (
                        <p className="text-xs text-slate-400 italic text-center">No tasks created</p>
                      )}
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
        <div className="flex items-center gap-3 border-t border-slate-100 pt-6 mt-8">
          <Button
            type="button"
            variant="error"
            onClick={() => setShowCancelConfirm(true)}
            className="font-semibold"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            disabled={submitting}
            className="text-slate-500"
          >
            Skip
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || submitting}
            className="text-slate-600"
          >
            Back
          </Button>

          {step < 7 ? (
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

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => {
          setShowCancelConfirm(false);
          router.push("/dashboard");
        }}
        title="Cancel Wedding Setup?"
        message="Are you sure you want to cancel? All unsaved changes will be lost. You can always start again from the wizard."
        confirmLabel="Yes, Cancel"
        cancelLabel="Go Back"
        variant="danger"
      />
    </div>
  );
}
