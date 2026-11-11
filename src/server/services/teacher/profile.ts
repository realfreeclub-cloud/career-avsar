import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { TeacherProfileModel } from "@/lib/db/models/teacher-profile";
import { UserModel } from "@/lib/db/models/user";
import { isDistrictActive } from "@/server/services/locations";
import type { DraftInput, FullProfileInput } from "@/lib/validation/teacher-profile";
import type { ProfileDto } from "@/types/teacher";

export type { ProfileDto } from "@/types/teacher";

type LeanDoc = { _id: unknown; kind: string; originalName: string; mimeType: string; size: number; uploadedAt?: Date };
type LeanProfile = {
  fullName?: string; email?: string; mobile?: string; whatsapp?: string; dob?: string; gender?: string; photoUrl?: string;
  location?: {
    state?: string;
    district?: string;
    city?: string;
    currentAddress?: string;
    preferredJobDistricts?: string[];
    preferredJobLocations?: string[];
    serviceAreaStatus?: "in_service_area" | "outside_service_area" | "review_needed";
  };
  education?: { highestQualification?: string; graduation?: string; postGraduation?: string; bed?: boolean; deled?: boolean; btc?: boolean; ctet?: boolean; ctetPaperI?: boolean; ctetPaperII?: boolean; uptet?: boolean; otherTet?: string };
  experience?: { status?: string; totalYears?: number; previousSchool?: string; previousDesignation?: string; currentEmploymentStatus?: string; expectedSalaryInr?: number };
  preferences?: { categories?: string[]; subjects?: string[]; preferredClasses?: string[]; preferredBoard?: string; employmentType?: string; preferredLocations?: string[] };
  documents?: LeanDoc[];
  registration?: { currentStep?: number; completed?: boolean; draftSavedAt?: Date };
  verification?: { status?: string; note?: string };
  updatedAt?: Date;
};



function dto(p: LeanProfile | null, fallbackEmail?: string): ProfileDto {
  const docs = (p?.documents ?? []).map((d) => ({
    id: String(d._id), kind: d.kind, originalName: d.originalName, mimeType: d.mimeType, size: d.size,
    uploadedAt: d.uploadedAt ? new Date(d.uploadedAt).toISOString() : undefined,
  }));
  const base: ProfileDto = {
    personal: {
      fullName: p?.fullName ?? "", email: p?.email ?? fallbackEmail ?? "", mobile: p?.mobile ?? "",
      whatsapp: p?.whatsapp ?? "", dob: p?.dob ?? "", gender: p?.gender ?? "", photoUrl: p?.photoUrl ?? "",
    },
    location: {
      state: p?.location?.state ?? "",
      district: p?.location?.district ?? "",
      city: p?.location?.city ?? "",
      currentAddress: p?.location?.currentAddress ?? "",
      preferredJobDistricts: p?.location?.preferredJobDistricts ?? [],
      preferredJobLocations: p?.location?.preferredJobLocations ?? [],
      serviceAreaStatus: p?.location?.serviceAreaStatus ?? "in_service_area",
    },
    education: {
      highestQualification: p?.education?.highestQualification ?? "", graduation: p?.education?.graduation ?? "",
      postGraduation: p?.education?.postGraduation ?? "", bed: !!p?.education?.bed, deled: !!p?.education?.deled,
      btc: !!p?.education?.btc, ctet: !!p?.education?.ctet, ctetPaperI: !!p?.education?.ctetPaperI,
      ctetPaperII: !!p?.education?.ctetPaperII, uptet: !!p?.education?.uptet, otherTet: p?.education?.otherTet ?? "",
    },
    experience: {
      status: p?.experience?.status ?? "", totalYears: p?.experience?.totalYears ?? "",
      previousSchool: p?.experience?.previousSchool ?? "", previousDesignation: p?.experience?.previousDesignation ?? "",
      currentEmploymentStatus: p?.experience?.currentEmploymentStatus ?? "", expectedSalaryInr: p?.experience?.expectedSalaryInr ?? "",
    },
    preferences: {
      categories: p?.preferences?.categories ?? [], subjects: p?.preferences?.subjects ?? [],
      preferredClasses: p?.preferences?.preferredClasses ?? [], preferredBoard: p?.preferences?.preferredBoard ?? "",
      employmentType: p?.preferences?.employmentType ?? "", preferredLocations: p?.preferences?.preferredLocations ?? [],
    },
    documents: docs,
    registration: {
      currentStep: p?.registration?.currentStep ?? 1, completed: !!p?.registration?.completed,
      draftSavedAt: p?.registration?.draftSavedAt ? new Date(p.registration.draftSavedAt).toISOString() : undefined,
    },
    verification: { status: p?.verification?.status ?? "unverified", note: p?.verification?.note ?? "" },
    completion: { percent: 0, missing: [] },
    updatedAt: p?.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
  };
  base.completion = computeCompletion(base);
  return base;
}

function computeCompletion(p: ProfileDto): { percent: number; missing: string[] } {
  const checks: [string, boolean][] = [
    ["Full name", !!p.personal.fullName],
    ["Email", !!p.personal.email],
    ["Mobile", !!p.personal.mobile],
    ["State", !!p.location.state],
    ["City", !!p.location.city],
    ["Highest qualification", !!p.education.highestQualification],
    ["Experience status", !!p.experience.status],
    ["Teaching subjects", p.preferences.subjects.length > 0],
    ["Resume or photo (optional but recommended)", p.documents.length > 0 || !!p.personal.photoUrl],
  ];
  const done = checks.filter((c) => c[1]).length;
  const missing = checks.filter((c) => !c[1]).map((c) => c[0]);
  return { percent: Math.round((done / checks.length) * 100), missing };
}

export async function getTeacherProfile(userId: string): Promise<ProfileDto> {
  await connectToDatabase();
  const [profile, user] = await Promise.all([
    TeacherProfileModel.findOne({ userId }).lean<LeanProfile | null>(),
    UserModel.findById(userId).lean<{ email?: string } | null>(),
  ]);
  return dto(profile, user?.email);
}

function stripUndef<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  return out;
}

export async function saveTeacherDraft(userId: string, input: DraftInput): Promise<ProfileDto> {
  await connectToDatabase();
  const $set: Record<string, unknown> = { "registration.draftSavedAt": new Date() };
  if (input.step) $set["registration.currentStep"] = input.step;
  if (input.personal) for (const [k, v] of Object.entries(stripUndef(input.personal as Record<string, unknown>))) $set[k] = v;
  if (input.location) {
    for (const [k, v] of Object.entries(stripUndef(input.location as Record<string, unknown>))) $set[`location.${k}`] = v;
    if (input.location.district) {
      const active = await isDistrictActive(input.location.district, input.location.state || "Uttar Pradesh");
      $set["location.serviceAreaStatus"] = active ? "in_service_area" : "outside_service_area";
    }
  }
  if (input.education) for (const [k, v] of Object.entries(stripUndef(input.education as Record<string, unknown>))) $set[`education.${k}`] = v;
  if (input.experience) for (const [k, v] of Object.entries(stripUndef(input.experience as Record<string, unknown>))) $set[`experience.${k}`] = v;
  if (input.preferences) for (const [k, v] of Object.entries(stripUndef(input.preferences as Record<string, unknown>))) $set[`preferences.${k}`] = v;
  await TeacherProfileModel.updateOne({ userId }, { $set, $setOnInsert: { userId } }, { upsert: true });
  return getTeacherProfile(userId);
}

export async function saveFullTeacherProfile(userId: string, input: FullProfileInput, opts?: { complete?: boolean }): Promise<ProfileDto> {
  await connectToDatabase();
  const district = input.location.district;
  const state = input.location.state || "Uttar Pradesh";
  const active = district ? await isDistrictActive(district, state) : false;
  const locationWithStatus = {
    ...input.location,
    serviceAreaStatus: active ? "in_service_area" : "outside_service_area",
  };

  await TeacherProfileModel.updateOne(
    { userId },
    {
      $set: {
        ...input.personal,
        location: locationWithStatus,
        education: input.education,
        experience: input.experience,
        preferences: input.preferences,
        "registration.draftSavedAt": new Date(),
        ...(opts?.complete ? { "registration.completed": true, "registration.currentStep": 6 } : {}),
      },
      $setOnInsert: { userId },
    },
    { upsert: true },
  );
  if (input.personal.email) await UserModel.updateOne({ _id: userId }, { $set: { email: input.personal.email.toLowerCase() } }).catch(() => {});
  return getTeacherProfile(userId);
}
