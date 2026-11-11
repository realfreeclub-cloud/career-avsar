import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { recordInterviewFeedbackAdmin } from "@/server/services/admin/interviews";
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
    const {
      rating,
      recommendation,
      strengths,
      improvements,
      notes,
      interviewerName,
      result,
      autoCreatePlacement,
      joiningDate,
      salaryOfferedInr,
    } = body;

    if (!result || !["pending", "selected", "rejected", "on_hold", "reschedule_needed"].includes(result)) {
      return fail("BAD_REQUEST", "Valid evaluation result is required", 400);
    }

    const { success, placementId } = await recordInterviewFeedbackAdmin(
      params.id,
      {
        rating: typeof rating === "number" ? rating : undefined,
        recommendation,
        strengths,
        improvements,
        notes,
        interviewerName,
        result,
        autoCreatePlacement,
        joiningDate,
        salaryOfferedInr,
      },
      auth.userId,
    );

    if (!success) return fail("NOT_FOUND", "Interview round not found", 404);

    await logAdminAction({
      actorUserId: auth.userId,
      action: "interview.feedback",
      entityType: "interview",
      entityId: params.id,
      summary: `Recorded interview feedback. Outcome: ${result}`,
      metadata: { result, recommendation, placementId },
    });

    return ok({ recorded: true, result, placementId });
  } catch (err) {
    return handleApiError(err);
  }
}
