import { z } from "zod";
import { ok, fail, handleApiError } from "@/lib/api/response";
import { listPublicJobs } from "@/server/services/public";
import { isFeatureEnabled } from "@/server/services/admin/settings";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  q: z.string().trim().max(120).optional().or(z.literal("")),
  subject: z.string().trim().max(80).optional().or(z.literal("")),
  district: z.string().trim().max(80).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  state: z.string().trim().max(80).optional().or(z.literal("")),
  qualification: z.string().trim().max(120).optional().or(z.literal("")),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  board: z.string().trim().max(80).optional().or(z.literal("")),
  employmentType: z.string().trim().max(80).optional().or(z.literal("")),
  interviewMode: z.string().trim().max(80).optional().or(z.literal("")),
  minExp: z.coerce.number().min(0).max(50).optional(),
  maxExp: z.coerce.number().min(0).max(50).optional(),
  sort: z.enum(["latest", "deadline", "salary"]).optional().default("latest"),
  page: z.coerce.number().int().min(1).max(500).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(9),
});

export async function GET(request: Request) {
  try {
    const enabled = await isFeatureEnabled("public_jobs");
    if (!enabled) {
      return fail(
        "SERVICE_UNAVAILABLE",
        "Public job listings are currently paused for scheduled maintenance.",
        503,
      );
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid job search parameters", 400, parsed.error.flatten());
    }
    const data = await listPublicJobs(parsed.data);
    return ok(data);
  } catch (err) {
    return handleApiError(err);
  }
}
