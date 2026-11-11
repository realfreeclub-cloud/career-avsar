"use client";

import * as React from "react";
import {
  AdminPage,
  Card,
  Button,
  Skeleton,
  ErrorState,
} from "@/components/admin/ui";
import {
  Users,
  Briefcase,
  Bell,
  Database,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X,
  Loader2,
  FileArchive,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ServiceAreaManager } from "@/components/admin/service-area-manager";
import type { SettingDefinition } from "@/server/services/admin/settings";
import type { BackupMetadata } from "@/server/services/admin/backup";

type SettingWithState = SettingDefinition & {
  value: boolean;
  updatedAt?: string;
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = React.useState<"locations" | "toggles" | "backups">("locations");
  const [settings, setSettings] = React.useState<SettingWithState[]>([]);
  const [backups, setBackups] = React.useState<BackupMetadata[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Updating single setting state
  const [updatingKey, setUpdatingKey] = React.useState<string | null>(null);

  // Sensitive Confirmation Modal
  const [pendingConfirm, setPendingConfirm] = React.useState<{
    setting: SettingWithState;
    targetValue: boolean;
  } | null>(null);

  // Backup creation state
  const [backingUp, setBackingUp] = React.useState(false);
  const [backupSuccessMsg, setBackupSuccessMsg] = React.useState<string | null>(null);

  const fetchSettings = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [resSettings, resBackups] = await Promise.all([
        fetch("/api/admin/settings", { credentials: "same-origin" }),
        fetch("/api/admin/backup", { credentials: "same-origin" }),
      ]);

      if (!resSettings.ok) throw new Error("Failed to load platform settings");
      const jsonSettings = await resSettings.json();
      setSettings(jsonSettings.data?.settings || []);

      if (resBackups.ok) {
        const jsonBackups = await resBackups.json();
        setBackups(jsonBackups.data?.backups || []);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to load settings configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function applySettingToggle(key: string, value: boolean) {
    try {
      setUpdatingKey(key);
      // Optimistic UI update
      setSettings((prev) =>
        prev.map((s) => (s.key === key ? { ...s, value, updatedAt: new Date().toISOString() } : s)),
      );

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });

      if (!res.ok) {
        // Revert on failure
        fetchSettings();
      }
    } catch {
      fetchSettings();
    } finally {
      setUpdatingKey(null);
      setPendingConfirm(null);
    }
  }

  function handleToggleClick(setting: SettingWithState) {
    const nextValue = !setting.value;
    // If sensitive setting is being disabled, ask for confirmation
    if (setting.sensitive && !nextValue) {
      setPendingConfirm({ setting, targetValue: nextValue });
    } else {
      applySettingToggle(setting.key, nextValue);
    }
  }

  async function handleCreateBackup() {
    try {
      setBackingUp(true);
      setBackupSuccessMsg(null);
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        credentials: "same-origin",
      });
      if (res.ok) {
        const json = await res.json();
        const b = json.data?.backup;
        setBackupSuccessMsg(`Snapshot backup created (${b?.totalRecords ?? 0} records, ${(b?.sizeBytes / 1024).toFixed(1)} KB)`);
        fetchSettings();
      }
    } catch {
      // ignore
    } finally {
      setBackingUp(false);
    }
  }

  const accessSettings = settings.filter((s) => s.category === "access");
  const recruitmentSettings = settings.filter((s) => s.category === "recruitment");
  const channelSettings = settings.filter((s) => s.category === "channels");

  return (
    <AdminPage
      title="Platform Settings & Governance"
      subtitle="Feature flag toggles, portal access policies, recruitment kill-switches, and database backup controls. All changes enforced by backend logic."
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateBackup}
            disabled={backingUp}
            className="gap-1.5 border-border bg-white text-secondary hover:bg-soft-blue"
          >
            {backingUp ? <Loader2 className="size-4 animate-spin" /> : <Database className="size-4 text-accent-gold" />}
            <span>Create Database Snapshot</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={fetchSettings}
            title="Refresh settings"
            className="text-muted hover:bg-soft-blue hover:text-primary"
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin text-secondary")} />
          </Button>
        </div>
      }
    >
      {backupSuccessMsg ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800 flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            {backupSuccessMsg}
          </span>
          <button type="button" onClick={() => setBackupSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="size-4" />
          </button>
        </div>
      ) : null}

      {loading && settings.length === 0 ? (
        <div className="space-y-4">
          <Skeleton className="h-44 rounded-2xl bg-white border border-border" />
          <Skeleton className="h-44 rounded-2xl bg-white border border-border" />
          <Skeleton className="h-44 rounded-2xl bg-white border border-border" />
        </div>
      ) : null}

      {error ? (
        <ErrorState title="Unable to load settings" message={error} onRetry={fetchSettings} />
      ) : null}

      {/* Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/80 pb-3 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("locations")}
          className={cn(
            "rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2",
            activeTab === "locations"
              ? "bg-primary text-white shadow-sm"
              : "bg-white text-muted hover:text-primary border border-border/80",
          )}
        >
          <MapPin className="size-3.5 text-accent-gold" />
          <span>Service Area & Districts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("toggles")}
          className={cn(
            "rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2",
            activeTab === "toggles"
              ? "bg-primary text-white shadow-sm"
              : "bg-white text-muted hover:text-primary border border-border/80",
          )}
        >
          <ShieldCheck className="size-3.5 text-secondary" />
          <span>Feature Toggles & Gates</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("backups")}
          className={cn(
            "rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2",
            activeTab === "backups"
              ? "bg-primary text-white shadow-sm"
              : "bg-white text-muted hover:text-primary border border-border/80",
          )}
        >
          <Database className="size-3.5 text-emerald-600" />
          <span>Database Snapshots ({backups.length})</span>
        </button>
      </div>

      {activeTab === "locations" ? <ServiceAreaManager /> : null}

      {activeTab === "toggles" && !loading && settings.length > 0 ? (
        <div className="space-y-6">
          {/* Group 1: Portal Access & Authentication */}
          <Card className="overflow-hidden border-border/80 bg-white shadow-2xs">
            <div className="border-b border-border/70 bg-[#FAF9F5] px-5 py-3.5 flex items-center gap-2">
              <Users className="size-4.5 text-primary" />
              <div>
                <h3 className="font-serif text-sm font-bold text-primary">Portal Access & User Registration</h3>
                <p className="text-[11px] text-muted">Controls user signup and authentication gates across candidate and school portals.</p>
              </div>
            </div>

            <div className="divide-y divide-border/50 p-2 sm:p-4">
              {accessSettings.map((s) => (
                <div key={s.key} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between hover:bg-soft-blue/20 rounded-xl transition">
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-primary">{s.label}</span>
                      {s.sensitive ? (
                        <span className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.2 text-[9px] font-bold uppercase text-amber-700">
                          Sensitive
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-muted leading-relaxed">{s.description}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted/80">key: {s.key}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pt-1 sm:pt-0">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        s.value
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200",
                      )}
                    >
                      {s.value ? "ACTIVE" : "DISABLED"}
                    </span>

                    <button
                      type="button"
                      disabled={updatingKey === s.key}
                      onClick={() => handleToggleClick(s)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20",
                        s.value ? "bg-primary" : "bg-gray-200",
                        updatingKey === s.key && "opacity-60",
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          s.value ? "translate-x-5" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Group 2: Recruitment & Workflow Controls */}
          <Card className="overflow-hidden border-border/80 bg-white shadow-2xs">
            <div className="border-b border-border/70 bg-[#FAF9F5] px-5 py-3.5 flex items-center gap-2">
              <Briefcase className="size-4.5 text-secondary" />
              <div>
                <h3 className="font-serif text-sm font-bold text-primary">Recruitment Operations & Applications</h3>
                <p className="text-[11px] text-muted">Core operational toggles for public vacancy visibility, application acceptance, and resume access.</p>
              </div>
            </div>

            <div className="divide-y divide-border/50 p-2 sm:p-4">
              {recruitmentSettings.map((s) => (
                <div key={s.key} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between hover:bg-soft-blue/20 rounded-xl transition">
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-primary">{s.label}</span>
                      {s.sensitive ? (
                        <span className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.2 text-[9px] font-bold uppercase text-amber-700">
                          Sensitive
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-muted leading-relaxed">{s.description}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted/80">key: {s.key}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pt-1 sm:pt-0">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        s.value
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200",
                      )}
                    >
                      {s.value ? "ACTIVE" : "DISABLED"}
                    </span>

                    <button
                      type="button"
                      disabled={updatingKey === s.key}
                      onClick={() => handleToggleClick(s)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20",
                        s.value ? "bg-primary" : "bg-gray-200",
                        updatingKey === s.key && "opacity-60",
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          s.value ? "translate-x-5" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Group 3: Multi-Channel Communication Gateways */}
          <Card className="overflow-hidden border-border/80 bg-white shadow-2xs">
            <div className="border-b border-border/70 bg-[#FAF9F5] px-5 py-3.5 flex items-center gap-2">
              <Bell className="size-4.5 text-accent-gold" />
              <div>
                <h3 className="font-serif text-sm font-bold text-primary">Multi-Channel Communication Gateways</h3>
                <p className="text-[11px] text-muted">Master platform-level kill-switches for external delivery channels.</p>
              </div>
            </div>

            <div className="divide-y divide-border/50 p-2 sm:p-4">
              {channelSettings.map((s) => (
                <div key={s.key} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between hover:bg-soft-blue/20 rounded-xl transition">
                  <div className="min-w-0 pr-4">
                    <span className="text-xs sm:text-sm font-bold text-primary">{s.label}</span>
                    <p className="mt-0.5 text-xs text-muted leading-relaxed">{s.description}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted/80">key: {s.key}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pt-1 sm:pt-0">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        s.value
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200",
                      )}
                    >
                      {s.value ? "ACTIVE" : "DISABLED"}
                    </span>

                    <button
                      type="button"
                      disabled={updatingKey === s.key}
                      onClick={() => handleToggleClick(s)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20",
                        s.value ? "bg-primary" : "bg-gray-200",
                        updatingKey === s.key && "opacity-60",
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          s.value ? "translate-x-5" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}

      {activeTab === "backups" ? (
        <div className="space-y-6">
          {/* Group 4: Database Backup History */}
          <Card className="overflow-hidden border-border/80 bg-white shadow-2xs">
            <div className="border-b border-border/70 bg-[#FAF9F5] px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="size-4.5 text-primary" />
                <div>
                  <h3 className="font-serif text-sm font-bold text-primary">Database Snapshot History</h3>
                  <p className="text-[11px] text-muted">Point-in-time collection dumps stored on server disk.</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateBackup}
                disabled={backingUp}
                className="text-xs border-border bg-white text-secondary hover:bg-soft-blue"
              >
                {backingUp ? <Loader2 className="size-3 animate-spin mr-1" /> : <Database className="size-3 mr-1" />}
                Snapshot Now
              </Button>
            </div>

            <div className="p-4">
              {backups.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted">No snapshot backups found. Click &quot;Snapshot Now&quot; to create one.</div>
              ) : (
                <div className="divide-y divide-border/50">
                  {backups.map((b) => (
                    <div key={b.id} className="flex items-center justify-between py-2.5 text-xs">
                      <div className="flex items-center gap-2.5">
                        <FileArchive className="size-4 text-accent-gold" />
                        <div>
                          <p className="font-mono text-xs font-semibold text-primary">{b.filename}</p>
                          <p className="text-[11px] text-muted">
                            {new Date(b.createdAt).toLocaleString("en-IN")} • {b.totalRecords} total records • {(b.sizeBytes / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        VERIFIED
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : null}

      {/* Sensitive Change Confirmation Modal */}
      {pendingConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/30 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-primary">Confirm Sensitive Setting Change</h3>
                <p className="text-xs text-muted">This action will immediately alter platform accessibility.</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 leading-relaxed">
              You are about to <strong>DISABLE</strong> <u>{pendingConfirm.setting.label}</u> ({pendingConfirm.setting.key}).
              Backend API endpoints will reject incoming requests for this feature until re-enabled.
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPendingConfirm(null)}
                className="border-border bg-white text-text hover:bg-soft-blue"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => applySettingToggle(pendingConfirm.setting.key, pendingConfirm.targetValue)}
                className="gap-1.5"
              >
                <span>Confirm & Disable</span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPage>
  );
}
