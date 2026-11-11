"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Card, useToast } from "@/components/ui";
import { apiFetch } from "@/lib/api/client";
import { ArrowRight, ShieldCheck, KeyRound, Building2 } from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const { push } = useToast();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await apiFetch<{ id: string; email: string; role: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (!res.ok) return setError(res.error.message);

    push({ tone: "success", title: "Signed in successfully", message: "Welcome back to your educator portal." });
    const next = sp.get("next");
    if (res.data.role === "admin") {
      router.push(next && next.startsWith("/admin") ? next : "/admin/dashboard");
    } else if (res.data.role === "school" || res.data.role === "recruiter") {
      router.push(next && next.startsWith("/school") ? next : "/school/dashboard");
    } else {
      router.push(next && next.startsWith("/teacher") ? next : "/teacher/dashboard");
    }
    router.refresh();
  }

  function fillDemoTeacher() {
    setEmail("teacher@careeravsar.in");
    setPassword("Teacher@123");
    setError(null);
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 text-center flex flex-col items-center">
        <BrandLogo size="lg" showTagline={true} />
        <h1 className="mt-4 font-serif text-2xl font-bold tracking-tight text-[#14264D] sm:text-3xl">
          Teacher Portal Login
        </h1>
        <p className="mt-1 text-xs text-[#687487]">
          Access your verified teaching profile, applications, and interview invitations.
        </p>
      </div>

      <Card className="p-6 sm:p-8 border-slate-200">
        {/* Demo Helper Banner */}
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-[#14264D] flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-[#1266C5]" /> Demo Teacher Credentials
            </span>
            <button
              type="button"
              onClick={fillDemoTeacher}
              className="text-[11px] font-semibold text-[#1266C5] hover:underline"
            >
              Auto-fill
            </button>
          </div>
          <p className="mt-1 text-slate-600">
            Email: <code className="font-mono text-[#14264D]">teacher@careeravsar.in</code> (or <code className="font-mono">teacher@eduniyukti.com</code>) • Password:{" "}
            <code className="font-mono text-[#14264D]">Teacher@123</code>
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <Input
            label="Registered Email"
            type="email"
            autoComplete="email"
            required
            placeholder="e.g. teacher@careeravsar.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Enter your account password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error ? (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50/70 p-3 text-xs font-medium text-danger">
              {error}
            </p>
          ) : null}
          <Button type="submit" fullWidth size="lg" disabled={busy} className="bg-[#1266C5] hover:bg-[#087FE8] text-white font-bold">
            <span>{busy ? "Signing in…" : "Sign In to Portal"}</span>
            <ArrowRight aria-hidden className="size-4 text-[#F28B19]" />
          </Button>
        </form>

        <div className="mt-6 border-t border-border pt-4 text-center text-xs text-muted space-y-2">
          <div>
            New to Career Avsar?{" "}
            <Link href="/teacher/register" className="font-semibold text-[#1266C5] hover:underline">
              Register as an Educator
            </Link>
          </div>
          <div className="flex flex-col gap-1 pt-1">
            <Link
              href="/school/login"
              className="inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-[#14264D]/80 hover:text-[#1266C5] hover:underline"
            >
              <Building2 className="h-3.5 w-3.5 text-[#F28B19]" /> Are you a School Representative? School Portal Login
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-[#14264D]/70 hover:text-[#1266C5] hover:underline"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#1266C5]" /> Administrator Access
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
