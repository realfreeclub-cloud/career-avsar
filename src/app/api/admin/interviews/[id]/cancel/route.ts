import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { cancelInterviewAdmin } from "@/server/services/admin/interviews";
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
    const reason = String(body.reason || "Cancelled by hiring administration").trim();

    const success = await cancelInterviewAdmin(params.id, reason, auth.userId);
    if (!success) return fail("NOT_FOUND", "Interview round not found", 404);

    await logAdminAction({
      actorUserId: auth.userId,
      action: "interview.cancel",
      entityType: "interview",
      entityId: params.id,
      summary: `Cancelled interview: ${reason}`,
      metadata: { reason },
    });

    return ok({ cancelled: true });
  } catch (err) {
    return handleApiError(err);
  }
}
