"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  UserCircle2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { BrandLogo } from "@/components/brand/logo";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

type UserInfo = { name: string; email: string; verificationStatus: string };

const NAV = [
  { href: "/teacher/dashboard", label: "Dashboard Overview", icon: LayoutDashboard, exact: true },
  { href: "/teacher/dashboard/profile", label: "My Profile", icon: UserCircle2 },
  { href: "/teacher/dashboard/jobs", label: "Find Jobs", icon: Search },
  { href: "/teacher/dashboard/applications", label: "My Applications", icon: FileText },
  { href: "/teacher/dashboard/interviews", label: "Interviews", icon: CalendarDays },
  { href: "/teacher/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/teacher/dashboard/messages", label: "Messages & Updates", icon: MessageSquare },
  { href: "/teacher/dashboard/settings", label: "Account Settings", icon: Settings },
];

export function TeacherDashboardShell({ user, children }: { user: UserInfo; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [userMenu, setUserMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!userMenu) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [userMenu]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-[#F8F7F3]">
      <a href="#dashboard-main" className="sr-only rounded-md bg-primary px-3 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[80]">
        Skip to content
      </a>

      {/* Mobile top header */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-md lg:hidden">
        <div className="flex min-h-[58px] items-center justify-between gap-3 px-4">
          <Button variant="ghost" size="icon" aria-label="Open menu" onClick={() => setMobileOpen(true)} className="text-primary hover:bg-soft-blue">
            <Menu aria-hidden className="size-5" />
          </Button>
          <Link href="/teacher/dashboard" className="flex items-center gap-2 text-sm font-bold text-primary">
            <BrandLogo size="xs" showTagline={false} href="" />
            <span className="font-serif text-[#14264D]">{CAREER_AVSAR_BRAND.brandName} Portal</span>
          </Link>
          <NotificationDropdown />
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", mobileOpen ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!mobileOpen}>
        <button
          type="button"
          tabIndex={mobileOpen ? 0 : -1}
          aria-label="Close menu"
          className={cn("absolute inset-0 bg-primary/25 backdrop-blur-[2px] transition-opacity", mobileOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setMobileOpen(false)}
        />
        <div className={cn("absolute left-0 top-0 flex h-full w-[min(20rem,92vw)] flex-col bg-white p-5 shadow-2xl transition-transform duration-250", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                <GraduationCap className="size-4 text-accent-gold" />
              </span>
              <span className="font-serif text-base font-bold text-primary">Menu</span>
            </div>
            <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setMobileOpen(false)} className="text-primary hover:bg-soft-blue">
              <X aria-hidden className="size-5" />
            </Button>
          </div>
          <SidebarNav pathname={pathname} collapsed={false} />
          <div className="mt-auto border-t border-border pt-4">
            <UserBlock user={user} onSignOut={signOut} compact />
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1920px] gap-4 p-3 sm:p-4 lg:p-5 xl:p-6">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "sticky top-4 hidden h-[calc(100dvh-2rem)] shrink-0 flex-col rounded-2xl border border-border bg-white p-3.5 shadow-sm transition-all duration-200 lg:flex xl:top-6 xl:h-[calc(100dvh-3rem)]",
            collapsed ? "w-[76px]" : "w-64",
          )}
        >
          <div className={cn("mb-4 flex items-center gap-2.5 px-2", collapsed && "justify-center px-0")}>
            <BrandLogo size={collapsed ? "xs" : "sm"} showTagline={false} showText={!collapsed} href="/teacher/dashboard" />
          </div>

          <SidebarNav pathname={pathname} collapsed={collapsed} />

          <div className="mt-auto space-y-2 border-t border-border pt-3">
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="touch-target w-full rounded-lg px-2 text-xs font-medium text-muted hover:bg-soft-blue hover:text-primary transition"
            >
              {collapsed ? "Expand" : "Collapse Sidebar"}
            </button>
            {!collapsed ? (
              <UserBlock user={user} onSignOut={signOut} />
            ) : (
              <button
                type="button"
                onClick={signOut}
                className="touch-target mx-auto flex items-center justify-center rounded-lg text-muted hover:text-danger"
                aria-label="Sign out"
              >
                <LogOut className="size-4" aria-hidden />
              </button>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Desktop top bar */}
          <header className="sticky top-4 z-30 mb-5 hidden items-center justify-between gap-4 rounded-xl border border-border bg-white px-5 py-3 shadow-sm lg:flex xl:top-6">
            <div className="min-w-0">
              <p className="truncate font-serif text-base font-bold text-primary">
                {NAV.find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)))?.label ?? "Dashboard"}
              </p>
              <p className="truncate text-xs text-muted">Verified Educator Portal</p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationDropdown />
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenu((v) => !v)}
                  className="touch-target flex items-center gap-2.5 rounded-lg px-2.5 py-1 text-left hover:bg-soft-blue"
                  aria-haspopup="menu"
                  aria-expanded={userMenu}
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-soft-blue text-xs font-bold text-primary border border-[#D5DFEB]">
                    {(user.name || "T").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden max-w-[140px] truncate text-sm font-semibold text-primary xl:block">
                    {user.name}
                  </span>
                  <ChevronDown className={cn("size-4 text-muted transition", userMenu && "rotate-180")} aria-hidden />
                </button>
                {userMenu ? (
                  <div role="menu" className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-white p-1.5 shadow-xl">
                    <div className="border-b border-border/60 px-3 py-2">
                      <p className="truncate text-sm font-semibold text-primary">{user.name}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                    </div>
                    <Link
                      href="/teacher/dashboard/profile"
                      role="menuitem"
                      className="touch-target flex items-center rounded-lg px-3 py-2 text-sm text-text hover:bg-soft-blue hover:text-primary"
                      onClick={() => setUserMenu(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/teacher/dashboard/settings"
                      role="menuitem"
                      className="touch-target flex items-center rounded-lg px-3 py-2 text-sm text-text hover:bg-soft-blue hover:text-primary"
                      onClick={() => setUserMenu(false)}
                    >
                      Account Settings
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={signOut}
                      className="touch-target flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-danger hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <main id="dashboard-main" className="min-w-0 flex-1 pb-20 lg:pb-6">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav aria-label="Dashboard quick navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <ul className="grid grid-cols-5">
          {[
            NAV[0], NAV[2], NAV[3], NAV[5], { href: "/teacher/dashboard/settings", label: "Settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition",
                    active ? "text-primary font-bold" : "text-muted",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  <span className="max-w-full truncate">{item.label.split(" ")[0]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function SidebarNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  return (
    <nav aria-label="Dashboard modules" className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={cn(
              "touch-target flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
              collapsed && "justify-center px-0",
              active
                ? "bg-soft-blue font-bold text-primary border border-[#D5DFEB]"
                : "text-text hover:bg-[#FAF9F5] hover:text-primary",
            )}
          >
            <Icon className={cn("size-4 shrink-0", active ? "text-secondary" : "text-muted")} aria-hidden />
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}

function UserBlock({ user, onSignOut, compact }: { user: UserInfo; onSignOut: () => void; compact?: boolean }) {
  return (
    <div className={cn("rounded-xl border border-border bg-[#FAF9F5] p-3.5", compact && "p-2.5")}>
      <p className="truncate text-sm font-semibold text-primary">{user.name}</p>
      <p className="truncate text-xs text-muted">{user.email}</p>
      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted">
        <span>Verification:</span>
        <span className="capitalize font-semibold text-secondary">{user.verificationStatus}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        fullWidth
        className="mt-2.5 justify-start text-danger hover:bg-red-50 font-medium"
        onClick={onSignOut}
      >
        <LogOut aria-hidden className="size-4" /> Sign out
      </Button>
    </div>
  );
}
