"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  Star,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui";
import { BrandLogo } from "@/components/brand/logo";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/teachers", label: "Teachers", icon: Users },
  { href: "/admin/schools", label: "Schools", icon: Building2 },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/shortlisted", label: "Shortlisted", icon: Star },
  { href: "/admin/interviews", label: "Interviews", icon: CalendarDays },
  { href: "/admin/placements", label: "Placements", icon: ShieldCheck },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ClipboardList },
  { href: "/admin/recruiters", label: "Recruiters", icon: UserCog },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => setMobileOpen(false), [pathname]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-[#F8F7F3]">
      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-md lg:hidden">
        <div className="flex min-h-[60px] items-center justify-between gap-3 px-4">
          <Button variant="ghost" size="icon" aria-label="Open menu" onClick={() => setMobileOpen(true)} className="text-primary hover:bg-soft-blue">
            <Menu aria-hidden className="size-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BrandLogo size="xs" showTagline={false} showText={false} href="" />
            <span className="font-serif text-sm font-bold text-[#14264D]">{CAREER_AVSAR_BRAND.brandName} Admin</span>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Mobile Drawer (Light Theme) */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", mobileOpen ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!mobileOpen}>
        <button
          type="button"
          tabIndex={mobileOpen ? 0 : -1}
          aria-label="Close menu"
          className={cn("absolute inset-0 bg-primary/20 backdrop-blur-[3px] transition-opacity", mobileOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setMobileOpen(false)}
        />
        <div className={cn("absolute left-0 top-0 flex h-full w-[min(20rem,92vw)] flex-col bg-white border-r border-border p-4 text-main-text shadow-2xl transition-transform duration-250", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
          <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2.5">
              <BrandLogo size="sm" showTagline={false} href="" />
            </div>
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close" className="text-secondary-text hover:bg-soft-blue hover:text-primary">
              <X aria-hidden className="size-5" />
            </Button>
          </div>
          <Nav pathname={pathname} />
          <div className="mt-auto border-t border-border pt-3">
            <Button variant="ghost" size="sm" className="w-full justify-start text-red-700 hover:bg-red-50 hover:text-red-800 font-medium" onClick={signOut}>
              <LogOut aria-hidden className="size-4" /> Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Main Container */}
      <div className="mx-auto flex w-full max-w-[1920px] gap-5 p-3 sm:p-4 lg:p-5 xl:p-6">
        {/* Elegant Light Desktop Sidebar */}
        <aside className="sticky top-4 hidden h-[calc(100dvh-2rem)] w-64 shrink-0 flex-col rounded-2xl bg-white border border-border p-4 text-main-text shadow-sm lg:flex xl:top-6 xl:h-[calc(100dvh-3rem)]">
          <div className="mb-4 border-b border-border px-1 pb-3.5">
            <BrandLogo size="sm" showTagline={false} href="/admin/dashboard" />
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#F28B19]">
              Management Console
            </p>
          </div>

          <Nav pathname={pathname} />

          <div className="mt-auto border-t border-border pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-red-700 hover:bg-red-50 hover:text-red-800 font-medium"
              onClick={signOut}
            >
              <LogOut aria-hidden className="size-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </aside>

        {/* Content Area */}
        <div className="min-w-0 flex-1">
          <main id="admin-main">{children}</main>
        </div>
      </div>
    </div>
  );
}

function Nav({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Admin modules" className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "touch-target flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-soft-blue text-primary font-bold border border-[#D5DFEB] shadow-xs"
                : "text-secondary-text hover:bg-soft-blue/60 hover:text-primary",
            )}
          >
            <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-secondary-text")} aria-hidden />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
