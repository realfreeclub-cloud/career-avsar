"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ArrowRight, Shield, User, Building2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { BrandLogo } from "@/components/brand/logo";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

const nav = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Find Teaching Jobs" },
  { href: "/for-schools", label: "For Schools" },
  { href: "/for-teachers", label: "For Teachers" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/locations", label: "Service Locations" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

export function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      <div className="container-safe flex min-h-[72px] items-center justify-between gap-4 py-2">
        {/* Brand / Career Avsar Logo */}
        <BrandLogo variant="primary" size="md" showTagline={true} />

        {/* Desktop Navigation */}
        <nav aria-label="Primary" className="hidden items-center gap-1 xl:flex">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "touch-target inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors duration-150",
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
          <Button
            asChildLink
            href="/teacher/login"
            variant="ghost"
            size="sm"
            className="text-xs font-semibold text-[#14264D] hover:bg-blue-50 hover:text-[#1266C5]"
          >
            <User className="mr-1 size-3.5 text-[#1266C5]" />
            Teacher Login
          </Button>

          <Button
            asChildLink
            href="/school/login"
            variant="outline"
            size="sm"
            className="border-slate-300 text-xs font-semibold text-[#14264D] hover:bg-slate-50"
          >
            <Building2 className="mr-1 size-3.5 text-[#F28B19]" />
            School Login
          </Button>

          <Button
            asChildLink
            href="/teacher/register"
            size="sm"
            className="group relative overflow-hidden bg-[#1266C5] px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#087FE8]"
          >
            <span>Register as Teacher</span>
            <ArrowRight aria-hidden className="ml-1 size-3.5 transition-transform group-hover:translate-x-0.5 text-[#F28B19]" />
          </Button>
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="flex items-center gap-2 xl:hidden">
          <Button
            asChildLink
            href="/teacher/register"
            size="sm"
            className="hidden sm:inline-flex bg-[#1266C5] text-xs font-semibold text-white hover:bg-[#087FE8]"
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
            <BrandLogo size="md" showTagline={true} />
            <p className="mt-2 text-xs text-muted">
              {CAREER_AVSAR_BRAND.brandDescriptor}
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

          <div className="space-y-2 border-t border-border pt-4">
            <Button
              asChildLink
              href="/teacher/login"
              variant="outline"
              size="md"
              className="w-full justify-start border-slate-200 text-[#14264D]"
              onClick={() => setOpen(false)}
            >
              <User className="mr-2 size-4 text-[#1266C5]" />
              Teacher Login
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
              School Login
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
              Administrator Access
            </Button>
          </div>
        </div>
      </Drawer>
    </header>
  );
}
