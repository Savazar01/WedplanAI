"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { archiveWeddingAction, unarchiveWeddingAction, deleteWeddingAction } from "@/app/actions/wedding";
import { useRouter } from "next/navigation";

import { MoreVertical } from "lucide-react";

interface WeddingActionsProps {
  weddingId: string;
  isArchived: boolean;
  isSample?: boolean;
}

export default function WeddingActions({ weddingId, isArchived, isSample }: WeddingActionsProps) {
  const router = useRouter();
  const [showArchiveConfirm, setShowArchiveConfirm] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [actioning, setActioning] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleArchive = async () => {
    setActioning(true);
    await archiveWeddingAction(weddingId);
    setShowArchiveConfirm(false);
    setActioning(false);
    router.refresh();
  };

  const handleUnarchive = async () => {
    setActioning(true);
    await unarchiveWeddingAction(weddingId);
    setActioning(false);
    router.refresh();
  };

  const handleDelete = async () => {
    setActioning(true);
    const res = await deleteWeddingAction(weddingId);
    setShowDeleteConfirm(false);
    setActioning(false);
    if (res && 'error' in res) {
      console.error(res.error);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#6771ab] cursor-pointer"
        aria-label="Wedding Actions Menu"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white border border-slate-200 shadow-lg p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-100">
          {isArchived ? (
            <button
              onClick={() => {
                setMenuOpen(false);
                handleUnarchive();
              }}
              disabled={actioning}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium cursor-pointer"
            >
              Restore Wedding
            </button>
          ) : (
            <button
              onClick={() => {
                setMenuOpen(false);
                setShowArchiveConfirm(true);
              }}
              disabled={actioning}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-amber-600 hover:bg-amber-50 hover:text-amber-700 transition-colors font-medium cursor-pointer"
            >
              Archive Wedding
            </button>
          )}
          <button
            onClick={() => {
              setMenuOpen(false);
              setShowDeleteConfirm(true);
            }}
            disabled={actioning || isSample}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors font-medium cursor-pointer ${
              isSample
                ? "text-slate-300 cursor-not-allowed"
                : "text-red-600 hover:bg-red-50 hover:text-red-700"
            }`}
          >
            Delete Wedding
          </button>
          {isSample && (
            <div className="px-3 py-2 text-[10px] text-amber-700 dark:text-amber-300 bg-amber-500/[0.12] border border-amber-200/50 rounded-lg m-1 font-medium leading-normal">
              This wedding is for training and onboarding purpose only and cannot be deleted.
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={showArchiveConfirm}
        onClose={() => setShowArchiveConfirm(false)}
        onConfirm={handleArchive}
        title="Archive Wedding?"
        message="Archiving will hide this wedding from the main dashboard. You can restore it later from the Archived section."
        confirmLabel="Archive"
        cancelLabel="Cancel"
        variant="default"
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Wedding?"
        message="Are you sure you want to permanently delete this wedding and all its data (tasks, ceremonies, guests, vendors, etc.)? This action cannot be undone."
        confirmLabel="Delete Forever"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
