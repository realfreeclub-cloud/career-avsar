import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { getTeacherDetailAdmin, verifyTeacherAdmin, addTeacherAdminNote } from "@/server/services/admin/teachers";
import { logAdminAction } from "@/server/services/admin/audit";

export const dynamic = "force-dynamic";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);
    const { id } = await ctx.params;
    const item = await getTeacherDetailAdmin(id);
    if (!item) return fail("NOT_FOUND", "Teacher not found", 404);
    return ok(item);
  } catch (err) { return handleApiError(err); }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as { action?: string; status?: string; note?: string };
    if (body.action === "verify" && body.status) {
      const okv = await verifyTeacherAdmin(id, body.status as "verified" | "rejected" | "pending" | "unverified", body.note, auth.userId);
      if (!okv) return fail("NOT_FOUND", "Teacher not found", 404);
      await logAdminAction({ actorUserId: auth.userId, action: "teacher.verify", entityType: "teacher_profile", entityId: id, summary: `Set verification to ${body.status}`, metadata: { status: body.status, note: body.note || null } });
      return ok({ updated: true });
    }
    if (body.action === "note" && body.note?.trim()) {
      const okn = await addTeacherAdminNote(id, body.note.trim(), auth.userId);
      if (!okn) return fail("NOT_FOUND", "Teacher not found", 404);
      await logAdminAction({ actorUserId: auth.userId, action: "teacher.note", entityType: "teacher_profile", entityId: id, summary: "Added internal note" });
      return ok({ updated: true });
    }
    return fail("BAD_REQUEST", "Unsupported action", 400);
  } catch (err) { return handleApiError(err); }
}
