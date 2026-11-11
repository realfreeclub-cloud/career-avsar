import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { InterviewModel, type Interview } from "@/lib/db/models/teacher/interview";
import { ApplicationModel } from "@/lib/db/models/teacher/application";
import { TeacherProfileModel } from "@/lib/db/models/teacher-profile";
import { NotificationModel } from "@/lib/db/models/teacher/notification";
import { PlacementModel } from "@/lib/db/models/admin/placement";
import type { Paged } from "@/types/admin";

export type AdminInterview = {
  id: string;
  teacherUserId: string;
  candidateName: string;
  candidateEmail?: string;
  candidateMobile?: string;
  applicationId?: string;
  jobId?: string;
  jobTitle: string;
  schoolName: string;
  scheduledAt: string;
  mode: "online" | "in_person" | "phone" | "hybrid" | "other";
  locationOrLink?: string;
  instructions?: string;
  status: "scheduled" | "confirmed" | "rescheduled" | "completed" | "cancelled" | "no_show";
  feedback?: {
    rating?: number;
    recommendation?: string;
    strengths?: string;
    improvements?: string;
    notes?: string;
    interviewerName?: string;
    submittedAt?: string;
  };
  result: "pending" | "selected" | "rejected" | "on_hold" | "reschedule_needed";
  candidateConfirmedAt?: string;
  candidateAttendanceNote?: string;
  rescheduleHistory?: Array<{
    id: string;
    previousScheduledAt: string;
    newScheduledAt: string;
    reason?: string;
    rescheduledByRole?: string;
    createdAt: string;
  }>;
  cancellationReason?: string;
  cancelledAt?: string;
  notes?: string;
  createdAt: string;
};

function mapInterview(d: Record<string, unknown>, profile?: Record<string, unknown>): AdminInterview {
  const name =
    (d.candidateName as string | undefined) ||
    (profile?.fullName as string | undefined) ||
    "Candidate Educator";

  const email = (d.candidateEmail as string | undefined) || (profile?.email as string | undefined);
  const mobile = (d.candidateMobile as string | undefined) || (profile?.mobile as string | undefined);

  const fb = d.feedback as Record<string, unknown> | undefined;
  const feedback = fb
    ? {
        rating: typeof fb.rating === "number" ? fb.rating : undefined,
        recommendation: fb.recommendation ? String(fb.recommendation) : undefined,
        strengths: fb.strengths ? String(fb.strengths) : undefined,
        improvements: fb.improvements ? String(fb.improvements) : undefined,
        notes: fb.notes ? String(fb.notes) : undefined,
        interviewerName: fb.interviewerName ? String(fb.interviewerName) : undefined,
        submittedAt: (fb.submittedAt as Date | undefined)?.toISOString?.(),
      }
    : undefined;

  const reschedules = Array.isArray(d.rescheduleHistory)
    ? (d.rescheduleHistory as Array<Record<string, unknown>>).map((r) => ({
        id: String(r._id || Math.random()),
        previousScheduledAt: (r.previousScheduledAt as Date | undefined)?.toISOString?.() ?? "",
        newScheduledAt: (r.newScheduledAt as Date | undefined)?.toISOString?.() ?? "",
        reason: r.reason ? String(r.reason) : undefined,
        rescheduledByRole: r.rescheduledByRole ? String(r.rescheduledByRole) : undefined,
        createdAt: (r.createdAt as Date | undefined)?.toISOString?.() ?? new Date().toISOString(),
      }))
    : undefined;

  return {
    id: String(d._id),
    teacherUserId: String(d.teacherUserId ?? ""),
    candidateName: name,
    candidateEmail: email,
    candidateMobile: mobile,
    applicationId: d.applicationId ? String(d.applicationId) : undefined,
    jobId: d.jobId ? String(d.jobId) : undefined,
    jobTitle: String(d.jobTitle ?? "Faculty Interview"),
    schoolName: String(d.schoolName ?? "Partner School"),
    scheduledAt: (d.scheduledAt as Date | undefined)?.toISOString?.() ?? new Date().toISOString(),
    mode: (d.mode as AdminInterview["mode"]) ?? "online",
    locationOrLink: d.locationOrLink ? String(d.locationOrLink) : undefined,
    instructions: d.instructions ? String(d.instructions) : undefined,
    status: (d.status as AdminInterview["status"]) ?? "scheduled",
    feedback,
    result: (d.result as AdminInterview["result"]) ?? "pending",
    candidateConfirmedAt: (d.candidateConfirmedAt as Date | undefined)?.toISOString?.(),
    candidateAttendanceNote: d.candidateAttendanceNote ? String(d.candidateAttendanceNote) : undefined,
    rescheduleHistory: reschedules,
    cancellationReason: d.cancellationReason ? String(d.cancellationReason) : undefined,
    cancelledAt: (d.cancelledAt as Date | undefined)?.toISOString?.(),
    notes: d.notes ? String(d.notes) : undefined,
    createdAt: (d.createdAt as Date | undefined)?.toISOString?.() ?? new Date().toISOString(),
  };
}

export async function listInterviewsAdmin(query: {
  status?: string;
  mode?: string;
  result?: string;
  teacherUserId?: string;
  q?: string;
  dateRange?: string;
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
}): Promise<Paged<AdminInterview>> {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(query.limit) || 20));
  const filter: Record<string, unknown> = {};

  if (query.status) filter.status = query.status;
  if (query.mode) filter.mode = query.mode;
  if (query.result) filter.result = query.result;
  if (query.teacherUserId) filter.teacherUserId = query.teacherUserId;

  // Calendar month filtering
  if (query.month && query.year) {
    const startOfMonth = new Date(Date.UTC(query.year, query.month - 1, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(query.year, query.month, 0, 23, 59, 59, 999));
    filter.scheduledAt = { $gte: startOfMonth, $lte: endOfMonth };
  } else if (query.dateRange) {
    const now = new Date();
    if (query.dateRange === "today") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      filter.scheduledAt = { $gte: start, $lte: end };
    } else if (query.dateRange === "this_week") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const start = new Date(now.setDate(diff));
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      filter.scheduledAt = { $gte: start, $lte: end };
    } else if (query.dateRange === "upcoming") {
      filter.scheduledAt = { $gte: new Date() };
    } else if (query.dateRange === "past") {
      filter.scheduledAt = { $lt: new Date() };
    }
  }

  if (query.q?.trim()) {
    const r = new RegExp(query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { jobTitle: r },
      { schoolName: r },
      { candidateName: r },
      { candidateEmail: r },
      { candidateMobile: r },
    ];
  }

  try {
    await connectToDatabase();
    const sortField = query.month && query.year ? { scheduledAt: 1 as const } : { scheduledAt: -1 as const };
    const [items, total] = await Promise.all([
      InterviewModel.find(filter)
        .sort(sortField)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      InterviewModel.countDocuments(filter),
    ]);

    // Pull teacher profile info if candidate name missing
    const missingProfiles = items.filter((i) => !i.candidateName).map((i) => i.teacherUserId);
    const profiles = missingProfiles.length
      ? await TeacherProfileModel.find({ userId: { $in: missingProfiles } }).lean()
      : [];
    const profileMap = new Map(profiles.map((p) => [String(p.userId), p]));

    const mapped = (items as Array<Record<string, unknown>>).map((i) =>
      mapInterview(i, profileMap.get(String(i.teacherUserId)) as Record<string, unknown> | undefined),
    );

    return {
      items: mapped,
      page: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  } catch {
    return { items: [], page: { page, limit, total: 0, totalPages: 1 } };
  }
}

export async function getInterviewAdmin(id: string): Promise<AdminInterview | null> {
  await connectToDatabase();
  const d = await InterviewModel.findById(id).lean();
  if (!d) return null;
  const p = await TeacherProfileModel.findOne({ userId: d.teacherUserId }).lean();
  return mapInterview(d as unknown as Record<string, unknown>, p as unknown as Record<string, unknown> | undefined);
}

export async function createInterviewAdmin(data: {
  teacherUserId: string;
  candidateName?: string;
  candidateEmail?: string;
  candidateMobile?: string;
  applicationId?: string;
  jobId?: string;
  jobTitle: string;
  schoolName: string;
  schoolId?: string;
  scheduledAt: string;
  mode?: "online" | "in_person" | "phone" | "hybrid" | "other";
  locationOrLink?: string;
  instructions?: string;
  notes?: string;
}): Promise<string> {
  await connectToDatabase();

  let name = data.candidateName;
  let email = data.candidateEmail;
  let mobile = data.candidateMobile;

  if (!name || !email) {
    const prof = await TeacherProfileModel.findOne({ userId: data.teacherUserId }).lean();
    if (prof) {
      name = name || prof.fullName || undefined;
      email = email || prof.email || undefined;
      mobile = mobile || prof.mobile || undefined;
    }
  }

  const scheduledDate = new Date(data.scheduledAt);
  const interview = await InterviewModel.create({
    teacherUserId: data.teacherUserId,
    candidateName: name || "Candidate Educator",
    candidateEmail: email,
    candidateMobile: mobile,
    applicationId: data.applicationId,
    jobId: data.jobId,
    jobTitle: data.jobTitle,
    schoolName: data.schoolName,
    schoolId: data.schoolId,
    scheduledAt: scheduledDate,
    mode: data.mode || "online",
    locationOrLink: data.locationOrLink,
    instructions: data.instructions,
    status: "scheduled",
    result: "pending",
    notes: data.notes,
  });

  // If application ID provided, link and transition status
  if (data.applicationId) {
    const app = await ApplicationModel.findById(data.applicationId);
    if (app) {
      app.status = "interview_scheduled";
      app.interviewId = interview._id as unknown as import("mongoose").Types.ObjectId;
      app.interviewScheduledAt = scheduledDate;
      app.interviewMode = data.mode || "online";
      app.statusHistory.push({
        status: "interview_scheduled",
        changedByRole: "admin",
        note: `Interview scheduled on ${scheduledDate.toLocaleString("en-IN")} (${data.mode || "online"})`,
        createdAt: new Date(),
      } as unknown as import("mongoose").Types.Subdocument);
      await app.save();
    }
  }

  // Notify teacher
  await NotificationModel.create({
    teacherUserId: data.teacherUserId,
    title: "Interview Round Scheduled",
    body: `Your interview for ${data.jobTitle} at ${data.schoolName} has been scheduled on ${scheduledDate.toLocaleString("en-IN")}.`,
    type: "interview",
    href: "/teacher/dashboard/interviews",
  }).catch(() => {});

  return String(interview._id);
}

export async function rescheduleInterviewAdmin(
  id: string,
  data: {
    scheduledAt: string;
    mode?: "online" | "in_person" | "phone" | "hybrid" | "other";
    locationOrLink?: string;
    instructions?: string;
    reason?: string;
  },
  actorUserId?: string,
): Promise<boolean> {
  await connectToDatabase();
  const iv = await InterviewModel.findById(id);
  if (!iv) return false;

  const previousDate = iv.scheduledAt;
  const newDate = new Date(data.scheduledAt);
  if (isNaN(newDate.getTime())) return false;

  iv.rescheduleHistory.push({
    previousScheduledAt: previousDate,
    newScheduledAt: newDate,
    reason: data.reason?.trim() || "Rescheduled by hiring administration",
    rescheduledByRole: "admin",
    createdAt: new Date(),
  } as unknown as import("mongoose").Types.Subdocument);

  iv.scheduledAt = newDate;
  if (data.mode) iv.mode = data.mode;
  if (data.locationOrLink !== undefined) iv.locationOrLink = data.locationOrLink;
  if (data.instructions !== undefined) iv.instructions = data.instructions;
  iv.status = "rescheduled";

  await iv.save();

  // Update application if linked
  if (iv.applicationId) {
    const app = await ApplicationModel.findById(iv.applicationId);
    if (app) {
      app.interviewScheduledAt = newDate;
      if (data.mode) app.interviewMode = data.mode;
      app.statusHistory.push({
        status: "interview_scheduled",
        changedBy: actorUserId as unknown as import("mongoose").Types.ObjectId,
        changedByRole: "admin",
        note: `Interview rescheduled to ${newDate.toLocaleString("en-IN")}. Reason: ${data.reason || "Administrative update"}`,
        createdAt: new Date(),
      } as unknown as import("mongoose").Types.Subdocument);
      await app.save();
    }
  }

  // Notify candidate
  await NotificationModel.create({
    teacherUserId: iv.teacherUserId,
    title: "Interview Schedule Updated",
    body: `Your interview for ${iv.jobTitle} has been rescheduled to ${newDate.toLocaleString("en-IN")}. Reason: ${data.reason || "Operational adjustment"}.`,
    type: "interview",
    href: "/teacher/dashboard/interviews",
  }).catch(() => {});

  return true;
}

export async function cancelInterviewAdmin(
  id: string,
  reason: string,
  actorUserId?: string,
): Promise<boolean> {
  await connectToDatabase();
  const iv = await InterviewModel.findById(id);
  if (!iv) return false;

  iv.status = "cancelled";
  iv.cancellationReason = reason.trim() || "Cancelled by hiring administration";
  iv.cancelledAt = new Date();
  await iv.save();

  // Update application if linked
  if (iv.applicationId) {
    const app = await ApplicationModel.findById(iv.applicationId);
    if (app) {
      app.statusHistory.push({
        status: app.status,
        changedBy: actorUserId as unknown as import("mongoose").Types.ObjectId,
        changedByRole: "admin",
        note: `Interview round cancelled: ${reason}`,
        createdAt: new Date(),
      } as unknown as import("mongoose").Types.Subdocument);
      await app.save();
    }
  }

  // Notify candidate
  await NotificationModel.create({
    teacherUserId: iv.teacherUserId,
    title: "Interview Round Cancelled",
    body: `Your scheduled interview for ${iv.jobTitle} at ${iv.schoolName} has been cancelled: ${reason}.`,
    type: "interview",
    href: "/teacher/dashboard/interviews",
  }).catch(() => {});

  return true;
}

export async function recordInterviewFeedbackAdmin(
  id: string,
  data: {
    rating?: number;
    recommendation?: "hire" | "strong_hire" | "consider" | "reject" | "re_evaluate";
    strengths?: string;
    improvements?: string;
    notes?: string;
    interviewerName?: string;
    result: "pending" | "selected" | "rejected" | "on_hold" | "reschedule_needed";
    // Optional placement auto-record details
    autoCreatePlacement?: boolean;
    joiningDate?: string;
    salaryOfferedInr?: number;
  },
  actorUserId?: string,
): Promise<{ success: boolean; placementId?: string }> {
  await connectToDatabase();
  const iv = await InterviewModel.findById(id);
  if (!iv) return { success: false };

  iv.feedback = {
    rating: data.rating,
    recommendation: data.recommendation || "",
    strengths: data.strengths?.trim(),
    improvements: data.improvements?.trim(),
    notes: data.notes?.trim(),
    interviewerName: data.interviewerName?.trim() || "Panel Reviewer",
    submittedAt: new Date(),
  } as unknown as Interview["feedback"];

  iv.result = data.result;

  // If marked selected or completed
  if (data.result === "selected" || data.result === "rejected") {
    iv.status = "completed";
  }

  await iv.save();

  let placementId: string | undefined;

  // Handle Selection & Placement transition
  if (data.result === "selected") {
    if (iv.applicationId) {
      const app = await ApplicationModel.findById(iv.applicationId);
      if (app) {
        app.status = "selected";
        app.statusHistory.push({
          status: "selected",
          changedBy: actorUserId as unknown as import("mongoose").Types.ObjectId,
          changedByRole: "admin",
          note: `Candidate selected following interview evaluation by ${data.interviewerName || "panel"}.`,
          createdAt: new Date(),
        } as unknown as import("mongoose").Types.Subdocument);
        await app.save();
      }
    }

    // Auto-create Placement Record if requested or joining date provided
    if (data.autoCreatePlacement && data.joiningDate && iv.jobId) {
      const placement = await PlacementModel.create({
        teacherUserId: iv.teacherUserId,
        teacherName: iv.candidateName || "Selected Educator",
        candidateEmail: iv.candidateEmail || undefined,
        candidateMobile: iv.candidateMobile || undefined,
        jobId: iv.jobId,
        jobTitle: iv.jobTitle,
        schoolId: iv.schoolId || undefined,
        schoolName: iv.schoolName,
        applicationId: iv.applicationId || undefined,
        interviewId: iv._id,
        selectionDate: new Date(),
        joiningDate: new Date(data.joiningDate),
        salaryOfferedInr: data.salaryOfferedInr || undefined,
        status: "offered",
        adminNotes: `Placement generated from interview evaluation (${data.recommendation || "selected"}).`,
      });
      placementId = String((placement as { _id: unknown })._id);
    }

    // Congratulatory Notification to candidate
    await NotificationModel.create({
      teacherUserId: iv.teacherUserId,
      title: "Congratulations! Candidate Selected",
      body: `You have been selected for ${iv.jobTitle} at ${iv.schoolName}! Our hiring office will contact you with offer details.`,
      type: "application",
      href: "/teacher/dashboard/applications",
    }).catch(() => {});
  } else if (data.result === "rejected") {
    if (iv.applicationId) {
      const app = await ApplicationModel.findById(iv.applicationId);
      if (app) {
        app.status = "rejected";
        app.statusHistory.push({
          status: "rejected",
          changedBy: actorUserId as unknown as import("mongoose").Types.ObjectId,
          changedByRole: "admin",
          note: `Interview outcome: not selected.`,
          createdAt: new Date(),
        } as unknown as import("mongoose").Types.Subdocument);
        await app.save();
      }
    }
    await NotificationModel.create({
      teacherUserId: iv.teacherUserId,
      title: "Interview Outcome Update",
      body: `Thank you for participating in the interview for ${iv.jobTitle} at ${iv.schoolName}. The hiring team has concluded evaluations.`,
      type: "application",
      href: "/teacher/dashboard/applications",
    }).catch(() => {});
  }

  return { success: true, placementId };
}

export async function sendInterviewInvitationAdmin(
  id: string,
): Promise<boolean> {
  await connectToDatabase();
  const iv = await InterviewModel.findById(id);
  if (!iv) return false;

  await NotificationModel.create({
    teacherUserId: iv.teacherUserId,
    title: `Interview Invitation: ${iv.jobTitle}`,
    body: `Reminder: Your interview is on ${new Date(iv.scheduledAt).toLocaleString("en-IN")}. Mode: ${iv.mode.replace(/_/g, " ")}. Location/Link: ${iv.locationOrLink || "See details in dashboard"}.`,
    type: "interview",
    href: "/teacher/dashboard/interviews",
  });

  return true;
}

export async function updateInterviewAdmin(id: string, data: Record<string, unknown>) {
  await connectToDatabase();
  return !!(await InterviewModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean());
}
