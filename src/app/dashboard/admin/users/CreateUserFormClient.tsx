"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FieldHelp } from "@/components/ui/field-help";
import * as React from "react";

interface CreateUserFormClientProps {
  createAction: (prevState: { success?: boolean; error?: string } | null, formData: FormData) => Promise<{ success?: boolean; error?: string }>;
  adminPersona?: string;
  weddings?: { id: string; partnerA: string; partnerB: string }[];
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
        <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1 flex items-center">
          Full Name <FieldHelp message="The full name of the team member you are adding." />
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
        <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1 flex items-center">
          Email Address <FieldHelp message="The email address they will use to log in." />
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
        <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1 flex items-center">
          Password <FieldHelp message="The temporary password they will use to log in. They will be forced to change this upon first login." />
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
        <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1 flex items-center">
          User Persona <FieldHelp message="Defines the user's primary persona and experience." />
        </label>
        <Select name="persona" defaultValue="diy" required disabled={isPending}>
          <option value="diy">Plan My Wedding (DIY)</option>
          <option value="wedding_planner">Wedding Planner</option>
        </Select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1 flex items-center">
          Assign Role <FieldHelp message="Users have limited access, Clients have full planning access, Admins have app administration access." />
        </label>
        <Select 
          name="role" 
          value={role} 
          onChange={(e) => setRole(e.target.value)} 
          required 
          disabled={isPending}
        >
          <option value="user">User</option>
          {adminPersona === "wedding_planner" && (
            <>
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </>
          )}
        </Select>
      </div>

      {role !== "admin" && (
        <div>
          <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1 flex items-center">
            Assigned Wedding(s) <FieldHelp message="Select which wedding this member can access." />
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
