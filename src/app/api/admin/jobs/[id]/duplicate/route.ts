import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { duplicateJobAdmin } from "@/server/services/admin/jobs";
import { logAdminAction } from "@/server/services/admin/audit";

export const dynamic = "force-dynamic";

export async function POST(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const { id } = await ctx.params;
    const newId = await duplicateJobAdmin(id);
    if (!newId) return fail("NOT_FOUND", "Source job not found", 404);

    await logAdminAction({
      actorUserId: auth.userId,
      action: "job.duplicate",
      entityType: "job",
      entityId: newId,
      summary: `Duplicated job from ID: ${id}`,
    });

    return ok({ id: newId, duplicated: true }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
