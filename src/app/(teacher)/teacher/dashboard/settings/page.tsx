"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, Shield } from "lucide-react";
import { Button, Card, CardHeader, CardTitle, EmptyState, ErrorState, Input, Skeleton, useToast } from "@/components/ui";
import { apiFetch } from "@/lib/api/client";

type SettingsData = { email: string; role: string };

export default function SettingsPage() {
  const router = useRouter();
  const { push } = useToast();
  const [data, setData] = React.useState<SettingsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true); setError(null);
    const res = await apiFetch<SettingsData>("/api/teacher/settings");
    if (!res.ok) setError(res.error.message);
    else { setData(res.data); setEmail(res.data.email); }
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await apiFetch<{ saved: boolean }>("/api/teacher/settings", { method: "PUT", body: JSON.stringify({ email }) });
    setSaving(false);
    if (!res.ok) return push({ tone: "error", title: "Save failed", message: res.error.message });
    push({ tone: "success", title: "Settings saved" });
    load();
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    router.push("/"); router.refresh();
  }

  if (loading) return <div className="space-y-3"><Skeleton className="h-10 w-48" /><Skeleton className="h-48 rounded-2xl" /></div>;
  if (error) return <ErrorState title="Unable to load settings" message={error} onRetry={load} />;
  if (!data) return <EmptyState title="Settings unavailable" description="We couldn’t load account settings." />;

  return (
    <div className="space-y-6">
      <header className="border-b border-border pb-4">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-primary sm:text-3xl">Account & Security</h1>
        <p className="mt-1 text-sm text-secondary-text sm:text-base">Manage account details, verified credentials, and active session security.</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border border-border p-6 shadow-sm">
          <CardHeader className="px-0 pt-0 pb-4 border-b border-border mb-5">
            <CardTitle className="font-serif text-lg font-bold text-primary">Contact & Credentials</CardTitle>
          </CardHeader>
          <form onSubmit={save} className="space-y-5">
            <Input
              label="Account Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              hint="Official email used for institutional correspondence and login."
            />
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving Changes…" : "Save Changes"}
              </Button>
              <Button asChildLink href="/teacher/dashboard/profile" variant="secondary">
                Edit Professional Profile
              </Button>
            </div>
          </form>
        </Card>
        <div className="space-y-5">
          <Card className="border border-border p-5 shadow-sm">
            <CardHeader className="px-0 pt-0 pb-3 border-b border-border mb-3">
              <CardTitle className="font-serif text-base font-bold text-primary">Verified Account Role</CardTitle>
            </CardHeader>
            <div className="flex items-start gap-3.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-soft-blue text-primary border border-[#D5DFEB]">
                <Shield className="size-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-bold capitalize text-primary">{data.role} Account</p>
                <p className="mt-0.5 text-xs text-secondary-text leading-relaxed">
                  Authorized access strictly bounded to your candidate records, verification documents, and active applications.
                </p>
              </div>
            </div>
          </Card>
          <Card className="border border-border p-5 shadow-sm">
            <CardHeader className="px-0 pt-0 pb-3 border-b border-border mb-3">
              <CardTitle className="font-serif text-base font-bold text-primary">Session Security</CardTitle>
            </CardHeader>
            <p className="text-xs text-secondary-text leading-relaxed">
              Ensure you terminate active sessions when utilizing shared or institutional computer terminals.
            </p>
            <Button variant="outline" className="mt-4 text-red-600 hover:bg-red-50 hover:border-red-200" onClick={signOut}>
              <LogOut aria-hidden className="size-4" />
              <span>Sign Out Session</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
