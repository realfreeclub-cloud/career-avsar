import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { sendApplicationCandidateMessageAdmin } from "@/server/services/admin/applications";
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
    const message = String(body.message || "").trim();
    const senderName = String(body.senderName || "Hiring Panel").trim();

    if (!message) {
      return fail("BAD_REQUEST", "Message text is required", 400);
    }

    const success = await sendApplicationCandidateMessageAdmin(params.id, auth.userId, senderName, message);
    if (!success) return fail("NOT_FOUND", "Application not found", 404);

    await logAdminAction({
      actorUserId: auth.userId,
      action: "application.candidate_message",
      entityType: "application",
      entityId: params.id,
      summary: `Sent message to candidate for application`,
      metadata: { senderName, messageSnippet: message.slice(0, 80) },
    });

    return ok({ sent: true });
  } catch (err) {
    return handleApiError(err);
  }
}
