import "server-only";
import { z } from "zod";

const optStr = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));
const strArr = z.array(z.string().trim().max(120)).max(50).optional().default([]);

export const personalSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(120),
  email: z.string().trim().email("Valid email required").max(200),
  mobile: z.string().trim().min(8, "Mobile number is required").max(20),
  whatsapp: optStr(20),
  dob: optStr(20),
  gender: optStr(40),
  photoUrl: optStr(500),
});

export const locationSchema = z.object({
  state: z.string().trim().min(1, "State is required").max(120),
  district: optStr(120),
  city: z.string().trim().min(1, "City is required").max(120),
  currentAddress: optStr(500),
  preferredJobDistricts: strArr,
  preferredJobLocations: strArr,
  serviceAreaStatus: z.enum(["in_service_area", "outside_service_area", "review_needed"]).optional(),
});

export const educationSchema = z.object({
  highestQualification: z.string().trim().min(1, "Highest qualification is required").max(120),
  graduation: optStr(200),
  postGraduation: optStr(200),
  bed: z.boolean().optional().default(false),
  deled: z.boolean().optional().default(false),
  btc: z.boolean().optional().default(false),
  ctet: z.boolean().optional().default(false),
  ctetPaperI: z.boolean().optional().default(false),
  ctetPaperII: z.boolean().optional().default(false),
  uptet: z.boolean().optional().default(false),
  otherTet: optStr(200),
});

export const experienceSchema = z.object({
  status: z.enum(["fresher", "experienced", ""]).default(""),
  totalYears: z.coerce.number().min(0).max(60).optional(),
  previousSchool: optStr(200),
  previousDesignation: optStr(120),
  currentEmploymentStatus: optStr(120),
  expectedSalaryInr: z.coerce.number().min(0).max(100000000).optional(),
}).superRefine((v, ctx) => {
  if (v.status === "experienced" && (v.totalYears == null || Number.isNaN(v.totalYears))) {
    ctx.addIssue({ code: "custom", path: ["totalYears"], message: "Total experience is required for experienced teachers" });
  }
});

export const preferencesSchema = z.object({
  categories: strArr,
  subjects: z.array(z.string().trim().max(120)).min(1, "Select at least one subject").max(50),
  preferredClasses: strArr,
  preferredBoard: optStr(120),
  employmentType: optStr(80),
  preferredLocations: strArr,
});

export const draftSchema = z.object({
  step: z.coerce.number().int().min(1).max(6).optional(),
  personal: personalSchema.partial().optional(),
  location: locationSchema.partial().optional(),
  education: educationSchema.partial().optional(),
  experience: z
    .object({
      status: z.enum(["fresher", "experienced", ""]).optional(),
      totalYears: z.coerce.number().min(0).max(60).optional(),
      previousSchool: optStr(200),
      previousDesignation: optStr(120),
      currentEmploymentStatus: optStr(120),
      expectedSalaryInr: z.coerce.number().min(0).max(100000000).optional(),
    })
    .optional(),
  preferences: z
    .object({
      categories: strArr,
      subjects: z.array(z.string().trim().max(120)).max(50).optional(),
      preferredClasses: strArr,
      preferredBoard: optStr(120),
      employmentType: optStr(80),
      preferredLocations: strArr,
    })
    .optional(),
});

export const fullProfileSchema = z.object({
  personal: personalSchema,
  location: locationSchema,
  education: educationSchema,
  experience: experienceSchema,
  preferences: preferencesSchema,
});

export type DraftInput = z.infer<typeof draftSchema>;
export type FullProfileInput = z.infer<typeof fullProfileSchema>;
