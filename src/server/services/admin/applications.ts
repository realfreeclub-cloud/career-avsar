import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ApplicationModel, type Application } from "@/lib/db/models/teacher/application";
import { TeacherProfileModel } from "@/lib/db/models/teacher-profile";
import { InterviewModel } from "@/lib/db/models/teacher/interview";
import { NotificationModel } from "@/lib/db/models/teacher/notification";
import { CommunicationLogModel } from "@/lib/db/models/admin/communication-log";
import { logAdminAction } from "@/server/services/admin/audit";
import type { Paged } from "@/types/admin";

export type AdminApplication = {
  id: string;
  teacherUserId: string;
  teacherName?: string;
  candidateEmail?: string;
  candidateMobile?: string;
  candidateCity?: string;
  candidateState?: string;
  qualification?: string;
  bed?: boolean;
  ctet?: boolean;
  experienceYears?: number;
  resumeUrl?: string;
  resumeOriginalName?: string;
  jobId: string;
  jobTitle: string;
  schoolName: string;
  status: string;
  coverNote?: string;
  withdrawalReason?: string;
  appliedAt: string;
  createdAt: string;
  statusHistory?: Array<{
    status: string;
    changedByRole?: string;
    note?: string;
    createdAt: string;
  }>;
  internalNotes?: Array<{
    id: string;
    authorName: string;
    note: string;
    createdAt: string;
  }>;
  candidateMessages?: Array<{
    id: string;
    senderName: string;
    message: string;
    createdAt: string;
  }>;
  sharedWithSchools?: Array<{
    id: string;
    schoolName: string;
    contactPerson: string;
    sharedAt: string;
    sharedByName?: string;
    includedFields?: string[];
    authorizationNote?: string;
  }>;
  interviewScheduledAt?: string;
  interviewMode?: string;
};

function mapApplication(a: Record<string, unknown>, profile?: Record<string, unknown>): AdminApplication {
  const snap = a.snapshot as Record<string, unknown> | undefined;
  const edu = (profile?.education as Record<string, unknown> | undefined) || {};
  const exp = (profile?.experience as Record<string, unknown> | undefined) || {};
  const loc = (profile?.location as Record<string, unknown> | undefined) || {};

  const name =
    (snap?.fullName as string | undefined) ||
    (profile?.fullName as string | undefined) ||
    (a.teacherName as string | undefined) ||
    "Candidate Educator";

  const email = (snap?.email as string | undefined) || (profile?.email as string | undefined);
  const mobile = (snap?.mobile as string | undefined) || (profile?.mobile as string | undefined);
  const city = (snap?.city as string | undefined) || (loc.city as string | undefined);
  const state = (snap?.state as string | undefined) || (loc.state as string | undefined);
  const qual = (snap?.highestQualification as string | undefined) || (edu.highestQualification as string | undefined);
  const bed = typeof snap?.bed === "boolean" ? snap.bed : !!edu.bed;
  const ctet = typeof snap?.ctet === "boolean" ? snap.ctet : !!edu.ctet;
  const expYears = typeof snap?.totalExperienceYears === "number" ? snap.totalExperienceYears : (exp.totalYears as number | undefined) ?? 0;

  const history = Array.isArray(a.statusHistory)
    ? (a.statusHistory as Array<Record<string, unknown>>).map((h) => ({
        status: String(h.status ?? ""),
        changedByRole: h.changedByRole ? String(h.changedByRole) : undefined,
        note: h.note ? String(h.note) : undefined,
        createdAt: (h.createdAt as Date | undefined)?.toISOString?.() ?? new Date().toISOString(),
      }))
    : undefined;

  const notes = Array.isArray(a.internalNotes)
    ? (a.internalNotes as Array<Record<string, unknown>>).map((n) => ({
        id: String(n._id),
        authorName: String(n.authorName ?? "Admin"),
        note: String(n.note ?? ""),
        createdAt: (n.createdAt as Date | undefined)?.toISOString?.() ?? new Date().toISOString(),
      }))
    : undefined;

  const messages = Array.isArray(a.candidateMessages)
    ? (a.candidateMessages as Array<Record<string, unknown>>).map((m) => ({
        id: String(m._id),
        senderName: String(m.senderName ?? "Recruiter"),
        message: String(m.message ?? ""),
        createdAt: (m.createdAt as Date | undefined)?.toISOString?.() ?? new Date().toISOString(),
      }))
    : undefined;

  const shared = Array.isArray(a.sharedWithSchools)
    ? (a.sharedWithSchools as Array<Record<string, unknown>>).map((s) => ({
        id: String(s._id || s.id),
        schoolName: String(s.schoolName ?? ""),
        contactPerson: String(s.contactPerson ?? ""),
        sharedAt: (s.sharedAt as Date | undefined)?.toISOString?.() ?? new Date().toISOString(),
        sharedByName: s.sharedByName ? String(s.sharedByName) : undefined,
        includedFields: Array.isArray(s.includedFields) ? (s.includedFields as string[]) : [],
        authorizationNote: s.authorizationNote ? String(s.authorizationNote) : undefined,
      }))
    : undefined;

  return {
    id: String(a._id),
    teacherUserId: String(a.teacherUserId ?? ""),
    teacherName: name,
    candidateEmail: email,
    candidateMobile: mobile,
    candidateCity: city,
    candidateState: state,
    qualification: qual,
    bed,
    ctet,
    experienceYears: expYears,
    resumeUrl: (snap?.resumeUrl as string | undefined) || undefined,
    resumeOriginalName: (snap?.resumeOriginalName as string | undefined) || undefined,
    jobId: String(a.jobId ?? ""),
    jobTitle: String(a.jobTitle ?? ""),
    schoolName: String(a.schoolName ?? ""),
    status: String(a.status ?? "submitted"),
    coverNote: a.coverNote ? String(a.coverNote) : undefined,
    withdrawalReason: a.withdrawalReason ? String(a.withdrawalReason) : undefined,
    appliedAt: (a.appliedAt as Date | undefined)?.toISOString?.() ?? (a.createdAt as Date | undefined)?.toISOString?.() ?? new Date().toISOString(),
    createdAt: (a.createdAt as Date | undefined)?.toISOString?.() ?? new Date().toISOString(),
    statusHistory: history,
    internalNotes: notes,
    candidateMessages: messages,
    sharedWithSchools: shared,
    interviewScheduledAt: (a.interviewScheduledAt as Date | undefined)?.toISOString?.(),
    interviewMode: a.interviewMode ? String(a.interviewMode) : undefined,
  };
}

export async function listApplicationsAdmin(query: {
  q?: string;
  status?: string;
  jobId?: string;
  teacherUserId?: string;
  page?: number;
  limit?: number;
}): Promise<Paged<AdminApplication>> {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const filter: Record<string, unknown> = {};

  if (query.status) {
    if (query.status === "pending") {
      filter.status = { $in: ["submitted", "applied", "pending", "under_review"] };
    } else {
      filter.status = query.status;
    }
  }

  if (query.jobId) filter.jobId = query.jobId;
  if (query.teacherUserId) filter.teacherUserId = query.teacherUserId;

  if (query.q?.trim()) {
    const r = new RegExp(query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { jobTitle: r },
      { schoolName: r },
      { "snapshot.fullName": r },
      { "snapshot.email": r },
      { "snapshot.mobile": r },
    ];
  }

  try {
    await connectToDatabase();
    const [items, total] = await Promise.all([
      ApplicationModel.find(filter)
        .sort({ appliedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ApplicationModel.countDocuments(filter),
    ]);

    // Pull teacher profiles for any missing snapshot info
    const teacherUserIds = items.map((i) => i.teacherUserId);
    const profiles = await TeacherProfileModel.find({ userId: { $in: teacherUserIds } }).lean();
    const profileMap = new Map(profiles.map((p) => [String(p.userId), p]));

    const mapped = (items as Array<Record<string, unknown>>).map((i) =>
      mapApplication(i, profileMap.get(String(i.teacherUserId)) as Record<string, unknown> | undefined),
    );

    return {
      items: mapped,
      page: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  } catch {
    return { items: [], page: { page, limit, total: 0, totalPages: 1 } };
  }
}

export async function getApplicationAdmin(id: string): Promise<AdminApplication | null> {
  await connectToDatabase();
  const a = await ApplicationModel.findById(id).lean();
  if (!a) return null;
  const p = await TeacherProfileModel.findOne({ userId: a.teacherUserId }).lean();
  return mapApplication(a as unknown as Record<string, unknown>, p as unknown as Record<string, unknown> | undefined);
}

export async function updateApplicationStatusAdmin(
  id: string,
  status: string,
  actorUserId?: string,
  options?: {
    internalReason?: string;
    candidateVisibleExplanation?: string;
    note?: string;
  } | string,
): Promise<boolean> {
  await connectToDatabase();
  const app = await ApplicationModel.findById(id);
  if (!app) return false;

  const validStatuses = [
    "submitted",
    "under_review",
    "shortlisted",
    "on_hold",
    "interview_scheduled",
    "interview_completed",
    "selected",
    "rejected",
    "withdrawn",
  ];
  if (!validStatuses.includes(status) && !["applied", "pending", "interview", "offered"].includes(status)) {
    return false;
  }

  const previousStatus = app.status;
  app.status = status as Application["status"];

  const opts = typeof options === "string" ? { note: options } : options || {};
  const internalReason = opts.internalReason || opts.note;
  const candidateVisibleExplanation = opts.candidateVisibleExplanation;

  // Push to status history
  app.statusHistory.push({
    status,
    previousStatus,
    changedBy: actorUserId as unknown as import("mongoose").Types.ObjectId,
    changedByRole: "admin",
    internalReason,
    candidateVisibleExplanation,
    note: candidateVisibleExplanation || internalReason || `Status updated to ${status.replace(/_/g, " ")}`,
    createdAt: new Date(),
  } as unknown as import("mongoose").Types.Subdocument);

  await app.save();

  // Notify candidate if status is relevant
  const notifyStatuses = ["under_review", "shortlisted", "on_hold", "interview_scheduled", "selected", "rejected"];
  if (notifyStatuses.includes(status)) {
    const formatted = status.replace(/_/g, " ").toUpperCase();
    const explanationText = candidateVisibleExplanation ? ` ${candidateVisibleExplanation}` : "";
    await NotificationModel.create({
      teacherUserId: app.teacherUserId,
      title: `Application ${formatted}`,
      body: `Your application for ${app.jobTitle} at ${app.schoolName} is now ${status.replace(/_/g, " ")}.${explanationText}`,
      type: "application",
      href: "/teacher/dashboard/applications",
    }).catch(() => {});
  }

  return true;
}

export async function shareCandidateWithSchoolAdmin(
  applicationId: string,
  params: {
    schoolId?: string;
    schoolName?: string;
    contactPerson: string;
    contactEmail?: string;
    contactPhone?: string;
    channel?: "email" | "whatsapp" | "phone" | "meeting" | "other";
    includedFields: string[];
    authorizationNote: string;
    actorUserId: string;
    actorName?: string;
  },
): Promise<{ ok: boolean; message: string }> {
  await connectToDatabase();
  const app = await ApplicationModel.findById(applicationId);
  if (!app) return { ok: false, message: "Application not found" };

  const targetSchoolName = params.schoolName || app.schoolName;
  const actorName = params.actorName || "Admin Officer";

  // Push to application sharedWithSchools
  app.sharedWithSchools.push({
    schoolId: params.schoolId ? (params.schoolId as unknown as import("mongoose").Types.ObjectId) : undefined,
    schoolName: targetSchoolName,
    contactPerson: params.contactPerson,
    sharedAt: new Date(),
    sharedByUserId: params.actorUserId as unknown as import("mongoose").Types.ObjectId,
    sharedByName: actorName,
    includedFields: params.includedFields,
    authorizationNote: params.authorizationNote,
  } as unknown as import("mongoose").Types.Subdocument);

  await app.save();

  // Log in CommunicationLogModel
  const providerMessageId = `share_${app._id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  await CommunicationLogModel.create({
    recipientType: "school",
    recipientName: `${targetSchoolName} (${params.contactPerson})`,
    recipientEmail: params.contactEmail,
    recipientMobile: params.contactPhone,
    schoolId: params.schoolId ? (params.schoolId as unknown as import("mongoose").Types.ObjectId) : undefined,
    schoolName: targetSchoolName,
    contactPerson: params.contactPerson,
    channel: params.channel || "email",
    event: "candidate_dossier_shared",
    subject: `Candidate Dossier: ${app.snapshot?.fullName || "Candidate"} for ${app.jobTitle}`,
    body: `Admin ${actorName} authorized sharing candidate profile (${params.includedFields.join(", ")}) with ${targetSchoolName} contact ${params.contactPerson}. Note: ${params.authorizationNote}`,
    provider: "manual_crm",
    providerMessageId,
    status: "logged",
    relatedJobId: app.jobId,
    relatedJobTitle: app.jobTitle,
    relatedApplicationId: app._id,
    recordedByUserId: params.actorUserId as unknown as import("mongoose").Types.ObjectId,
    recordedByName: actorName,
    candidateSharingDetails: {
      candidateName: app.snapshot?.fullName,
      candidateEmail: params.includedFields.includes("contact") ? app.snapshot?.email : undefined,
      candidateMobile: params.includedFields.includes("contact") ? app.snapshot?.mobile : undefined,
      highestQualification: app.snapshot?.highestQualification,
      experienceYears: app.snapshot?.totalExperienceYears,
      resumeUrl: params.includedFields.includes("resume") ? app.snapshot?.resumeUrl : undefined,
      includedFields: params.includedFields,
      authorizationNote: params.authorizationNote,
    },
  }).catch(() => {});

  await logAdminAction({
    action: "candidate_dossier_shared",
    entityType: "application",
    entityId: applicationId,
    summary: `Shared candidate dossier with ${targetSchoolName} (${params.contactPerson})`,
    actorUserId: params.actorUserId,
  }).catch(() => {});

  return { ok: true, message: `Candidate dossier successfully shared with ${targetSchoolName}` };
}

export async function addApplicationInternalNoteAdmin(
  id: string,
  actorUserId: string,
  authorName: string,
  note: string,
): Promise<boolean> {
  await connectToDatabase();
  const app = await ApplicationModel.findById(id);
  if (!app) return false;

  app.internalNotes.push({
    authorUserId: actorUserId as unknown as import("mongoose").Types.ObjectId,
    authorName: authorName || "Admin Reviewer",
    note: note.trim(),
    createdAt: new Date(),
  } as unknown as import("mongoose").Types.Subdocument);

  await app.save();
  return true;
}

export async function sendApplicationCandidateMessageAdmin(
  id: string,
  senderUserId: string,
  senderName: string,
  message: string,
): Promise<boolean> {
  await connectToDatabase();
  const app = await ApplicationModel.findById(id);
  if (!app) return false;

  app.candidateMessages.push({
    senderUserId: senderUserId as unknown as import("mongoose").Types.ObjectId,
    senderName: senderName || "Hiring Panel",
    message: message.trim(),
    createdAt: new Date(),
  } as unknown as import("mongoose").Types.Subdocument);

  await app.save();

  // Also dispatch a high-priority dashboard notification to the candidate
  await NotificationModel.create({
    teacherUserId: app.teacherUserId,
    title: `Recruiter Message: ${app.jobTitle}`,
    body: `${senderName || "Hiring Officer"}: "${message.slice(0, 120)}${message.length > 120 ? "…" : ""}"`,
    type: "message",
    href: "/teacher/dashboard/applications",
  }).catch(() => {});

  return true;
}

export async function scheduleApplicationInterviewAdmin(
  id: string,
  actorUserId: string,
  data: {
    scheduledAt: string;
    mode: "online" | "in_person" | "phone" | "other";
    locationOrLink?: string;
    notes?: string;
  },
): Promise<boolean> {
  await connectToDatabase();
  const app = await ApplicationModel.findById(id);
  if (!app) return false;

  const scheduledDate = new Date(data.scheduledAt);
  if (isNaN(scheduledDate.getTime())) return false;

  // Create Interview document
  const interview = await InterviewModel.create({
    teacherUserId: app.teacherUserId,
    applicationId: app._id,
    jobId: app.jobId,
    jobTitle: app.jobTitle,
    schoolName: app.schoolName,
    scheduledAt: scheduledDate,
    mode: data.mode,
    locationOrLink: data.locationOrLink,
    notes: data.notes,
    status: "scheduled",
  });

  // Update application
  app.status = "interview_scheduled";
  app.interviewId = interview._id as unknown as import("mongoose").Types.ObjectId;
  app.interviewScheduledAt = scheduledDate;
  app.interviewMode = data.mode;

  app.statusHistory.push({
    status: "interview_scheduled",
    changedBy: actorUserId as unknown as import("mongoose").Types.ObjectId,
    changedByRole: "admin",
    note: `Interview scheduled for ${scheduledDate.toLocaleString("en-IN")} (${data.mode})`,
    createdAt: new Date(),
  } as unknown as import("mongoose").Types.Subdocument);

  await app.save();

  // Notify teacher
  await NotificationModel.create({
    teacherUserId: app.teacherUserId,
    title: "Interview Scheduled",
    body: `Interview scheduled for ${app.jobTitle} at ${app.schoolName} on ${scheduledDate.toLocaleString("en-IN")}.`,
    type: "interview",
    href: "/teacher/dashboard/interviews",
  }).catch(() => {});

  return true;
}

export async function bulkUpdateApplicationsStatusAdmin(
  ids: string[],
  status: string,
  actorUserId: string,
  note?: string,
): Promise<{ updatedCount: number }> {
  await connectToDatabase();
  let updatedCount = 0;
  for (const id of ids) {
    const success = await updateApplicationStatusAdmin(id, status, actorUserId, note);
    if (success) updatedCount++;
  }
  return { updatedCount };
}
