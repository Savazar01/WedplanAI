"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { archiveWeddingAction, unarchiveWeddingAction, deleteWeddingAction } from "@/app/actions/wedding";
import { useRouter } from "next/navigation";

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
    <>
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
        {isArchived ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleUnarchive}
            disabled={actioning}
            className="text-xs"
          >
            Restore Wedding
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowArchiveConfirm(true)}
            disabled={actioning}
            className="text-xs text-amber-600 border border-amber-200 hover:bg-amber-50"
          >
            Archive Wedding
          </Button>
        )}
        <Button
          type="button"
          variant="error"
          size="sm"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={actioning || isSample}
          className="text-xs"
        >
          Delete Wedding
        </Button>
      </div>
      {isSample && (
        <div className="mt-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-500/[0.12] border border-amber-200/50 rounded-lg p-2 font-medium">
          This wedding is for training and onboarding purpose only and cannot be deleted.
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
    </>
  );
}
