"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import * as React from "react";

interface CreateUserFormClientProps {
  createAction: (prevState: { success?: boolean; error?: string } | null, formData: FormData) => Promise<{ success?: boolean; error?: string }>;
  adminPersona?: string;
  weddings?: any[];
}

export default function CreateUserFormClient({ 
  createAction,
  adminPersona = "diy",
  weddings = [],
}: CreateUserFormClientProps) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [role, setRole] = React.useState("user");

  async function handleSubmitAction(prevState: { success?: boolean; error?: string } | null, formData: FormData) {
    const res = await createAction(prevState, formData);
    if (res?.success) {
      if (formRef.current) {
        formRef.current.reset();
        setRole("user");
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
          User Persona
        </label>
        <Select name="persona" defaultValue="diy" required disabled={isPending}>
          <option value="diy">Plan My Wedding (DIY)</option>
          <option value="wedding_planner">Wedding Planner</option>
        </Select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">
          Assign Role
        </label>
        <Select 
          name="role" 
          value={role} 
          onChange={(e) => setRole(e.target.value)} 
          required 
          disabled={isPending}
        >
          <option value="user">User</option>
          {adminPersona !== "diy" && <option value="client">Client</option>}
          <option value="admin">Admin</option>
        </Select>
      </div>

      {role !== "admin" && (
        <div>
          <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">
            Assigned Wedding(s)
          </label>
          {role === "client" ? (
            <Select name="weddingAccess" required disabled={isPending}>
              <option value="">Select a Wedding</option>
              {weddings.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.partnerA} & {w.partnerB}
                </option>
              ))}
            </Select>
          ) : (
            <Select name="weddingAccess" defaultValue="all" required disabled={isPending}>
              <option value="all">All Weddings</option>
              {weddings.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.partnerA} & {w.partnerB}
                </option>
              ))}
            </Select>
          )}
        </div>
      )}

      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-xs text-center font-sans">
          Team member account created successfully!
        </div>
      )}

      <Button type="submit" variant="primary" className="w-full mt-2" disabled={isPending}>
        {isPending ? "Creating Team Member..." : "Create Team Member"}
      </Button>
    </form>
  );
}
