import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import {
  listApplicationsAdmin,
  updateApplicationStatusAdmin,
  bulkUpdateApplicationsStatusAdmin,
} from "@/server/services/admin/applications";
import { logAdminAction } from "@/server/services/admin/audit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);
    const sp = new URL(req.url).searchParams;
    return ok(
      await listApplicationsAdmin({
        q: sp.get("q") || undefined,
        status: sp.get("status") || undefined,
        jobId: sp.get("jobId") || undefined,
        teacherUserId: sp.get("teacherUserId") || undefined,
        page: Number(sp.get("page") || 1),
        limit: Number(sp.get("limit") || 20),
      }),
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const body = await req.json().catch(() => ({}));
    const { id, ids, status, note, internalReason, candidateVisibleExplanation } = body;

    if (!status || typeof status !== "string") {
      return fail("BAD_REQUEST", "A target status is required", 400);
    }

    // Bulk update support
    if (Array.isArray(ids) && ids.length > 0) {
      const { updatedCount } = await bulkUpdateApplicationsStatusAdmin(
        ids,
        status,
        auth.userId,
        candidateVisibleExplanation || internalReason || note,
      );
      await logAdminAction({
        actorUserId: auth.userId,
        action: "application.bulk_status",
        entityType: "application",
        summary: `Bulk updated ${updatedCount} applications to ${status}`,
        metadata: { status, count: updatedCount },
      });
      return ok({ updatedCount, status, bulk: true });
    }

    // Single update support
    if (!id || typeof id !== "string") {
      return fail("BAD_REQUEST", "Application ID is required", 400);
    }

    const success = await updateApplicationStatusAdmin(id, status, auth.userId, {
      internalReason: internalReason || note,
      candidateVisibleExplanation,
    });
    if (!success) return fail("NOT_FOUND", "Application not found or invalid status transition", 400);

    await logAdminAction({
      actorUserId: auth.userId,
      action: "application.status",
      entityType: "application",
      entityId: id,
      summary: `Updated application status to ${status}`,
      metadata: { status, note },
    });

    return ok({ updated: true, status });
  } catch (err) {
    return handleApiError(err);
  }
}
