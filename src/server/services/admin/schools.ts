import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { SchoolModel } from "@/lib/db/models/admin/school";
import { JobModel } from "@/lib/db/models/job";
import { logAdminAction } from "@/server/services/admin/audit";
import type { Paged, SchoolDetail, SchoolListItem, SchoolContact } from "@/types/admin";

type SchoolQuery = {
  q?: string;
  status?: string;
  verificationStatus?: string;
  district?: string;
  state?: string;
  page?: number;
  limit?: number;
};

function escRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toList(s: Record<string, unknown>, activeJobsCount = 0): SchoolListItem {
  const loc = s.location as Record<string, unknown> | undefined;
  const contacts = Array.isArray(s.contacts) ? s.contacts : [];
  return {
    id: String(s._id),
    name: String(s.name ?? ""),
    type: s.type ? String(s.type) : undefined,
    board: s.board ? String(s.board) : undefined,
    status: s.status === "inactive" ? "inactive" : "active",
    verificationStatus: (s.verificationStatus as SchoolListItem["verificationStatus"]) || "pending_verification",
    verifiedAt: (s.verifiedAt as Date | undefined)?.toISOString?.(),
    state: loc?.state ? String(loc.state) : "Uttar Pradesh",
    district: loc?.district ? String(loc.district) : undefined,
    city: loc?.city ? String(loc.city) : undefined,
    contactsCount: contacts.length,
    followUpDate: (s.followUpDate as Date | undefined)?.toISOString?.(),
    followUpStatus: (s.followUpStatus as SchoolListItem["followUpStatus"]) || "none",
    isArchived: !!s.isArchived,
    activeVacanciesCount: activeJobsCount,
    updatedAt: (s.updatedAt as Date | undefined)?.toISOString?.(),
  };
}

export async function listSchoolsAdmin(query: SchoolQuery): Promise<Paged<SchoolListItem>> {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const filter: Record<string, unknown> = { isArchived: { $ne: true } };

  if (query.q?.trim()) {
    const r = new RegExp(escRe(query.q.trim()), "i");
    filter.$or = [{ name: r }, { "location.city": r }, { "location.district": r }, { board: r }];
  }
  if (query.status) filter.status = query.status;
  if (query.verificationStatus) filter.verificationStatus = query.verificationStatus;
  if (query.district) filter["location.district"] = new RegExp(`^${escRe(query.district)}$`, "i");
  if (query.state) filter["location.state"] = new RegExp(`^${escRe(query.state)}$`, "i");

  try {
    await connectToDatabase();
    const [items, total] = await Promise.all([
      SchoolModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      SchoolModel.countDocuments(filter),
    ]);

    // Pull active jobs count per school
    const schoolIds = items.map((i) => i._id);
    const jobCounts = await JobModel.aggregate([
      { $match: { institutionId: { $in: schoolIds }, status: "published" } },
      { $group: { _id: "$institutionId", count: { $sum: 1 } } },
    ]);
    const jobCountMap = new Map(jobCounts.map((j) => [String(j._id), Number(j.count)]));

    return {
      items: (items as Array<Record<string, unknown>>).map((s) =>
        toList(s, jobCountMap.get(String(s._id)) || 0),
      ),
      page: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  } catch {
    return { items: [], page: { page, limit, total: 0, totalPages: 1 } };
  }
}

export async function getSchoolAdmin(id: string): Promise<SchoolDetail | null> {
  try {
    await connectToDatabase();
    const s = await SchoolModel.findById(id).lean();
    if (!s) return null;
    const r = s as unknown as Record<string, unknown>;
    const loc = r.location as Record<string, unknown> | undefined;

    const activeJobsCount = await JobModel.countDocuments({ institutionId: s._id, status: "published" });

    return {
      ...toList(r, activeJobsCount),
      email: r.email ? String(r.email) : undefined,
      phone: r.phone ? String(r.phone) : undefined,
      website: r.website ? String(r.website) : undefined,
      address: loc?.address ? String(loc.address) : undefined,
      pincode: loc?.pincode ? String(loc.pincode) : undefined,
      hiringRequirements: r.hiringRequirements ? String(r.hiringRequirements) : undefined,
      contacts: (Array.isArray(r.contacts) ? r.contacts : []).map((c: Record<string, unknown>) => ({
        id: String(c._id ?? ""),
        name: String(c.name ?? ""),
        role: c.role ? String(c.role) : undefined,
        designation: c.designation ? String(c.designation) : undefined,
        email: c.email ? String(c.email) : undefined,
        phone: c.phone ? String(c.phone) : undefined,
        whatsapp: c.whatsapp ? String(c.whatsapp) : undefined,
        isPrimary: !!c.isPrimary,
        schoolId: String(s._id),
        schoolName: String(r.name ?? ""),
      })),
      internalNotes: (Array.isArray(r.internalNotes) ? r.internalNotes : [])
        .map((n: Record<string, unknown>) => ({
          id: String(n._id ?? ""),
          authorUserId: n.authorUserId ? String(n.authorUserId) : undefined,
          authorName: n.authorName ? String(n.authorName) : "Admin Officer",
          body: String(n.body ?? ""),
          createdAt: (n.createdAt as Date | undefined)?.toISOString?.() ?? new Date().toISOString(),
        }))
        .reverse(),
    };
  } catch {
    return null;
  }
}

export async function createSchoolAdmin(data: Record<string, unknown>, actorUserId?: string) {
  await connectToDatabase();
  const doc = (await SchoolModel.create({
    ...data,
    status: (data.status as "active" | "inactive") || "active",
    verificationStatus: (data.verificationStatus as "verified" | "pending_verification" | "unverified") || "pending_verification",
    location: {
      state: "Uttar Pradesh",
      ...((data.location as Record<string, unknown>) || {}),
    },
  })) as unknown as { _id: unknown; name: string; location?: { district?: string } };

  if (actorUserId) {
    await logAdminAction({
      action: "school_created",
      entityType: "school",
      entityId: String(doc._id),
      summary: `Registered institution: ${doc.name} (${doc.location?.district || "UP"})`,
      actorUserId,
    }).catch(() => {});
  }

  return String(doc._id);
}

export async function updateSchoolAdmin(id: string, data: Record<string, unknown>, actorUserId?: string) {
  await connectToDatabase();
  const res = await SchoolModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
  if (res && actorUserId) {
    await logAdminAction({
      action: "school_updated",
      entityType: "school",
      entityId: id,
      summary: `Updated institution records: ${res.name}`,
      actorUserId,
    }).catch(() => {});
  }
  return !!res;
}

export async function verifySchoolAdmin(
  id: string,
  verificationStatus: "verified" | "pending_verification" | "unverified",
  actorUserId?: string,
) {
  await connectToDatabase();
  const update: Record<string, unknown> = { verificationStatus };
  if (verificationStatus === "verified") {
    update.verifiedAt = new Date();
    if (actorUserId) update.verifiedBy = actorUserId;
  }
  const res = await SchoolModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  if (res && actorUserId) {
    await logAdminAction({
      action: "school_verified",
      entityType: "school",
      entityId: id,
      summary: `Set verification status to ${verificationStatus} for ${res.name}`,
      actorUserId,
    }).catch(() => {});
  }
  return !!res;
}

export async function addSchoolContact(id: string, contact: Record<string, unknown>, actorUserId?: string) {
  await connectToDatabase();
  const res = await SchoolModel.findByIdAndUpdate(id, { $push: { contacts: contact } }, { new: true }).lean();
  if (res && actorUserId) {
    await logAdminAction({
      action: "school_contact_added",
      entityType: "school",
      entityId: id,
      summary: `Added contact ${contact.name || ""} for ${res.name}`,
      actorUserId,
    }).catch(() => {});
  }
  return !!res;
}

export async function deleteSchoolContact(schoolId: string, contactId: string) {
  await connectToDatabase();
  const res = await SchoolModel.findByIdAndUpdate(
    schoolId,
    { $pull: { contacts: { _id: contactId } } },
    { new: true },
  ).lean();
  return !!res;
}

export async function addSchoolNote(id: string, body: string, actorUserId: string, authorName = "Admin Reviewer") {
  await connectToDatabase();
  return !!(await SchoolModel.findByIdAndUpdate(
    id,
    { $push: { internalNotes: { authorUserId: actorUserId, authorName, body: body.trim(), createdAt: new Date() } } },
  ).lean());
}

export async function setSchoolFollowUp(
  id: string,
  followUpDate: string | null,
  followUpStatus: "pending" | "completed" | "none",
  actorUserId?: string,
) {
  await connectToDatabase();
  const update: Record<string, unknown> = {
    followUpStatus,
    followUpDate: followUpDate ? new Date(followUpDate) : null,
  };
  const res = await SchoolModel.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  if (res && actorUserId) {
    await logAdminAction({
      action: "school_followup_updated",
      entityType: "school",
      entityId: id,
      summary: `Updated follow-up status to ${followUpStatus} for ${res.name}`,
      actorUserId,
    }).catch(() => {});
  }
  return !!res;
}

export async function setSchoolStatus(id: string, status: "active" | "inactive") {
  await connectToDatabase();
  return !!(await SchoolModel.findByIdAndUpdate(id, { $set: { status } }).lean());
}

export async function archiveSchoolAdmin(id: string, isArchived: boolean) {
  await connectToDatabase();
  return !!(await SchoolModel.findByIdAndUpdate(id, { $set: { isArchived } }).lean());
}

/**
 * List all recruiter/school contacts across all institutions for the Recruiter Contacts Directory
 */
export async function listAllSchoolContactsAdmin(query: { q?: string; page?: number; limit?: number }) {
  await connectToDatabase();
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

  const schools = await SchoolModel.find(
    { "contacts.0": { $exists: true }, isArchived: { $ne: true } },
    { name: 1, location: 1, contacts: 1 },
  ).lean();

  const allContacts: SchoolContact[] = [];
  for (const s of schools) {
    for (const c of s.contacts || []) {
      allContacts.push({
        id: String(c._id ?? ""),
        name: String(c.name ?? ""),
        role: c.role ? String(c.role) : undefined,
        designation: c.designation ? String(c.designation) : undefined,
        email: c.email ? String(c.email) : undefined,
        phone: c.phone ? String(c.phone) : undefined,
        whatsapp: c.whatsapp ? String(c.whatsapp) : undefined,
        isPrimary: !!c.isPrimary,
        schoolId: String(s._id),
        schoolName: String(s.name ?? ""),
      });
    }
  }

  let filtered = allContacts;
  if (query.q?.trim()) {
    const qLower = query.q.trim().toLowerCase();
    filtered = allContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(qLower) ||
        (c.schoolName && c.schoolName.toLowerCase().includes(qLower)) ||
        (c.role && c.role.toLowerCase().includes(qLower)) ||
        (c.phone && c.phone.includes(qLower)) ||
        (c.email && c.email.toLowerCase().includes(qLower)),
    );
  }

  const total = filtered.length;
  const items = filtered.slice((page - 1) * limit, page * limit);

  return {
    items,
    page: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}
