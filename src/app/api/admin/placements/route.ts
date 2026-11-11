import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import {
  listPlacementsAdmin,
  createPlacementAdmin,
  updatePlacementAdmin,
} from "@/server/services/admin/placements";
import { logAdminAction } from "@/server/services/admin/audit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const sp = new URL(req.url).searchParams;
    const res = await listPlacementsAdmin({
      status: sp.get("status") || undefined,
      q: sp.get("q") || undefined,
      page: Number(sp.get("page") || 1),
      limit: Number(sp.get("limit") || 20),
    });

    return ok(res);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const body = await req.json().catch(() => ({}));
    if (!body.teacherUserId || !body.teacherName || !body.jobId || !body.jobTitle || !body.schoolName || !body.joiningDate) {
      return fail(
        "BAD_REQUEST",
        "Teacher ID, teacher name, job ID, job title, school name, and joining date are required",
        400,
      );
    }

    const id = await createPlacementAdmin(body);
    await logAdminAction({
      actorUserId: auth.userId,
      action: "placement.create",
      entityType: "placement",
      entityId: id,
      summary: `Created placement record for ${body.teacherName} at ${body.schoolName}`,
      metadata: { teacherUserId: body.teacherUserId, jobTitle: body.jobTitle, joiningDate: body.joiningDate },
    });

    return ok({ id, created: true }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const body = await req.json().catch(() => ({}));
    if (!body?.id) return fail("BAD_REQUEST", "Placement ID is required", 400);

    const { id, ...data } = body;
    const success = await updatePlacementAdmin(id, data, auth.userId);
    if (!success) return fail("NOT_FOUND", "Placement record not found", 404);

    await logAdminAction({
      actorUserId: auth.userId,
      action: "placement.update",
      entityType: "placement",
      entityId: id,
      summary: `Updated placement record: status=${data.status || "unchanged"}`,
      metadata: data,
    });

    return ok({ updated: true });
  } catch (err) {
    return handleApiError(err);
  }
}
