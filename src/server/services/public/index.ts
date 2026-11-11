import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { JobModel, type Job } from "@/lib/db/models/job";
import { InstitutionModel, type Institution } from "@/lib/db/models/institution";
import { TestimonialModel, type Testimonial } from "@/lib/db/models/testimonial";
import { logger } from "@/lib/logger";

export type PublicJob = {
  id: string;
  title: string;
  schoolName: string;
  location: { city: string; state: string; district?: string };
  subject: string;
  category: string;
  qualification: string;
  trainingRequirements?: string;
  ctetRequired?: string;
  minExperience?: number;
  maxExperience?: number;
  experience: string;
  salaryMinInr?: number;
  salaryMaxInr?: number;
  salaryPeriod?: string;
  vacanciesCount?: number;
  employmentType?: string;
  board?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  applicationDeadline?: string;
  extendedDeadlineAt?: string;
  interviewMode?: string;
  status: string;
  isExpired?: boolean;
  publishedAt?: string;
};

export type PublicInstitution = {
  id: string;
  name: string;
  type?: string;
  city?: string;
  state?: string;
  description?: string;
};

export type PublicTestimonial = {
  id: string;
  authorName: string;
  role?: string;
  organization?: string;
  content: string;
  rating?: number;
};

export type JobSearch = {
  q?: string;
  subject?: string;
  district?: string;
  city?: string;
  state?: string;
  qualification?: string;
  category?: string;
  board?: string;
  employmentType?: string;
  interviewMode?: string;
  minExp?: number;
  maxExp?: number;
  sort?: "latest" | "deadline" | "salary";
  page?: number;
  limit?: number;
};

export type PageResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

function emptyPage<T>(page: number, limit: number): PageResult<T> {
  return { items: [], total: 0, page, limit, hasMore: false };
}

function sanitizeText(v?: string): string | undefined {
  const t = v?.trim();
  return t ? t : undefined;
}

function toPublicJob(doc: Job): PublicJob {
  const isExpired = !!(
    doc.status === "expired" ||
    (doc.applicationDeadline && new Date(doc.applicationDeadline).getTime() < Date.now())
  );
  return {
    id: String(doc._id),
    title: doc.title,
    schoolName: doc.schoolName,
    location: {
      city: doc.location?.city ?? "",
      state: doc.location?.state ?? "",
      district: doc.location?.district ?? undefined,
    },
    subject: doc.subject,
    category: doc.category,
    qualification: doc.qualification,
    trainingRequirements: doc.trainingRequirements ?? undefined,
    ctetRequired: doc.ctetRequired ?? undefined,
    minExperience: doc.minExperience ?? undefined,
    maxExperience: doc.maxExperience ?? undefined,
    experience: doc.experience ?? (doc.minExperience !== undefined ? `${doc.minExperience}+ Years` : "Experience as per norm"),
    salaryMinInr: doc.salaryMinInr ?? undefined,
    salaryMaxInr: doc.salaryMaxInr ?? undefined,
    salaryPeriod: doc.salaryPeriod ?? "monthly",
    vacanciesCount: doc.vacanciesCount ?? 1,
    employmentType: doc.employmentType ?? "Full-time",
    board: doc.board ?? undefined,
    description: doc.description ?? undefined,
    responsibilities: doc.responsibilities?.length ? doc.responsibilities : undefined,
    requirements: doc.requirements?.length ? doc.requirements : undefined,
    applicationDeadline: doc.applicationDeadline?.toISOString(),
    extendedDeadlineAt: doc.extendedDeadlineAt?.toISOString(),
    interviewMode: doc.interviewMode ?? "Online",
    status: isExpired && doc.status === "published" ? "expired" : (doc.status ?? "draft"),
    isExpired,
    publishedAt: doc.publishedAt?.toISOString(),
  };
}

export async function listPublicJobs(search: JobSearch = {}): Promise<PageResult<PublicJob>> {
  const page = Math.max(1, Math.floor(search.page ?? 1));
  const limit = Math.min(24, Math.max(1, Math.floor(search.limit ?? 9)));
  try {
    await connectToDatabase();
  } catch (err) {
    logger.warn({ err }, "Public jobs unavailable: database connection failed");
    return emptyPage(page, limit);
  }

  const filter: Record<string, unknown> = { status: "published", isPublic: true };
  const q = sanitizeText(search.q);
  const subject = sanitizeText(search.subject);
  const district = sanitizeText(search.district);
  const city = sanitizeText(search.city);
  const state = sanitizeText(search.state);
  const qualification = sanitizeText(search.qualification);
  const category = sanitizeText(search.category);
  const board = sanitizeText(search.board);
  const employmentType = sanitizeText(search.employmentType);
  const interviewMode = sanitizeText(search.interviewMode);

  if (subject) filter.subject = new RegExp(escapeRegex(subject), "i");
  if (district) filter["location.district"] = new RegExp(escapeRegex(district), "i");
  if (city) filter["location.city"] = new RegExp(escapeRegex(city), "i");
  if (state) filter["location.state"] = new RegExp(escapeRegex(state), "i");
  if (qualification) filter.qualification = new RegExp(escapeRegex(qualification), "i");
  if (category) filter.category = new RegExp(escapeRegex(category), "i");
  if (board) filter.board = new RegExp(escapeRegex(board), "i");
  if (employmentType) filter.employmentType = new RegExp(escapeRegex(employmentType), "i");
  if (interviewMode) filter.interviewMode = new RegExp(escapeRegex(interviewMode), "i");
  if (search.minExp !== undefined && search.minExp !== null && !isNaN(search.minExp)) {
    filter.minExperience = { $lte: Number(search.minExp) };
  }

  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [
      { title: rx },
      { subject: rx },
      { schoolName: rx },
      { "location.district": rx },
      { "location.city": rx },
      { "location.state": rx },
      { board: rx },
    ];
  }

  let sortObj: Record<string, 1 | -1> = { publishedAt: -1, createdAt: -1 };
  if (search.sort === "deadline") {
    sortObj = { applicationDeadline: 1, publishedAt: -1 };
  } else if (search.sort === "salary") {
    sortObj = { salaryMaxInr: -1, publishedAt: -1 };
  }

  const [items, total] = await Promise.all([
    JobModel.find(filter)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<Job[]>(),
    JobModel.countDocuments(filter),
  ]);

  return {
    items: items.map(toPublicJob),
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}

export async function getPublicJob(id: string): Promise<PublicJob | null> {
  if (!/^[a-fA-F0-9]{24}$/.test(id)) return null;
  try {
    await connectToDatabase();
  } catch (err) {
    logger.warn({ err }, "Public job detail unavailable: database connection failed");
    return null;
  }
  // Allow published, paused, expired or closed jobs so candidates can see status and eligibility
  const doc = await JobModel.findOne({
    _id: id,
    status: { $in: ["published", "paused", "expired", "closed"] },
  }).lean<Job | null>();
  return doc ? toPublicJob(doc) : null;
}

export async function listApprovedInstitutions(limit = 12): Promise<PublicInstitution[]> {
  try {
    await connectToDatabase();
  } catch (err) {
    logger.warn({ err }, "Public institutions unavailable: database connection failed");
    return [];
  }
  const items = await InstitutionModel.find({ status: "approved" })
    .sort({ featured: -1, approvedAt: -1, createdAt: -1 })
    .limit(Math.min(50, Math.max(1, limit)))
    .lean<Institution[]>();
  return items.map((d) => ({
    id: String(d._id),
    name: d.name,
    type: d.type ?? undefined,
    city: d.city ?? undefined,
    state: d.state ?? undefined,
    description: d.description ?? undefined,
  }));
}

export async function listApprovedTestimonials(limit = 12): Promise<PublicTestimonial[]> {
  try {
    await connectToDatabase();
  } catch (err) {
    logger.warn({ err }, "Public testimonials unavailable: database connection failed");
    return [];
  }
  const items = await TestimonialModel.find({ status: "approved" })
    .sort({ approvedAt: -1, createdAt: -1 })
    .limit(Math.min(50, Math.max(1, limit)))
    .lean<Testimonial[]>();
  return items.map((d) => ({
    id: String(d._id),
    authorName: d.authorName,
    role: d.role ?? undefined,
    organization: d.organization ?? undefined,
    content: d.content,
    rating: d.rating ?? undefined,
  }));
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
