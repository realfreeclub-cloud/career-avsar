"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ArrowRight, Shield, User, Building2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { BrandLogo } from "@/components/brand/logo";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

const nav = [
  { href: "/jobs", label: "Find Jobs" },
  { href: "/for-schools", label: "For Schools" },
  { href: "/for-teachers", label: "For Teachers" },
  { href: "/locations", label: "Locations" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const [loginMenuOpen, setLoginMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close login dropdown on outside click or Esc
  React.useEffect(() => {
    if (!loginMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLoginMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLoginMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [loginMenuOpen]);

  // Close dropdown on route change
  React.useEffect(() => {
    setLoginMenuOpen(false);
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur-md transition-all duration-200",
        scrolled ? "shadow-[0_4px_20px_-4px_rgba(20,38,77,0.08)]" : "shadow-none",
      )}
    >
      <a
        href="#main-content"
        className="sr-only rounded-md bg-[#1266C5] px-3.5 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[70]"
      >
        Skip to content
      </a>
      <div className="container-safe flex min-h-[68px] items-center justify-between gap-3 sm:gap-4 py-2">
        {/* Brand / Career Avsar Logo */}
        <div className="shrink-0">
          <BrandLogo variant="primary" size="md" showTagline={false} />
        </div>

        {/* Desktop Navigation */}
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "touch-target whitespace-nowrap inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-semibold tracking-wide transition-colors duration-150",
                  active
                    ? "bg-blue-50 font-bold text-[#1266C5] border border-blue-200"
                    : "text-[#172334]/85 hover:bg-slate-100 hover:text-[#1266C5]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden items-center gap-2 lg:flex">
          {/* Sign In Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setLoginMenuOpen((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#14264D] transition hover:bg-slate-100 hover:text-[#1266C5]",
                loginMenuOpen && "bg-slate-100 text-[#1266C5]",
              )}
              aria-haspopup="true"
              aria-expanded={loginMenuOpen}
            >
              <User className="size-3.5 text-[#1266C5]" />
              <span>Sign In</span>
              <ChevronDown className={cn("size-3 transition-transform duration-200", loginMenuOpen && "rotate-180")} />
            </button>

            {loginMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Select Portal</p>
                </div>

                <Link
                  href="/teacher/login"
                  className="flex items-start gap-3 rounded-xl p-2.5 text-left transition hover:bg-blue-50/70 group"
                  onClick={() => setLoginMenuOpen(false)}
                >
                  <div className="mt-0.5 rounded-lg bg-blue-100/70 p-1.5 text-[#1266C5] group-hover:bg-[#1266C5] group-hover:text-white transition">
                    <User className="size-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[#14264D] group-hover:text-[#1266C5]">Teacher Portal</span>
                    <span className="block text-[11px] text-muted">Applications, interviews &amp; profile</span>
                  </div>
                </Link>

                <Link
                  href="/school/login"
                  className="flex items-start gap-3 rounded-xl p-2.5 text-left transition hover:bg-amber-50/70 group"
                  onClick={() => setLoginMenuOpen(false)}
                >
                  <div className="mt-0.5 rounded-lg bg-amber-100/70 p-1.5 text-[#F28B19] group-hover:bg-[#F28B19] group-hover:text-white transition">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[#14264D] group-hover:text-[#F28B19]">School Portal</span>
                    <span className="block text-[11px] text-muted">Institutional hiring &amp; requirements</span>
                  </div>
                </Link>

                <div className="border-t border-slate-100 mt-1 pt-1">
                  <Link
                    href="/admin/login"
                    className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:text-[#1266C5] hover:bg-slate-50 transition"
                    onClick={() => setLoginMenuOpen(false)}
                  >
                    <Shield className="size-3 text-[#1266C5]" />
                    <span>Administrator Console</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Primary CTA Button */}
          <Button
            asChildLink
            href="/teacher/register"
            size="sm"
            className="group whitespace-nowrap bg-[#1266C5] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#087FE8] rounded-xl"
          >
            <span>Register as Teacher</span>
            <ArrowRight aria-hidden className="ml-1 size-3.5 transition-transform group-hover:translate-x-0.5 text-[#F28B19]" />
          </Button>
        </div>

        {/* Mobile Navigation Trigger (Visible < lg) */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button
            asChildLink
            href="/teacher/register"
            size="sm"
            className="whitespace-nowrap bg-[#1266C5] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#087FE8] rounded-lg"
          >
            Register
          </Button>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="touch-target inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-[#14264D] transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1266C5]"
            aria-label="Open navigation menu"
            aria-expanded={open}
          >
            <Menu aria-hidden className="size-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <Drawer open={open} onClose={() => setOpen(false)} title={CAREER_AVSAR_BRAND.brandName} side="left">
        <div className="flex flex-col gap-6 py-2">
          {/* Logo inside Drawer */}
          <div className="border-b border-border pb-4">
            <BrandLogo size="md" showTagline={false} />
            <p className="mt-2 text-xs text-muted leading-relaxed">
              {CAREER_AVSAR_BRAND.tagline}
            </p>
          </div>

          <nav aria-label="Mobile Navigation" className="flex flex-col gap-1">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "touch-target flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors",
                    active
                      ? "bg-blue-50 font-bold text-[#1266C5]"
                      : "text-[#172334] hover:bg-slate-100",
                  )}
                >
                  <span>{item.label}</span>
                  <ArrowRight aria-hidden className="size-4 opacity-40" />
                </Link>
              );
            })}
          </nav>

          <div className="space-y-2.5 border-t border-border pt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted px-1">Access Portals</p>
            <Button
              asChildLink
              href="/teacher/login"
              variant="outline"
              size="md"
              className="w-full justify-start border-slate-200 text-[#14264D]"
              onClick={() => setOpen(false)}
            >
              <User className="mr-2 size-4 text-[#1266C5]" />
              Teacher Portal Login
            </Button>
            <Button
              asChildLink
              href="/school/login"
              variant="outline"
              size="md"
              className="w-full justify-start border-slate-200 text-[#14264D]"
              onClick={() => setOpen(false)}
            >
              <Building2 className="mr-2 size-4 text-[#F28B19]" />
              School Recruitment Portal
            </Button>
            <Button
              asChildLink
              href="/teacher/register"
              size="md"
              className="w-full justify-center bg-[#1266C5] font-bold text-white hover:bg-[#087FE8]"
              onClick={() => setOpen(false)}
            >
              <span>Register as Teacher</span>
              <ArrowRight aria-hidden className="ml-1.5 size-4 text-[#F28B19]" />
            </Button>
            <Button
              asChildLink
              href="/admin/login"
              variant="ghost"
              size="sm"
              className="w-full justify-center text-xs text-muted hover:text-primary"
              onClick={() => setOpen(false)}
            >
              <Shield className="mr-1 size-3 text-[#1266C5]" />
              Administrator Console
            </Button>
          </div>
        </div>
      </Drawer>
    </header>
  );
}
