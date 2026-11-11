import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { sendInterviewInvitationAdmin } from "@/server/services/admin/interviews";
import { logAdminAction } from "@/server/services/admin/audit";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return fail(auth.status === 403 ? "FORBIDDEN" : "UNAUTHORIZED", auth.message, auth.status);

    const success = await sendInterviewInvitationAdmin(params.id);
    if (!success) return fail("NOT_FOUND", "Interview round not found", 404);

    await logAdminAction({
      actorUserId: auth.userId,
      action: "interview.resend_invitation",
      entityType: "interview",
      entityId: params.id,
      summary: "Resent interview invitation notification to candidate",
    });

    return ok({ sent: true });
  } catch (err) {
    return handleApiError(err);
  }
}
