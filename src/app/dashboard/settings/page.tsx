import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?unauthenticated=true");
  }

  return (
    <main className="w-full max-w-3xl mr-auto p-6 md:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-xs text-slate-500">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-sm font-bold text-[#6771ab] uppercase tracking-widest">Account Info</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Name</span>
              <span className="font-medium text-slate-800">{session.user.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Email</span>
              <span className="font-medium text-slate-800">{session.user.email}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Role</span>
              <span className="font-medium text-slate-800 capitalize">{session.user.role}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-bold text-[#6771ab] uppercase tracking-widest mb-4">Change Password</h2>
        <ChangePasswordForm />
      </div>
    </main>
  );
}
