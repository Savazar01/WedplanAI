"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePasswordAction } from "@/app/actions/change-password";
import * as React from "react";

export default function ChangePasswordForm() {
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleSubmit(prev: { success?: boolean; error?: string } | null, formData: FormData) {
    const res = await changePasswordAction(prev, formData);
    if (res?.success && formRef.current) {
      formRef.current.reset();
    }
    return res;
  }

  const [state, formAction, isPending] = useActionState(handleSubmit, null);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Current Password</label>
        <Input type="password" name="currentPassword" placeholder="Enter current password" required disabled={isPending} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">New Password</label>
          <Input type="password" name="newPassword" placeholder="Min 8 characters" required disabled={isPending} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">Confirm New Password</label>
          <Input type="password" name="confirmPassword" placeholder="Re-enter new password" required disabled={isPending} />
        </div>
      </div>

      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">{state.error}</div>
      )}

      {state?.success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-xs text-center font-sans">
          Password changed successfully!
        </div>
      )}

      <div className="flex items-center justify-end pt-2">
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? "Changing..." : "Change Password"}
        </Button>
      </div>
    </form>
  );
}
