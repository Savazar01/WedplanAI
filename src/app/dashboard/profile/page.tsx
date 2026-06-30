import { getServerSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { getProfileAction } from "@/app/actions/profile";
import ChangePasswordForm from "./ChangePasswordForm";
import ProfileForm from "./ProfileForm";
import ThemePreferences from "./ThemePreferences";
import { getLocaleServer } from "@/lib/i18n-server";
import { translations } from "@/lib/translations";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function ProfilePage() {
  const locale = await getLocaleServer();
  const tDict = translations[locale] || translations["en"];
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/login?unauthenticated=true");
  }

  const [dbUser] = await db
    .select({ shouldChangePassword: users.shouldChangePassword })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const shouldWarn = dbUser?.shouldChangePassword === true;

  const profile = await getProfileAction();

  return (
    <main className="w-full max-w-3xl mr-auto p-6 md:px-8 space-y-6">
      {shouldWarn && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-5 rounded-2xl flex items-start gap-3.5 shadow-sm">
          <span className="text-xl">⚠️</span>
          <div>
            <h3 className="font-bold text-amber-800">Password Change Required</h3>
            <p className="text-xs text-amber-700 mt-1">For your security, you must update your password to secure your account. Please use the Change Password form below to set a new password.</p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">{tDict.profile}</h1>
        <p className="text-xs text-slate-500">Manage your account details, address, and preferences.</p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-bold text-[#6771ab] uppercase tracking-widest">Account Info</h2>
        <div className="space-y-2 text-sm">
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

      {/* Profile Edit Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-bold text-[#6771ab] uppercase tracking-widest mb-6">
          Profile Details
        </h2>
        <ProfileForm
          initialName={profile?.name || session.user.name || ""}
          initialStreet={profile?.street}
          initialCity={profile?.city}
          initialState={profile?.state}
          initialCountry={profile?.country}
          initialPincode={profile?.pincode}
          initialLanguages={profile?.languages}
          isAdmin={session.user.role === "admin"}
          initialPersona={profile?.persona || session.user.persona || "diy"}
        />
      </div>

      {/* Theme Preferences */}
      <ThemePreferences />

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-bold text-[#6771ab] uppercase tracking-widest mb-4">
          Change Password
        </h2>
        <ChangePasswordForm />
      </div>
    </main>
  );
}
