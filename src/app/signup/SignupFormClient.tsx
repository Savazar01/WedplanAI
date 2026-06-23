"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

import { Select } from "@/components/ui/select";

interface SignupFormClientProps {
  signupAction: (prevState: { success?: boolean; error?: string } | null, formData: FormData) => Promise<{ success?: boolean; error?: string }>;
}

export default function SignupFormClient({ signupAction }: SignupFormClientProps) {
  const router = useRouter();

  async function handleSubmitAction(prevState: { success?: boolean; error?: string } | null, formData: FormData) {
    const res = await signupAction(prevState, formData);
    if (res?.success) {
      router.push("/login?signup_success=true");
    }
    return res;
  }

  const [state, formAction, isPending] = useActionState(handleSubmitAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">
          Full Name
        </label>
        <Input 
          type="text" 
          name="name" 
          placeholder="Enter your name" 
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
          placeholder="name@example.com" 
          required 
          disabled={isPending}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#6771ab] uppercase tracking-widest mb-1">
          User Persona
        </label>
        <Select 
          name="persona" 
          defaultValue="wedding_planner"
          disabled={isPending}
          required
        >
          <option value="diy">Plan My Wedding (DIY)</option>
          <option value="wedding_planner">Wedding Planner</option>
        </Select>
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

      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">
          {state.error}
        </div>
      )}

      <Button type="submit" variant="primary" className="w-full mt-2" disabled={isPending}>
        {isPending ? "Creating Account..." : "Register as Admin"}
      </Button>
    </form>
  );
}
