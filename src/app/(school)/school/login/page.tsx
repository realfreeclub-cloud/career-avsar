"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
} from "lucide-react";
import { Button, Input, Card, useToast } from "@/components/ui";
import { apiFetch } from "@/lib/api/client";
import { BrandLogo } from "@/components/brand/logo";
import { CAREER_AVSAR_BRAND } from "@/lib/brand/config";

function SchoolLoginForm() {
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
      body: JSON.stringify({ email: email.trim(), password }),
    });

    setBusy(false);

    if (!res.ok) {
      return setError(res.error.message || "Invalid institution credentials.");
    }

    if (res.data.role !== "school" && res.data.role !== "recruiter" && res.data.role !== "admin") {
      return setError(
        "Access denied. This portal is reserved for authorized school representatives. Teachers should use the Teacher Portal."
      );
    }

    push({
      tone: "success",
      title: "School Portal Authenticated",
      message: `Welcome to ${CAREER_AVSAR_BRAND.brandName} School Recruitment Portal.`,
    });

    const next = sp.get("next");
    router.push(next && next.startsWith("/school") ? next : "/school/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center flex flex-col items-center">
          <BrandLogo size="md" showTagline={false} />
          <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight text-[#14264D]">
            School Recruitment Portal
          </h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#F28B19]">
            {CAREER_AVSAR_BRAND.tagline}
          </p>
          <p className="mt-2 text-xs text-[#687487]">
            Authorized Institutional Access for Principals, HR &amp; Hiring Committees
          </p>
        </div>

        <Card className="mt-8 p-6 sm:p-8 bg-white border border-slate-200 shadow-sm rounded-2xl">
          <form onSubmit={submit} className="space-y-4" noValidate>
            <Input
              label="Institutional Email"
              type="email"
              autoComplete="email"
              required
              placeholder="e.g. principal@school.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Enter your password"
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
              className="bg-[#1266C5] hover:bg-[#087FE8] text-white font-bold"
            >
              <span>{busy ? "Authenticating…" : "Sign In to School Portal"}</span>
              <ArrowRight aria-hidden className="size-4 text-[#F28B19]" />
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-[#687487] space-y-2">
            <p>
              Received an activation invitation via WhatsApp?{" "}
              <Link href="/school/activate" className="font-semibold text-[#1266C5] hover:underline">
                Activate Account
              </Link>
            </p>
            <p>
              Need to post teacher requirements?{" "}
              <Link href="/for-schools" className="font-semibold text-[#1266C5] hover:underline">
                Explore School Solutions
              </Link>
            </p>
            <div className="pt-2 flex justify-center gap-4 text-[11px]">
              <Link href="/teacher/login" className="text-muted hover:text-primary">
                Teacher Login
              </Link>
              <span>•</span>
              <Link href="/admin/login" className="text-muted hover:text-primary">
                Admin Console
              </Link>
              <span>•</span>
              <Link href="/" className="text-muted hover:text-primary">
                Public Website
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function SchoolLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#F6F8FC] flex items-center justify-center">
          <div className="text-center font-serif text-[#14264D]">Loading School Portal…</div>
        </div>
      }
    >
      <SchoolLoginForm />
    </React.Suspense>
  );
}
