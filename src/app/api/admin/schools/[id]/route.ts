import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import {
  getSchoolAdmin,
  updateSchoolAdmin,
  verifySchoolAdmin,
  addSchoolContact,
  deleteSchoolContact,
  addSchoolNote,
  setSchoolStatus,
  setSchoolFollowUp,
  archiveSchoolAdmin,
} from "@/server/services/admin/schools";
import { logAdminAction } from "@/server/services/admin/audit";

export const dynamic = "force-dynamic";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);
    const { id } = await ctx.params;
    const item = await getSchoolAdmin(id);
    if (!item) return fail("NOT_FOUND", "School not found", 404);
    return ok(item);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const action = body.action as string | undefined;

    if (action === "verify" && typeof body.verificationStatus === "string") {
      await verifySchoolAdmin(
        id,
        body.verificationStatus as "verified" | "pending_verification" | "unverified",
        auth.userId,
      );
      return ok({ updated: true });
    }

    if (action === "follow_up") {
      await setSchoolFollowUp(
        id,
        (body.followUpDate as string) || null,
        (body.followUpStatus as "pending" | "completed" | "none") || "none",
        auth.userId,
      );
      return ok({ updated: true });
    }

    if (action === "contact" && body.contact) {
      await addSchoolContact(id, body.contact as Record<string, unknown>, auth.userId);
      return ok({ updated: true });
    }

    if (action === "delete_contact" && typeof body.contactId === "string") {
      await deleteSchoolContact(id, body.contactId);
      return ok({ updated: true });
    }

    if (action === "note" && typeof body.body === "string") {
      await addSchoolNote(id, body.body, auth.userId, (body.authorName as string) || "Admin Officer");
      await logAdminAction({
        actorUserId: auth.userId,
        action: "school.note.add",
        entityType: "school",
        entityId: id,
        summary: "Added school internal note",
      });
      return ok({ updated: true });
    }

    if (action === "status" && (body.status === "active" || body.status === "inactive")) {
      await setSchoolStatus(id, body.status);
      await logAdminAction({
        actorUserId: auth.userId,
        action: "school.status",
        entityType: "school",
        entityId: id,
        summary: `Set school ${body.status}`,
      });
      return ok({ updated: true });
    }

    if (action === "archive") {
      await archiveSchoolAdmin(id, !!body.isArchived);
      return ok({ updated: true });
    }

    const data = { ...body };
    delete (data as { action?: unknown }).action;
    await updateSchoolAdmin(id, data, auth.userId);
    return ok({ updated: true });
  } catch (err) {
    return handleApiError(err);
  }
}
