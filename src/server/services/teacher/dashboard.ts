import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ApplicationModel } from "@/lib/db/models/teacher/application";
import { InterviewModel } from "@/lib/db/models/teacher/interview";
import { NotificationModel } from "@/lib/db/models/teacher/notification";
import { MessageModel } from "@/lib/db/models/teacher/message";
import { getTeacherProfile } from "@/server/services/teacher/profile";
import { listPublicJobs } from "@/server/services/public";
import { logger } from "@/lib/logger";
import type {
  DashboardApplication,
  DashboardInterview,
  DashboardMessage,
  DashboardNotification,
  TeacherDashboardData,
} from "@/types/dashboard";

function iso(d?: Date | string | null): string {
  if (!d) return new Date().toISOString();
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
}

function mapApp(d: Record<string, unknown>): DashboardApplication {
  const history = Array.isArray(d.statusHistory)
    ? (d.statusHistory as Array<Record<string, unknown>>).map((h) => ({
        status: String(h.status ?? ""),
        changedByRole: h.changedByRole ? String(h.changedByRole) : undefined,
        note: h.candidateVisibleExplanation ? String(h.candidateVisibleExplanation) : undefined,
        createdAt: iso(h.createdAt as Date | undefined),
      }))
    : undefined;

  const msgs = Array.isArray(d.candidateMessages)
    ? (d.candidateMessages as Array<Record<string, unknown>>).map((m) => ({
        senderName: String(m.senderName ?? "Recruiter"),
        message: String(m.message ?? ""),
        createdAt: iso(m.createdAt as Date | undefined),
      }))
    : undefined;

  return {
    id: String(d._id),
    jobId: String(d.jobId ?? ""),
    jobTitle: String(d.jobTitle ?? "Teaching position"),
    schoolName: String(d.schoolName ?? "Institution"),
    status: (d.status as DashboardApplication["status"]) ?? "submitted",
    appliedAt: iso(d.appliedAt as Date | undefined),
    updatedAt: iso((d.updatedAt as Date | undefined) ?? (d.appliedAt as Date | undefined)),
    coverNote: d.coverNote ? String(d.coverNote) : undefined,
    withdrawalReason: d.withdrawalReason ? String(d.withdrawalReason) : undefined,
    interviewScheduledAt: d.interviewScheduledAt ? iso(d.interviewScheduledAt as Date | undefined) : undefined,
    interviewMode: d.interviewMode ? String(d.interviewMode) : undefined,
    statusHistory: history,
    candidateMessages: msgs,
  };
}

export async function getTeacherDashboard(userId: string, userEmail: string): Promise<TeacherDashboardData> {
  const [profile, jobsResult] = await Promise.all([
    getTeacherProfile(userId),
    listPublicJobs({ page: 1, limit: 6 }),
  ]);

  let totalApplications = 0;
  let pendingApplications = 0;
  let shortlistedApplications = 0;
  let interviewsScheduled = 0;
  let recentNotifications: DashboardNotification[] = [];

  try {
    await connectToDatabase();
    const [total, pending, shortlisted, interviews, notifs] = await Promise.all([
      ApplicationModel.countDocuments({ teacherUserId: userId }),
      ApplicationModel.countDocuments({ teacherUserId: userId, status: { $in: ["submitted", "applied", "pending", "under_review", "on_hold"] } }),
      ApplicationModel.countDocuments({ teacherUserId: userId, status: { $in: ["shortlisted", "selected", "offered"] } }),
      InterviewModel.countDocuments({ teacherUserId: userId, status: "scheduled", scheduledAt: { $gte: new Date() } }),
      NotificationModel.find({ teacherUserId: userId }).sort({ createdAt: -1 }).limit(8).lean(),
    ]);
    totalApplications = total;
    pendingApplications = pending;
    shortlistedApplications = shortlisted;
    interviewsScheduled = interviews;
    recentNotifications = (notifs as Array<Record<string, unknown>>).map((n) => ({
      id: String(n._id),
      title: String(n.title ?? ""),
      body: String(n.body ?? ""),
      type: (n.type as DashboardNotification["type"]) ?? "system",
      read: !!n.read,
      createdAt: iso(n.createdAt as Date | undefined),
      href: n.href ? String(n.href) : undefined,
    }));
  } catch (err) {
    logger.warn({ err, userId }, "Teacher dashboard module data unavailable; returning profile/job stats with empty module data");
  }

  return {
    user: { id: userId, name: profile.personal.fullName || "Teacher", email: profile.personal.email || userEmail },
    stats: {
      profileCompletion: profile.completion.percent,
      verificationStatus: profile.verification.status as TeacherDashboardData["stats"]["verificationStatus"],
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      interviewsScheduled,
    },
    latestJobs: jobsResult.items.map((j) => ({
      id: j.id,
      title: j.title,
      schoolName: j.schoolName,
      location: j.location,
      subject: j.subject,
      category: j.category,
      salaryMinInr: j.salaryMinInr,
      salaryMaxInr: j.salaryMaxInr,
      applicationDeadline: j.applicationDeadline,
    })),
    recentNotifications,
  };
}

export async function listTeacherApplications(userId: string): Promise<DashboardApplication[]> {
  try {
    await connectToDatabase();
    const items = await ApplicationModel.find({ teacherUserId: userId }).sort({ createdAt: -1 }).limit(100).lean();
    return (items as Array<Record<string, unknown>>).map(mapApp);
  } catch (err) {
    logger.warn({ err, userId }, "Teacher applications unavailable");
    return [];
  }
}

export async function listTeacherInterviews(userId: string): Promise<DashboardInterview[]> {
  try {
    await connectToDatabase();
    const items = await InterviewModel.find({ teacherUserId: userId }).sort({ scheduledAt: -1 }).limit(100).lean();
    return (items as Array<Record<string, unknown>>).map((d) => ({
      id: String(d._id),
      applicationId: d.applicationId ? String(d.applicationId) : undefined,
      jobTitle: String(d.jobTitle ?? "Teaching position"),
      schoolName: String(d.schoolName ?? "Institution"),
      scheduledAt: iso(d.scheduledAt as Date | undefined),
      mode: (d.mode as DashboardInterview["mode"]) ?? "online",
      status: (d.status as DashboardInterview["status"]) ?? "scheduled",
      locationOrLink: d.locationOrLink ? String(d.locationOrLink) : undefined,
      instructions: d.instructions ? String(d.instructions) : undefined,
      result: (d.result as DashboardInterview["result"]) ?? "pending",
      candidateConfirmedAt: d.candidateConfirmedAt ? (d.candidateConfirmedAt as Date).toISOString() : undefined,
      candidateAttendanceNote: d.candidateAttendanceNote ? String(d.candidateAttendanceNote) : undefined,
      cancellationReason: d.cancellationReason ? String(d.cancellationReason) : undefined,
      notes: d.notes ? String(d.notes) : undefined,
    }));
  } catch (err) {
    logger.warn({ err, userId }, "Teacher interviews unavailable");
    return [];
  }
}

export async function listTeacherNotifications(userId: string): Promise<DashboardNotification[]> {
  try {
    await connectToDatabase();
    const items = await NotificationModel.find({ teacherUserId: userId }).sort({ createdAt: -1 }).limit(100).lean();
    return (items as Array<Record<string, unknown>>).map((n) => ({
      id: String(n._id),
      title: String(n.title ?? ""),
      body: String(n.body ?? ""),
      type: (n.type as DashboardNotification["type"]) ?? "system",
      read: !!n.read,
      createdAt: iso(n.createdAt as Date | undefined),
      href: n.href ? String(n.href) : undefined,
      priority: (n.priority as DashboardNotification["priority"]) ?? "normal",
      channel: (n.channel as DashboardNotification["channel"]) ?? "in_app",
    }));
  } catch (err) {
    logger.warn({ err, userId }, "Teacher notifications unavailable");
    return [];
  }
}

export async function markTeacherNotificationRead(userId: string, id: string, read = true): Promise<boolean> {
  if (!/^[a-fA-F0-9]{24}$/.test(id)) return false;
  try {
    await connectToDatabase();
    const res = await NotificationModel.updateOne(
      { _id: id, teacherUserId: userId },
      { $set: { read, readAt: read ? new Date() : null } },
    );
    return res.matchedCount > 0;
  } catch {
    return false;
  }
}

export async function markAllTeacherNotificationsRead(userId: string): Promise<number> {
  try {
    await connectToDatabase();
    const res = await NotificationModel.updateMany(
      { teacherUserId: userId, read: false },
      { $set: { read: true, readAt: new Date() } },
    );
    return res.modifiedCount;
  } catch {
    return 0;
  }
}

export async function listTeacherMessages(userId: string): Promise<DashboardMessage[]> {
  try {
    await connectToDatabase();
    const items = await MessageModel.find({ teacherUserId: userId }).sort({ createdAt: -1 }).limit(100).lean();
    return (items as Array<Record<string, unknown>>).map((m) => ({
      id: String(m._id),
      fromName: String(m.fromName ?? "System"),
      fromRole: m.fromRole ? String(m.fromRole) : undefined,
      subject: m.subject ? String(m.subject) : undefined,
      body: String(m.body ?? ""),
      read: !!m.read,
      createdAt: iso(m.createdAt as Date | undefined),
    }));
  } catch (err) {
    logger.warn({ err, userId }, "Teacher messages unavailable");
    return [];
  }
}
