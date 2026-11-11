"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, LayoutDashboard, Briefcase, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase, disabled: true },
  { href: "/candidates", label: "Candidates", icon: Users, disabled: true },
  { href: "/settings", label: "Settings", icon: Settings, disabled: true },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const className = cn(
          "touch-target flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
          item.disabled
            ? "cursor-not-allowed text-muted/60"
            : "text-text hover:bg-soft-blue hover:text-primary",
        );
        if (item.disabled) {
          return (
            <span key={item.label} className={className} aria-disabled="true">
              <Icon aria-hidden className="size-4 shrink-0 text-muted/60" />
              <span className="truncate">{item.label}</span>
              <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-muted">Soon</span>
            </span>
          );
        }
        return (
          <Link key={item.href} href={item.href} className={className} onClick={onNavigate}>
            <Icon aria-hidden className="size-4 shrink-0 text-secondary" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="min-h-dvh bg-[#F8F7F3]">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-primary px-3.5 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70]"
      >
        Skip to content
      </a>

      <div className="container-safe flex min-h-dvh gap-4 py-4 lg:gap-6 lg:py-6">
        <aside className="sticky top-6 hidden h-[calc(100dvh-3rem)] w-64 shrink-0 flex-col rounded-2xl border border-border bg-white p-5 shadow-sm lg:flex">
          <div className="mb-6 px-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-gold">ITRP</p>
            <p className="mt-1 font-serif text-base font-bold text-primary">Teacher Recruitment</p>
          </div>
          <NavLinks />
          <div className="mt-auto rounded-xl border border-border bg-[#FAF9F5] p-3.5 text-xs text-muted">
            Official Educator Placement Registry.
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-sm lg:hidden">
            <div className="min-w-0">
              <p className="truncate font-serif text-sm font-bold text-primary">Teacher Recruitment</p>
              <p className="truncate text-xs text-muted">Verified Portal</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="border-border text-primary hover:bg-soft-blue"
              aria-label="Open navigation menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu aria-hidden className="size-5" />
            </Button>
          </header>

          <Drawer open={open} onClose={() => setOpen(false)} title="Navigation">
            <NavLinks onNavigate={() => setOpen(false)} />
          </Drawer>

          <main id="main-content" className="min-w-0 flex-1 pb-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
