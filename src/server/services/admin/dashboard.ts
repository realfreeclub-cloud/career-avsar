import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/db/models/user";
import { TeacherProfileModel } from "@/lib/db/models/teacher-profile";
import { SchoolModel } from "@/lib/db/models/admin/school";
import { JobModel } from "@/lib/db/models/job";
import { ApplicationModel } from "@/lib/db/models/teacher/application";
import { InterviewModel } from "@/lib/db/models/teacher/interview";
import { PlacementModel } from "@/lib/db/models/admin/placement";
import { CommunicationLogModel } from "@/lib/db/models/admin/communication-log";
import { AuditLogModel } from "@/lib/db/models/admin/audit-log";
import { logger } from "@/lib/logger";
import type { AdminDashboardStats } from "@/types/admin";

function emptyStats(): AdminDashboardStats {
  return {
    totalTeachers: 0,
    verifiedTeachers: 0,
    unverifiedTeachers: 0,
    pendingDocumentVerification: 0,
    totalSchools: 0,
    verifiedSchools: 0,
    pendingFollowUps: 0,
    activeVacancies: 0,
    totalApplications: 0,
    pendingApplications: 0,
    shortlistedCandidates: 0,
    scheduledInterviews: 0,
    successfulPlacements: 0,
    recentRegistrations: [],
    recentActivities: [],
  };
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  try {
    await connectToDatabase();
    const now = new Date();
    const [
      totalTeachers,
      verifiedTeachers,
      unverifiedTeachers,
      pendingDocVerification,
      totalSchools,
      verifiedSchools,
      pendingFollowUps,
      activeVacancies,
      totalApplications,
      pendingApplications,
      shortlistedCandidates,
      scheduledInterviews,
      successfulPlacements,
      recentRegs,
      recentLogs,
    ] = await Promise.all([
      UserModel.countDocuments({ role: "candidate" }),
      TeacherProfileModel.countDocuments({ "verification.status": "verified" }),
      TeacherProfileModel.countDocuments({ "verification.status": { $ne: "verified" } }),
      TeacherProfileModel.countDocuments({ "verification.status": "pending" }),
      SchoolModel.countDocuments({ isArchived: { $ne: true } }),
      SchoolModel.countDocuments({ verificationStatus: "verified", isArchived: { $ne: true } }),
      CommunicationLogModel.countDocuments({ followUpStatus: "pending" }),
      JobModel.countDocuments({
        status: "published",
        $or: [
          { applicationDeadline: { $exists: false } },
          { applicationDeadline: null },
          { applicationDeadline: { $gte: now } },
        ],
      }).catch(() => 0),
      ApplicationModel.countDocuments({}).catch(() => 0),
      ApplicationModel.countDocuments({ status: { $in: ["submitted", "applied", "pending", "under_review"] } }).catch(() => 0),
      ApplicationModel.countDocuments({ status: "shortlisted" }).catch(() => 0),
      InterviewModel.countDocuments({ status: "scheduled" }).catch(() => 0),
      PlacementModel.countDocuments({ status: { $in: ["joined", "completed"] } }).catch(() => 0),
      TeacherProfileModel.find(
        {},
        {
          fullName: 1,
          email: 1,
          mobile: 1,
          "location.state": 1,
          "location.district": 1,
          "education.highestQualification": 1,
          "experience.totalYears": 1,
          "preferences.subjects": 1,
          "education.ctet": 1,
          "education.uptet": 1,
          "experience.expectedSalaryInr": 1,
          "verification.status": 1,
          userId: 1,
          createdAt: 1,
        },
      )
        .sort({ createdAt: -1 })
        .limit(8)
        .lean()
        .catch(() => []),
      AuditLogModel.find({}, { action: 1, summary: 1, entityType: 1, createdAt: 1 })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .catch(() => []),
    ]);

    return {
      totalTeachers,
      verifiedTeachers,
      unverifiedTeachers,
      pendingDocumentVerification: pendingDocVerification,
      totalSchools,
      verifiedSchools,
      pendingFollowUps,
      activeVacancies,
      totalApplications,
      pendingApplications,
      shortlistedCandidates,
      scheduledInterviews,
      successfulPlacements,
      recentRegistrations: (recentRegs as Array<Record<string, unknown>>).map((t) => ({
        id: String(t._id),
        userId: String(t.userId ?? ""),
        fullName: String(t.fullName ?? "—"),
        email: String(t.email ?? ""),
        mobile: String(t.mobile ?? ""),
        state: String((t.location as Record<string, unknown> | undefined)?.state ?? ""),
        district: String((t.location as Record<string, unknown> | undefined)?.district ?? ""),
        highestQualification: String((t.education as Record<string, unknown> | undefined)?.highestQualification ?? ""),
        experienceYears:
          typeof (t.experience as Record<string, unknown> | undefined)?.totalYears === "number"
            ? ((t.experience as Record<string, unknown>).totalYears as number)
            : null,
        subjects: Array.isArray((t.preferences as Record<string, unknown> | undefined)?.subjects)
          ? ((t.preferences as Record<string, unknown>).subjects as string[])
          : [],
        ctet: !!(t.education as Record<string, unknown> | undefined)?.ctet,
        uptet: !!(t.education as Record<string, unknown> | undefined)?.uptet,
        expectedSalaryInr:
          typeof (t.experience as Record<string, unknown> | undefined)?.expectedSalaryInr === "number"
            ? ((t.experience as Record<string, unknown>).expectedSalaryInr as number)
            : null,
        verificationStatus: String((t.verification as Record<string, unknown> | undefined)?.status ?? "unverified"),
        createdAt: (t.createdAt as Date | undefined)?.toISOString?.() ?? new Date().toISOString(),
      })),
      recentActivities: (recentLogs as Array<Record<string, unknown>>).map((a) => ({
        id: String(a._id),
        action: String(a.action ?? ""),
        summary: String(a.summary ?? ""),
        entityType: String(a.entityType ?? ""),
        createdAt: (a.createdAt as Date | undefined)?.toISOString?.() ?? new Date().toISOString(),
      })),
    };
  } catch (err) {
    logger.warn({ err }, "Admin dashboard stats unavailable");
    return emptyStats();
  }
}
