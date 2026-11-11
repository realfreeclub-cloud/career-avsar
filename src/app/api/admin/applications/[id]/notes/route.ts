import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { addApplicationInternalNoteAdmin } from "@/server/services/admin/applications";
import { logAdminAction } from "@/server/services/admin/audit";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const body = await req.json().catch(() => ({}));
    const note = String(body.note || "").trim();
    const authorName = String(body.authorName || "Admin Reviewer").trim();

    if (!note) {
      return fail("BAD_REQUEST", "Internal note text is required", 400);
    }

    const success = await addApplicationInternalNoteAdmin(params.id, auth.userId, authorName, note);
    if (!success) return fail("NOT_FOUND", "Application not found", 404);

    await logAdminAction({
      actorUserId: auth.userId,
      action: "application.internal_note",
      entityType: "application",
      entityId: params.id,
      summary: `Added private internal note to application`,
    });

    return ok({ added: true });
  } catch (err) {
    return handleApiError(err);
  }
}
