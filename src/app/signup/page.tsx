import { db } from "@/db/client";
import { users } from "@/db/schema";
import Link from "next/link";
import { signupAction } from "@/app/actions/auth";
import { Card } from "@/components/ui/card";
import SignupFormClient from "./SignupFormClient";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const existingUsers = await db.select().from(users).limit(1);
  const isClosed = existingUsers.length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card variant="cream" className="w-full max-w-md p-8 shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-3xl font-bold text-[#6771ab] tracking-tight">Savazar.com</h1>
          <p className="text-sm text-slate-500 mt-1">Wedding Event Planner</p>
        </div>

        {isClosed ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-sm">
              Public registration is closed. Subsequent users must be created by an administrator.
            </div>
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link href="/login" className="text-[#6771ab] font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-4 p-3 bg-violet-50 rounded-xl border border-violet-100 text-[#2d336b] text-xs text-center">
              Welcome! You are the first user. You will be designated as the <strong>Admin</strong>.
            </div>
            
            <SignupFormClient signupAction={signupAction} />
            
            <p className="text-center text-xs text-slate-500 mt-6 font-sans">
              Already have an admin account?{" "}
              <Link href="/login" className="text-[#6771ab] font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
