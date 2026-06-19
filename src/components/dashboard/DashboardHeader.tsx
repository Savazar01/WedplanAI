"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface DashboardHeaderProps {
  userName: string;
  userEmail: string;
  userRole: string;
}

export default function DashboardHeader({ userName, userRole }: DashboardHeaderProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between font-sans">
      <div className="flex items-center gap-2">
        <Link href="/dashboard" className="flex items-center">
          <img 
            src="https://savazar.com/wp-content/uploads/2023/10/cropped-Transparent_Image_2-300x100.png" 
            alt="Savazar.com Logo" 
            className="h-10 w-auto object-contain"
          />
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        {userRole === "admin" && (
          <Link href="/dashboard/admin/users">
            <Button variant="ghost" size="sm" className="text-[#6771ab] border border-violet-100 hover:bg-violet-50 font-semibold">
              Manage Your Team
            </Button>
          </Link>
        )}
        
        <div className="flex items-center gap-2 text-right">
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-slate-800">{userName}</div>
            <div className="text-[10px] text-slate-400 capitalize">{userRole}</div>
          </div>
          <div className="h-8 w-8 rounded-full bg-violet-100 text-[#2d336b] flex items-center justify-center text-xs font-bold uppercase">
            {userName.substring(0, 2)}
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-slate-500 font-semibold hover:text-red-500">
          Sign Out
        </Button>
      </div>
    </header>
  );
}
