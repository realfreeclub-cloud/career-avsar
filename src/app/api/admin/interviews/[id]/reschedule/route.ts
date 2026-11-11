import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { rescheduleInterviewAdmin } from "@/server/services/admin/interviews";
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
    const { scheduledAt, mode, locationOrLink, instructions, reason } = body;

    if (!scheduledAt || isNaN(new Date(scheduledAt).getTime())) {
      return fail("BAD_REQUEST", "Valid reschedule date and time are required", 400);
    }

    const success = await rescheduleInterviewAdmin(
      params.id,
      { scheduledAt, mode, locationOrLink, instructions, reason },
      auth.userId,
    );

    if (!success) return fail("NOT_FOUND", "Interview round not found", 404);

    await logAdminAction({
      actorUserId: auth.userId,
      action: "interview.reschedule",
      entityType: "interview",
      entityId: params.id,
      summary: `Rescheduled interview to ${new Date(scheduledAt).toLocaleString("en-IN")}`,
      metadata: { scheduledAt, reason },
    });

    return ok({ rescheduled: true });
  } catch (err) {
    return handleApiError(err);
  }
}
