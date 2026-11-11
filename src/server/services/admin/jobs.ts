import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { JobModel, type Job } from "@/lib/db/models/job";
import { SchoolModel } from "@/lib/db/models/admin/school";
import { ApplicationModel } from "@/lib/db/models/teacher/application";
import { TeacherProfileModel } from "@/lib/db/models/teacher-profile";
import { isDistrictActive } from "@/server/services/locations";
import type { Paged } from "@/types/admin";

export type AdminJob = {
  id: string;
  title: string;
  schoolName: string;
  institutionId?: string;
  subject: string;
  category: string;
  city: string;
  district?: string;
  state: string;
  qualification: string;
  trainingRequirements?: string;
  ctetRequired?: string;
  minExperience?: number;
  maxExperience?: number;
  experience?: string;
  salaryMinInr?: number;
  salaryMaxInr?: number;
  salaryPeriod?: string;
  vacanciesCount: number;
  employmentType: string;
  board?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  interviewMode: string;
  status: string;
  isPublic: boolean;
  applicationDeadline?: string;
  extendedDeadlineAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  applicantsCount?: number;
};

export type JobApplicantItem = {
  id: string;
  teacherUserId: string;
  fullName: string;
  email?: string;
  mobile?: string;
  city?: string;
  state?: string;
  highestQualification?: string;
  hasBed: boolean;
  hasCtet: boolean;
  ctetDetails?: string;
  totalYearsExperience?: number;
  experienceStatus?: string;
  status: string;
  appliedAt: string;
  coverNote?: string;
};

function mapJob(j: Record<string, unknown>, applicantsCount = 0): AdminJob {
  const loc = j.location as Record<string, unknown> | undefined;
  return {
    id: String(j._id),
    title: String(j.title ?? ""),
    schoolName: String(j.schoolName ?? ""),
    institutionId: j.institutionId ? String(j.institutionId) : undefined,
    subject: String(j.subject ?? ""),
    category: String(j.category ?? ""),
    city: String(loc?.city ?? ""),
    district: loc?.district ? String(loc.district) : undefined,
    state: String(loc?.state ?? ""),
    qualification: String(j.qualification ?? ""),
    trainingRequirements: j.trainingRequirements ? String(j.trainingRequirements) : undefined,
    ctetRequired: j.ctetRequired ? String(j.ctetRequired) : undefined,
    minExperience: typeof j.minExperience === "number" ? j.minExperience : undefined,
    maxExperience: typeof j.maxExperience === "number" ? j.maxExperience : undefined,
    experience: j.experience ? String(j.experience) : undefined,
    salaryMinInr: typeof j.salaryMinInr === "number" ? j.salaryMinInr : undefined,
    salaryMaxInr: typeof j.salaryMaxInr === "number" ? j.salaryMaxInr : undefined,
    salaryPeriod: String(j.salaryPeriod ?? "monthly"),
    vacanciesCount: Number(j.vacanciesCount) || 1,
    employmentType: String(j.employmentType ?? "Full-time"),
    board: j.board ? String(j.board) : undefined,
    description: j.description ? String(j.description) : undefined,
    responsibilities: Array.isArray(j.responsibilities) ? (j.responsibilities as string[]) : [],
    requirements: Array.isArray(j.requirements) ? (j.requirements as string[]) : [],
    interviewMode: String(j.interviewMode ?? "Online"),
    status: String(j.status ?? "draft"),
    isPublic: !!j.isPublic,
    applicationDeadline: (j.applicationDeadline as Date | undefined)?.toISOString?.(),
    extendedDeadlineAt: (j.extendedDeadlineAt as Date | undefined)?.toISOString?.(),
    publishedAt: (j.publishedAt as Date | undefined)?.toISOString?.(),
    createdAt: (j.createdAt as Date | undefined)?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: (j.updatedAt as Date | undefined)?.toISOString?.() ?? new Date().toISOString(),
    applicantsCount,
  };
}

export async function listJobsAdmin(query: {
  q?: string;
  status?: string;
  subject?: string;
  district?: string;
  state?: string;
  category?: string;
  board?: string;
  page?: number;
  limit?: number;
}): Promise<Paged<AdminJob>> {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const filter: Record<string, unknown> = {};

  if (query.q?.trim()) {
    const r = new RegExp(query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [
      { title: r },
      { schoolName: r },
      { subject: r },
      { "location.district": r },
      { "location.city": r },
      { "location.state": r },
    ];
  }
  if (query.status) filter.status = query.status;
  if (query.subject) filter.subject = new RegExp(query.subject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  if (query.district) filter["location.district"] = new RegExp(query.district.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  if (query.category) filter.category = new RegExp(query.category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  if (query.board) filter.board = new RegExp(query.board.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  if (query.state) filter["location.state"] = query.state;

  try {
    await connectToDatabase();
    const [items, total] = await Promise.all([
      JobModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      JobModel.countDocuments(filter),
    ]);

    // Aggregate applicant counts for these jobs
    const jobIds = items.map((j) => j._id);
    const counts = await ApplicationModel.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: "$jobId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map<string, number>(counts.map((c) => [String(c._id), c.count]));

    return {
      items: (items as Array<Record<string, unknown>>).map((j) => mapJob(j, countMap.get(String(j._id)) ?? 0)),
      page: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  } catch {
    return { items: [], page: { page, limit, total: 0, totalPages: 1 } };
  }
}

export async function getJobAdmin(id: string): Promise<AdminJob | null> {
  await connectToDatabase();
  const j = await JobModel.findById(id).lean();
  if (!j) return null;
  const count = await ApplicationModel.countDocuments({ jobId: j._id });
  return mapJob(j as unknown as Record<string, unknown>, count);
}

export async function createJobAdmin(data: Record<string, unknown>) {
  await connectToDatabase();

  // If schoolId passed, pull schoolName
  if (data.schoolId && !data.schoolName) {
    const s = await SchoolModel.findById(String(data.schoolId), { name: 1 }).lean();
    if (s) data.schoolName = (s as Record<string, unknown>).name;
  }

  // Handle location structure
  if (data.city || data.state || data.district) {
    const locState = String(data.state || "Uttar Pradesh");
    const locDistrict = data.district ? String(data.district) : undefined;
    data.location = {
      city: String(data.city ?? ""),
      district: locDistrict,
      state: locState,
    };
  }

  // Validate active service district if publishing
  if (data.status === "published" || data.isPublic) {
    const loc = (data.location as { district?: string; state?: string } | undefined);
    if (loc?.district) {
      const active = await isDistrictActive(loc.district, loc.state || "Uttar Pradesh");
      if (!active) {
        throw new Error(
          `District "${loc.district}" is not currently an active service location. Please activate it under Service Area Management first.`,
        );
      }
    }
  }

  // Ensure experience string is generated if missing
  if (!data.experience && (data.minExperience !== undefined || data.maxExperience !== undefined)) {
    const min = data.minExperience ?? 0;
    const max = data.maxExperience;
    data.experience = max ? `${min} - ${max} Years` : `${min}+ Years`;
  }

  // Align isPublic with status
  if (data.status === "published") {
    data.isPublic = true;
    data.publishedAt = data.publishedAt ? new Date(String(data.publishedAt)) : new Date();
  } else {
    data.isPublic = false;
  }

  const doc = await JobModel.create(data);
  return String(doc._id);
}

export async function updateJobAdmin(id: string, data: Record<string, unknown>) {
  await connectToDatabase();

  // If location fields changed
  if (data.city !== undefined || data.state !== undefined || data.district !== undefined) {
    const existing = await JobModel.findById(id, { location: 1 }).lean();
    const loc = (existing?.location as { city?: string; district?: string; state?: string } | undefined) || {};
    data.location = {
      city: data.city !== undefined ? String(data.city) : loc.city,
      district: data.district !== undefined ? String(data.district) : loc.district,
      state: data.state !== undefined ? String(data.state) : loc.state,
    };
  }

  // Status and publish rules
  if (data.status === "published") {
    data.isPublic = true;
    if (!data.publishedAt) {
      const existing = await JobModel.findById(id, { publishedAt: 1, location: 1 }).lean();
      data.publishedAt = existing?.publishedAt || new Date();
      const loc = (data.location || existing?.location) as { district?: string; state?: string } | undefined;
      if (loc?.district) {
        const active = await isDistrictActive(loc.district, loc.state || "Uttar Pradesh");
        if (!active) {
          throw new Error(
            `District "${loc.district}" is not currently an active service location. Please activate it under Service Area Management first.`,
          );
        }
      }
    }
  } else if (data.status && data.status !== "published") {
    data.isPublic = false;
  }

  const updated = await JobModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
  return !!updated;
}

export async function duplicateJobAdmin(id: string): Promise<string | null> {
  await connectToDatabase();
  const source = await JobModel.findById(id).lean<Job | null>();
  if (!source) return null;

  const cloneData = {
    ...source,
    _id: undefined,
    title: `${source.title} (Copy)`,
    status: "draft" as const,
    isPublic: false,
    publishedAt: undefined,
    createdAt: undefined,
    updatedAt: undefined,
  };

  const newDoc = await JobModel.create(cloneData);
  return String(newDoc._id);
}

export async function updateJobStatusAdmin(
  id: string,
  status: "draft" | "published" | "paused" | "expired" | "closed",
): Promise<boolean> {
  await connectToDatabase();
  const isPublic = status === "published";
  const update: Record<string, unknown> = { status, isPublic };
  if (status === "published") {
    const existing = await JobModel.findById(id, { publishedAt: 1 }).lean();
    if (!existing?.publishedAt) update.publishedAt = new Date();
  }
  const result = await JobModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  return !!result;
}

export async function extendDeadlineAdmin(id: string, newDeadlineIso: string): Promise<boolean> {
  await connectToDatabase();
  const targetDate = new Date(newDeadlineIso);
  if (isNaN(targetDate.getTime())) return false;

  const existing = await JobModel.findById(id).lean();
  if (!existing) return false;

  const update: Record<string, unknown> = {
    applicationDeadline: targetDate,
    extendedDeadlineAt: new Date(),
  };

  // If job was expired, reactivate to published
  if (existing.status === "expired") {
    update.status = "published";
    update.isPublic = true;
  }

  const result = await JobModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  return !!result;
}

export async function listJobApplicantsAdmin(jobId: string): Promise<JobApplicantItem[]> {
  await connectToDatabase();
  const applications = await ApplicationModel.find({ jobId }).sort({ appliedAt: -1, createdAt: -1 }).lean();
  if (!applications.length) return [];

  const teacherIds = applications.map((a) => a.teacherUserId);
  const profiles = await TeacherProfileModel.find({ userId: { $in: teacherIds } }).lean();
  const profileMap = new Map(profiles.map((p) => [String(p.userId), p]));

  return applications.map((a) => {
    const p = profileMap.get(String(a.teacherUserId));
    const edu = p?.education;
    const exp = p?.experience;
    const loc = p?.location;

    let ctetDetails = "";
    if (edu?.ctet) {
      const papers = [];
      if (edu.ctetPaperI) papers.push("Paper I");
      if (edu.ctetPaperII) papers.push("Paper II");
      ctetDetails = papers.length ? `CTET Qualified (${papers.join(", ")})` : "CTET Qualified";
    }

    return {
      id: String(a._id),
      teacherUserId: String(a.teacherUserId),
      fullName: String(p?.fullName || "Candidate Educator"),
      email: p?.email ?? undefined,
      mobile: p?.mobile ?? undefined,
      city: loc?.city ?? undefined,
      state: loc?.state ?? undefined,
      highestQualification: edu?.highestQualification ?? undefined,
      hasBed: !!edu?.bed,
      hasCtet: !!edu?.ctet,
      ctetDetails: ctetDetails || undefined,
      totalYearsExperience: exp?.totalYears ?? undefined,
      experienceStatus: exp?.status ?? undefined,
      status: a.status,
      appliedAt: (a.appliedAt || a.createdAt || new Date()).toISOString(),
      coverNote: a.coverNote ?? undefined,
    };
  });
}

export async function exportJobApplicantsCsvAdmin(jobId: string): Promise<{ csv: string; jobTitle: string }> {
  await connectToDatabase();
  const job = await JobModel.findById(jobId, { title: 1, schoolName: 1 }).lean();
  const jobTitle = job?.title || "Job Vacancy";

  const applicants = await listJobApplicantsAdmin(jobId);

  const headers = [
    "Application ID",
    "Candidate Full Name",
    "Email",
    "Phone / Mobile",
    "City",
    "State",
    "Highest Qualification",
    "B.Ed Qualified",
    "CTET Status",
    "Experience (Years)",
    "Experience Level",
    "Application Status",
    "Applied At (IST)",
    "Cover Note",
  ];

  const escapeCsv = (str?: string | number | boolean | null) => {
    if (str === undefined || str === null) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = applicants.map((a) => [
    escapeCsv(a.id),
    escapeCsv(a.fullName),
    escapeCsv(a.email),
    escapeCsv(a.mobile),
    escapeCsv(a.city),
    escapeCsv(a.state),
    escapeCsv(a.highestQualification),
    escapeCsv(a.hasBed ? "Yes" : "No"),
    escapeCsv(a.ctetDetails || (a.hasCtet ? "Yes" : "No")),
    escapeCsv(a.totalYearsExperience ?? "0"),
    escapeCsv(a.experienceStatus),
    escapeCsv(a.status),
    escapeCsv(new Date(a.appliedAt).toLocaleString("en-IN")),
    escapeCsv(a.coverNote),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  return { csv, jobTitle };
}
