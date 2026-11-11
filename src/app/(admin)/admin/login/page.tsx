"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  KeyRound,
  Building2,
  Users,
} from "lucide-react";
import { Button, Input, Card, useToast } from "@/components/ui";
import { apiFetch } from "@/lib/api/client";
import { BrandLogo } from "@/components/brand/logo";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { push } = useToast();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const res = await apiFetch<{ id: string; email: string; role: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), password }),
    });

    setBusy(false);

    if (!res.ok) {
      return setError(res.error.message || "Invalid administrator credentials.");
    }

    if (res.data.role !== "admin") {
      return setError(
        "Access denied. This account does not have administrator privileges. Please use the Teacher or School Portal."
      );
    }

    push({
      tone: "success",
      title: "Administrator Authenticated",
      message: `Welcome to ${CAREER_AVSAR_BRAND.brandName} Operations Console.`,
    });

    const next = searchParams.get("next");
    router.push(next && next.startsWith("/admin") ? next : "/admin/dashboard");
    router.refresh();
  }

  function fillDemoAdmin1() {
    setEmail("admin@careeravsar.in");
    setPassword("Admin@123");
    setError(null);
  }

  function fillDemoAdmin2() {
    setEmail("admin@eduniyukti.com");
    setPassword("Admin@123");
    setError(null);
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header Branding */}
        <div className="text-center flex flex-col items-center">
          <BrandLogo size="lg" showTagline={true} />
          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#14264D]">
            {CAREER_AVSAR_BRAND.brandName} Admin
          </h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#F28B19]">
            {CAREER_AVSAR_BRAND.brandDescriptor}
          </p>
          <p className="mt-2 text-sm text-[#687487]">
            Operations Console for Schools, Teachers &amp; Placement Workflows
          </p>
        </div>

        {/* Card Surface */}
        <Card className="mt-8 p-6 sm:p-8 bg-white border border-slate-200 shadow-sm rounded-2xl">
          {/* Quick Demo Helper Box */}
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#14264D] flex items-center gap-1.5">
                <KeyRound className="h-4 w-4 text-[#1266C5]" /> Demo Admin Credentials
              </span>
              <span className="text-[10px] uppercase font-bold text-[#1266C5] bg-blue-100 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>

            <p className="text-slate-600 text-[11px] leading-relaxed">
              Click either option below to auto-fill verified administrator credentials:
            </p>

            <div className="grid gap-2">
              <button
                type="button"
                onClick={fillDemoAdmin1}
                className="w-full text-left rounded-lg border border-slate-200 bg-white p-2.5 hover:border-[#1266C5] hover:bg-slate-50 transition flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-[#14264D] block">Primary Admin (Career Avsar)</span>
                  <code className="text-[11px] text-muted">admin@careeravsar.in / Admin@123</code>
                </div>
                <span className="text-[11px] font-bold text-[#1266C5]">Fill</span>
              </button>

              <button
                type="button"
                onClick={fillDemoAdmin2}
                className="w-full text-left rounded-lg border border-slate-200 bg-white p-2.5 hover:border-[#1266C5] hover:bg-slate-50 transition flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-[#14264D] block">Legacy Admin (EduNiyukti Account)</span>
                  <code className="text-[11px] text-muted">admin@eduniyukti.com / Admin@123</code>
                </div>
                <span className="text-[11px] font-bold text-[#1266C5]">Fill</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Administrator Email"
              type="email"
              autoComplete="email"
              required
              placeholder="e.g. admin@careeravsar.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Security Password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Enter administrator password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error ? (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-danger">
                {error}
              </div>
            ) : null}

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={busy}
              className="bg-[#14264D] hover:bg-[#1266C5] text-white font-bold"
            >
              <span>{busy ? "Authenticating…" : "Sign In to Admin Console"}</span>
              <ArrowRight aria-hidden className="size-4 text-[#F28B19]" />
            </Button>
          </form>

          {/* Footer Navigation Links */}
          <div className="mt-6 border-t border-slate-100 pt-4 text-center space-y-2">
            <div>
              <Link
                href="/school/login"
                className="text-xs font-semibold text-[#1266C5] hover:underline inline-flex items-center gap-1"
              >
                <Building2 className="h-3.5 w-3.5" /> Looking for the School Portal? Sign in here
              </Link>
            </div>
            <div>
              <Link
                href="/teacher/login"
                className="text-xs font-semibold text-muted hover:text-primary hover:underline inline-flex items-center gap-1"
              >
                <Users className="h-3.5 w-3.5" /> Candidate Educator? Access Teacher Portal
              </Link>
            </div>
            <div className="pt-2">
              <Link
                href="/"
                className="text-xs text-muted hover:text-primary transition"
              >
                ← Return to Public Website
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F8FC] flex items-center justify-center">
          <div className="text-center font-serif text-[#14264D]">Loading Admin Console…</div>
        </div>
      }
    >
      <AdminLoginForm />
    </React.Suspense>
  );
}
