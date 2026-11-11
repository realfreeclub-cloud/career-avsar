import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import {
  listInterviewsAdmin,
  createInterviewAdmin,
  updateInterviewAdmin,
} from "@/server/services/admin/interviews";
import { logAdminAction } from "@/server/services/admin/audit";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const sp = new URL(req.url).searchParams;
    const month = sp.get("month") ? Number(sp.get("month")) : undefined;
    const year = sp.get("year") ? Number(sp.get("year")) : undefined;

    return ok(
      await listInterviewsAdmin({
        status: sp.get("status") || undefined,
        mode: sp.get("mode") || undefined,
        result: sp.get("result") || undefined,
        teacherUserId: sp.get("teacherUserId") || undefined,
        q: sp.get("q") || undefined,
        dateRange: sp.get("dateRange") || undefined,
        month,
        year,
        page: Number(sp.get("page") || 1),
        limit: Number(sp.get("limit") || 20),
      }),
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const body = await req.json().catch(() => ({}));
    if (!body.teacherUserId || !body.jobTitle || !body.scheduledAt) {
      return fail("BAD_REQUEST", "Teacher ID, job title, and schedule date are required", 400);
    }

    const id = await createInterviewAdmin(body);
    await logAdminAction({
      actorUserId: auth.userId,
      action: "interview.create",
      entityType: "interview",
      entityId: id,
      summary: `Scheduled interview round for ${body.jobTitle}`,
      metadata: { teacherUserId: body.teacherUserId, scheduledAt: body.scheduledAt },
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
    if (!body?.id) return fail("BAD_REQUEST", "Interview ID is required", 400);

    const { id, ...data } = body;
    const success = await updateInterviewAdmin(id, data);
    if (!success) return fail("NOT_FOUND", "Interview round not found", 404);

    await logAdminAction({
      actorUserId: auth.userId,
      action: "interview.update",
      entityType: "interview",
      entityId: id,
      summary: "Updated interview round attributes",
      metadata: data,
    });

    return ok({ updated: true });
  } catch (err) {
    return handleApiError(err);
  }
}
