import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { getJobAdmin, updateJobAdmin } from "@/server/services/admin/jobs";
import { logAdminAction } from "@/server/services/admin/audit";
export const dynamic = "force-dynamic";
export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try { const auth = await requireAdmin(); if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);
    const { id } = await ctx.params; const item = await getJobAdmin(id); if (!item) return fail("NOT_FOUND", "Job not found", 404); return ok(item);
  } catch (err) { return handleApiError(err); }
}
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    await updateJobAdmin(id, body);
    await logAdminAction({
      actorUserId: auth.userId,
      action: "job.update",
      entityType: "job",
      entityId: id,
      summary: `Updated job vacancy ${body.title ? `(${body.title})` : ""}`,
    });
    return ok({ updated: true });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);
    const { id } = await ctx.params;
    await updateJobAdmin(id, { status: "closed", isPublic: false });
    await logAdminAction({
      actorUserId: auth.userId,
      action: "job.close",
      entityType: "job",
      entityId: id,
      summary: `Closed job vacancy ID: ${id}`,
    });
    return ok({ closed: true });
  } catch (err) {
    return handleApiError(err);
  }
}
