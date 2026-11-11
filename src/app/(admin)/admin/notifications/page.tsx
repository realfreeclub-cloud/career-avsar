"use client";

import * as React from "react";
import {
  AdminPage,
  Card,
  Button,
  DataTable,
  Pager,
  Skeleton,
} from "@/components/admin/ui";
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  Send,
  Radio,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Search,
  FileCode2,
  Clock,
  ShieldCheck,
  Check,
  X,
  Eye,
  Loader2,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { AdminCommunicationLog, CommunicationStats } from "@/server/services/admin/communication";
import type { NotificationTemplate } from "@/lib/db/models/admin/notification-template";

type ChannelType = "in_app" | "email" | "sms" | "whatsapp";

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = React.useState<"logs" | "templates">("logs");

  // Logs & Stats state
  const [logs, setLogs] = React.useState<AdminCommunicationLog[]>([]);
  const [stats, setStats] = React.useState<CommunicationStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);

  // Filters state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterChannel, setFilterChannel] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const [filterEvent, setFilterEvent] = React.useState("");

  // Modals state
  const [composerOpen, setComposerOpen] = React.useState(false);
  const [broadcastOpen, setBroadcastOpen] = React.useState(false);
  const [detailModalLog, setDetailModalLog] = React.useState<AdminCommunicationLog | null>(null);
  const [templateModalOpen, setTemplateModalOpen] = React.useState(false);
  const [editingTemplate, setEditingTemplate] = React.useState<Partial<NotificationTemplate> | null>(null);

  // Templates list state
  const [templates, setTemplates] = React.useState<NotificationTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = React.useState(false);

  // Direct Message Composer Form State
  const [composerRecipientId, setComposerRecipientId] = React.useState("");
  const [composerRecipientName, setComposerRecipientName] = React.useState("");
  const [composerRecipientEmail, setComposerRecipientEmail] = React.useState("");
  const [composerRecipientMobile, setComposerRecipientMobile] = React.useState("");
  const [composerChannels, setComposerChannels] = React.useState<ChannelType[]>(["in_app", "email"]);
  const [composerEvent, setComposerEvent] = React.useState("announcement");
  const [composerTemplateCode, setComposerTemplateCode] = React.useState("");
  const [composerSubject, setComposerSubject] = React.useState("");
  const [composerBody, setComposerBody] = React.useState("");
  const [composerSending, setComposerSending] = React.useState(false);
  const [composerSuccess, setComposerSuccess] = React.useState(false);
  const [composerError, setComposerError] = React.useState<string | null>(null);

  // Broadcast Form State
  const [broadcastTitle, setBroadcastTitle] = React.useState("");
  const [broadcastBody, setBroadcastBody] = React.useState("");
  const [broadcastChannels, setBroadcastChannels] = React.useState<ChannelType[]>(["in_app", "email"]);
  const [broadcastSending, setBroadcastSending] = React.useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = React.useState(false);
  const [broadcastResult, setBroadcastResult] = React.useState<{ totalRecipients: number; dispatchedCount: number } | null>(null);
  const [broadcastError, setBroadcastError] = React.useState<string | null>(null);

  // Candidate Search Suggestions for Composer
  const [candidateSearchText, setCandidateSearchText] = React.useState("");
  const [candidateSearchResults, setCandidateSearchResults] = React.useState<
    Array<{ id: string; fullName: string; email: string; mobile: string }>
  >([]);
  const [candidateSearching, setCandidateSearching] = React.useState(false);

  // Template Form State
  const [templateSaving, setTemplateSaving] = React.useState(false);
  const [templateError, setTemplateError] = React.useState<string | null>(null);

  // Retry state
  const [retryingLogId, setRetryingLogId] = React.useState<string | null>(null);

  const fetchLogs = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (filterChannel) params.set("channel", filterChannel);
      if (filterStatus) params.set("status", filterStatus);
      if (filterEvent) params.set("event", filterEvent);
      params.set("page", String(page));
      params.set("limit", "20");

      const res = await fetch(`/api/admin/notifications?${params.toString()}`, { credentials: "same-origin" });
      if (!res.ok) throw new Error("Failed to load communication delivery logs");
      const json = await res.json();
      setLogs(json.data?.logs?.items || []);
      setTotalPages(json.data?.logs?.page?.totalPages || 1);
      setTotalCount(json.data?.logs?.page?.total || 0);
      setStats(json.data?.stats || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to load communication logs");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterChannel, filterStatus, filterEvent, page]);

  const fetchTemplates = React.useCallback(async () => {
    try {
      setTemplatesLoading(true);
      const res = await fetch("/api/admin/notifications/templates", { credentials: "same-origin" });
      if (res.ok) {
        const json = await res.json();
        setTemplates(json.data?.templates || []);
      }
    } catch {
      // ignore
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  React.useEffect(() => {
    if (activeTab === "templates") {
      fetchTemplates();
    }
  }, [activeTab, fetchTemplates]);

  // Candidate quick search for composer
  React.useEffect(() => {
    if (!candidateSearchText.trim() || candidateSearchText.length < 2) {
      setCandidateSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setCandidateSearching(true);
        const res = await fetch(`/api/admin/teachers?q=${encodeURIComponent(candidateSearchText.trim())}&limit=5`, {
          credentials: "same-origin",
        });
        if (res.ok) {
          const json = await res.json();
          const items = (json.data?.items || []).map((t: { id: string; fullName: string; email: string; mobile?: string }) => ({
            id: t.id,
            fullName: t.fullName,
            email: t.email,
            mobile: t.mobile || "",
          }));
          setCandidateSearchResults(items);
        }
      } catch {
        // silent
      } finally {
        setCandidateSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [candidateSearchText]);

  async function handleRetryLog(logId: string) {
    try {
      setRetryingLogId(logId);
      const res = await fetch(`/api/admin/notifications/${logId}/retry`, {
        method: "POST",
        credentials: "same-origin",
      });
      if (res.ok) {
        setLogs((prev) =>
          prev.map((l) =>
            l.id === logId
              ? { ...l, status: "delivered", failureReason: undefined, retryCount: l.retryCount + 1 }
              : l,
          ),
        );
      }
    } catch {
      // ignore
    } finally {
      setRetryingLogId(null);
    }
  }

  async function handleSendDirectMessage() {
    setComposerSending(true);
    setComposerError(null);
    setComposerSuccess(false);

    try {
      if (!composerRecipientId.trim()) throw new Error("Recipient candidate must be selected");
      if (composerChannels.length === 0) throw new Error("At least one communication channel must be selected");
      if (!composerSubject.trim() && !composerBody.trim()) throw new Error("Subject or message body is required");

      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientUserId: composerRecipientId.trim(),
          recipientName: composerRecipientName.trim() || undefined,
          recipientEmail: composerRecipientEmail.trim() || undefined,
          recipientMobile: composerRecipientMobile.trim() || undefined,
          channels: composerChannels,
          event: composerEvent,
          templateCode: composerTemplateCode || undefined,
          subject: composerSubject.trim() || undefined,
          body: composerBody.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || "Failed to dispatch message");
      }

      setComposerSuccess(true);
      fetchLogs();
      setTimeout(() => {
        setComposerOpen(false);
        setComposerSuccess(false);
        setComposerRecipientId("");
        setComposerRecipientName("");
        setComposerSubject("");
        setComposerBody("");
      }, 1500);
    } catch (err: unknown) {
      setComposerError(err instanceof Error ? err.message : "Failed to dispatch communication");
    } finally {
      setComposerSending(false);
    }
  }

  async function handleSendBroadcast() {
    setBroadcastSending(true);
    setBroadcastError(null);
    setBroadcastSuccess(false);

    try {
      if (!broadcastTitle.trim() || !broadcastBody.trim()) {
        throw new Error("Announcement title and body are required");
      }
      if (broadcastChannels.length === 0) {
        throw new Error("At least one communication channel must be selected");
      }

      const res = await fetch("/api/admin/notifications/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: broadcastTitle.trim(),
          body: broadcastBody.trim(),
          channels: broadcastChannels,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || "Broadcast dispatch failed");
      }

      const json = await res.json();
      setBroadcastResult({
        totalRecipients: json.data?.totalRecipients || 0,
        dispatchedCount: json.data?.dispatchedCount || 0,
      });
      setBroadcastSuccess(true);
      fetchLogs();
    } catch (err: unknown) {
      setBroadcastError(err instanceof Error ? err.message : "Failed to broadcast announcement");
    } finally {
      setBroadcastSending(false);
    }
  }

  async function handleSaveTemplate() {
    if (!editingTemplate?.name || !editingTemplate?.code || !editingTemplate?.event) {
      setTemplateError("Name, Code, and Event code are required");
      return;
    }
    setTemplateSaving(true);
    setTemplateError(null);

    try {
      const res = await fetch("/api/admin/notifications/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTemplate),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || "Failed to save template");
      }

      setTemplateModalOpen(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch (err: unknown) {
      setTemplateError(err instanceof Error ? err.message : "Error saving template");
    } finally {
      setTemplateSaving(false);
    }
  }

  const getChannelBadge = (ch: AdminCommunicationLog["channel"]) => {
    switch (ch) {
      case "email":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            <Mail className="size-3" /> Email
          </span>
        );
      case "sms":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            <Smartphone className="size-3" /> SMS (DLT)
          </span>
        );
      case "whatsapp":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 border border-green-200">
            <MessageSquare className="size-3" /> WhatsApp
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
            <Bell className="size-3" /> In-App
          </span>
        );
    }
  };

  const getStatusBadge = (status: AdminCommunicationLog["status"], failureReason?: string) => {
    switch (status) {
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="size-3.5" /> Delivered
          </span>
        );
      case "failed":
        return (
          <span
            title={failureReason || "Delivery failed"}
            className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200 cursor-help"
          >
            <XCircle className="size-3.5" /> Failed
          </span>
        );
      case "opted_out":
        return (
          <span
            title="Candidate opted out of this channel"
            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200"
          >
            <AlertTriangle className="size-3.5" /> Opted Out
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700 border border-sky-200">
            <Clock className="size-3.5" /> Sent / Pending
          </span>
        );
    }
  };

  return (
    <AdminPage
      title="Communication Hub"
      subtitle="Centralized multi-channel messaging (In-App, Email, SMS DLT, WhatsApp Business), delivery logs, templates, and announcements."
      actions={
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBroadcastOpen(true);
              setBroadcastSuccess(false);
              setBroadcastResult(null);
            }}
            className="gap-1.5 border-border bg-white text-secondary hover:bg-soft-blue"
          >
            <Radio className="size-4 text-accent-gold" />
            <span>Broadcast Announcement</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setComposerOpen(true);
              setComposerSuccess(false);
              setCandidateSearchText("");
              fetchTemplates();
            }}
            className="gap-1.5 bg-primary text-white hover:bg-secondary"
          >
            <Send className="size-4" />
            <span>Send Direct Message</span>
          </Button>
        </div>
      }
    >
      {/* Multi-channel Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <div className="rounded-xl border border-border bg-white p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Total Dispatched</p>
          <p className="mt-1 font-serif text-2xl font-bold text-primary">{stats?.totalSent ?? 0}</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">Delivered</p>
          <p className="mt-1 font-serif text-2xl font-bold text-emerald-800">{stats?.delivered ?? 0}</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-700">Failed</p>
          <p className="mt-1 font-serif text-2xl font-bold text-rose-800">{stats?.failed ?? 0}</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-gold">Delivery Rate</p>
          <p className="mt-1 font-serif text-2xl font-bold text-primary">{stats?.deliveryRate ?? 100}%</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-purple-700">
            <Bell className="size-3" /> In-App
          </div>
          <p className="mt-1 font-serif text-xl font-bold text-primary">{stats?.inAppCount ?? 0}</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-700">
            <Mail className="size-3" /> Email
          </div>
          <p className="mt-1 font-serif text-xl font-bold text-primary">{stats?.emailCount ?? 0}</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            <Smartphone className="size-3" /> SMS (DLT)
          </div>
          <p className="mt-1 font-serif text-xl font-bold text-primary">{stats?.smsCount ?? 0}</p>
        </div>

        <div className="rounded-xl border border-border bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-green-700">
            <MessageSquare className="size-3" /> WhatsApp
          </div>
          <p className="mt-1 font-serif text-xl font-bold text-primary">{stats?.whatsappCount ?? 0}</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-border/80 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={cn(
            "pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2",
            activeTab === "logs"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-primary",
          )}
        >
          <Clock className="size-4" />
          <span>Delivery Logs & Tracking ({totalCount})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("templates");
            fetchTemplates();
          }}
          className={cn(
            "pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2",
            activeTab === "templates"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-primary",
          )}
        >
          <FileCode2 className="size-4" />
          <span>Notification Templates ({templates.length})</span>
        </button>
      </div>

      {/* TAB 1: DELIVERY LOGS */}
      {activeTab === "logs" ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <Card className="p-4 bg-white border-border/80 shadow-2xs">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search recipient, mobile, ID, subject..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-border bg-[#FAF9F5] py-2 pl-9 pr-3 text-xs text-text placeholder:text-muted focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={filterChannel}
                  onChange={(e) => {
                    setFilterChannel(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-border bg-[#FAF9F5] px-3 py-2 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
                >
                  <option value="">All Channels</option>
                  <option value="in_app">In-App Notification</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS (DLT)</option>
                  <option value="whatsapp">WhatsApp Business</option>
                </select>
              </div>

              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-border bg-[#FAF9F5] px-3 py-2 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                  <option value="opted_out">Opted Out</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <select
                  value={filterEvent}
                  onChange={(e) => {
                    setFilterEvent(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-xl border border-border bg-[#FAF9F5] px-3 py-2 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
                >
                  <option value="">All Events</option>
                  <option value="registration">Registration</option>
                  <option value="profile_verification">Profile Verification</option>
                  <option value="application_submission">Application Submission</option>
                  <option value="application_status_update">Application Status Update</option>
                  <option value="shortlisting">Shortlisting</option>
                  <option value="interview_invitation">Interview Invitation</option>
                  <option value="interview_rescheduling">Interview Rescheduling</option>
                  <option value="selection">Selection & Offer</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Table */}
          <DataTable
            loading={loading}
            error={error}
            onRetry={fetchLogs}
            rows={logs}
            rowKey={(r) => r.id}
            emptyTitle="No communication logs found"
            emptyDesc="Dispatched notifications across in-app, email, SMS, and WhatsApp will be tracked here with delivery confirmation."
            cols={[
              {
                key: "recipient",
                label: "Recipient Educator",
                render: (row) => (
                  <div className="min-w-[160px]">
                    <p className="font-semibold text-xs text-primary">{row.recipientName}</p>
                    <p className="text-[11px] text-muted truncate">{row.recipientEmail || row.recipientMobile || "In-app recipient"}</p>
                  </div>
                ),
              },
              {
                key: "channel",
                label: "Channel",
                render: (row) => getChannelBadge(row.channel),
              },
              {
                key: "event",
                label: "Event",
                render: (row) => (
                  <span className="rounded-md bg-[#FAF9F5] border border-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                    {row.event.replace(/_/g, " ")}
                  </span>
                ),
              },
              {
                key: "message",
                label: "Subject & Message",
                render: (row) => (
                  <div className="max-w-[280px]">
                    <p className="truncate text-xs font-semibold text-primary">{row.subject || "(No subject)"}</p>
                    <p className="truncate text-[11px] text-muted">{row.body}</p>
                  </div>
                ),
              },
              {
                key: "providerMessageId",
                label: "Provider Msg ID",
                render: (row) => (
                  <span className="font-mono text-[10px] text-muted truncate max-w-[120px] block" title={row.providerMessageId}>
                    {row.providerMessageId}
                  </span>
                ),
              },
              {
                key: "status",
                label: "Delivery Status",
                render: (row) => getStatusBadge(row.status, row.failureReason),
              },
              {
                key: "timestamp",
                label: "Attempted At",
                render: (row) => (
                  <span className="text-[11px] text-muted whitespace-nowrap">
                    {new Date(row.lastAttemptAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                ),
              },
              {
                key: "actions",
                label: "Action",
                render: (row) => (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDetailModalLog(row)}
                      title="Inspect message payload"
                      className="size-7 p-0 text-muted hover:text-primary hover:bg-soft-blue"
                    >
                      <Eye className="size-3.5" />
                    </Button>

                    {row.status === "failed" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={retryingLogId === row.id}
                        onClick={() => handleRetryLog(row.id)}
                        title="Retry delivery safely"
                        className="h-7 px-2 text-[11px] font-semibold text-rose-700 border-rose-200 hover:bg-rose-50"
                      >
                        {retryingLogId === row.id ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <RotateCcw className="size-3 mr-1" />
                        )}
                        Retry
                      </Button>
                    ) : null}
                  </div>
                ),
              },
            ]}
            renderMobile={(row) => (
              <li key={row.id} className="p-4 bg-white hover:bg-soft-blue/30 transition">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-xs text-primary">{row.recipientName}</p>
                    <p className="text-[11px] text-muted">{row.recipientEmail || row.recipientMobile}</p>
                  </div>
                  {getStatusBadge(row.status, row.failureReason)}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {getChannelBadge(row.channel)}
                  <span className="rounded bg-[#FAF9F5] border border-border px-1.5 py-0.5 text-[10px] text-muted">
                    {row.event}
                  </span>
                </div>

                <div className="mt-2">
                  <p className="text-xs font-semibold text-primary">{row.subject}</p>
                  <p className="text-[11px] text-muted line-clamp-2">{row.body}</p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted">
                  <span className="font-mono text-[10px]">{row.providerMessageId.slice(0, 16)}...</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailModalLog(row)}
                      className="font-medium text-secondary hover:underline"
                    >
                      View
                    </button>
                    {row.status === "failed" ? (
                      <button
                        type="button"
                        onClick={() => handleRetryLog(row.id)}
                        className="font-bold text-rose-700 hover:underline"
                      >
                        Retry
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            )}
          />

          <Pager page={page} totalPages={totalPages} onPage={setPage} />
        </div>
      ) : null}

      {/* TAB 2: NOTIFICATION TEMPLATES */}
      {activeTab === "templates" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted">
              Standardized notification templates across recruitment milestones. Edit variable placeholders and multi-channel phrasing.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingTemplate({
                  name: "",
                  code: "",
                  event: "announcement",
                  channels: ["in_app", "email"],
                  subject: "",
                  inAppBody: "",
                  emailHtml: "",
                  smsText: "",
                  whatsappText: "",
                  availableVariables: ["candidateName"],
                  status: "active",
                });
                setTemplateModalOpen(true);
              }}
              className="gap-1.5 border-border bg-white text-primary hover:bg-soft-blue"
            >
              <Plus className="size-4 text-accent-gold" />
              <span>Create Template</span>
            </Button>
          </div>

          {templatesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-xl bg-white border border-border" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((tpl) => (
                <Card
                  key={tpl._id ? String(tpl._id) : tpl.code}
                  className="flex flex-col justify-between p-4.5 bg-white border-border/80 shadow-2xs hover:shadow-xs transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-soft-blue px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
                        {tpl.event}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 capitalize">
                        {tpl.status}
                      </span>
                    </div>

                    <h3 className="mt-2 text-sm font-bold text-primary">{tpl.name}</h3>
                    <p className="mt-0.5 text-[11px] font-mono text-muted">code: {tpl.code}</p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {tpl.channels.map((ch) => (
                        <span key={ch} className="rounded border border-border/70 bg-[#FAF9F5] px-1.5 py-0.5 text-[10px] font-medium text-text capitalize">
                          {ch.replace("_", " ")}
                        </span>
                      ))}
                    </div>

                    <p className="mt-2.5 text-xs text-muted line-clamp-2">
                      {tpl.subject || tpl.inAppBody}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                    <div className="flex flex-wrap gap-1">
                      {(tpl.availableVariables || []).slice(0, 3).map((v) => (
                        <span key={v} className="rounded bg-accent/10 px-1 py-0.2 text-[9px] font-mono text-primary">
                          {`{{${v}}}`}
                        </span>
                      ))}
                      {(tpl.availableVariables || []).length > 3 ? (
                        <span className="text-[9px] text-muted">+{tpl.availableVariables.length - 3}</span>
                      ) : null}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTemplate(tpl);
                        setTemplateModalOpen(true);
                      }}
                      className="text-xs font-semibold text-secondary hover:bg-soft-blue"
                    >
                      Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* MODAL 1: DIRECT MESSAGE COMPOSER */}
      {composerOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/30 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <Send className="size-5 text-accent-gold" />
                <h3 className="font-serif text-lg font-bold text-primary">Direct Message Composer</h3>
              </div>
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-soft-blue hover:text-primary"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Recipient Selection */}
              <div>
                <label className="text-xs font-bold text-primary block mb-1">
                  Recipient Candidate Educator *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="Search candidate name or email to auto-fill..."
                    value={candidateSearchText}
                    onChange={(e) => setCandidateSearchText(e.target.value)}
                    className="w-full rounded-xl border border-border bg-[#FAF9F5] py-2 pl-9 pr-9 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
                  />
                  {candidateSearching ? (
                    <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-secondary" />
                  ) : null}
                </div>

                {candidateSearchResults.length > 0 ? (
                  <div className="mt-1 divide-y divide-border/60 rounded-xl border border-border bg-white shadow-md">
                    {candidateSearchResults.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setComposerRecipientId(c.id);
                          setComposerRecipientName(c.fullName);
                          setComposerRecipientEmail(c.email);
                          setComposerRecipientMobile(c.mobile);
                          setCandidateSearchText(`${c.fullName} (${c.email})`);
                          setCandidateSearchResults([]);
                        }}
                        className="p-2.5 text-xs hover:bg-soft-blue cursor-pointer"
                      >
                        <p className="font-semibold text-primary">{c.fullName}</p>
                        <p className="text-[11px] text-muted">{c.email} | {c.mobile || "No mobile"}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {composerRecipientId ? (
                  <div className="mt-2 flex items-center justify-between rounded-lg bg-soft-blue/60 border border-[#D5DFEB] px-3 py-1.5 text-xs text-primary">
                    <span>Selected ID: <strong>{composerRecipientId}</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        setComposerRecipientId("");
                        setComposerRecipientName("");
                        setComposerRecipientEmail("");
                        setComposerRecipientMobile("");
                        setCandidateSearchText("");
                      }}
                      className="text-xs text-danger hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Or enter candidate user ID manually"
                    value={composerRecipientId}
                    onChange={(e) => setComposerRecipientId(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-border bg-[#FAF9F5] px-3 py-2 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
                  />
                )}
              </div>

              {/* Channel Checkboxes */}
              <div>
                <label className="text-xs font-bold text-primary block mb-1.5">
                  Target Communication Channels *
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { id: "in_app", label: "In-App", icon: Bell },
                    { id: "email", label: "Email", icon: Mail },
                    { id: "sms", label: "SMS (DLT)", icon: Smartphone },
                    { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
                  ].map((ch) => {
                    const isChecked = composerChannels.includes(ch.id as ChannelType);
                    return (
                      <label
                        key={ch.id}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border p-2.5 cursor-pointer text-xs transition",
                          isChecked
                            ? "border-secondary bg-soft-blue/70 font-semibold text-primary"
                            : "border-border bg-white text-muted hover:bg-[#FAF9F5]",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setComposerChannels([...composerChannels, ch.id as ChannelType]);
                            } else {
                              setComposerChannels(composerChannels.filter((c) => c !== ch.id));
                            }
                          }}
                          className="size-3.5 rounded text-secondary"
                        />
                        <span>{ch.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Template selector */}
              <div>
                <label className="text-xs font-bold text-primary block mb-1">
                  Load From Template (Optional)
                </label>
                <select
                  value={composerTemplateCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setComposerTemplateCode(code);
                    const found = templates.find((t) => t.code === code);
                    if (found) {
                      setComposerSubject(found.subject || found.name);
                      setComposerBody(found.inAppBody || found.smsText || "");
                      setComposerEvent(found.event);
                    }
                  }}
                  className="w-full rounded-xl border border-border bg-[#FAF9F5] px-3 py-2 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
                >
                  <option value="">-- Custom Message (No Template) --</option>
                  {templates.map((t) => (
                    <option key={t.code} value={t.code}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-bold text-primary block mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  placeholder="e.g. Demonstration Slot Confirmation..."
                  value={composerSubject}
                  onChange={(e) => setComposerSubject(e.target.value)}
                  className="w-full rounded-xl border border-border bg-[#FAF9F5] px-3 py-2 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="text-xs font-bold text-primary block mb-1">
                  Message Content *
                </label>
                <textarea
                  rows={4}
                  placeholder="Write clear notification content. Candidate opt-out preferences and delivery tracking will be applied automatically."
                  value={composerBody}
                  onChange={(e) => setComposerBody(e.target.value)}
                  className="w-full rounded-xl border border-border bg-[#FAF9F5] p-3 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>

              {composerError ? (
                <p className="text-xs font-medium text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  {composerError}
                </p>
              ) : null}

              {composerSuccess ? (
                <p className="text-xs font-medium text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  Communication dispatched successfully across selected channels!
                </p>
              ) : null}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-border/80 pt-3.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setComposerOpen(false)}
                className="border-border bg-white text-text hover:bg-soft-blue"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSendDirectMessage}
                disabled={composerSending || composerSuccess}
                className="gap-1.5 bg-primary text-white hover:bg-secondary"
              >
                {composerSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                <span>Dispatch Message</span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL 2: BROADCAST ANNOUNCEMENT */}
      {broadcastOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/30 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="size-5 text-accent-gold" />
                <h3 className="font-serif text-lg font-bold text-primary">Broadcast Institutional Announcement</h3>
              </div>
              <button
                type="button"
                onClick={() => setBroadcastOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-soft-blue hover:text-primary"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-accent/30 bg-[#FAF5EB] p-3 text-xs text-text">
                <p className="font-semibold text-primary">Authorized Broadcast Scope</p>
                <p className="mt-0.5 text-muted">
                  This broadcast queues messages to all verified active candidates. Channel opt-outs and rate limits are respected automatically.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-primary block mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. CBSE 2026 Direct Recruitment Drive Announced"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-[#FAF9F5] px-3 py-2 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-primary block mb-1">
                  Announcement Message Body *
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter broadcast details, dates, or guidelines for candidate educators..."
                  value={broadcastBody}
                  onChange={(e) => setBroadcastBody(e.target.value)}
                  className="w-full rounded-xl border border-border bg-[#FAF9F5] p-3 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-primary block mb-1.5">
                  Channels To Broadcast Through *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "in_app", label: "In-App Feed", icon: Bell },
                    { id: "email", label: "Email Newsletter", icon: Mail },
                    { id: "sms", label: "SMS (DLT Flash)", icon: Smartphone },
                    { id: "whatsapp", label: "WhatsApp Broadcast", icon: MessageSquare },
                  ].map((ch) => {
                    const isChecked = broadcastChannels.includes(ch.id as ChannelType);
                    return (
                      <label
                        key={ch.id}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border p-2.5 cursor-pointer text-xs transition",
                          isChecked
                            ? "border-secondary bg-soft-blue/70 font-semibold text-primary"
                            : "border-border bg-white text-muted hover:bg-[#FAF9F5]",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBroadcastChannels([...broadcastChannels, ch.id as ChannelType]);
                            } else {
                              setBroadcastChannels(broadcastChannels.filter((c) => c !== ch.id));
                            }
                          }}
                          className="size-3.5 rounded text-secondary"
                        />
                        <span>{ch.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {broadcastError ? (
                <p className="text-xs font-medium text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  {broadcastError}
                </p>
              ) : null}

              {broadcastSuccess && broadcastResult ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    Broadcast Queue Established!
                  </p>
                  <p className="mt-0.5">
                    Dispatched to {broadcastResult.dispatchedCount} active educators across selected channels.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-border/80 pt-3.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBroadcastOpen(false)}
                className="border-border bg-white text-text hover:bg-soft-blue"
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSendBroadcast}
                disabled={broadcastSending || broadcastSuccess}
                className="gap-1.5 bg-primary text-white hover:bg-secondary"
              >
                {broadcastSending ? <Loader2 className="size-4 animate-spin" /> : <Radio className="size-4" />}
                <span>Queue Broadcast</span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL 3: LOG INSPECTOR DETAIL */}
      {detailModalLog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/30 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-secondary" />
                <h3 className="font-serif text-lg font-bold text-primary">Delivery Audit Detail</h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalLog(null)}
                className="rounded-lg p-1 text-muted hover:bg-soft-blue hover:text-primary"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#FAF9F5] p-3 border border-border/60">
                <div>
                  <span className="text-[10px] text-muted block uppercase font-bold">Recipient</span>
                  <span className="font-semibold text-primary">{detailModalLog.recipientName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted block uppercase font-bold">Channel</span>
                  {getChannelBadge(detailModalLog.channel)}
                </div>
                <div>
                  <span className="text-[10px] text-muted block uppercase font-bold">Status</span>
                  {getStatusBadge(detailModalLog.status, detailModalLog.failureReason)}
                </div>
                <div>
                  <span className="text-[10px] text-muted block uppercase font-bold">Event</span>
                  <span className="font-medium text-text">{detailModalLog.event}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-muted block uppercase font-bold mb-1">Provider Tracking ID</span>
                <p className="font-mono bg-white p-2 rounded-lg border border-border text-primary select-all">
                  {detailModalLog.providerMessageId}
                </p>
              </div>

              {detailModalLog.failureReason ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-rose-800">
                  <span className="font-bold block">Failure Audit Reason:</span>
                  <span>{detailModalLog.failureReason}</span>
                </div>
              ) : null}

              <div>
                <span className="text-[10px] text-muted block uppercase font-bold mb-1">Subject</span>
                <p className="font-medium text-text bg-[#FAF9F5] p-2 rounded-lg border border-border/60">
                  {detailModalLog.subject || "(No subject)"}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-muted block uppercase font-bold mb-1">Message Body</span>
                <div className="max-h-36 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-[#FAF9F5] p-2.5 text-text">
                  {detailModalLog.body}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted pt-2">
                <span>Retries: {detailModalLog.retryCount}</span>
                <span>Last Attempt: {new Date(detailModalLog.lastAttemptAt).toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-border/80 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailModalLog(null)}
                className="border-border bg-white text-text hover:bg-soft-blue"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL 4: TEMPLATE EDITOR */}
      {templateModalOpen && editingTemplate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/30 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <FileCode2 className="size-5 text-accent-gold" />
                <h3 className="font-serif text-lg font-bold text-primary">
                  {editingTemplate._id ? "Edit Notification Template" : "New Notification Template"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTemplateModalOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-soft-blue hover:text-primary"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-primary block mb-1">Template Name *</label>
                  <input
                    type="text"
                    value={editingTemplate.name || ""}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-[#FAF9F5] px-3 py-2 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-primary block mb-1">Template Code *</label>
                  <input
                    type="text"
                    value={editingTemplate.code || ""}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, code: e.target.value })}
                    className="w-full rounded-xl border border-border bg-[#FAF9F5] px-3 py-2 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-primary block mb-1">Event Category *</label>
                  <select
                    value={editingTemplate.event || "announcement"}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        event: e.target.value as NotificationTemplate["event"],
                      })
                    }
                    className="w-full rounded-xl border border-border bg-[#FAF9F5] px-3 py-2 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
                  >
                    <option value="registration">registration</option>
                    <option value="profile_verification">profile_verification</option>
                    <option value="application_submission">application_submission</option>
                    <option value="application_status_update">application_status_update</option>
                    <option value="shortlisting">shortlisting</option>
                    <option value="interview_invitation">interview_invitation</option>
                    <option value="interview_rescheduling">interview_rescheduling</option>
                    <option value="selection">selection</option>
                    <option value="announcement">announcement</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-primary block mb-1">Status</label>
                  <select
                    value={editingTemplate.status || "active"}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        status: e.target.value as "active" | "draft" | "archived",
                      })
                    }
                    className="w-full rounded-xl border border-border bg-[#FAF9F5] px-3 py-2 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-primary block mb-1">Subject Template</label>
                <input
                  type="text"
                  value={editingTemplate.subject || ""}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  className="w-full rounded-xl border border-border bg-[#FAF9F5] px-3 py-2 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-primary block mb-1">In-App Body Template</label>
                <textarea
                  rows={2}
                  value={editingTemplate.inAppBody || ""}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, inAppBody: e.target.value })}
                  className="w-full rounded-xl border border-border bg-[#FAF9F5] p-2.5 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-primary block mb-1">SMS Text (DLT Compliant)</label>
                <textarea
                  rows={2}
                  value={editingTemplate.smsText || ""}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, smsText: e.target.value })}
                  className="w-full rounded-xl border border-border bg-[#FAF9F5] p-2.5 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-primary block mb-1">WhatsApp Business Template</label>
                <textarea
                  rows={2}
                  value={editingTemplate.whatsappText || ""}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, whatsappText: e.target.value })}
                  className="w-full rounded-xl border border-border bg-[#FAF9F5] p-2.5 text-xs text-text focus:border-secondary focus:bg-white focus:outline-none"
                />
              </div>

              {templateError ? (
                <p className="text-xs font-medium text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  {templateError}
                </p>
              ) : null}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-border/80 pt-3.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTemplateModalOpen(false)}
                className="border-border bg-white text-text hover:bg-soft-blue"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveTemplate}
                disabled={templateSaving}
                className="gap-1.5 bg-primary text-white hover:bg-secondary"
              >
                {templateSaving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                <span>Save Template</span>
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPage>
  );
}
