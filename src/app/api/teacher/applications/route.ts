import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireTeacher } from "@/lib/auth";
import { listTeacherApplications } from "@/server/services/teacher/dashboard";
import { connectToDatabase } from "@/lib/db/mongoose";
import { JobModel } from "@/lib/db/models/job";
import { ApplicationModel } from "@/lib/db/models/teacher/application";
import { NotificationModel } from "@/lib/db/models/teacher/notification";
import { TeacherProfileModel } from "@/lib/db/models/teacher-profile";
import { isFeatureEnabled } from "@/server/services/admin/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireTeacher();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);
    const items = await listTeacherApplications(auth.userId);
    return ok({ items, total: items.length });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const appsEnabled = await isFeatureEnabled("applications");
    if (!appsEnabled) {
      return fail(
        "FORBIDDEN",
        "Job application submissions are currently closed by platform administrators.",
        403,
      );
    }

    const auth = await requireTeacher();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);

    const body = await req.json().catch(() => ({}));
    const { jobId, coverNote } = body;
    if (!jobId || typeof jobId !== "string" || !/^[a-fA-F0-9]{24}$/.test(jobId)) {
      return fail("VALIDATION_ERROR", "A valid job ID is required", 422);
    }

    await connectToDatabase();
    const job = await JobModel.findById(jobId).lean();
    if (!job) {
      return fail("NOT_FOUND", "The requested vacancy does not exist", 404);
    }

    // Backend validation: Ensure job is published and not expired or paused/closed
    if (job.status !== "published" || !job.isPublic) {
      return fail("FORBIDDEN", `This vacancy is currently ${job.status || "unavailable"} and not accepting applications.`, 400);
    }

    if (job.applicationDeadline && new Date(job.applicationDeadline).getTime() < Date.now()) {
      return fail("FORBIDDEN", "The application deadline for this vacancy has expired.", 400);
    }

    // Check duplicate
    const existing = await ApplicationModel.findOne({ teacherUserId: auth.userId, jobId }).lean();
    if (existing) {
      return fail("CONFLICT", "You have already applied for this teaching position.", 409);
    }

    // Fetch teacher profile snapshot
    const profile = await TeacherProfileModel.findOne({ userId: auth.userId }).lean();
    const edu = profile?.education;
    const exp = profile?.experience;
    const loc = profile?.location;
    const resumeDoc = profile?.documents?.find((d) => d.kind === "resume");

    let ctetDetails = "";
    if (edu?.ctet) {
      const papers = [];
      if (edu.ctetPaperI) papers.push("Paper I");
      if (edu.ctetPaperII) papers.push("Paper II");
      ctetDetails = papers.length ? `CTET Qualified (${papers.join(", ")})` : "CTET Qualified";
    }

    const snapshot = profile
      ? {
          fullName: profile.fullName || "Candidate Educator",
          email: profile.email || undefined,
          mobile: profile.mobile || undefined,
          city: loc?.city || undefined,
          state: loc?.state || undefined,
          highestQualification: edu?.highestQualification || undefined,
          bed: !!edu?.bed,
          ctet: !!edu?.ctet,
          ctetDetails: ctetDetails || undefined,
          totalExperienceYears: exp?.totalYears ?? 0,
          previousSchool: exp?.previousSchool || undefined,
          previousDesignation: exp?.previousDesignation || undefined,
          resumeUrl: resumeDoc ? `/api/teacher/documents/${resumeDoc._id}/download` : undefined,
          resumeOriginalName: resumeDoc?.originalName,
        }
      : undefined;

    const application = await ApplicationModel.create({
      teacherUserId: auth.userId,
      jobId,
      jobTitle: job.title,
      schoolName: job.schoolName,
      status: "submitted",
      coverNote: typeof coverNote === "string" ? coverNote.trim() : undefined,
      appliedAt: new Date(),
      snapshot,
      statusHistory: [
        {
          status: "submitted",
          changedBy: auth.userId,
          changedByRole: "teacher",
          note: "Application submitted by candidate",
          createdAt: new Date(),
        },
      ],
    });

    // Notify teacher
    await NotificationModel.create({
      teacherUserId: auth.userId,
      title: "Application Submitted Successfully",
      body: `Your formal application for ${job.title} at ${job.schoolName} has been recorded.`,
      type: "application",
      href: "/teacher/dashboard/applications",
    }).catch(() => {});

    return ok({ applied: true, applicationId: String(application._id) }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireTeacher();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);

    const body = await req.json().catch(() => ({}));
    const { id, action, reason } = body;
    if (!id || typeof id !== "string" || !/^[a-fA-F0-9]{24}$/.test(id)) {
      return fail("VALIDATION_ERROR", "A valid application ID is required", 422);
    }

    if (action !== "withdraw") {
      return fail("VALIDATION_ERROR", "Supported action is 'withdraw'", 422);
    }

    await connectToDatabase();
    const app = await ApplicationModel.findOne({ _id: id, teacherUserId: auth.userId });
    if (!app) {
      return fail("NOT_FOUND", "Application not found", 404);
    }

    // Withdrawal rule: permitted when in preliminary stages
    const withdrawableStatuses = ["submitted", "applied", "pending", "under_review", "on_hold"];
    if (!withdrawableStatuses.includes(app.status)) {
      return fail(
        "FORBIDDEN",
        `Application cannot be withdrawn as it is currently at '${app.status.replace(/_/g, " ")}' stage.`,
        400,
      );
    }

    const note = typeof reason === "string" && reason.trim() ? reason.trim() : "Withdrawn by candidate";

    app.status = "withdrawn";
    app.withdrawalReason = note;
    app.statusHistory.push({
      status: "withdrawn",
      changedBy: auth.userId as unknown as import("mongoose").Types.ObjectId,
      changedByRole: "teacher",
      note,
      createdAt: new Date(),
    } as unknown as import("mongoose").Types.Subdocument);

    await app.save();

    // Confirm withdrawal via notification
    await NotificationModel.create({
      teacherUserId: auth.userId,
      title: "Application Withdrawn",
      body: `Your application for ${app.jobTitle} at ${app.schoolName} has been withdrawn.`,
      type: "application",
      href: "/teacher/dashboard/applications",
    }).catch(() => {});

    return ok({ withdrawn: true });
  } catch (err) {
    return handleApiError(err);
  }
}
