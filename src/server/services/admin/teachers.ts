import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { TeacherProfileModel } from "@/lib/db/models/teacher-profile";
import type { Paged, TeacherListItem } from "@/types/admin";

export type TeacherQuery = {
  q?: string; state?: string; district?: string; qualification?: string; subject?: string;
  ctet?: "true" | "false"; uptet?: "true" | "false"; verificationStatus?: string;
  minExp?: number; maxExp?: number; minSalary?: number; maxSalary?: number;
  page?: number; limit?: number; sort?: string; order?: "asc" | "desc";
};

const SORT_MAP: Record<string, string> = {
  createdAt: "createdAt", name: "fullName", experience: "experience.totalYears", salary: "experience.expectedSalaryInr", verification: "verification.status", state: "location.state",
};

function escRe(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

export async function listTeachersAdmin(query: TeacherQuery): Promise<Paged<TeacherListItem>> {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const filter: Record<string, unknown> = {};
  if (query.q?.trim()) {
    const r = new RegExp(escRe(query.q.trim()), "i");
    filter.$or = [{ fullName: r }, { email: r }, { mobile: r }];
  }
  if (query.state) filter["location.state"] = query.state;
  if (query.district) filter["location.district"] = query.district;
  if (query.qualification) filter["education.highestQualification"] = new RegExp(escRe(query.qualification), "i");
  if (query.subject) filter["preferences.subjects"] = new RegExp(escRe(query.subject), "i");
  if (query.ctet === "true") filter["education.ctet"] = true;
  if (query.uptet === "true") filter["education.uptet"] = true;
  if (query.verificationStatus) filter["verification.status"] = query.verificationStatus;
  if (query.minExp != null || query.maxExp != null) {
    const r: Record<string, number> = {};
    if (query.minExp != null) r.$gte = query.minExp;
    if (query.maxExp != null) r.$lte = query.maxExp;
    filter["experience.totalYears"] = r;
  }
  if (query.minSalary != null || query.maxSalary != null) {
    const r: Record<string, number> = {};
    if (query.minSalary != null) r.$gte = query.minSalary;
    if (query.maxSalary != null) r.$lte = query.maxSalary;
    filter["experience.expectedSalaryInr"] = r;
  }
  const sortField = SORT_MAP[query.sort || "createdAt"] || "createdAt";
  const sortDir = query.order === "asc" ? 1 : -1;

  try {
    await connectToDatabase();
    const [items, total] = await Promise.all([
      TeacherProfileModel.find(filter).sort({ [sortField]: sortDir, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      TeacherProfileModel.countDocuments(filter),
    ]);
    return {
      items: (items as Array<Record<string, unknown>>).map(mapTeacher),
      page: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  } catch {
    return { items: [], page: { page, limit, total: 0, totalPages: 1 } };
  }
}

function mapTeacher(t: Record<string, unknown>): TeacherListItem {
  const loc = t.location as Record<string, unknown> | undefined;
  const edu = t.education as Record<string, unknown> | undefined;
  const exp = t.experience as Record<string, unknown> | undefined;
  const pref = t.preferences as Record<string, unknown> | undefined;
  const ver = t.verification as Record<string, unknown> | undefined;
  return {
    id: String(t._id), userId: String(t.userId ?? ""), fullName: String(t.fullName ?? "—"), email: String(t.email ?? ""), mobile: String(t.mobile ?? ""),
    state: String(loc?.state ?? ""), district: String(loc?.district ?? ""), highestQualification: String(edu?.highestQualification ?? ""),
    experienceYears: typeof exp?.totalYears === "number" ? (exp.totalYears as number) : null,
    subjects: Array.isArray(pref?.subjects) ? (pref!.subjects as string[]).slice(0, 6) : [],
    ctet: !!edu?.ctet, uptet: !!edu?.uptet,
    expectedSalaryInr: typeof exp?.expectedSalaryInr === "number" ? (exp.expectedSalaryInr as number) : null,
    verificationStatus: String(ver?.status ?? "unverified"),
    createdAt: (t.createdAt as Date | undefined)?.toISOString?.() ?? new Date().toISOString(),
  };
}

export async function getTeacherDetailAdmin(id: string) {
  try {
    await connectToDatabase();
    const t = await TeacherProfileModel.findById(id).lean();
    if (!t) return null;
    const r = t as unknown as Record<string, unknown>;
    const docs = Array.isArray(r.documents) ? (r.documents as Array<Record<string, unknown>>) : [];
    const notes = Array.isArray(r.adminNotes) ? (r.adminNotes as Array<Record<string, unknown>>) : [];
    return {
      ...mapTeacher(r),
      whatsapp: String(r.whatsapp ?? ""),
      city: String((r.location as Record<string, unknown> | undefined)?.city ?? ""),
      address: String((r.location as Record<string, unknown> | undefined)?.currentAddress ?? ""),
      graduation: String((r.education as Record<string, unknown> | undefined)?.graduation ?? ""),
      postGraduation: String((r.education as Record<string, unknown> | undefined)?.postGraduation ?? ""),
      bed: !!(r.education as Record<string, unknown> | undefined)?.bed,
      deled: !!(r.education as Record<string, unknown> | undefined)?.deled,
      experienceStatus: String((r.experience as Record<string, unknown> | undefined)?.status ?? ""),
      previousSchool: String((r.experience as Record<string, unknown> | undefined)?.previousSchool ?? ""),
      preferredLocations: Array.isArray((r.preferences as Record<string, unknown> | undefined)?.preferredLocations) ? ((r.preferences as Record<string, unknown>).preferredLocations as string[]) : [],
      documents: docs.map((d) => ({ id: String(d._id ?? ""), kind: String(d.kind ?? ""), originalName: String(d.originalName ?? ""), mimeType: String(d.mimeType ?? ""), size: Number(d.size ?? 0) })),
      adminNotes: notes.map((n) => ({ id: String(n._id ?? ""), body: String(n.body ?? ""), createdAt: (n.createdAt as Date | undefined)?.toISOString?.() ?? "" })).reverse(),
      verificationNote: String((r.verification as Record<string, unknown> | undefined)?.note ?? ""),
    };
  } catch { return null; }
}

export async function verifyTeacherAdmin(id: string, status: "verified" | "rejected" | "pending" | "unverified", note: string | undefined, actorUserId: string) {
  await connectToDatabase();
  const res = await TeacherProfileModel.findByIdAndUpdate(id, { $set: { "verification.status": status, "verification.note": note ?? "", "verification.verifiedAt": status === "verified" ? new Date() : undefined, "verification.verifiedByUserId": actorUserId } }, { new: true }).lean();
  return !!res;
}

export async function addTeacherAdminNote(id: string, body: string, actorUserId: string) {
  await connectToDatabase();
  const res = await TeacherProfileModel.findByIdAndUpdate(id, { $push: { adminNotes: { authorUserId: actorUserId, body, createdAt: new Date() } } }, { new: true }).lean();
  return !!res;
}

export async function exportTeachersCsv(query: TeacherQuery): Promise<string> {
  const result = await listTeachersAdmin({ ...query, page: 1, limit: 100 });
  const header = ["Name","Email","Mobile","State","District","Qualification","Experience Years","Subjects","CTET","UPTET","Expected Salary (INR)","Verification","Registered"];
  const rows = result.items.map((t) => [t.fullName,t.email,t.mobile,t.state,t.district,t.highestQualification,t.experienceYears ?? "",t.subjects.join("; "),t.ctet?"Yes":"No",t.uptet?"Yes":"No",t.expectedSalaryInr ?? "",t.verificationStatus,t.createdAt]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [header.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
}
