"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Sparkles, 
  ClipboardList, 
  Calendar, 
  Users, 
  Wallet, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Clock,
  Globe,
  Settings,
  ShieldCheck,
  UserCog
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SampleWalkthroughCardProps {
  isSampleWedding: boolean;
  weddingId?: string;
  userRole?: string;
}

export default function SampleWalkthroughCard({ 
  isSampleWedding,
  weddingId,
  userRole 
}: SampleWalkthroughCardProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [status, setStatus] = React.useState<'walking' | 'completed' | 'skipped' | null>(null);
  const [currentStep, setCurrentStep] = React.useState(0);

  React.useEffect(() => {
    const stored = localStorage.getItem("sample_walkthrough_status");
    setTimeout(() => {
      if (stored === "completed" || stored === "skipped") {
        setStatus(stored);
      } else {
        setStatus("walking");
      }
    }, 0);
  }, []);

  const steps = React.useMemo(() => {
    const allSteps = [
      {
        id: "welcome",
        title: "Welcome to WedPlanAI!",
        description: "Welcome to WedPlanAI! This dashboard contains a fully populated sample Hindu wedding of Ananya & Kabir. Let's take a quick tour of the planning tools available at your fingertips.",
        icon: Sparkles,
        color: "text-amber-500 bg-amber-50 border-amber-100",
        path: "/dashboard",
      },
      {
        id: "planning-board",
        title: "Planning Tasks",
        description: "Manage pre-wedding ceremonies like Haldi, Mehndi, Sangeet, and the main wedding events. Easily drag tasks across stages (To Do, In Progress, Done) to stay organized.",
        icon: ClipboardList,
        color: "text-blue-500 bg-blue-50 border-blue-100",
        path: "/dashboard/planning-board",
      },
      {
        id: "calendar",
        title: "Calendar",
        description: "Schedule and view all wedding-related events, rituals, and appointments in a consolidated calendar view.",
        icon: Calendar,
        color: "text-rose-500 bg-rose-50 border-rose-100",
        path: "/dashboard/calendar",
      },
      {
        id: "event-itinerary",
        title: "Event Itinerary",
        description: "Track the detailed, minute-by-minute itinerary of events on the wedding day to ensure seamless coordination.",
        icon: Clock,
        color: "text-violet-500 bg-violet-50 border-violet-100",
        path: "/dashboard/event-itinerary",
      },
      {
        id: "guests",
        title: "Guests RSVP",
        description: "Monitor guest lists, attendance status (attending, declined, pending), and plus-ones. Update details instantly and export lists for caterers.",
        icon: Users,
        color: "text-emerald-500 bg-emerald-50 border-emerald-100",
        path: "/dashboard/guests",
      },
      {
        id: "vendors",
        title: "Vendors & Budget",
        description: "Track vendor costs, deposits paid, and outstanding balances. Visualize budget depletion automatically and receive warnings if you breach your limit.",
        icon: Wallet,
        color: "text-indigo-500 bg-indigo-50 border-indigo-100",
        path: "/dashboard/vendors",
      },
      {
        id: "showcase",
        title: "Showcase Website",
        description: "Preview the beautiful public wedding showcase website where guests can view event details, stories, and RSVP.",
        icon: Globe,
        color: "text-sky-500 bg-sky-50 border-sky-100",
        path: weddingId ? `/wedding/${weddingId}` : "/dashboard",
      },
      {
        id: "profile",
        title: "User Profile",
        description: "Configure user details, profile information, and account security preferences.",
        icon: UserCog,
        color: "text-amber-600 bg-amber-50 border-amber-100",
        path: "/dashboard/profile",
      },
      ...(userRole === "admin" ? [{
        id: "users",
        title: "User Management",
        description: "Manage user roles, invite planners, assign permissions, and coordinate who can edit wedding details.",
        icon: ShieldCheck,
        color: "text-red-500 bg-red-50 border-red-100",
        path: "/dashboard/admin/users",
      }] : []),
      {
        id: "all-set",
        title: "All Set!",
        description: "You've toured all major planning tools! Click below to create your own wedding event and start your personalized planning journey with WedPlanAI.",
        icon: CheckCircle2,
        color: "text-[#6771ab] bg-[#eef0f7] border-[#6771ab]/20",
        path: "/dashboard",
      }
    ];
    return allSteps;
  }, [weddingId, userRole]);

  // Synchronize step index with path changes
  React.useEffect(() => {
    if (!pathname) return;

    const matchedIndex = steps.findIndex((step, index) => {
      // Disambiguation for Welcome (0) and All Set (last) which both share "/dashboard"
      if (step.path === "/dashboard") {
        if (pathname === "/dashboard") {
          if (currentStep === 0 && index === 0) return true;
          if (currentStep === steps.length - 1 && index === steps.length - 1) return true;
          return index === 0;
        }
        return false;
      }
      
      // Match showcase path starting with /wedding/
      if (step.id === "showcase") {
        return pathname.startsWith("/wedding/");
      }
      
      return step.path === pathname;
    });

    if (matchedIndex !== -1 && matchedIndex !== currentStep) {
      setTimeout(() => {
        setCurrentStep(matchedIndex);
      }, 0);
    }
  }, [pathname, steps, currentStep]);

  const isShowcasePage = pathname?.startsWith("/wedding/");

  if (!isSampleWedding) {
    return null;
  }

  if (isShowcasePage && (status === "completed" || status === "skipped")) {
    return null;
  }

  if (status === null) {
    if (isShowcasePage) return null;
    return (
      <div className="max-w-6xl w-full mx-auto px-6 pt-6">
        <div className="w-full h-44 bg-slate-50 border border-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const handleSkip = () => {
    setStatus("skipped");
    localStorage.setItem("sample_walkthrough_status", "skipped");
  };

  const handleComplete = () => {
    setStatus("completed");
    localStorage.setItem("sample_walkthrough_status", "completed");
    router.push("/dashboard");
  };

  const handleRestart = () => {
    setStatus("walking");
    setCurrentStep(0);
    localStorage.setItem("sample_walkthrough_status", "walking");
    router.push("/dashboard");
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      router.push(steps[nextStepIndex].path);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      router.push(steps[prevStepIndex].path);
    }
  };

  const step = steps[currentStep] || steps[0];
  const StepIcon = step.icon;

  // Render on showcase page as premium floating top banner
  if (isShowcasePage) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-violet-100 shadow-md p-4 animate-walk-in">
        <style>{`
          @keyframes walkFadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-walk-in {
            animation: walkFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-3 items-center flex-1 min-w-0">
            <div className={`p-2 rounded-lg shrink-0 border ${step.color} shadow-sm`}>
              <StepIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#6771ab] uppercase tracking-widest block">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-xs font-bold text-slate-400">•</span>
                <h4 className="text-sm font-bold text-[#2d336b] truncate">{step.title}</h4>
              </div>
              <p className="text-xs text-slate-600 truncate max-w-2xl">{step.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentStep(index);
                    router.push(steps[index].path);
                  }}
                  className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                    index === currentStep 
                      ? "w-4 bg-[#6771ab]" 
                      : "w-1.5 bg-slate-200 hover:bg-slate-300"
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              {currentStep < steps.length - 1 && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-semibold text-[11px] h-8 px-2.5"
                >
                  Skip
                </Button>
              )}
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-[#6771ab] hover:text-[#566198] hover:bg-slate-50 font-semibold text-[11px] h-8 px-2.5 flex items-center gap-0.5"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </Button>
              )}
              <Button
                variant="primary"
                onClick={handleNext}
                className="h-8 px-3.5 bg-[#6771ab] hover:bg-[#566198] text-white shadow-md hover:shadow-lg transition-all duration-100 ease-out font-semibold text-[11px] flex items-center gap-0.5"
              >
                {currentStep === steps.length - 1 ? (
                  <>Get Started <CheckCircle2 className="w-3 h-3" /></>
                ) : (
                  <>Next <ArrowRight className="w-3 h-3" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Completed or skipped banner
  if (status === "completed" || status === "skipped") {
    return (
      <div className="max-w-6xl w-full mx-auto px-6 pt-6">
        <style>{`
          @keyframes bannerFadeIn {
            from { opacity: 0; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-banner-in {
            animation: bannerFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>
        <Card variant="default" className="p-6 border-[#6771ab]/20 bg-gradient-to-r from-violet-50/60 to-rose-50/40 shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl relative overflow-hidden group animate-banner-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#c484b0]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <h3 className="text-base font-bold text-[#2d336b]">Ready to Plan Your Own Wedding?</h3>
              </div>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                {"Now that you've explored the sample wedding features, it's time to build your own dashboard."}
                {"Create your personalized event with customizable ceremonies, guest RSVPs, budgets, and tasks."}
              </p>
              <button 
                onClick={handleRestart}
                className="text-xs font-semibold text-[#6771ab] hover:text-[#566198] transition-colors inline-flex items-center gap-1 mt-1 hover:underline cursor-pointer"
              >
                🔄 Restart Walkthrough
              </button>
            </div>
            <Link href="/wizard" className="shrink-0">
              <Button 
                variant="primary" 
                className="rounded-xl px-6 py-2.5 bg-[#6771ab] text-white shadow-md hover:bg-[#566198] hover:scale-[1.02] hover:shadow-lg transition-all active:scale-[0.97] duration-100 ease-out font-medium"
              >
                Create Your Wedding Event
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Active walking card in Dashboard
  return (
    <div className="max-w-6xl w-full mx-auto px-6 pt-6">
      <style>{`
        @keyframes walkFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-walk-in {
          animation: walkFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      <Card variant="default" className="p-6 border-[#6771ab]/25 bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#6771ab]/5 to-transparent rounded-bl-full pointer-events-none" />
        
        <div className="flex flex-col gap-6">
          <div key={currentStep} className="flex gap-4 items-start animate-walk-in">
            <div className={`p-3.5 rounded-xl shrink-0 border ${step.color} shadow-sm`}>
              <StepIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1 flex-1">
              <span className="text-xs font-bold text-[#6771ab] uppercase tracking-widest block">
                Step {currentStep + 1} of {steps.length}
              </span>
              <h3 className="text-lg font-bold text-[#2d336b]">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{step.description}</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-1">
            <div className="flex items-center gap-1.5">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentStep(index);
                    router.push(steps[index].path);
                  }}
                  className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                    index === currentStep 
                      ? "w-6 bg-[#6771ab]" 
                      : "w-2 bg-slate-200 hover:bg-slate-300"
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStep < steps.length - 1 && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-semibold text-xs h-9 px-3.5"
                >
                  Skip Tour
                </Button>
              )}
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-[#6771ab] hover:text-[#566198] hover:bg-slate-50 font-semibold text-xs h-9 px-3.5 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </Button>
              )}
              <Button
                variant="primary"
                onClick={handleNext}
                className="h-9 px-4.5 bg-[#6771ab] hover:bg-[#566198] text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.97] transition-all duration-100 ease-out font-semibold text-xs flex items-center gap-1"
              >
                {currentStep === steps.length - 1 ? (
                  <>Get Started <CheckCircle2 className="w-3.5 h-3.5" /></>
                ) : (
                  <>Next <ArrowRight className="w-3.5 h-3.5" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
