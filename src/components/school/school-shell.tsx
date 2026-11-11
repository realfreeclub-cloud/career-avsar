"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FilePlus,
  Briefcase,
  Users,
  CalendarDays,
  MessageSquare,
  Award,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/logo";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

const SCHOOL_NAV = [
  { href: "/school/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/school/profile", label: "Institution Profile", icon: Building2 },
  { href: "/school/vacancies/request", label: "Vacancy Requests", icon: FilePlus },
  { href: "/school/vacancies", label: "My Vacancies", icon: Briefcase },
  { href: "/school/candidates", label: "Shortlisted Candidates", icon: Users },
  { href: "/school/interviews", label: "Interview Management", icon: CalendarDays },
  { href: "/school/feedback", label: "Candidate Feedback", icon: MessageSquare },
  { href: "/school/placements", label: "Placement History", icon: Award },
  { href: "/school/messages", label: "Communication", icon: Send },
  { href: "/school/notifications", label: "Notifications", icon: Bell },
  { href: "/school/settings", label: "Account Settings", icon: Settings },
];

export function SchoolShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
    router.push("/school/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-[#F6F8FC]">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-md lg:hidden">
        <div className="flex min-h-[60px] items-center justify-between gap-3 px-4">
          <Button variant="ghost" size="icon" aria-label="Open menu" onClick={() => setMobileOpen(true)} className="text-[#14264D] hover:bg-slate-100">
            <Menu aria-hidden className="size-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BrandLogo size="xs" showTagline={false} showText={false} href="" />
            <span className="font-serif text-sm font-bold text-[#14264D]">{CAREER_AVSAR_BRAND.brandName} School Portal</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", mobileOpen ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!mobileOpen}>
        <button
          type="button"
          tabIndex={mobileOpen ? 0 : -1}
          aria-label="Close menu"
          className={cn("absolute inset-0 bg-[#14264D]/25 backdrop-blur-[2px] transition-opacity", mobileOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setMobileOpen(false)}
        />
        <div className={cn("absolute left-0 top-0 flex h-full w-[min(20rem,92vw)] flex-col bg-white p-5 shadow-2xl transition-transform duration-250", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <BrandLogo size="sm" showTagline={false} href="/school/dashboard" />
            <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setMobileOpen(false)} className="text-[#14264D]">
              <X aria-hidden className="size-5" />
            </Button>
          </div>
          <nav className="flex flex-col gap-1 overflow-y-auto">
            {SCHOOL_NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                    active
                      ? "bg-blue-50 font-bold text-[#1266C5]"
                      : "text-slate-700 hover:bg-slate-100 hover:text-[#1266C5]",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-border pt-4">
            <Button variant="ghost" size="sm" className="w-full justify-start text-rose-600 hover:bg-rose-50" onClick={handleSignOut}>
              <LogOut className="mr-2 size-4" /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto flex w-full max-w-[1920px] gap-5 p-3 sm:p-4 lg:p-5 xl:p-6">
        {/* Desktop Sidebar */}
        <aside className="sticky top-4 hidden h-[calc(100dvh-2rem)] w-64 shrink-0 flex-col rounded-2xl bg-white border border-slate-200 p-4 shadow-xs lg:flex xl:top-6 xl:h-[calc(100dvh-3rem)]">
          <div className="mb-4 border-b border-slate-100 pb-3">
            <BrandLogo size="sm" showTagline={false} href="/school/dashboard" />
            <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold text-[#1266C5]">
              <ShieldCheck className="size-3" />
              <span>School Recruitment Portal</span>
            </div>
          </div>

          <nav className="flex flex-col gap-1 overflow-y-auto pr-1">
            {SCHOOL_NAV.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all",
                    active
                      ? "bg-blue-50 font-bold text-[#1266C5] border border-blue-200 shadow-xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-[#1266C5]",
                  )}
                >
                  <Icon className={cn("size-4 shrink-0", active ? "text-[#1266C5]" : "text-slate-500")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-slate-100 pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs font-semibold text-rose-600 hover:bg-rose-50"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 size-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
