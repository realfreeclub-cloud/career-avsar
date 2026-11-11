import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { updateJobStatusAdmin } from "@/server/services/admin/jobs";
import { logAdminAction } from "@/server/services/admin/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const status = body?.status;
    const valid = ["draft", "published", "paused", "expired", "closed"];
    if (!valid.includes(status)) {
      return fail("VALIDATION_ERROR", `Status must be one of: ${valid.join(", ")}`, 422);
    }

    const success = await updateJobStatusAdmin(id, status);
    if (!success) return fail("NOT_FOUND", "Job vacancy not found", 404);

    await logAdminAction({
      actorUserId: auth.userId,
      action: `job.status.${status}`,
      entityType: "job",
      entityId: id,
      summary: `Updated job status to: ${status}`,
    });

    return ok({ status, updated: true });
  } catch (err) {
    return handleApiError(err);
  }
}
