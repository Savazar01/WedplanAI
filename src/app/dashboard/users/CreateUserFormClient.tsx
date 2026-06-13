"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import * as React from "react";

interface CreateUserFormClientProps {
  createAction: (prevState: { success?: boolean; error?: string } | null, formData: FormData) => Promise<{ success?: boolean; error?: string }>;
}

export default function CreateUserFormClient({ createAction }: CreateUserFormClientProps) {
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleSubmitAction(prevState: { success?: boolean; error?: string } | null, formData: FormData) {
    const res = await createAction(prevState, formData);
    if (res?.success) {
      if (formRef.current) {
        formRef.current.reset();
      }
    }
    return res;
  }

  const [state, formAction, isPending] = useActionState(handleSubmitAction, null);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">
          Full Name
        </label>
        <Input 
          type="text" 
          name="name" 
          placeholder="Enter name" 
          required 
          disabled={isPending}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">
          Email Address
        </label>
        <Input 
          type="email" 
          name="email" 
          placeholder="email@example.com" 
          required 
          disabled={isPending}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">
          Password
        </label>
        <Input 
          type="password" 
          name="password" 
          placeholder="••••••••" 
          required 
          disabled={isPending}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">
          Assign Role
        </label>
        <Select name="role" required disabled={isPending}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </Select>
      </div>

      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-xs text-center font-sans">
          User account created successfully!
        </div>
      )}

      <Button type="submit" variant="primary" className="w-full mt-2" disabled={isPending}>
        {isPending ? "Creating User..." : "Create User"}
      </Button>
    </form>
  );
}
