import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { extendDeadlineAdmin } from "@/server/services/admin/jobs";
import { logAdminAction } from "@/server/services/admin/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const deadline = body?.deadline;
    if (!deadline || isNaN(new Date(deadline).getTime())) {
      return fail("VALIDATION_ERROR", "A valid deadline date is required", 422);
    }

    const success = await extendDeadlineAdmin(id, deadline);
    if (!success) return fail("NOT_FOUND", "Job vacancy not found", 404);

    await logAdminAction({
      actorUserId: auth.userId,
      action: "job.extend_deadline",
      entityType: "job",
      entityId: id,
      summary: `Extended job deadline to: ${new Date(deadline).toLocaleDateString("en-IN")}`,
    });

    return ok({ deadline, extended: true });
  } catch (err) {
    return handleApiError(err);
  }
}
