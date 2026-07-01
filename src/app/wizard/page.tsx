"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FieldHelp } from "@/components/ui/field-help";
import { createWeddingAction } from "@/app/actions/wedding";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { authClient } from "@/lib/auth-client";
import { formatCurrency, getCurrencyForCountry } from "@/lib/format";

const traditions = [
  { id: "hindu", label: "Hindu", desc: "Mehndi, Haldi & Sangeet, Saat Phere, Reception" },
  { id: "muslim", label: "Muslim", desc: "Imam Zamin & Manjha, Nikah, Valima" },
  { id: "sikh", label: "Sikh", desc: "Maiya & Vatna, Anand Karaj, Reception" },
  { id: "christian", label: "Christian", desc: "Rehearsal Dinner, Church Ceremony, Reception" },
  { id: "secular", label: "Secular", desc: "Welcome Toast, Exchange of Vows, Reception Dinner" },
] as const;

const defaultTasks = {
  hindu: [
    { title: "Book Mehndi Artist", category: "ceremonies", ceremonyName: "Mehndi" },
    { title: "Buy Wedding Lehenga & Sherwani", category: "apparel", ceremonyName: "Mandap Pheras" },
    { title: "Hire Dhol Players & DJ", category: "music", ceremonyName: "Sangeet" },
    { title: "Arrange Catering & Sweets (Mithai)", category: "catering", ceremonyName: "Reception" },
    { title: "Select Mandap Decorator", category: "decor", ceremonyName: "Mandap Pheras" },
  ],
  muslim: [
    { title: "Coordinate with Qazi & Print Nikah Nama", category: "ceremonies", ceremonyName: "Nikah" },
    { title: "Purchase Wedding Attire (Sherwani/Gharara)", category: "apparel", ceremonyName: "Nikah" },
    { title: "Select Stage & Floral Decorator", category: "decor", ceremonyName: "Valima" },
    { title: "Book Catering Menu for Valima Feast", category: "catering", ceremonyName: "Valima" },
  ],
  sikh: [
    { title: "Book Gurdwara & Coordinate with Ragis", category: "venue", ceremonyName: "Anand Karaj" },
    { title: "Purchase Rumalla Sahib for Guru Granth Sahib", category: "ceremonies", ceremonyName: "Anand Karaj" },
    { title: "Finalize Langar or Catering Menu", category: "catering", ceremonyName: "Anand Karaj" },
    { title: "Buy Anand Karaj Bridal/Groom Suit", category: "apparel", ceremonyName: "Anand Karaj" },
  ],
  christian: [
    { title: "Secure Church Venue & Priest", category: "venue", ceremonyName: "Church Ceremony" },
    { title: "Purchase Wedding Dress & Tuxedo", category: "apparel", ceremonyName: "Church Ceremony" },
    { title: "Order Wedding Cake & Floral Bouquets", category: "catering", ceremonyName: "Reception" },
    { title: "Hire Wedding Choir & Organist", category: "music", ceremonyName: "Church Ceremony" },
  ],
  secular: [
    { title: "Select Secular Celebrant", category: "ceremonies", ceremonyName: "Vows" },
    { title: "Write Wedding Vows", category: "other", ceremonyName: "Vows" },
    { title: "Arrange Catering & Open Bar", category: "catering", ceremonyName: "Reception" },
    { title: "Coordinate Photographer/Videographer Contracts", category: "other", ceremonyName: "Reception" },
  ],
};

const defaultRituals = {
  hindu: [
    { name: "Mehndi", description: "Traditional henna pre-wedding celebration", offsetDays: -2, startHour: 14, startMin: 0, endHour: 18, endMin: 0, isFoodServed: false },
    { name: "Haldi", description: "Traditional cleansing ceremony", offsetDays: -1, startHour: 10, startMin: 0, endHour: 13, endMin: 0, isFoodServed: false },
    { name: "Sangeet", description: "Musical celebration night", offsetDays: -1, startHour: 18, startMin: 0, endHour: 22, endMin: 0, isFoodServed: false },
    { name: "Mandap Pheras", description: "Main Vedic wedding ceremony rituals around the holy fire", offsetDays: 0, startHour: 10, startMin: 0, endHour: 14, endMin: 0, isFoodServed: true },
    { name: "Reception", description: "Grand wedding dinner reception", offsetDays: 0, startHour: 19, startMin: 0, endHour: 23, endMin: 0, isFoodServed: true },
  ],
  muslim: [
    { name: "Manjha", description: "Traditional pre-wedding ceremonies", offsetDays: -2, startHour: 16, startMin: 0, endHour: 20, endMin: 0, isFoodServed: false },
    { name: "Nikah", description: "Official marriage contract ceremony", offsetDays: 0, startHour: 11, startMin: 0, endHour: 13, endMin: 0, isFoodServed: true },
    { name: "Valima", description: "Post-wedding grand feast reception", offsetDays: 1, startHour: 19, startMin: 0, endHour: 23, endMin: 0, isFoodServed: true },
  ],
  sikh: [
    { name: "Maiya", description: "Traditional pre-wedding cleansing ceremonies", offsetDays: -1, startHour: 10, startMin: 0, endHour: 13, endMin: 0, isFoodServed: false },
    { name: "Anand Karaj", description: "Holy wedding ceremony at the Gurdwara", offsetDays: 0, startHour: 9, startMin: 0, endHour: 13, endMin: 0, isFoodServed: true },
    { name: "Reception", description: "Post-wedding dinner party celebration", offsetDays: 0, startHour: 18, startMin: 0, endHour: 23, endMin: 0, isFoodServed: true },
  ],
  christian: [
    { name: "Rehearsal Dinner", description: "Formal dinner with family and bridal party", offsetDays: -1, startHour: 18, startMin: 0, endHour: 21, endMin: 0, isFoodServed: true },
    { name: "Church Ceremony", description: "Marriage ceremony in the church", offsetDays: 0, startHour: 14, startMin: 0, endHour: 16, endMin: 0, isFoodServed: false },
    { name: "Reception", description: "Evening reception celebration with cake and dancing", offsetDays: 0, startHour: 18, startMin: 0, endHour: 23, endMin: 0, isFoodServed: true },
  ],
  secular: [
    { name: "Toast", description: "Ice-breaker drinks with incoming guests", offsetDays: -1, startHour: 18, startMin: 0, endHour: 20, endMin: 0, isFoodServed: true },
    { name: "Vows", description: "Ceremonial reading of wedding vows", offsetDays: 0, startHour: 16, startMin: 0, endHour: 17, endMin: 30, isFoodServed: false },
    { name: "Reception", description: "Dinner, toast, and dancing", offsetDays: 0, startHour: 18, startMin: 0, endHour: 23, endMin: 30, isFoodServed: true },
  ],
};


export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);

  const { data: sessionData, isPending } = authClient.useSession();

  React.useEffect(() => {
    if (!isPending) {
      if (!sessionData || !sessionData.user) {
        router.push("/login");
        return;
      }
      const user = sessionData.user as { role?: string; persona?: string; weddingId?: string | null };
      const isAllowed = user.role !== "user" && (user.role === "admin" || (user.persona === "diy" && !user.weddingId));
      if (!isAllowed) {
        router.push("/dashboard");
      }
    }
  }, [sessionData, isPending, router]);

  // Form states
  const [partnerA, setPartnerA] = React.useState("");
  const [brideFather, setBrideFather] = React.useState("");
  const [brideMother, setBrideMother] = React.useState("");
  const [partnerB, setPartnerB] = React.useState("");
  const [groomFather, setGroomFather] = React.useState("");
  const [groomMother, setGroomMother] = React.useState("");
  const [weddingDate, setWeddingDate] = React.useState("");
  const [location, setLocation] = React.useState("");
  const locationRef = React.useRef(location);
  const locationManuallyEdited = React.useRef(false);
  React.useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const [locationName, setLocationName] = React.useState("");
  const [street, setStreet] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [country, setCountry] = React.useState("India");
  const [pincode, setPincode] = React.useState("");
  React.useEffect(() => {
    if (locationManuallyEdited.current) return;
    const parts = [locationName, street, city, state, country, pincode].filter(Boolean);
    if (parts.length >= 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocation(parts.join(', '));
    }
  }, [locationName, street, city, state, country, pincode]);
  const [multiLocationEnabled, setMultiLocationEnabled] = React.useState(false);
  const [locationOptions, setLocationOptions] = React.useState<string[]>([]);
  const [newLocationOption, setNewLocationOption] = React.useState("");
  const allVenueOptions = React.useMemo(() => {
    const venueList = location ? [location] : [];
    locationOptions.forEach((loc) => {
      if (!venueList.includes(loc)) venueList.push(loc);
    });
    return venueList;
  }, [location, locationOptions]);
  const [description, setDescription] = React.useState("");
  const [teamMembers, setTeamMembers] = React.useState<{ name: string; email: string; password: string }[]>([]);
  const [newTeamName, setNewTeamName] = React.useState("");
  const [newTeamEmail, setNewTeamEmail] = React.useState("");
  const [newTeamPassword, setNewTeamPassword] = React.useState("User@2027!");

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
  const [newTraditionDesc, setNewTraditionDesc] = React.useState("");
  const [savingTradition, setSavingTradition] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
  const [customTasks, setCustomTasks] = React.useState<{ title: string; category: string; dueDate: string; ceremonyName?: string }[]>([]);
  const [customRituals, setCustomRituals] = React.useState<{
    name: string;
    description: string;
    date: string;
    startTimeOnly: string;
    endTimeOnly: string;
    location: string;
    isFoodServed: boolean;
  }[]>([]);

  // Form states for adding new task
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [newTaskCategory, setNewTaskCategory] = React.useState("other");
  const [newTaskDueDate, setNewTaskDueDate] = React.useState("");
  const [newTaskCeremonyName, setNewTaskCeremonyName] = React.useState("");

  // Form states for adding new ritual
  const [newRitualName, setNewRitualName] = React.useState("");
  const [newRitualDescription, setNewRitualDescription] = React.useState("");
  const [newRitualDate, setNewRitualDate] = React.useState("");
  const [newRitualStartTime, setNewRitualStartTime] = React.useState("09:00");
  const [newRitualEndTime, setNewRitualEndTime] = React.useState("17:00");
  const [newRitualLocation, setNewRitualLocation] = React.useState("");
  const [newRitualIsFoodServed, setNewRitualIsFoodServed] = React.useState(false);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    setCustomTasks([
      ...customTasks,
      {
        title: newTaskTitle.trim(),
        category: newTaskCategory,
        dueDate: newTaskDueDate || weddingDate || new Date().toISOString().split("T")[0],
        ceremonyName: newTaskCeremonyName || undefined,
      },
    ]);
    setNewTaskTitle("");
    setNewTaskCategory("other");
    setNewTaskDueDate("");
    setNewTaskCeremonyName("");
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
        isFoodServed: newRitualIsFoodServed,
      },
    ]);
    setNewRitualName("");
    setNewRitualDescription("");
    setNewRitualDate("");
    setNewRitualStartTime("09:00");
    setNewRitualEndTime("17:00");
    setNewRitualLocation("");
    setNewRitualIsFoodServed(false);
  };

  const updateTask = (index: number, field: keyof typeof customTasks[0], value: string) => {
    setCustomTasks(
      customTasks.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const deleteTask = (index: number) => {
    setCustomTasks(customTasks.filter((_, i) => i !== index));
  };

  const updateRitual = (index: number, field: keyof typeof customRituals[0], value: string | boolean) => {
    setCustomRituals(
      customRituals.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const deleteRitual = (index: number) => {
    setCustomRituals(customRituals.filter((_, i) => i !== index));
  };

  const handleAddTeamMember = () => {
    if (!newTeamName.trim() || !newTeamEmail.trim() || !newTeamPassword.trim()) return;
    setTeamMembers([...teamMembers, { name: newTeamName, email: newTeamEmail, password: newTeamPassword }]);
    setNewTeamName("");
    setNewTeamEmail("");
    setNewTeamPassword("");
  };

  const deleteTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleSaveNewTradition = async () => {
    if (!customTraditionName.trim()) return;
    setSavingTradition(true);
    setToast(null);
    try {
      const { createWizardTraditionAction } = await import("@/app/actions/wedding");
      const res = await createWizardTraditionAction({
        name: customTraditionName.trim(),
        description: newTraditionDesc.trim() || undefined,
      });
      if (res.error) {
        setToast({ message: res.error, type: 'error' });
      } else {
        setToast({ message: `Tradition "${customTraditionName.trim()}" created!`, type: 'success' });
        setCustomTraditionName("");
        setNewTraditionDesc("");
        const { getPublicTraditions } = await import("@/app/actions/wedding");
        const trads = await getPublicTraditions();
        setDbTraditions(trads);
        if (res.tradition) setTradition(res.tradition.key);
      }
    } catch (err) {
      setToast({ message: 'Failed to save tradition.', type: 'error' });
    } finally {
      setSavingTradition(false);
    }
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
        isFoodServed: boolean;
      }[] = [];

      if (dbTrad) {
        if (dbTrad.seedTasks) {
          try {
            const parsedTasks = JSON.parse(dbTrad.seedTasks);
            if (Array.isArray(parsedTasks)) {
              tasksMapped = parsedTasks.map(t => ({
                title: t.title || "",
                category: t.category || "other",
                dueDate: calculateTaskDueDate(weddingDate, t.category || "other"),
                ceremonyName: t.ceremonyName || undefined,
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
                const hasFood = typeof r.isFoodServed === 'boolean'
                  ? r.isFoodServed
                  : (r.name.toLowerCase().includes("reception") || 
                     r.name.toLowerCase().includes("valima") || 
                     r.name.toLowerCase().includes("pheras") ||
                     r.name.toLowerCase().includes("feast"));
                return {
                  name: r.name || "",
                  description: r.description || "",
                  date: dateStr,
                  startTimeOnly: `${startHStr}:${startMStr}`,
                  endTimeOnly: `${endHStr}:${endMStr}`,
                  location: r.location || locationRef.current || "",
                  isFoodServed: hasFood
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
            isFoodServed: r.isFoodServed,
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
        return;
      }
      const user = session.data.user as { role?: string; persona?: string; weddingId?: string | null };
      const role = user.role || "user";
      const persona = user.persona || "diy";
      const weddingId = user.weddingId;

      const isAllowed = role !== "user" && (role === "admin" || (persona === "diy" && !weddingId));
      if (!isAllowed) {
        router.push("/dashboard");
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
    if (step === 4) {
      for (const tm of teamMembers) {
        if (!tm.name.trim() || !tm.email.trim() || !tm.password.trim()) {
          setError("All team members must have a name, email, and password.");
          return false;
        }
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
    if (step === 8) {
      if (budget <= 0) {
        setError("Budget must be a positive number.");
        return false;
      }
      if (guestCount <= 0) {
        setError("Guest count must be a positive number.");
        return false;
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
    if (step === 7) {
      for (const t of customTasks) {
        if (!t.title.trim()) {
          setError("All tasks must have a title.");
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
          isFoodServed: r.isFoodServed,
        };
      });

      const res = await createWeddingAction({
        partnerA,
        brideFather,
        brideMother,
        partnerB,
        groomFather,
        groomMother,
        teamMembers,
        tradition: tradition === "other" ? (customTraditionName.trim() || "other") : tradition,
        weddingDate,
        budget,
        guestCount,
        location,
        locationOptions: locationOptions.length > 0 ? locationOptions : undefined,
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
          ceremonyName: t.ceremonyName || undefined,
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex items-center justify-center p-4 transition-colors duration-300">
      <Card variant="default" className="w-full max-w-2xl bg-white p-8 shadow-xl border border-slate-100 flex flex-col relative overflow-x-hidden">

        {/* Top Progress Indicator */}
        <div className="flex items-center justify-between mb-8 shrink-0 overflow-x-auto pb-1 gap-0">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center shrink-0">
                <div
                  className={`min-w-[28px] min-h-[28px] rounded-full flex items-center justify-center font-semibold text-[11px] leading-none transition-all ${
                    step >= s 
                      ? "bg-[#6771ab] text-white shadow-sm" 
                      : "bg-slate-100 text-slate-400"
                  }`}
                  style={{ width: '28px', height: '28px' }}
                >
                  {s}
                </div>
                <span className="hidden lg:inline text-[11px] ml-1.5 font-medium text-slate-500 whitespace-nowrap">
                  {s === 1 && "Partners"}
                  {s === 2 && "Date & Place"}
                  {s === 3 && "Team"}
                  {s === 4 && "Tradition"}
                  {s === 5 && "Budget & Guests"}
                  {s === 6 && "Ceremonies"}
                  {s === 7 && "Tasks"}
                  {s === 8 && "Review"}
                </span>
              </div>
              {i < 7 && <div className={`h-[2px] min-w-[6px] flex-1 mx-1 rounded-full ${step > s ? "bg-[#6771ab]" : "bg-slate-100"}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Wizard Form Content */}
        <div className="flex-1 min-h-[300px] overflow-y-auto max-h-[calc(100vh-380px)] overflow-x-hidden">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#6771ab] mb-1">Partner Details</h2>
                <p className="text-sm text-slate-500">Let&apos;s start with the happy couple&apos;s names.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest flex items-center gap-1.5"><span>Bride Name</span><FieldHelp message="Full name of the bride" /></label>
                  <Input
                    type="text"
                    placeholder="Enter partner A name"
                    value={partnerA}
                    onChange={(e) => setPartnerA(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest flex items-center gap-1.5"><span>Bridegroom Name</span><FieldHelp message="Full name of the bridegroom" /></label>
                  <Input
                    type="text"
                    placeholder="Enter partner B name"
                    value={partnerB}
                    onChange={(e) => setPartnerB(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest flex items-center gap-1.5">
                    <span>Bride&apos;s Father Name</span>
                    <FieldHelp message="Optional. Name of the bride's father" />
                  </label>
                  <Input type="text" placeholder="Enter bride's father name" value={brideFather} onChange={(e) => setBrideFather(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest flex items-center gap-1.5">
                    <span>Bride&apos;s Mother Name</span>
                    <FieldHelp message="Optional. Name of the bride's mother" />
                  </label>
                  <Input type="text" placeholder="Enter bride's mother name" value={brideMother} onChange={(e) => setBrideMother(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest flex items-center gap-1.5">
                    <span>Bridegroom&apos;s Father Name</span>
                    <FieldHelp message="Optional. Name of the bridegroom's father" />
                  </label>
                  <Input type="text" placeholder="Enter bridegroom's father name" value={groomFather} onChange={(e) => setGroomFather(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest flex items-center gap-1.5">
                    <span>Bridegroom&apos;s Mother Name</span>
                    <FieldHelp message="Optional. Name of the bridegroom's mother" />
                  </label>
                  <Input type="text" placeholder="Enter bridegroom's mother name" value={groomMother} onChange={(e) => setGroomMother(e.target.value)} />
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
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest flex items-center gap-1.5"><span>Wedding Date</span><FieldHelp message="The main day of the wedding" /></label>
                  <Input
                    type="date"
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest flex items-center gap-1.5"><span>Country</span><FieldHelp message="Select the country where the wedding will take place" /></label>
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
                  onChange={(e) => {
                    locationManuallyEdited.current = true;
                    setLocation(e.target.value);
                  }}
                />
              </div>
              <div className="border-t border-slate-200 pt-4 mt-4 space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={multiLocationEnabled}
                    onChange={(e) => setMultiLocationEnabled(e.target.checked)}
                    className="rounded border-slate-300 text-[#6771ab] focus:ring-[#6771ab]"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    My ceremonies are at different locations
                  </span>
                </label>
                {multiLocationEnabled && (
                  <div className="space-y-3 pl-2">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Venue Name, Street Address, City, State, Country, ZIP"
                        value={newLocationOption}
                        onChange={(e) => setNewLocationOption(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if (newLocationOption.trim()) {
                            setLocationOptions(prev => [...prev, newLocationOption.trim()]);
                            setNewLocationOption("");
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    {locationOptions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-500 font-medium">Added Locations:</p>
                        {locationOptions.map((loc, i) => (
                          <div key={i} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-md text-sm">
                            <span>{loc}</span>
                            <button
                              type="button"
                              onClick={() => setLocationOptions(prev => prev.filter((_, j) => j !== i))}
                              className="text-red-400 hover:text-red-600 text-xs font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#6771ab] mb-1">Add Team Members</h2>
                <p className="text-sm text-slate-500">Invite your wedding planner, coordinator, or family members to help you plan.</p>
              </div>
              <div className="space-y-3">
                {teamMembers.map((tm, idx) => (
                  <Card key={idx} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#2d336b]">{tm.name}</p>
                      <p className="text-xs text-slate-500">{tm.email}</p>
                    </div>
                    <Button variant="ghost" className="text-red-500" onClick={() => deleteTeamMember(idx)}>✕</Button>
                  </Card>
                ))}
              </div>
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-semibold text-[#6771ab] uppercase mb-2">Add New Member</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input placeholder="Name" value={newTeamName} onChange={e => setNewTeamName(e.target.value)} />
                  <Input placeholder="Email" value={newTeamEmail} onChange={e => setNewTeamEmail(e.target.value)} />
                  <Input placeholder="Temporary Password" value={newTeamPassword} onChange={e => setNewTeamPassword(e.target.value)} />
                </div>
                <Button className="mt-3" onClick={handleAddTeamMember}>Add Team Member</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#6771ab] mb-1">Select Wedding Tradition</h2>
                <p className="text-sm text-slate-500">Choose a cultural tradition. This will pre-populate your tasks and ceremonies.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(() => {
                  const tradMap = new Map<string, { id: string; label: string; desc: string }>();
                  traditions.forEach(t => tradMap.set(t.id, { id: t.id, label: t.label, desc: t.desc }));
                  dbTraditions.forEach(t => tradMap.set(t.key, { id: t.key, label: t.name, desc: t.description || "" }));
                  const order = [...traditions.map(t => t.id), ...dbTraditions.map(t => t.key).filter(k => !traditions.some(h => h.id === k))];
                  const deduped = order.map(id => tradMap.get(id)).filter(Boolean) as { id: string; label: string; desc: string }[];
                  return [...deduped, { id: "other", label: "Other", desc: "Create a custom tradition with your own tasks and ceremonies" }];
                })().map((t) => {
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
                <div className="space-y-3 mt-4 border-t border-slate-100 pt-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest block mb-1">New Tradition Name</label>
                    <Input
                      type="text"
                      placeholder="e.g. Japanese Shinto Wedding"
                      value={customTraditionName}
                      onChange={(e) => setCustomTraditionName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest block mb-1">Description (optional)</label>
                    <textarea
                      value={newTraditionDesc}
                      onChange={(e) => setNewTraditionDesc(e.target.value)}
                      placeholder="Describe the tradition and its key ceremonies..."
                      className="w-full min-h-[60px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6771ab] focus:border-transparent resize-y"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleSaveNewTradition}
                    variant="primary"
                    disabled={savingTradition || !customTraditionName.trim()}
                    className="text-xs rounded-xl bg-[#6771ab] text-white hover:bg-[#566198]"
                  >
                    {savingTradition ? "Saving..." : "Save New Tradition"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[#6771ab] mb-1">Budget & Estimated Guests</h2>
                <p className="text-sm text-slate-500">Provide approximate budget limits and counts.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#6771ab] uppercase tracking-widest">Total Budget ({getCurrencyForCountry(country)})</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">{getCurrencyForCountry(country).replace('USD', '$').replace('INR', '₹').replace('EUR', '€').replace('GBP', '£').replace('JPY', '¥') || getCurrencyForCountry(country)}</span>
                    <Input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="pl-8"
                    />
                  </div>
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
                        {multiLocationEnabled && allVenueOptions.length > 0 ? (
                          <select
                            value={r.location || ""}
                            onChange={(e) => updateRitual(idx, "location", e.target.value)}
                            className="h-9 text-xs w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6771ab]/40"
                          >
                            <option value="">Select location...</option>
                            {allVenueOptions.map((loc, i) => (
                              <option key={i} value={loc}>{loc}</option>
                            ))}
                            <option value="__other__">Other (type below)</option>
                          </select>
                        ) : (
                          <Input
                            type="text"
                            value={r.location || ""}
                            onChange={(e) => updateRitual(idx, "location", e.target.value)}
                            placeholder="e.g. Royal Banquet Hall"
                            className="h-9 text-xs"
                          />
                        )}
                        {multiLocationEnabled && r.location === "__other__" && (
                          <Input
                            type="text"
                            value=""
                            onChange={(e) => updateRitual(idx, "location", e.target.value)}
                            placeholder="Enter custom location..."
                            className="h-9 text-xs mt-1"
                          />
                        )}
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
                      <div className="md:col-span-12 flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id={`food-served-${idx}`}
                          checked={r.isFoodServed || false}
                          onChange={(e) => updateRitual(idx, "isFoodServed", e.target.checked)}
                          className="rounded border-slate-300 text-[#6771ab] focus:ring-[#6771ab] h-4 w-4"
                        />
                        <label htmlFor={`food-served-${idx}`} className="text-xs text-slate-600 font-medium cursor-pointer">
                          🍴 Food Served (Automatically creates a Catering Menu Plan)
                        </label>
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
                    {multiLocationEnabled && allVenueOptions.length > 0 ? (
                      <select
                        value={newRitualLocation}
                        onChange={(e) => setNewRitualLocation(e.target.value === "__other__" ? "" : e.target.value)}
                        className="h-9 text-xs w-full rounded-xl border border-slate-200 bg-white px-3 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6771ab]/40"
                      >
                        <option value="">Select location...</option>
                        {allVenueOptions.map((loc, i) => (
                          <option key={i} value={loc}>{loc}</option>
                        ))}
                        <option value="">Other (type below)</option>
                      </select>
                    ) : (
                      <Input
                        type="text"
                        placeholder="Hotel Poolside"
                        value={newRitualLocation}
                        onChange={(e) => setNewRitualLocation(e.target.value)}
                        className="h-9 text-xs"
                      />
                    )}
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
                  <div className="md:col-span-12 flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="new-ritual-food-served"
                      checked={newRitualIsFoodServed}
                      onChange={(e) => setNewRitualIsFoodServed(e.target.checked)}
                      className="rounded border-slate-300 text-[#6771ab] focus:ring-[#6771ab] h-4 w-4"
                    />
                    <label htmlFor="new-ritual-food-served" className="text-xs text-slate-600 font-medium cursor-pointer">
                      🍴 Food Served (Automatically creates a Catering Menu Plan)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 7 && (
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
                      <div className="sm:col-span-4">
                        <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Task Title</label>
                        <Input
                          type="text"
                          value={t.title}
                          onChange={(e) => updateTask(idx, "title", e.target.value)}
                          placeholder="e.g. Book mehndi artist"
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Category</label>
                        <select
                          value={t.category}
                          onChange={(e) => updateTask(idx, "category", e.target.value)}
                          className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6771ab]"
                        >
                          {dbCategories.map((cat) => (
                            <option key={cat.key} value={cat.key}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Associated Ceremony</label>
                        <select
                          value={t.ceremonyName || ""}
                          onChange={(e) => updateTask(idx, "ceremonyName", e.target.value)}
                          className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6771ab]"
                        >
                          <option value="">No Ceremony</option>
                          {customRituals
                            .filter((r) => r.name.trim())
                            .map((r) => (
                              <option key={r.name} value={r.name}>
                                {r.name}
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
                  <div className="sm:col-span-4">
                    <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Task Title</label>
                    <Input
                      type="text"
                      placeholder="e.g. Hire Wedding Planner"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Category</label>
                    <select
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value)}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6771ab]"
                    >
                      {dbCategories.map((cat) => (
                        <option key={cat.key} value={cat.key}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-semibold text-[#6771ab] uppercase tracking-wider block mb-1">Associated Ceremony</label>
                    <select
                      value={newTaskCeremonyName}
                      onChange={(e) => setNewTaskCeremonyName(e.target.value)}
                      className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6771ab]"
                    >
                      <option value="">No Ceremony</option>
                      {customRituals
                        .filter((r) => r.name.trim())
                        .map((r) => (
                          <option key={r.name} value={r.name}>
                            {r.name}
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

          {step === 8 && (
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
                            {r.isFoodServed && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                                🍴 Menu Plan
                              </span>
                            )}
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

        {toast && (
          <div className={`my-4 p-3 rounded-xl text-xs flex items-center justify-between ${
            toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'
          }`}>
            <span>{toast.message}</span>
            <button type="button" onClick={() => setToast(null)} className="ml-2 font-bold cursor-pointer">&times;</button>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6 mt-8 shrink-0">
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

          {step < 8 ? (
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
