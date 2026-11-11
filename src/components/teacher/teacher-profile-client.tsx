"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  LogOut,
  Save,
  ShieldAlert,
  UserCircle2,
} from "lucide-react";
import { Button, Card, CardHeader, CardTitle, Input, Select, useToast, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { GlassPanel } from "@/components/teacher/glass-panel";
import { StepProgress } from "@/components/teacher/step-progress";
import { DocumentsStep } from "@/components/teacher/documents-step";
import { useUnsavedChangesGuard } from "@/components/teacher/use-unsaved-guard";
import { apiFetch } from "@/lib/api/client";
import {
  BOARDS,
  EMPLOYMENT_TYPES,
  GENDERS,
  PREFERRED_CLASSES,
  QUALIFICATION_LEVELS,
  TEACHER_CATEGORIES,
  TEACHING_SUBJECTS,
} from "@/data/teacher-options";
import type { ProfileDto } from "@/types/teacher";

const STEPS = [
  { title: "Personal Information", short: "Personal" },
  { title: "Location", short: "Location" },
  { title: "Education", short: "Education" },
  { title: "Experience", short: "Experience" },
  { title: "Professional Preferences", short: "Preferences" },
  { title: "Documents", short: "Documents" },
];

type Errs = Record<string, string>;

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
}

export function TeacherProfileClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const { push } = useToast();
  const onboarding = sp.get("onboarding") === "1";
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<ProfileDto | null>(null);
  const [draft, setDraft] = React.useState<ProfileDto | null>(null);
  const [step, setStep] = React.useState(1);
  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Errs>({});
  const [tab, setTab] = React.useState<"overview" | "edit" | "documents" | "preview">("overview");

  useUnsavedChangesGuard(dirty);

  const load = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const res = await apiFetch<ProfileDto>("/api/teacher/profile");
    if (!res.ok) {
      if (res.error.code === "UNAUTHORIZED" || res.error.message.toLowerCase().includes("auth")) {
        router.push("/teacher/login?next=/teacher/profile");
        return;
      }
      setLoadError(res.error.message);
      setLoading(false);
      return;
    }
    setProfile(res.data);
    setDraft(clone(res.data));
    setStep(Math.min(6, Math.max(1, res.data.registration.currentStep || 1)));
    setLoading(false);
  }, [router]);

  const [activeLocations, setActiveLocations] = React.useState<
    Array<{ district: string; slug: string; isActive: boolean; majorTowns?: string[] }>
  >([]);

  React.useEffect(() => {
    load();
    fetch("/api/public/locations")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && Array.isArray(j.data?.items)) {
          setActiveLocations(j.data.items);
        }
      })
      .catch(() => {});
  }, [load]);

  function mutate(fn: (d: ProfileDto) => void) {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = clone(prev);
      fn(next);
      return next;
    });
    setDirty(true);
  }

  async function saveDraft(nextStep?: number) {
    if (!draft) return false;
    setSaving(true);
    setErrors({});
    const payload = {
      mode: "draft",
      data: {
        step: nextStep ?? step,
        personal: draft.personal,
        location: draft.location,
        education: draft.education,
        experience: { ...draft.experience, totalYears: draft.experience.totalYears === "" ? undefined : Number(draft.experience.totalYears), expectedSalaryInr: draft.experience.expectedSalaryInr === "" ? undefined : Number(draft.experience.expectedSalaryInr) },
        preferences: draft.preferences,
      },
    };
    const res = await apiFetch<ProfileDto>("/api/teacher/profile", { method: "PUT", body: JSON.stringify(payload) });
    setSaving(false);
    if (!res.ok) {
      push({ tone: "error", title: "Could not save draft", message: res.error.message });
      return false;
    }
    setProfile(res.data);
    setDraft(clone(res.data));
    setDirty(false);
    push({ tone: "success", title: "Draft saved" });
    return true;
  }

  function validateStep(s: number, d: ProfileDto): Errs {
    const e: Errs = {};
    if (s === 1) {
      if (d.personal.fullName.trim().length < 2) e.fullName = "Full name is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.personal.email)) e.email = "Enter a valid email.";
      if (d.personal.mobile.trim().length < 8) e.mobile = "Enter a valid mobile number.";
    }
    if (s === 2) {
      if (!d.location.state) e.state = "State is required.";
      if (d.location.city.trim().length < 1) e.city = "City is required.";
    }
    if (s === 3) {
      if (!d.education.highestQualification) e.highestQualification = "Highest qualification is required.";
    }
    if (s === 4) {
      if (d.experience.status === "experienced" && d.experience.totalYears === "") e.totalYears = "Total experience is required.";
    }
    if (s === 5) {
      if (d.preferences.subjects.length === 0) e.subjects = "Select at least one teaching subject.";
    }
    return e;
  }

  async function nextStep() {
    if (!draft) return;
    const e = validateStep(step, draft);
    setErrors(e);
    if (Object.keys(e).length) {
      push({ tone: "error", title: "Please fix the highlighted fields" });
      return;
    }
    const ns = Math.min(6, step + 1);
    const ok = await saveDraft(ns);
    if (ok) setStep(ns);
  }

  async function prevStep() {
    if (dirty) {
      const leave = window.confirm("You have unsaved changes. Save draft before going back?");
      if (leave) await saveDraft(step);
    }
    setStep((s) => Math.max(1, s - 1));
  }

  async function submitRegistration() {
    if (!draft) return;
    const e = { ...validateStep(1, draft), ...validateStep(2, draft), ...validateStep(3, draft), ...validateStep(4, draft), ...validateStep(5, draft) };
    setErrors(e);
    if (Object.keys(e).length) {
      push({ tone: "error", title: "Profile incomplete", message: "Please complete required fields in earlier steps." });
      const first = [1, 2, 3, 4, 5].find((s) => Object.keys(validateStep(s, draft)).length);
      if (first) setStep(first);
      return;
    }
    setSaving(true);
    const payload = {
      mode: "complete",
      data: {
        personal: draft.personal,
        location: draft.location,
        education: draft.education,
        experience: {
          ...draft.experience,
          status: draft.experience.status as "fresher" | "experienced" | "",
          totalYears: draft.experience.totalYears === "" ? undefined : Number(draft.experience.totalYears),
          expectedSalaryInr: draft.experience.expectedSalaryInr === "" ? undefined : Number(draft.experience.expectedSalaryInr),
        },
        preferences: draft.preferences,
      },
    };
    const res = await apiFetch<ProfileDto>("/api/teacher/profile", { method: "PUT", body: JSON.stringify(payload) });
    setSaving(false);
    if (!res.ok) return push({ tone: "error", title: "Could not submit profile", message: res.error.message });
    setProfile(res.data);
    setDraft(clone(res.data));
    setDirty(false);
    setTab("overview");
    push({ tone: "success", title: "Profile submitted", message: "Your registration profile has been saved." });
    router.replace("/teacher/profile");
  }

  async function saveEdits() {
    if (!draft) return;
    const e = { ...validateStep(1, draft), ...validateStep(2, draft), ...validateStep(3, draft), ...validateStep(4, draft), ...validateStep(5, draft) };
    setErrors(e);
    if (Object.keys(e).length) return push({ tone: "error", title: "Please fix required fields" });
    setSaving(true);
    const payload = {
      mode: "full",
      data: {
        personal: draft.personal,
        location: draft.location,
        education: draft.education,
        experience: {
          ...draft.experience,
          status: draft.experience.status as "fresher" | "experienced" | "",
          totalYears: draft.experience.totalYears === "" ? undefined : Number(draft.experience.totalYears),
          expectedSalaryInr: draft.experience.expectedSalaryInr === "" ? undefined : Number(draft.experience.expectedSalaryInr),
        },
        preferences: draft.preferences,
      },
    };
    const res = await apiFetch<ProfileDto>("/api/teacher/profile", { method: "PUT", body: JSON.stringify(payload) });
    setSaving(false);
    if (!res.ok) return push({ tone: "error", title: "Save failed", message: res.error.message });
    setProfile(res.data);
    setDraft(clone(res.data));
    setDirty(false);
    push({ tone: "success", title: "Profile updated" });
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="space-y-4" aria-label="Loading profile">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }
  if (loadError) return <ErrorState message={loadError} onRetry={load} />;
  if (!profile || !draft) return <EmptyState title="Profile unavailable" description="Unable to load your teacher profile." action={<Button variant="secondary" onClick={load}>Retry</Button>} />;

  const inWizard = onboarding || !profile.registration.completed;

  if (inWizard) {
    return (
      <div className="space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-border pb-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-gold">Educator Onboarding</p>
            <h1 className="mt-1 font-serif text-2xl font-bold text-primary sm:text-3xl">Complete your professional dossier</h1>
            <p className="mt-1 text-sm text-muted">Save your progress anytime. Your draft is preserved across devices.</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="secondary" onClick={() => saveDraft(step)} disabled={saving || !dirty}>
              <Save aria-hidden className="size-4" />
              <span>{saving ? "Saving…" : "Save draft"}</span>
            </Button>
            <Button variant="ghost" onClick={signOut}>
              <LogOut aria-hidden className="size-4" />
              <span>Sign out</span>
            </Button>
          </div>
        </header>

        <Card className="p-4 sm:p-5">
          <StepProgress steps={STEPS} current={step} />
        </Card>

        {step === 1 ? <Step1 value={draft} errors={errors} onChange={mutate} /> : null}
        {step === 2 ? <Step2 value={draft} errors={errors} onChange={mutate} locations={activeLocations} /> : null}
        {step === 3 ? <Step3 value={draft} errors={errors} onChange={mutate} /> : null}
        {step === 4 ? <Step4 value={draft} errors={errors} onChange={mutate} /> : null}
        {step === 5 ? <Step5 value={draft} errors={errors} onChange={mutate} /> : null}
        {step === 6 ? <DocumentsStep docs={draft.documents} onChange={(documents) => mutate((d) => { d.documents = documents; })} /> : null}

        <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-xl border border-border bg-white/95 p-4 shadow-lg backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted sm:text-sm">
            {dirty ? "Unsaved edits in progress" : profile.registration.draftSavedAt ? `Draft saved ${new Date(profile.registration.draftSavedAt).toLocaleString("en-IN")}` : "No draft saved yet"}
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Button variant="secondary" onClick={prevStep} disabled={step === 1 || saving}>
              <ChevronLeft aria-hidden className="size-4" /> Back
            </Button>
            {step < 6 ? (
              <Button onClick={nextStep} disabled={saving} className="bg-primary hover:bg-secondary text-white font-medium">
                {saving ? <><Loader2 className="animate-spin size-4" aria-hidden /> Saving…</> : <>Save &amp; continue <ChevronRight aria-hidden className="size-4" /></>}
              </Button>
            ) : (
              <Button onClick={submitRegistration} disabled={saving} className="bg-primary hover:bg-secondary text-white font-medium">
                {saving ? "Submitting…" : "Complete registration"}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-primary sm:text-3xl">Teacher Dossier &amp; Profile</h1>
          <p className="mt-1 text-sm text-muted">Review, update, and manage your verified credentials and uploaded documentation.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {dirty && tab === "edit" ? (
            <Button onClick={saveEdits} disabled={saving} className="bg-primary hover:bg-secondary text-white">
              <Save aria-hidden className="size-4" /> {saving ? "Saving…" : "Save changes"}
            </Button>
          ) : null}
          <Button variant="ghost" onClick={signOut}>
            <LogOut aria-hidden className="size-4" /> Sign out
          </Button>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5 sm:p-6">
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
          </CardHeader>
          <div className="flex items-center gap-4">
            <div
              className="relative size-16 shrink-0 rounded-full"
              style={{ background: `conic-gradient(#C6A66B ${profile.completion.percent * 3.6}deg, #E6E2D9 0deg)` }}
              aria-hidden
            >
              <div className="absolute inset-1.5 flex items-center justify-center rounded-full bg-white text-sm font-bold text-primary">
                {profile.completion.percent}%
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-muted leading-relaxed">
                {profile.completion.missing.length ? `Missing: ${profile.completion.missing.slice(0, 3).join(", ")}${profile.completion.missing.length > 3 ? "…" : ""}` : "Your professional profile is comprehensive and ready for school applications."}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <CardHeader>
            <CardTitle>Verification Standing</CardTitle>
          </CardHeader>
          <div className="flex items-start gap-3.5">
            {profile.verification.status === "verified" ? (
              <BadgeCheck className="mt-0.5 size-6 text-success shrink-0" aria-hidden />
            ) : profile.verification.status === "rejected" ? (
              <ShieldAlert className="mt-0.5 size-6 text-danger shrink-0" aria-hidden />
            ) : (
              <AlertCircle className="mt-0.5 size-6 text-amber-600 shrink-0" aria-hidden />
            )}
            <div>
              <p className="text-base font-semibold capitalize text-primary">{profile.verification.status}</p>
              <p className="mt-0.5 text-xs text-muted sm:text-sm">
                {profile.verification.note || "Platform administrators review your submitted qualifications to confer verified status."}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-white p-2 shadow-sm" role="tablist" aria-label="Profile sections">
        {([["overview", "Overview"], ["edit", "Edit Profile"], ["documents", "Documents"], ["preview", "Public Preview"]] as const).map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cnTab(tab === k)}>{label}</button>
        ))}
      </div>

      {tab === "overview" ? <ProfileOverview profile={profile} onEdit={() => setTab("edit")} /> : null}
      {tab === "edit" ? (
        <div className="space-y-5">
          <Step1 value={draft} errors={errors} onChange={mutate} />
          <Step2 value={draft} errors={errors} onChange={mutate} />
          <Step3 value={draft} errors={errors} onChange={mutate} />
          <Step4 value={draft} errors={errors} onChange={mutate} />
          <Step5 value={draft} errors={errors} onChange={mutate} />
          <div className="flex justify-end pt-2">
            <Button onClick={saveEdits} disabled={saving || !dirty} size="lg" className="bg-primary hover:bg-secondary text-white font-medium">
              {saving ? "Saving…" : "Save Profile Changes"}
            </Button>
          </div>
        </div>
      ) : null}
      {tab === "documents" ? <DocumentsStep docs={draft.documents} onChange={(documents) => { mutate((d) => { d.documents = documents; }); setProfile((p) => p ? { ...p, documents } : p); }} /> : null}
      {tab === "preview" ? <ProfilePreview profile={draft} /> : null}
    </div>
  );
}

function cnTab(active: boolean) {
  return `touch-target rounded-lg px-4 py-2 text-sm font-medium transition ${active ? "bg-primary text-white shadow-sm font-semibold" : "text-primary/80 hover:bg-soft-blue hover:text-primary"}`;
}

function ChipSelect({ label, options, value, onChange, error }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void; error?: string }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-primary">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(toggle(value, o))}
              className={`touch-target rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${on ? "border-accent bg-[#FAF5EB] text-[#8F7032] font-semibold" : "border-border bg-white text-text hover:bg-[#FAF9F5]"}`}
            >
              {o}
            </button>
          );
        })}
      </div>
      {error ? <p className="mt-1.5 text-xs text-danger font-medium">{error}</p> : null}
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-[44px] items-center gap-3 rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-text hover:bg-[#FAF9F5] cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 rounded border-border text-primary focus:ring-accent" />
      <span className="font-medium">{label}</span>
    </label>
  );
}

function Step1({ value: d, errors, onChange }: { value: ProfileDto; errors: Errs; onChange: (fn: (d: ProfileDto) => void) => void }) {
  return (
    <GlassPanel title="Personal Information" description="Basic identity and contact details. Email and mobile are required for institutional communications.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Full Name *" value={d.personal.fullName} onChange={(e) => onChange((x) => { x.personal.fullName = e.target.value; })} error={errors.fullName} autoComplete="name" />
        <Input label="Email Address *" type="email" value={d.personal.email} onChange={(e) => onChange((x) => { x.personal.email = e.target.value; })} error={errors.email} autoComplete="email" />
        <Input label="Mobile Number *" type="tel" value={d.personal.mobile} onChange={(e) => onChange((x) => { x.personal.mobile = e.target.value; })} error={errors.mobile} autoComplete="tel" />
        <Input label="WhatsApp Number" type="tel" value={d.personal.whatsapp} onChange={(e) => onChange((x) => { x.personal.whatsapp = e.target.value; })} hint="Optional; used for real-time interview updates." />
        <Input label="Date of Birth" type="date" value={d.personal.dob} onChange={(e) => onChange((x) => { x.personal.dob = e.target.value; })} />
        <Select label="Gender" value={d.personal.gender} onChange={(e) => onChange((x) => { x.personal.gender = e.target.value; })} placeholder="Select" options={[{ value: "", label: "Prefer not to specify" }, ...GENDERS.map((g) => ({ value: g, label: g }))]} />
      </div>
      <p className="mt-4 text-xs text-muted">A passport-size photograph can be uploaded in Step 6 (Documents).</p>
    </GlassPanel>
  );
}

function Step2({
  value: d,
  errors,
  onChange,
  locations = [],
}: {
  value: ProfileDto;
  errors: Errs;
  onChange: (fn: (d: ProfileDto) => void) => void;
  locations?: Array<{ district: string; slug: string; isActive: boolean; majorTowns?: string[] }>;
}) {
  // Pre-select Uttar Pradesh as state
  React.useEffect(() => {
    if (!d.location.state) {
      onChange((x) => {
        x.location.state = "Uttar Pradesh";
      });
    }
  }, [d.location.state, onChange]);

  const activeDistrictList = locations.length
    ? locations.filter((l) => l.isActive).map((l) => l.district)
    : ["Pratapgarh", "Amethi", "Jaunpur", "Prayagraj", "Raebareli", "Sultanpur"];

  const districtDropdownOptions = activeDistrictList.map((dist) => ({
    value: dist,
    label: dist,
  }));

  const selectedLoc = locations.find(
    (l) => l.district.toLowerCase() === (d.location.district || "").toLowerCase(),
  );
  const townSuggestions = selectedLoc?.majorTowns || [];

  const isOutsideArea =
    d.location.district &&
    !activeDistrictList.some((ad) => ad.toLowerCase() === d.location.district.toLowerCase());

  return (
    <GlassPanel
      title="Regional Service Location (Uttar Pradesh)"
      description="Specify your residential district and active teaching preferences across our Uttar Pradesh regional network."
    >
      {isOutsideArea && (
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-[#14264D]">
          <p className="font-semibold text-[#1266C5]">Preserved Record Outside Active Area</p>
          <p className="mt-1 leading-relaxed text-muted">
            Your district ({d.location.district}) is securely registered. Career Avsar is initially operating in Pratapgarh,
            Amethi, Jaunpur, Prayagraj, Raebareli, and Sultanpur. Your profile is preserved and will be prioritized as our
            school partnerships expand.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-primary">State *</label>
          <input
            type="text"
            readOnly
            value="Uttar Pradesh"
            className="w-full rounded-lg border border-border bg-[#F5F2EB] px-3.5 py-2.5 text-base font-medium text-text cursor-not-allowed shadow-[0_1px_2px_rgba(20,35,59,0.03)]"
          />
          <p className="mt-1 text-xs text-muted">Initial launch region: Uttar Pradesh, India.</p>
        </div>

        <Select
          label="Residential District *"
          value={d.location.district}
          onChange={(e) =>
            onChange((x) => {
              x.location.district = e.target.value;
              x.location.state = "Uttar Pradesh";
            })
          }
          options={[{ value: "", label: "Select active service district" }, ...districtDropdownOptions]}
          error={errors.district}
          hint="Only active launch districts in UP are currently selectable"
        />

        <div className="sm:col-span-2">
          <Input
            label="City / Town / Tehsil *"
            value={d.location.city}
            onChange={(e) =>
              onChange((x) => {
                x.location.city = e.target.value;
              })
            }
            error={errors.city}
            placeholder="e.g. Civil Lines, Kunda, Gomti Nagar"
          />
          {townSuggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted">
              <span className="font-medium text-primary">Common areas in {d.location.district}:</span>
              {townSuggestions.map((town) => (
                <button
                  key={town}
                  type="button"
                  onClick={() =>
                    onChange((x) => {
                      x.location.city = town;
                    })
                  }
                  className="rounded-md border border-border bg-[#FAF9F6] px-2 py-0.5 hover:border-accent hover:text-primary transition"
                >
                  {town}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="sm:col-span-2">
          <ChipSelect
            label="Preferred Job Districts (Select all that apply)"
            options={activeDistrictList}
            value={d.location.preferredJobDistricts || []}
            onChange={(v) =>
              onChange((x) => {
                x.location.preferredJobDistricts = v;
              })
            }
          />
        </div>

        <div className="sm:col-span-2">
          <Input
            label="Preferred Job Locations / Localities (Optional)"
            value={d.location.preferredJobLocations.join(", ")}
            onChange={(e) =>
              onChange((x) => {
                x.location.preferredJobLocations = e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
              })
            }
            hint="Specific towns, tehsils, or localities you prefer within the selected districts"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-primary">Current Residential Address</label>
          <textarea
            value={d.location.currentAddress}
            onChange={(e) =>
              onChange((x) => {
                x.location.currentAddress = e.target.value;
              })
            }
            rows={3}
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-base text-text shadow-[0_1px_2px_rgba(20,35,59,0.03)] focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>
    </GlassPanel>
  );
}

function Step3({ value: d, errors, onChange }: { value: ProfileDto; errors: Errs; onChange: (fn: (d: ProfileDto) => void) => void }) {
  return (
    <GlassPanel title="Academic &amp; Professional Qualifications" description="Teaching degree qualifications, eligibility scores, and subject degrees.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Highest Academic Qualification *" value={d.education.highestQualification} onChange={(e) => onChange((x) => { x.education.highestQualification = e.target.value; })} error={errors.highestQualification} placeholder="Select" options={QUALIFICATION_LEVELS.map((v) => ({ value: v, label: v }))} />
        <Input label="Graduation Degree" value={d.education.graduation} onChange={(e) => onChange((x) => { x.education.graduation = e.target.value; })} placeholder="e.g. B.Sc. Mathematics (Honours)" />
        <Input label="Post-Graduation Degree" value={d.education.postGraduation} onChange={(e) => onChange((x) => { x.education.postGraduation = e.target.value; })} placeholder="e.g. M.Sc. Physics" />
        <Input label="Other TET / State Eligibility Exams" value={d.education.otherTet} onChange={(e) => onChange((x) => { x.education.otherTet = e.target.value; })} placeholder="e.g. HTET, REET, KTET" />
      </div>
      <div className="mt-5 border-t border-border/60 pt-4">
        <p className="mb-3 text-sm font-semibold text-primary">Teacher Training Certifications</p>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          <Check label="B.Ed (Bachelor of Education)" checked={d.education.bed} onChange={(v) => onChange((x) => { x.education.bed = v; })} />
          <Check label="D.El.Ed (Diploma in Elementary Ed)" checked={d.education.deled} onChange={(v) => onChange((x) => { x.education.deled = v; })} />
          <Check label="BTC (Basic Training Certificate)" checked={d.education.btc} onChange={(v) => onChange((x) => { x.education.btc = v; })} />
          <Check label="CTET (Central Teacher Eligibility)" checked={d.education.ctet} onChange={(v) => onChange((x) => { x.education.ctet = v; })} />
          <Check label="CTET Paper I (Primary)" checked={d.education.ctetPaperI} onChange={(v) => onChange((x) => { x.education.ctetPaperI = v; })} />
          <Check label="CTET Paper II (Upper Primary)" checked={d.education.ctetPaperII} onChange={(v) => onChange((x) => { x.education.ctetPaperII = v; })} />
          <Check label="UPTET / State TET Qualified" checked={d.education.uptet} onChange={(v) => onChange((x) => { x.education.uptet = v; })} />
        </div>
      </div>
    </GlassPanel>
  );
}

function Step4({ value: d, errors, onChange }: { value: ProfileDto; errors: Errs; onChange: (fn: (d: ProfileDto) => void) => void }) {
  return (
    <GlassPanel title="Experience &amp; Career Background" description="Details of previous institutional tenures and remuneration expectations.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Experience Standing" value={d.experience.status} onChange={(e) => onChange((x) => { x.experience.status = e.target.value; })} placeholder="Select" options={[{ value: "", label: "Select" }, { value: "fresher", label: "Fresher (Entry Level)" }, { value: "experienced", label: "Experienced Educator" }]} />
        <Input label={`Total Experience (Years)${d.experience.status === "experienced" ? " *" : ""}`} type="number" min={0} max={60} value={d.experience.totalYears} onChange={(e) => onChange((x) => { x.experience.totalYears = e.target.value === "" ? "" : Number(e.target.value); })} error={errors.totalYears} />
        <Input label="Last / Current Institution" value={d.experience.previousSchool} onChange={(e) => onChange((x) => { x.experience.previousSchool = e.target.value; })} placeholder="e.g. Delhi Public School" />
        <Input label="Previous Designation" value={d.experience.previousDesignation} onChange={(e) => onChange((x) => { x.experience.previousDesignation = e.target.value; })} placeholder="e.g. Senior TGT Mathematics" />
        <Input label="Current Employment Status" value={d.experience.currentEmploymentStatus} onChange={(e) => onChange((x) => { x.experience.currentEmploymentStatus = e.target.value; })} placeholder="Available immediately, Serving notice, etc." />
        <Input label="Expected Remuneration (INR)" type="number" min={0} value={d.experience.expectedSalaryInr} onChange={(e) => onChange((x) => { x.experience.expectedSalaryInr = e.target.value === "" ? "" : Number(e.target.value); })} hint="Annual or monthly expected scale in INR" />
      </div>
    </GlassPanel>
  );
}

function Step5({ value: d, errors, onChange }: { value: ProfileDto; errors: Errs; onChange: (fn: (d: ProfileDto) => void) => void }) {
  return (
    <GlassPanel title="Professional Teaching Preferences" description="Match your expertise with the exact curriculum, subjects, and grade levels you teach.">
      <div className="space-y-6">
        <ChipSelect label="Teaching Category / Wing" options={[...TEACHER_CATEGORIES]} value={d.preferences.categories} onChange={(v) => onChange((x) => { x.preferences.categories = v; })} />
        <ChipSelect label="Primary Teaching Subjects *" options={[...TEACHING_SUBJECTS]} value={d.preferences.subjects} onChange={(v) => onChange((x) => { x.preferences.subjects = v; })} error={errors.subjects} />
        <ChipSelect label="Preferred Classes / Grades" options={[...PREFERRED_CLASSES]} value={d.preferences.preferredClasses} onChange={(v) => onChange((x) => { x.preferences.preferredClasses = v; })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Preferred Board Curriculum" value={d.preferences.preferredBoard} onChange={(e) => onChange((x) => { x.preferences.preferredBoard = e.target.value; })} placeholder="Select" options={[{ value: "", label: "Any / Open to all" }, ...BOARDS.map((v) => ({ value: v, label: v }))]} />
          <Select label="Employment Type Preference" value={d.preferences.employmentType} onChange={(e) => onChange((x) => { x.preferences.employmentType = e.target.value; })} placeholder="Select" options={[{ value: "", label: "Any / Open to all" }, ...EMPLOYMENT_TYPES.map((v) => ({ value: v, label: v }))]} />
          <div className="sm:col-span-2">
            <Input label="Preferred Target Cities / Regions" value={d.preferences.preferredLocations.join(", ")} onChange={(e) => onChange((x) => { x.preferences.preferredLocations = e.target.value.split(",").map((s) => s.trim()).filter(Boolean); })} hint="Comma-separated target cities or districts" />
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}

function ProfileOverview({ profile: p, onEdit }: { profile: ProfileDto; onEdit: () => void }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <GlassPanel title="Personal &amp; Location Overview" description="Core identity and verified geographical presence.">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <KV k="Legal Name" v={p.personal.fullName} />
          <KV k="Email" v={p.personal.email} />
          <KV k="Mobile" v={p.personal.mobile} />
          <KV k="State" v={p.location.state} />
          <KV k="District" v={p.location.district} />
          <KV k="City" v={p.location.city} />
          <KV
            k="Preferred Districts"
            v={p.location.preferredJobDistricts?.length ? p.location.preferredJobDistricts.join(", ") : "All active districts"}
          />
          <KV
            k="Service Area Standing"
            v={
              p.location.serviceAreaStatus === "outside_service_area"
                ? "Outside Launch Area (Preserved)"
                : "Active Regional Zone"
            }
          />
        </dl>
        <div className="mt-5 border-t border-border/60 pt-4">
          <Button variant="secondary" onClick={onEdit}>Edit Profile Details</Button>
        </div>
      </GlassPanel>

      <GlassPanel title="Professional Standing" description="Educational degrees, teaching history, and preferences.">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <KV k="Highest Qualification" v={p.education.highestQualification} />
          <KV k="Experience" v={p.experience.status === "experienced" ? `${p.experience.totalYears || 0} years` : p.experience.status || "—"} />
          <KV k="Subjects" v={p.preferences.subjects.join(", ") || "—"} />
          <KV k="Wings" v={p.preferences.categories.join(", ") || "—"} />
          <KV k="Documents" v={`${p.documents.length} verified file(s)`} />
        </dl>
      </GlassPanel>
    </div>
  );
}

function ProfilePreview({ profile: p }: { profile: ProfileDto }) {
  return (
    <GlassPanel title="Public Institutional Preview" description="How hiring principals and recruitment teams view your authenticated profile.">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-soft-blue text-secondary border border-[#D5DFEB]">
            <UserCircle2 className="size-8" aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="font-serif text-xl font-bold text-primary">{p.personal.fullName || "Educator Name"}</h3>
            <p className="text-sm font-medium text-secondary">{[p.location.city, p.location.state].filter(Boolean).join(", ") || "Location unconfigured"}</p>
            <p className="mt-1 text-xs text-muted sm:text-sm">{p.preferences.subjects.join(" &bull; ") || "Subjects unconfigured"}</p>
          </div>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2">
          <KV k="Highest Qualification" v={p.education.highestQualification} />
          <KV k="Experience Standing" v={p.experience.status || "—"} />
          <KV k="Preferred Categories" v={p.preferences.categories.join(", ")} />
          <KV k="Preferred Board" v={p.preferences.preferredBoard} />
          <KV k="Employment Type" v={p.preferences.employmentType} />
          <KV k="Verification Standing" v={p.verification.status} />
        </dl>
        <div className="border-t border-border/60 pt-4">
          <p className="font-serif text-sm font-bold text-primary">Uploaded Documents</p>
          {p.documents.length ? (
            <ul className="mt-2.5 space-y-1.5 text-sm text-text">
              {p.documents.map((doc) => (
                <li key={doc.id} className="flex items-center gap-2 rounded-lg border border-border/70 bg-[#FAF9F5] px-3 py-2">
                  <FileText className="size-4 text-secondary" aria-hidden />
                  <span className="truncate flex-1 font-medium text-xs sm:text-sm">{doc.originalName}</span>
                  <CheckCircle2 className="size-4 text-success shrink-0" aria-hidden />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-muted">No documents uploaded yet.</p>
          )}
        </div>
      </div>
    </GlassPanel>
  );
}

function KV({ k, v }: { k: string; v?: string | number | null }) {
  return (
    <div className="min-w-0 rounded-lg border border-border/70 bg-[#FAF9F5] px-3 py-2.5">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{k}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-primary">{v === "" || v == null ? "—" : String(v)}</dd>
    </div>
  );
}
