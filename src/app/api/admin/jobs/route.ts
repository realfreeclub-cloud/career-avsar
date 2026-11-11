import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { listJobsAdmin, createJobAdmin } from "@/server/services/admin/jobs";
import { logAdminAction } from "@/server/services/admin/audit";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);
    const sp = new URL(req.url).searchParams;
    return ok(
      await listJobsAdmin({
        q: sp.get("q") || undefined,
        status: sp.get("status") || undefined,
        subject: sp.get("subject") || undefined,
        category: sp.get("category") || undefined,
        district: sp.get("district") || undefined,
        board: sp.get("board") || undefined,
        state: sp.get("state") || undefined,
        page: Number(sp.get("page") || 1),
        limit: Number(sp.get("limit") || 20),
      }),
    );
  } catch (err) {
    return handleApiError(err);
  }
}
export async function POST(req: Request) {
  try { const auth = await requireAdmin(); if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);
    const body = await req.json().catch(() => ({})); if (!body?.title) return fail("VALIDATION_ERROR", "Job title is required", 422);
    const id = await createJobAdmin(body); await logAdminAction({ actorUserId: auth.userId, action: "job.create", entityType: "job", entityId: id, summary: `Created job: ${body.title}` }); return ok({ id }, 201);
  } catch (err) { return handleApiError(err); }
}
