"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  CheckCheck,
  CalendarDays,
  FileText,
  Megaphone,
  Info,
  SlidersHorizontal,
  Mail,
  MessageSquare,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Card, EmptyState, ErrorState, Skeleton } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { DashboardNotification } from "@/types/dashboard";

type FilterTab = "all" | "unread" | "application" | "interview" | "announcement";

type CommPrefs = {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  inApp: boolean;
  jobAlerts: boolean;
  interviewReminders: boolean;
  announcements: boolean;
};

export default function NotificationsPage() {
  const [items, setItems] = React.useState<DashboardNotification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<FilterTab>("all");
  const [markingAll, setMarkingAll] = React.useState(false);

  // Communication Preferences State
  const [prefsOpen, setPrefsOpen] = React.useState(false);
  const [prefs, setPrefs] = React.useState<CommPrefs>({
    email: true,
    sms: true,
    whatsapp: true,
    inApp: true,
    jobAlerts: true,
    interviewReminders: true,
    announcements: true,
  });
  const [prefsLoading, setPrefsLoading] = React.useState(false);
  const [prefsSaving, setPrefsSaving] = React.useState(false);
  const [prefsSuccess, setPrefsSuccess] = React.useState(false);

  const loadNotifications = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/teacher/notifications", { credentials: "same-origin" });
      if (!res.ok) throw new Error("Failed to load notifications");
      const json = await res.json();
      setItems(json.data?.items || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPreferences = React.useCallback(async () => {
    try {
      setPrefsLoading(true);
      const res = await fetch("/api/teacher/preferences", { credentials: "same-origin" });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.preferences) {
          setPrefs(json.data.preferences);
        }
      }
    } catch {
      // silently handle
    } finally {
      setPrefsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, [loadNotifications, loadPreferences]);

  async function toggleRead(id: string, currentRead: boolean) {
    const targetRead = !currentRead;
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: targetRead } : n)));
    try {
      await fetch(`/api/teacher/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: targetRead }),
      });
    } catch {
      // Revert if error
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: currentRead } : n)));
    }
  }

  async function markAllAsRead() {
    setMarkingAll(true);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch("/api/teacher/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
    } catch {
      // ignore
    } finally {
      setMarkingAll(false);
    }
  }

  async function savePreferences() {
    setPrefsSaving(true);
    setPrefsSuccess(false);
    try {
      const res = await fetch("/api/teacher/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      if (res.ok) {
        setPrefsSuccess(true);
        setTimeout(() => setPrefsSuccess(false), 3000);
      }
    } catch {
      // handle error
    } finally {
      setPrefsSaving(false);
    }
  }

  const filteredItems = items.filter((item) => {
    if (activeTab === "unread") return !item.read;
    if (activeTab === "application") return item.type === "application";
    if (activeTab === "interview") return item.type === "interview";
    if (activeTab === "announcement") return item.type === "announcement";
    return true;
  });

  const unreadCount = items.filter((n) => !n.read).length;
  const appCount = items.filter((n) => n.type === "application").length;
  const interviewCount = items.filter((n) => n.type === "interview").length;
  const announcementCount = items.filter((n) => n.type === "announcement").length;

  const getTypeIcon = (type: DashboardNotification["type"]) => {
    switch (type) {
      case "interview":
        return <CalendarDays className="size-4.5 text-secondary" />;
      case "application":
        return <FileText className="size-4.5 text-primary" />;
      case "announcement":
        return <Megaphone className="size-4.5 text-accent-gold" />;
      default:
        return <Info className="size-4.5 text-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-primary">
              Notification Center
            </h1>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-bold text-primary border border-accent/30">
                {unreadCount} unread
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted">
            Institutional recruitment alerts, interview calls, application milestones, and announcements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={markingAll}
              className="gap-1.5 border-border bg-white text-secondary hover:bg-soft-blue"
            >
              <CheckCheck className="size-4" />
              <span>Mark all read</span>
            </Button>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPrefsOpen((v) => !v)}
            className="gap-1.5 border-border bg-white text-primary hover:bg-soft-blue"
          >
            <SlidersHorizontal className="size-4 text-accent-gold" />
            <span>Preferences</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={loadNotifications}
            title="Refresh notifications"
            className="text-muted hover:bg-soft-blue hover:text-primary"
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin text-secondary")} />
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border/80 pb-3">
        {[
          { id: "all", label: "All Updates", count: items.length },
          { id: "unread", label: "Unread", count: unreadCount },
          { id: "application", label: "Applications", count: appCount },
          { id: "interview", label: "Interviews", count: interviewCount },
          { id: "announcement", label: "Announcements", count: announcementCount },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as FilterTab)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-150",
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white text-muted hover:bg-soft-blue hover:text-primary border border-border/80",
              )}
            >
              <span>{tab.label}</span>
              {tab.count > 0 ? (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                    isActive ? "bg-white/20 text-white" : "bg-soft-blue text-primary",
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Preferences Slide-over / Glass Panel */}
      {prefsOpen ? (
        <Card className="overflow-hidden border-accent-gold/40 bg-gradient-to-br from-white via-white to-[#F8F7F3] shadow-md animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between border-b border-border/80 bg-[#FAF9F5]/80 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-accent-gold" />
              <h3 className="font-serif text-base font-bold text-primary">
                Communication & Opt-out Preferences
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setPrefsOpen(false)}
              className="rounded-lg p-1 text-muted hover:bg-soft-blue hover:text-primary"
            >
              <X className="size-4.5" />
            </button>
          </div>

          <div className="p-5 sm:p-6">
            <p className="text-xs text-muted mb-4">
              Select which channels and alert categories you want to receive communications through. In compliance with TRAI DLT and communication privacy laws, we will never dispatch communications via disabled channels.
            </p>

            {prefsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="size-5 animate-spin text-secondary" />
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Channels */}
                <div className="space-y-3 rounded-xl border border-border/70 bg-white p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                    Delivery Channels
                  </h4>
                  <div className="space-y-2.5">
                    <label className="flex items-center justify-between cursor-pointer text-xs font-medium text-text">
                      <span className="flex items-center gap-2">
                        <Mail className="size-4 text-secondary" /> Email Notifications
                      </span>
                      <input
                        type="checkbox"
                        checked={prefs.email}
                        onChange={(e) => setPrefs({ ...prefs, email: e.target.checked })}
                        className="size-4 rounded text-secondary focus:ring-secondary/20"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer text-xs font-medium text-text">
                      <span className="flex items-center gap-2">
                        <Smartphone className="size-4 text-secondary" /> SMS (DLT Gateway)
                      </span>
                      <input
                        type="checkbox"
                        checked={prefs.sms}
                        onChange={(e) => setPrefs({ ...prefs, sms: e.target.checked })}
                        className="size-4 rounded text-secondary focus:ring-secondary/20"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer text-xs font-medium text-text">
                      <span className="flex items-center gap-2">
                        <MessageSquare className="size-4 text-green-600" /> WhatsApp Business
                      </span>
                      <input
                        type="checkbox"
                        checked={prefs.whatsapp}
                        onChange={(e) => setPrefs({ ...prefs, whatsapp: e.target.checked })}
                        className="size-4 rounded text-secondary focus:ring-secondary/20"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer text-xs font-medium text-text">
                      <span className="flex items-center gap-2">
                        <Bell className="size-4 text-accent-gold" /> In-App Notification Center
                      </span>
                      <input
                        type="checkbox"
                        checked={prefs.inApp}
                        onChange={(e) => setPrefs({ ...prefs, inApp: e.target.checked })}
                        className="size-4 rounded text-secondary focus:ring-secondary/20"
                      />
                    </label>
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-3 rounded-xl border border-border/70 bg-white p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                    Notification Categories
                  </h4>
                  <div className="space-y-2.5">
                    <label className="flex items-center justify-between cursor-pointer text-xs font-medium text-text">
                      <span>Job Alerts & Matches</span>
                      <input
                        type="checkbox"
                        checked={prefs.jobAlerts}
                        onChange={(e) => setPrefs({ ...prefs, jobAlerts: e.target.checked })}
                        className="size-4 rounded text-secondary focus:ring-secondary/20"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer text-xs font-medium text-text">
                      <span>Interview & Demonstration Reminders</span>
                      <input
                        type="checkbox"
                        checked={prefs.interviewReminders}
                        onChange={(e) => setPrefs({ ...prefs, interviewReminders: e.target.checked })}
                        className="size-4 rounded text-secondary focus:ring-secondary/20"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer text-xs font-medium text-text">
                      <span>Platform Announcements & Policies</span>
                      <input
                        type="checkbox"
                        checked={prefs.announcements}
                        onChange={(e) => setPrefs({ ...prefs, announcements: e.target.checked })}
                        className="size-4 rounded text-secondary focus:ring-secondary/20"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-3">
              {prefsSuccess ? (
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-700">
                  <CheckCircle2 className="size-4 text-green-600" />
                  Preferences updated!
                </span>
              ) : null}
              <Button
                variant="primary"
                size="sm"
                onClick={savePreferences}
                disabled={prefsSaving}
                className="gap-1.5 bg-primary text-white hover:bg-secondary"
              >
                {prefsSaving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                <span>Save Preferences</span>
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Notification items */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-white border border-border" />
          ))}
        </div>
      ) : null}

      {error ? (
        <ErrorState title="Unable to load notifications" message={error} onRetry={loadNotifications} />
      ) : null}

      {!loading && !error && filteredItems.length === 0 ? (
        <EmptyState
          title={activeTab === "all" ? "No notifications" : `No ${activeTab} notifications`}
          description={
            activeTab === "unread"
              ? "You’re all caught up with your updates."
              : "Updates regarding your recruitment activities will appear here."
          }
        />
      ) : null}

      {!loading && !error && filteredItems.length > 0 ? (
        <div className="space-y-3">
          {filteredItems.map((n) => (
            <Card
              key={n.id}
              className={cn(
                "group relative overflow-hidden p-4 sm:p-5 transition-all duration-200 border",
                n.read
                  ? "bg-white border-border/80 shadow-2xs hover:shadow-xs"
                  : "bg-white border-accent-gold/40 shadow-xs ring-1 ring-accent-gold/20",
              )}
            >
              <div className="flex items-start gap-3.5 sm:gap-4">
                <div
                  className={cn(
                    "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border shadow-2xs",
                    n.read
                      ? "border-border/70 bg-[#FAF9F5] text-muted"
                      : "border-accent-gold/30 bg-accent-gold/10 text-primary",
                  )}
                >
                  {getTypeIcon(n.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={cn(
                          "text-sm sm:text-base text-primary",
                          !n.read ? "font-bold" : "font-semibold",
                        )}
                      >
                        {n.title}
                      </h3>
                      <span className="rounded-full border border-border bg-[#FAF9F5] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                        {n.type}
                      </span>
                      {n.priority === "urgent" || n.priority === "high" ? (
                        <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold text-red-700">
                          Priority
                        </span>
                      ) : null}
                    </div>

                    <span className="text-[11px] text-muted">
                      {new Date(n.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="mt-2 text-xs sm:text-sm text-text/80 leading-relaxed">
                    {n.body}
                  </p>

                  <div className="mt-3.5 flex flex-wrap items-center gap-3 pt-2 border-t border-border/40">
                    {n.href ? (
                      <Link
                        href={n.href}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-soft-blue px-3 py-1.5 text-xs font-semibold text-primary hover:bg-[#D8E4F2] transition"
                      >
                        <span>View Details</span>
                        <ExternalLink className="size-3.5" />
                      </Link>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => toggleRead(n.id, n.read)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
                        n.read
                          ? "text-muted hover:bg-[#FAF9F5] hover:text-primary"
                          : "text-secondary hover:bg-soft-blue font-semibold",
                      )}
                    >
                      {n.read ? (
                        <>
                          <Check className="size-3.5 text-muted" />
                          <span>Mark unread</span>
                        </>
                      ) : (
                        <>
                          <CheckCheck className="size-3.5 text-secondary" />
                          <span>Mark read</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
