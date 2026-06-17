"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import WeddingSwitcher from "./WeddingSwitcher";
import SampleWalkthroughCard from "./SampleWalkthroughCard";
import {
  LayoutDashboard,
  KanbanSquare,
  Calendar,
  Clock,
  Users,
  Store,
  UserCog,
  Palette,
  LogOut,
  Menu,
  X,
  Globe,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  KeyRound,
  ChevronDown,
} from "lucide-react";

const DEFAULT_LOGO = "https://savazar.com/wp-content/uploads/2023/10/cropped-Transparent_Image_2-300x100.png";

interface Wedding {
  id: string;
  partnerA: string;
  partnerB: string;
  description?: string | null;
  themeFont?: string | null;
  themePrimary?: string | null;
  themeSecondary?: string | null;
  themeBackground?: string | null;
  logoUrl?: string | null;
  logoData?: string | null;
}

interface SidebarShellProps {
  activeWedding: Wedding | null;
  allWeddings: Wedding[];
  userName: string;
  userEmail: string;
  userRole: string;
  children: React.ReactNode;
}

export default function SidebarShell({
  activeWedding,
  allWeddings,
  userName,
  userEmail,
  userRole,
  children,
}: SidebarShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  React.useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") {
      setTimeout(() => {
        setIsCollapsed(true);
      }, 0);
    }
  }, []);

  React.useEffect(() => {
    if (["/dashboard/admin/appearance", "/dashboard/admin/api-keys", "/dashboard/admin/users"].includes(pathname)) {
      setIsAdminMenuOpen(true);
    }
  }, [pathname]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    target?: string;
  }

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/kanban", label: "Kanban Board", icon: KanbanSquare },
    { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
    { href: "/dashboard/timeline", label: "Timeline", icon: Clock },
    { href: "/dashboard/guests", label: "Guests", icon: Users },
    { href: "/dashboard/vendors", label: "Vendors", icon: Store },
  ];

  if (activeWedding) {
    navItems.push({
      href: `/wedding/${activeWedding.id}`,
      label: "Showcase Page",
      icon: Globe,
      target: "_blank",
    });
  }

  navItems.push({ href: "/dashboard/profile", label: "User Profile", icon: UserCog });


  const sidebarContent = (isMobile = false) => {
    const showCollapsed = isCollapsed && !isMobile;
    const isSubpageActive = ["/dashboard/admin/appearance", "/dashboard/admin/api-keys", "/dashboard/admin/users"].includes(pathname);
    const logoSource = activeWedding?.logoData || activeWedding?.logoUrl || DEFAULT_LOGO;

    return (
      <div className="flex flex-col h-full">
        {/* Brand Header */}
        <div className={`mb-6 px-2 ${showCollapsed ? "flex justify-center" : ""}`}>
          <Link href="/dashboard" className="flex items-center" onClick={() => isMobile && setIsMobileMenuOpen(false)}>
            {showCollapsed ? (
              <span className="text-2xl" title="Savazar Dashboard">💒</span>
            ) : (
              <img
                src={logoSource}
                alt="Savazar.com Logo"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  if (e.currentTarget.src !== DEFAULT_LOGO) {
                    e.currentTarget.src = DEFAULT_LOGO;
                  }
                }}
              />
            )}
          </Link>
        </div>

        {/* Wedding Switcher */}
        <div className="mb-6">
          <WeddingSwitcher activeWedding={activeWedding} allWeddings={allWeddings} isCollapsed={showCollapsed} />
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                target={item.target}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                onClick={() => isMobile && setIsMobileMenuOpen(false)}
                title={item.label}
                className={`flex items-center rounded-xl text-sm font-semibold transition-all duration-100 ${
                  showCollapsed
                    ? "justify-center h-10 w-10 mx-auto"
                    : "gap-3 px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-[#eef0f7] text-[#2d336b] shadow-sm"
                    : "text-[#475569] hover:bg-[#f0f1fa] hover:text-[#3d4580]"
                }`}
              >
                <item.icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-[#6771ab]" : "text-slate-400"}`} />
                {!showCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {/* App Administration Accordion */}
          {userRole === "admin" && (
            showCollapsed ? (
              <div className="relative group mx-auto">
                <button
                  title="App Administration"
                  className={`flex items-center justify-center h-10 w-10 mx-auto rounded-xl transition-all duration-100 cursor-pointer ${
                    isSubpageActive
                      ? "bg-[#eef0f7] text-[#2d336b] shadow-sm"
                      : "text-[#475569] hover:bg-[#f0f1fa] hover:text-[#3d4580]"
                  }`}
                >
                  <ShieldAlert className={`h-4.5 w-4.5 shrink-0 ${isSubpageActive ? "text-[#6771ab]" : "text-slate-400"}`} />
                </button>
                
                {/* Floating Tooltip Box */}
                <div className="absolute left-full top-0 ml-2 hidden group-hover:flex flex-col bg-white border border-slate-200 shadow-md p-2.5 rounded-xl z-50 w-48 text-left space-y-1">
                  <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                    App Administration
                  </div>
                  <Link
                    href="/dashboard/admin/appearance"
                    onClick={() => isMobile && setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#f0f1fa] hover:text-[#3d4580] transition-colors ${
                      pathname === "/dashboard/admin/appearance" ? "bg-[#eef0f7] text-[#2d336b]" : "text-[#475569]"
                    }`}
                  >
                    <Palette className="h-3.5 w-3.5 text-slate-400" />
                    Appearance
                  </Link>
                  <Link
                    href="/dashboard/admin/api-keys"
                    onClick={() => isMobile && setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#f0f1fa] hover:text-[#3d4580] transition-colors ${
                      pathname === "/dashboard/admin/api-keys" ? "bg-[#eef0f7] text-[#2d336b]" : "text-[#475569]"
                    }`}
                  >
                    <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                    API Keys
                  </Link>
                  <Link
                    href="/dashboard/admin/users"
                    onClick={() => isMobile && setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#f0f1fa] hover:text-[#3d4580] transition-colors ${
                      pathname === "/dashboard/admin/users" ? "bg-[#eef0f7] text-[#2d336b]" : "text-[#475569]"
                    }`}
                  >
                    <UserCog className="h-3.5 w-3.5 text-slate-400" />
                    User Management
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <button
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  className={`w-full flex items-center justify-between rounded-xl text-sm font-semibold transition-all duration-100 px-3 py-2.5 cursor-pointer ${
                    isSubpageActive
                      ? "bg-[#eef0f7]/40 text-[#2d336b]"
                      : "text-[#475569] hover:bg-[#f0f1fa] hover:text-[#3d4580]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert className={`h-4.5 w-4.5 shrink-0 ${isSubpageActive ? "text-[#6771ab]" : "text-slate-400"}`} />
                    <span>App Administration</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isAdminMenuOpen ? "rotate-180" : ""}`} />
                </button>
                
                {isAdminMenuOpen && (
                  <div className="pl-6 space-y-1 mt-1">
                    <Link
                      href="/dashboard/admin/appearance"
                      onClick={() => isMobile && setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-100 ${
                        pathname === "/dashboard/admin/appearance"
                          ? "bg-[#eef0f7] text-[#2d336b]"
                          : "text-[#475569] hover:bg-[#f0f1fa] hover:text-[#3d4580]"
                      }`}
                    >
                      <Palette className="h-4 w-4 text-slate-400" />
                      <span>Appearance</span>
                    </Link>
                    <Link
                      href="/dashboard/admin/api-keys"
                      onClick={() => isMobile && setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-100 ${
                        pathname === "/dashboard/admin/api-keys"
                          ? "bg-[#eef0f7] text-[#2d336b]"
                          : "text-[#475569] hover:bg-[#f0f1fa] hover:text-[#3d4580]"
                      }`}
                    >
                      <KeyRound className="h-4 w-4 text-slate-400" />
                      <span>API Keys</span>
                    </Link>
                    <Link
                      href="/dashboard/admin/users"
                      onClick={() => isMobile && setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-100 ${
                        pathname === "/dashboard/admin/users"
                          ? "bg-[#eef0f7] text-[#2d336b]"
                          : "text-[#475569] hover:bg-[#f0f1fa] hover:text-[#3d4580]"
                      }`}
                    >
                      <UserCog className="h-4 w-4 text-slate-400" />
                      <span>User Management</span>
                    </Link>
                  </div>
                )}
              </div>
            )
          )}
        </nav>

        {/* User Card & Sign Out at the bottom */}
        <div className="border-t border-slate-200/60 pt-4 mt-auto">
          {showCollapsed ? (
            <div className="flex justify-center mb-2">
              <div 
                className="h-9 w-9 rounded-full bg-violet-100 text-[#2d336b] flex items-center justify-center text-sm font-bold uppercase shrink-0 border border-violet-200 cursor-help"
                title={`${userName} (${userEmail})`}
              >
                {userName.substring(0, 2)}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-2 py-1.5 mb-2 bg-[#fefce8]/60 rounded-xl border border-slate-100">
              <div className="h-9 w-9 rounded-full bg-violet-100 text-[#2d336b] flex items-center justify-center text-sm font-bold uppercase shrink-0">
                {userName.substring(0, 2)}
              </div>
              <div className="truncate min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{userName}</p>
                <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            title={showCollapsed ? "Sign Out" : undefined}
            className={`flex items-center rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer active:scale-[0.98] ${
              showCollapsed
                ? "justify-center h-10 w-10 mx-auto"
                : "w-full gap-3 px-3 py-2"
            }`}
          >
            <LogOut className="h-4.5 w-4.5 text-slate-400 group-hover:text-red-500" />
            {!showCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    );
  };

  const logoSource = activeWedding?.logoData || activeWedding?.logoUrl || DEFAULT_LOGO;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      {/* Desktop Sidebar */}
      <aside className={`bg-white border-r border-slate-200/80 hidden md:flex flex-col h-screen sticky top-0 shrink-0 z-30 transition-all duration-300 relative ${
        isCollapsed ? "w-20 p-3" : "w-64 p-5"
      }`}>
        {sidebarContent(false)}
        
        {/* Toggle Button */}
        <button
          onClick={toggleCollapse}
          className="absolute top-6 -right-3 h-6 w-6 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:shadow transition-all cursor-pointer z-40"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Navigation Header */}
        <header className="md:hidden bg-white border-b border-slate-200 h-16 px-4 flex items-center justify-between sticky top-0 z-40">
          <Link href="/dashboard" className="flex items-center">
            <img
              src={logoSource}
              alt="Savazar Logo"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                if (e.currentTarget.src !== DEFAULT_LOGO) {
                  e.currentTarget.src = DEFAULT_LOGO;
                }
              }}
            />
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 focus-visible:ring-2 focus-visible:ring-[#6771ab] outline-none"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl p-5 flex flex-col z-50 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between mb-6">
                <Link href="/dashboard" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                  <img
                    src={logoSource}
                    alt="Savazar Logo"
                    className="h-8 w-auto object-contain"
                    onError={(e) => {
                      if (e.currentTarget.src !== DEFAULT_LOGO) {
                        e.currentTarget.src = DEFAULT_LOGO;
                      }
                    }}
                  />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-xl hover:bg-slate-100 text-slate-500"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {sidebarContent(true)}
            </aside>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1">
          <SampleWalkthroughCard 
            isSampleWedding={activeWedding ? (activeWedding.description || "").includes("Sample Wedding") : false} 
            weddingId={activeWedding?.id} 
            userRole={userRole} 
          />
          {children}
        </main>
      </div>
    </div>
  );
}
