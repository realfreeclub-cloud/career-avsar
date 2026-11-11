import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { PlacementModel } from "@/lib/db/models/admin/placement";
import { ApplicationModel } from "@/lib/db/models/teacher/application";
import { NotificationModel } from "@/lib/db/models/teacher/notification";
import type { Paged } from "@/types/admin";

export type AdminPlacement = {
  id: string;
  teacherUserId: string;
  teacherName: string;
  candidateEmail?: string;
  candidateMobile?: string;
  jobId: string;
  jobTitle: string;
  schoolId?: string;
  schoolName: string;
  applicationId?: string;
  interviewId?: string;
  selectionDate: string;
  joiningDate: string;
  actualJoiningDate?: string;
  salaryOfferedInr?: number;
  status: "offered" | "offer_accepted" | "joined" | "declined" | "deferred" | "backed_out" | "completed";
  offerLetterUrl?: string;
  joiningStatusRemarks?: string;
  adminNotes?: string;
  createdAt: string;
};

export type PlacementStats = {
  total: number;
  offered: number;
  accepted: number;
  joined: number;
  declined: number;
  placementRate: number;
  averageSalaryInr: number;
};

function mapPlacement(d: Record<string, unknown>): AdminPlacement {
  return {
    id: String(d._id),
    teacherUserId: String(d.teacherUserId ?? ""),
    teacherName: String(d.teacherName ?? "Selected Candidate"),
    candidateEmail: d.candidateEmail ? String(d.candidateEmail) : undefined,
    candidateMobile: d.candidateMobile ? String(d.candidateMobile) : undefined,
    jobId: String(d.jobId ?? ""),
    jobTitle: String(d.jobTitle ?? "Faculty Position"),
    schoolId: d.schoolId ? String(d.schoolId) : undefined,
    schoolName: String(d.schoolName ?? "Partner School"),
    applicationId: d.applicationId ? String(d.applicationId) : undefined,
    interviewId: d.interviewId ? String(d.interviewId) : undefined,
    selectionDate: (d.selectionDate as Date | undefined)?.toISOString?.() ?? (d.createdAt as Date | undefined)?.toISOString?.() ?? new Date().toISOString(),
    joiningDate: (d.joiningDate as Date | undefined)?.toISOString?.() ?? new Date().toISOString(),
    actualJoiningDate: (d.actualJoiningDate as Date | undefined)?.toISOString?.(),
    salaryOfferedInr: typeof d.salaryOfferedInr === "number" ? d.salaryOfferedInr : undefined,
    status: (d.status as AdminPlacement["status"]) ?? "offered",
    offerLetterUrl: d.offerLetterUrl ? String(d.offerLetterUrl) : undefined,
    joiningStatusRemarks: d.joiningStatusRemarks ? String(d.joiningStatusRemarks) : undefined,
    adminNotes: d.adminNotes ? String(d.adminNotes) : (d.notes ? String(d.notes) : undefined),
    createdAt: (d.createdAt as Date | undefined)?.toISOString?.() ?? new Date().toISOString(),
  };
}

export async function listPlacementsAdmin(query: {
  status?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<Paged<AdminPlacement> & { stats: PlacementStats }> {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const filter: Record<string, unknown> = {};

  if (query.status) filter.status = query.status;

  if (query.q?.trim()) {
    const r = new RegExp(query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { teacherName: r },
      { schoolName: r },
      { jobTitle: r },
      { candidateEmail: r },
      { candidateMobile: r },
    ];
  }

  try {
    await connectToDatabase();
    const [items, total, allForStats] = await Promise.all([
      PlacementModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      PlacementModel.countDocuments(filter),
      PlacementModel.find({}, { status: 1, salaryOfferedInr: 1 }).lean(),
    ]);

    // Aggregate statistics
    let offeredCount = 0;
    let acceptedCount = 0;
    let joinedCount = 0;
    let declinedCount = 0;
    let salarySum = 0;
    let salaryCount = 0;

    for (const p of allForStats) {
      if (p.status === "offered") offeredCount++;
      else if (p.status === "offer_accepted") acceptedCount++;
      else if (p.status === "joined" || p.status === "completed") joinedCount++;
      else if (p.status === "declined" || p.status === "backed_out") declinedCount++;

      if (typeof p.salaryOfferedInr === "number" && p.salaryOfferedInr > 0) {
        salarySum += p.salaryOfferedInr;
        salaryCount++;
      }
    }

    const totalAll = allForStats.length;
    const successfulPlacements = acceptedCount + joinedCount;
    const placementRate = totalAll > 0 ? Math.round((successfulPlacements / totalAll) * 100) : 0;
    const averageSalaryInr = salaryCount > 0 ? Math.round(salarySum / salaryCount) : 0;

    const stats: PlacementStats = {
      total: totalAll,
      offered: offeredCount,
      accepted: acceptedCount,
      joined: joinedCount,
      declined: declinedCount,
      placementRate,
      averageSalaryInr,
    };

    return {
      items: (items as Array<Record<string, unknown>>).map(mapPlacement),
      page: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      stats,
    };
  } catch {
    return {
      items: [],
      page: { page, limit, total: 0, totalPages: 1 },
      stats: { total: 0, offered: 0, accepted: 0, joined: 0, declined: 0, placementRate: 0, averageSalaryInr: 0 },
    };
  }
}

export async function getPlacementAdmin(id: string): Promise<AdminPlacement | null> {
  await connectToDatabase();
  const d = await PlacementModel.findById(id).lean();
  if (!d) return null;
  return mapPlacement(d as unknown as Record<string, unknown>);
}

export async function createPlacementAdmin(data: {
  teacherUserId: string;
  teacherName: string;
  candidateEmail?: string;
  candidateMobile?: string;
  jobId: string;
  jobTitle: string;
  schoolId?: string;
  schoolName: string;
  applicationId?: string;
  interviewId?: string;
  selectionDate?: string;
  joiningDate: string;
  actualJoiningDate?: string;
  salaryOfferedInr?: number;
  status?: "offered" | "offer_accepted" | "joined" | "declined" | "deferred" | "backed_out" | "completed";
  offerLetterUrl?: string;
  joiningStatusRemarks?: string;
  adminNotes?: string;
}): Promise<string> {
  await connectToDatabase();

  const doc = await PlacementModel.create({
    teacherUserId: data.teacherUserId,
    teacherName: data.teacherName.trim(),
    candidateEmail: data.candidateEmail?.trim(),
    candidateMobile: data.candidateMobile?.trim(),
    jobId: data.jobId,
    jobTitle: data.jobTitle.trim(),
    schoolId: data.schoolId,
    schoolName: data.schoolName.trim(),
    applicationId: data.applicationId,
    interviewId: data.interviewId,
    selectionDate: data.selectionDate ? new Date(data.selectionDate) : new Date(),
    joiningDate: new Date(data.joiningDate),
    actualJoiningDate: data.actualJoiningDate ? new Date(data.actualJoiningDate) : undefined,
    salaryOfferedInr: data.salaryOfferedInr,
    status: data.status || "offered",
    offerLetterUrl: data.offerLetterUrl?.trim(),
    joiningStatusRemarks: data.joiningStatusRemarks?.trim(),
    adminNotes: data.adminNotes?.trim(),
  });

  // Notify candidate about formal placement offer
  await NotificationModel.create({
    teacherUserId: data.teacherUserId,
    title: `Formal Placement Offer: ${data.jobTitle}`,
    body: `Congratulations! Official placement record created for ${data.jobTitle} at ${data.schoolName}. Expected joining date: ${new Date(data.joiningDate).toLocaleDateString("en-IN")}.`,
    type: "application",
    href: "/teacher/dashboard/applications",
  }).catch(() => {});

  return String(doc._id);
}

export async function updatePlacementAdmin(
  id: string,
  data: {
    status?: "offered" | "offer_accepted" | "joined" | "declined" | "deferred" | "backed_out" | "completed";
    joiningDate?: string;
    actualJoiningDate?: string;
    salaryOfferedInr?: number;
    joiningStatusRemarks?: string;
    adminNotes?: string;
    offerLetterUrl?: string;
  },
  actorUserId?: string,
): Promise<boolean> {
  await connectToDatabase();
  const placement = await PlacementModel.findById(id);
  if (!placement) return false;

  const previousStatus = placement.status;

  if (data.status) placement.status = data.status;
  if (data.joiningDate) placement.joiningDate = new Date(data.joiningDate);
  if (data.actualJoiningDate) placement.actualJoiningDate = new Date(data.actualJoiningDate);
  if (data.salaryOfferedInr !== undefined) placement.salaryOfferedInr = data.salaryOfferedInr;
  if (data.joiningStatusRemarks !== undefined) placement.joiningStatusRemarks = data.joiningStatusRemarks;
  if (data.adminNotes !== undefined) placement.adminNotes = data.adminNotes;
  if (data.offerLetterUrl !== undefined) placement.offerLetterUrl = data.offerLetterUrl;

  await placement.save();

  // If status changed to joined or accepted, update linked application status
  if (data.status && data.status !== previousStatus) {
    if (placement.applicationId) {
      const app = await ApplicationModel.findById(placement.applicationId);
      if (app) {
        if (data.status === "joined") {
          app.status = "selected";
        }
        app.statusHistory.push({
          status: app.status,
          changedBy: actorUserId as unknown as import("mongoose").Types.ObjectId,
          changedByRole: "admin",
          note: `Placement status changed to ${data.status.replace(/_/g, " ")}. Remarks: ${data.joiningStatusRemarks || "Updated by admin"}`,
          createdAt: new Date(),
        } as unknown as import("mongoose").Types.Subdocument);
        await app.save();
      }
    }

    // Notify candidate
    if (data.status === "joined") {
      await NotificationModel.create({
        teacherUserId: placement.teacherUserId,
        title: "Welcome! Joining Formally Recorded",
        body: `Your formal joining as ${placement.jobTitle} at ${placement.schoolName} has been verified and confirmed.`,
        type: "application",
        href: "/teacher/dashboard/applications",
      }).catch(() => {});
    }
  }

  return true;
}
