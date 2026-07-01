"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { switchWeddingAction } from "@/lib/wedding-helper";
import { ChevronDown, Plus } from "lucide-react";

interface Wedding {
  id: string;
  partnerA: string;
  partnerB: string;
}

interface WeddingSwitcherProps {
  activeWedding: Wedding | null;
  allWeddings: Wedding[];
  isCollapsed?: boolean;
  userRole?: string;
}

export default function WeddingSwitcher({
  activeWedding,
  allWeddings,
  isCollapsed = false,
  userRole,
}: WeddingSwitcherProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const otherWeddings = activeWedding
    ? allWeddings.filter((w) => w.id !== activeWedding.id)
    : allWeddings;

  const handleSelect = async (weddingId: string) => {
    setIsOpen(false);
    await switchWeddingAction(weddingId);
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    router.push("/wizard");
  };

  const partnerAInitial = activeWedding?.partnerA?.charAt(0) || "";
  const partnerBInitial = activeWedding?.partnerB?.charAt(0) || "";
  const initials = (partnerAInitial + partnerBInitial).toUpperCase() || "💒";

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={
          isCollapsed
            ? activeWedding
              ? `${activeWedding.partnerA} & ${activeWedding.partnerB}`
              : "Select a Wedding"
            : undefined
        }
        className={
          isCollapsed
            ? "h-10 w-10 p-0 rounded-xl flex items-center justify-center bg-white border border-slate-200 shadow-sm mx-auto hover:bg-slate-50 transition-all active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#6771ab] outline-none cursor-pointer"
            : "w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left shadow-sm active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#6771ab] outline-none cursor-pointer"
        }
        aria-label="Active Wedding"
      >
        {isCollapsed ? (
          <span className="text-xs font-bold text-[#6771ab]">{initials}</span>
        ) : (
          <>
            <div className="truncate">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-[#6771ab]">
                Active Wedding
              </p>
              <p className="text-sm font-semibold text-slate-800 truncate">
                {activeWedding
                  ? `${activeWedding.partnerA} & ${activeWedding.partnerB}`
                  : "Select a Wedding"}
              </p>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </>
        )}
      </button>

      {isOpen && (
        <div className={`absolute mt-2 z-50 rounded-xl bg-[#fefce8] border border-slate-200 shadow-lg p-1 animate-in fade-in slide-in-from-top-2 duration-100 ${
          isCollapsed ? "left-0 w-56" : "left-0 right-0"
        }`}>
          <div className="max-h-60 overflow-y-auto">
            {otherWeddings.length === 0 ? (
              <p className="text-xs text-slate-500 p-3 italic">No other weddings</p>
            ) : (
              otherWeddings.map((wedding) => (
                <button
                  key={wedding.id}
                  onClick={() => handleSelect(wedding.id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-[#6771ab]/10 hover:text-[#2d336b] transition-colors font-medium truncate"
                >
                  {wedding.partnerA} & {wedding.partnerB}
                </button>
              ))
            )}
          </div>
          {userRole !== "user" && (
            <div className="border-t border-slate-200/60 mt-1 pt-1">
              <button
                onClick={handleCreateNew}
                className="w-full flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-[#6771ab] hover:bg-[#6771ab] hover:text-white transition-all font-semibold"
              >
                <Plus className="h-4 w-4" />
                <span>Create New</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
