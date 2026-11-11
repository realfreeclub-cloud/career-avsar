import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import {
  getApplicationAdmin,
  updateApplicationStatusAdmin,
} from "@/server/services/admin/applications";
import { logAdminAction } from "@/server/services/admin/audit";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const { id } = await params;
    const app = await getApplicationAdmin(id);
    if (!app) return fail("NOT_FOUND", "Application not found", 404);

    return ok(app);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { status, note, internalNote } = body;

    if (!status || typeof status !== "string") {
      return fail("BAD_REQUEST", "A target status is required", 400);
    }

    const success = await updateApplicationStatusAdmin(id, status, auth.userId, note || internalNote);
    if (!success) return fail("NOT_FOUND", "Application not found", 404);

    await logAdminAction({
      actorUserId: auth.userId,
      action: "application.status",
      entityType: "application",
      entityId: id,
      summary: `Updated application ${id} status to ${status}`,
    });

    return ok({ updated: true, status });
  } catch (err) {
    return handleApiError(err);
  }
}
