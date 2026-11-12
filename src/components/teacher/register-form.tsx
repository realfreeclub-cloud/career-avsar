"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input, Card, useToast } from "@/components/ui";
import { apiFetch, fieldErrors } from "@/lib/api/client";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const { push } = useToast();
  const [form, setForm] = React.useState({ fullName: "", email: "", mobile: "", password: "", confirm: "" });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [busy, setBusy] = React.useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.fullName.trim().length < 2) next.fullName = "Full name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email.";
    if (form.mobile.trim().length < 8) next.mobile = "Enter a valid mobile number.";
    if (form.password.length < 8) next.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirm) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    const res = await apiFetch<{ id: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName: form.fullName, email: form.email, mobile: form.mobile, password: form.password }),
    });
    setBusy(false);
    if (!res.ok) {
      setErrors({ _form: res.error.message, ...fieldErrors(res.error.details) });
      return;
    }
    push({ tone: "success", title: "Account created", message: "Continue your teacher registration." });
    router.push("/teacher/profile?onboarding=1");
    router.refresh();
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      {/* Editorial Overview Card */}
      <div className="rounded-2xl border border-border bg-[#F5F2EB] p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#DCD5C5] bg-[#EFECE4] px-3.5 py-1 text-xs font-semibold tracking-wide text-[#8F7032]">
          <Sparkles aria-hidden className="size-3.5 text-accent-gold" />
          <span>Educator Enrollment</span>
        </div>
        <h1 className="mt-3.5 font-serif text-2xl font-bold tracking-tight text-primary sm:text-3xl lg:text-4xl">
          Create your verified teacher account
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          Join India&rsquo;s trusted recruitment registry. Build a structured academic dossier, upload credentials privately, and connect directly with accredited schools.
        </p>
        <ul className="mt-6 space-y-3 border-t border-border/80 pt-6 text-sm text-text">
          {[
            "Step-by-step profile wizard aligned with NCTE standards",
            "Auto-save progress anytime & resume from any device",
            "Confidential document vault visible only to schools you apply to",
            "Real-time interview alerts and direct institutional offers",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2.5">
              <CheckCircle2 className="size-4.5 shrink-0 text-accent-gold mt-0.5" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Form Card */}
      <Card className="p-6 sm:p-8">
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Input
            label="Full Legal Name"
            autoComplete="name"
            required
            placeholder="e.g. Ananya Sen Gupta"
            value={form.fullName}
            onChange={set("fullName")}
            error={errors.fullName}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              required
              placeholder="name@example.com"
              value={form.email}
              onChange={set("email")}
              error={errors.email}
            />
            <Input
              label="Mobile Number"
              type="tel"
              autoComplete="tel"
              required
              placeholder="+91 98765 43210"
              value={form.mobile}
              onChange={set("mobile")}
              error={errors.mobile}
              hint="Include country code if applicable"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Account Password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              hint="Must be at least 8 characters"
            />
            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="Re-enter password"
              value={form.confirm}
              onChange={set("confirm")}
              error={errors.confirm}
            />
          </div>
          {errors._form ? (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50/70 p-3 text-sm font-medium text-danger">
              {errors._form}
            </p>
          ) : null}
          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={busy}
            className="bg-primary hover:bg-secondary text-white font-medium"
          >
            <span>{busy ? "Creating account…" : "Create Account & Continue Profile"}</span>
            <ArrowRight aria-hidden className="size-4 text-accent-gold" />
          </Button>
        </form>
        <div className="mt-6 border-t border-border/60 pt-4 text-center text-sm text-muted">
          Already registered?{" "}
          <Link href="/teacher/login" className="font-semibold text-secondary hover:underline">
            Sign In to Teacher Portal
          </Link>
        </div>
      </Card>
    </div>
  );
}
