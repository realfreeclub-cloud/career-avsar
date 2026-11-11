import { ok, fail, handleApiError } from "@/lib/api/response";
import { getPublicJob } from "@/server/services/public";
import { isFeatureEnabled } from "@/server/services/admin/settings";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  try {
    const enabled = await isFeatureEnabled("public_jobs");
    if (!enabled) {
      return fail(
        "SERVICE_UNAVAILABLE",
        "Public job listings are currently paused for scheduled maintenance.",
        503,
      );
    }

    const { id } = await params;
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      return fail("INVALID_ID", "Invalid job id", 400);
    }
    const job = await getPublicJob(id);
    if (!job) {
      return fail("NOT_FOUND", "Job not found", 404);
    }
    return ok(job);
  } catch (err) {
    return handleApiError(err);
  }
}
