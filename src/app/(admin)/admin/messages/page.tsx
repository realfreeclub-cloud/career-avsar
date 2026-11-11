"use client";

import * as React from "react";
import {
  Phone,
  MessageSquare,
  Mail,
  Clock,
  Building2,
  Users,
  Plus,
} from "lucide-react";
import {
  AdminPage,
  DataTable,
  Pager,
  Button,
  Input,
  Card,
  KpiCard,
} from "@/components/admin/ui";
import { Modal } from "@/components/ui/modal";
import { apiFetch } from "@/lib/api/client";
import type { Paged } from "@/types/admin";

type CommItem = {
  id: string;
  recipientType: "teacher" | "school";
  schoolId?: string;
  schoolName?: string;
  contactPerson?: string;
  contactRole?: string;
  teacherUserId?: string;
  channel: string;
  event: string;
  subject?: string;
  message?: string;
  status: string;
  followUpDate?: string;
  followUpStatus?: string;
  recordedByName?: string;
  createdAt: string;
};

export default function AdminMessagesPage() {
  const [activeTab, setActiveTab] = React.useState<"schools" | "followups" | "candidates">("schools");
  const [channelFilter, setChannelFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [data, setData] = React.useState<Paged<CommItem> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Stats
  const [stats, setStats] = React.useState({
    totalCount: 0,
    schoolCount: 0,
    candidateCount: 0,
    pendingFollowUps: 0,
  });

  // Log communication modal state
  const [logModalOpen, setLogModalOpen] = React.useState(false);
  const [schools, setSchools] = React.useState<Array<{ id: string; name: string }>>([]);
  const [newLog, setNewLog] = React.useState({
    schoolId: "",
    schoolName: "",
    contactPerson: "",
    contactRole: "Principal",
    channel: "phone" as "phone" | "whatsapp" | "meeting" | "email",
    subject: "",
    message: "",
    followUpDate: "",
  });
  const [logging, setLogging] = React.useState(false);

  // Load communications
  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
    });

    if (activeTab === "schools") {
      params.set("recipientType", "school");
    } else if (activeTab === "candidates") {
      params.set("recipientType", "teacher");
    } else if (activeTab === "followups") {
      params.set("recipientType", "school");
      params.set("followUpStatus", "pending");
    }

    if (channelFilter !== "all") params.set("channel", channelFilter);

    const res = await apiFetch<Paged<CommItem>>(`/api/admin/communications?${params.toString()}`);
    if (!res.ok) setError(res.error.message);
    else setData(res.data);
    setLoading(false);
  }, [page, activeTab, channelFilter]);

  React.useEffect(() => {
    load();
  }, [load]);

  // Load stats and schools on mount
  React.useEffect(() => {
    apiFetch<{ items: Array<{ id: string; name: string }> }>("/api/admin/schools?limit=100").then((res) => {
      if (res.ok && res.data?.items) {
        setSchools(res.data.items);
        if (res.data.items[0]) {
          setNewLog((prev) => ({
            ...prev,
            schoolId: res.data!.items[0]!.id,
            schoolName: res.data!.items[0]!.name,
          }));
        }
      }
    });

    // Quick counts fetch
    apiFetch<Paged<CommItem>>("/api/admin/communications?recipientType=school&limit=1").then((r) => {
      if (r.ok) setStats((prev) => ({ ...prev, schoolCount: r.data.page.total }));
    });
    apiFetch<Paged<CommItem>>("/api/admin/communications?recipientType=teacher&limit=1").then((r) => {
      if (r.ok) setStats((prev) => ({ ...prev, candidateCount: r.data.page.total }));
    });
    apiFetch<Paged<CommItem>>("/api/admin/communications?recipientType=school&followUpStatus=pending&limit=1").then(
      (r) => {
        if (r.ok) setStats((prev) => ({ ...prev, pendingFollowUps: r.data.page.total }));
      },
    );
  }, []);

  async function handleCreateLog(e: React.FormEvent) {
    e.preventDefault();
    if (!newLog.schoolId || !newLog.message.trim()) return;
    setLogging(true);

    const matchedSchool = schools.find((s) => s.id === newLog.schoolId);

    const res = await apiFetch("/api/admin/communications", {
      method: "POST",
      body: JSON.stringify({
        recipientType: "school",
        schoolId: newLog.schoolId,
        schoolName: matchedSchool?.name || newLog.schoolName,
        contactPerson: newLog.contactPerson.trim() || "School Administrator",
        contactRole: newLog.contactRole.trim() || "Staff",
        channel: newLog.channel,
        subject: newLog.subject.trim() || `Recruitment Interaction via ${newLog.channel.toUpperCase()}`,
        message: newLog.message.trim(),
        followUpDate: newLog.followUpDate ? new Date(newLog.followUpDate).toISOString() : undefined,
      }),
    });

    setLogging(false);
    if (res.ok) {
      setLogModalOpen(false);
      setNewLog((prev) => ({
        ...prev,
        contactPerson: "",
        subject: "",
        message: "",
        followUpDate: "",
      }));
      load();
    } else {
      alert(res.error.message);
    }
  }

  return (
    <AdminPage
      title="Recruitment Communications & CRM Outreach"
      subtitle="Complete record of administrator outreach with educational institutions, recruiter follow-ups, and candidate notifications."
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setLogModalOpen(true)}
            className="flex items-center gap-1.5 shadow-sm bg-accent hover:bg-accent/90 text-navy font-semibold"
          >
            <Plus className="size-4" />
            <span>Log School Outreach</span>
          </Button>
        </div>
      }
    >
      {/* KPI Cards Row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="School CRM Outreach"
          value={stats.schoolCount}
          hint="Calls, WhatsApp & meetings logged"
        />
        <KpiCard
          label="Pending Follow-ups"
          value={stats.pendingFollowUps}
          hint="Action items requiring recruiter call"
        />
        <KpiCard
          label="Candidate Notifications"
          value={stats.candidateCount}
          hint="Direct status & interview notices"
        />
        <KpiCard
          label="Total Interactions"
          value={stats.schoolCount + stats.candidateCount}
          hint="Overall platform communication"
        />
      </div>

      {/* Tabs & Filter Bar */}
      <Card className="border border-border p-4 shadow-sm bg-surface">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex border-b md:border-b-0 border-border gap-1 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab("schools");
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === "schools"
                  ? "bg-navy text-warm-ivory shadow-xs"
                  : "text-text-subtle hover:text-navy hover:bg-surface-raised"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              School CRM Logs
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("followups");
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === "followups"
                  ? "bg-navy text-warm-ivory shadow-xs"
                  : "text-text-subtle hover:text-navy hover:bg-surface-raised"
              }`}
            >
              <Clock className="h-3.5 w-3.5 text-accent" />
              Pending Follow-ups
              {stats.pendingFollowUps > 0 && (
                <span className="ml-1 rounded-full bg-accent text-navy px-1.5 py-0.2 text-[10px] font-bold">
                  {stats.pendingFollowUps}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("candidates");
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === "candidates"
                  ? "bg-navy text-warm-ivory shadow-xs"
                  : "text-text-subtle hover:text-navy hover:bg-surface-raised"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Candidate Notices
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-subtle font-medium">Channel:</span>
            <select
              value={channelFilter}
              onChange={(e) => {
                setChannelFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-navy focus:border-accent focus:outline-none"
            >
              <option value="all">All Channels</option>
              <option value="phone">Phone Calls</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="meeting">In-Person Meeting</option>
              <option value="email">Email</option>
              <option value="in_app">In-App Notification</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Communications Table */}
      <DataTable<CommItem>
        loading={loading}
        error={error}
        onRetry={load}
        rows={data?.items || []}
        rowKey={(r) => r.id}
        emptyTitle="No communication logs found"
        emptyDesc={
          activeTab === "followups"
            ? "No pending school follow-ups scheduled at this time."
            : "No interaction logs match your selected filter criteria."
        }
        cols={[
          {
            key: "entity",
            label: activeTab === "candidates" ? "Candidate & Event" : "Partner Institution",
            render: (r) => (
              <div className="min-w-[180px]">
                {r.recipientType === "school" ? (
                  <>
                    <span className="font-serif font-bold text-navy block truncate max-w-xs">
                      {r.schoolName || "Educational Institution"}
                    </span>
                    <span className="text-xs text-text-subtle">
                      {r.contactPerson ? `${r.contactPerson} (${r.contactRole || "Staff"})` : "School Representative"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-navy block">
                      Candidate Event: {r.event.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-text-subtle truncate block max-w-xs">
                      Subject: {r.subject || "Notification"}
                    </span>
                  </>
                )}
              </div>
            ),
          },
          {
            key: "channel",
            label: "Channel",
            render: (r) => (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-raised border border-border text-navy uppercase">
                {r.channel === "phone" && <Phone className="h-3 w-3 text-accent" />}
                {r.channel === "whatsapp" && <MessageSquare className="h-3 w-3 text-emerald-600" />}
                {r.channel === "meeting" && <Users className="h-3 w-3 text-blue-600" />}
                {r.channel === "email" && <Mail className="h-3 w-3 text-purple-600" />}
                {r.channel}
              </span>
            ),
          },
          {
            key: "notes",
            label: "Summary & Action Items",
            render: (r) => (
              <div className="max-w-md">
                <p className="text-xs text-navy leading-relaxed line-clamp-2">
                  {r.message || r.subject || "No message body"}
                </p>
                {r.recordedByName && (
                  <span className="block text-[10px] text-text-subtle mt-0.5">
                    Recorded by: {r.recordedByName}
                  </span>
                )}
              </div>
            ),
          },
          {
            key: "followup",
            label: "Follow-up / Due",
            render: (r) => {
              if (!r.followUpDate) return <span className="text-xs text-text-subtle">—</span>;
              const d = new Date(r.followUpDate);
              const isPast = d.getTime() < Date.now();
              return (
                <div className="text-xs">
                  <span
                    className={`inline-flex items-center gap-1 font-semibold ${
                      r.followUpStatus === "completed"
                        ? "text-emerald-700"
                        : isPast
                        ? "text-rose-700"
                        : "text-amber-700"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {d.toLocaleDateString("en-IN")}
                  </span>
                  <span className="block text-[10px] capitalize text-text-subtle">
                    {r.followUpStatus || "Scheduled"}
                  </span>
                </div>
              );
            },
          },
          {
            key: "date",
            label: "Logged On",
            render: (r) => (
              <span className="text-xs text-text-subtle">
                {new Date(r.createdAt).toLocaleString("en-IN", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            ),
          },
        ]}
      />

      {data ? <Pager page={data.page.page} totalPages={data.page.totalPages} onPage={setPage} /> : null}

      {/* LOG OUTREACH MODAL */}
      <Modal
        open={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        title="Log Institution Interaction & Schedule Follow-up"
        description="Record phone calls, WhatsApp messages, campus meetings, or emails with partner school recruiters."
        className="sm:max-w-xl"
      >
        <form onSubmit={handleCreateLog} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Partner Educational Institution *</label>
            <select
              value={newLog.schoolId}
              onChange={(e) => {
                const sId = e.target.value;
                const found = schools.find((s) => s.id === sId);
                setNewLog({
                  ...newLog,
                  schoolId: sId,
                  schoolName: found?.name || "",
                });
              }}
              className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-navy focus:border-accent focus:outline-none"
              required
            >
              <option value="">-- Select Institution --</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Contact Person</label>
              <Input
                placeholder="e.g. Dr. Anand Sharma"
                value={newLog.contactPerson}
                onChange={(e) => setNewLog({ ...newLog, contactPerson: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Designation</label>
              <Input
                placeholder="e.g. Principal / Director"
                value={newLog.contactRole}
                onChange={(e) => setNewLog({ ...newLog, contactRole: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Communication Channel *</label>
              <select
                value={newLog.channel}
                onChange={(e) =>
                  setNewLog({
                    ...newLog,
                    channel: e.target.value as "phone" | "whatsapp" | "meeting" | "email",
                  })
                }
                className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-navy focus:border-accent focus:outline-none"
              >
                <option value="phone">Phone Call</option>
                <option value="whatsapp">WhatsApp Conversation</option>
                <option value="meeting">Campus / In-Person Meeting</option>
                <option value="email">Official Email</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Schedule Follow-up Date</label>
              <input
                type="date"
                value={newLog.followUpDate}
                onChange={(e) => setNewLog({ ...newLog, followUpDate: e.target.value })}
                className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-xs font-medium text-navy focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Subject / Topic</label>
            <Input
              placeholder="e.g. Mathematics PGT Vacancy Requirements Discussion"
              value={newLog.subject}
              onChange={(e) => setNewLog({ ...newLog, subject: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy mb-1">Discussion Notes & Action Items *</label>
            <textarea
              rows={3}
              placeholder="Summarize key points discussed, school's hiring urgency, salary budget, and next steps..."
              value={newLog.message}
              onChange={(e) => setNewLog({ ...newLog, message: e.target.value })}
              required
              className="w-full rounded-xl border border-border bg-surface p-2.5 text-xs text-navy focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setLogModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={logging || !newLog.schoolId || !newLog.message.trim()}
              className="bg-accent hover:bg-accent/90 text-navy font-semibold"
            >
              {logging ? "Recording Log..." : "Save Communication Log"}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminPage>
  );
}
