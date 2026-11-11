import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth";
import { scheduleApplicationInterviewAdmin } from "@/server/services/admin/applications";
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
    const scheduledAt = String(body.scheduledAt || "").trim();
    const mode = (body.mode || "online") as "online" | "in_person" | "phone" | "other";
    const locationOrLink = body.locationOrLink ? String(body.locationOrLink).trim() : undefined;
    const notes = body.notes ? String(body.notes).trim() : undefined;

    if (!scheduledAt || isNaN(new Date(scheduledAt).getTime())) {
      return fail("BAD_REQUEST", "A valid interview schedule date/time is required", 400);
    }

    const success = await scheduleApplicationInterviewAdmin(params.id, auth.userId, {
      scheduledAt,
      mode,
      locationOrLink,
      notes,
    });

    if (!success) return fail("NOT_FOUND", "Application not found or schedule failed", 404);

    await logAdminAction({
      actorUserId: auth.userId,
      action: "application.schedule_interview",
      entityType: "application",
      entityId: params.id,
      summary: `Scheduled ${mode} interview for candidate on ${new Date(scheduledAt).toLocaleString("en-IN")}`,
      metadata: { scheduledAt, mode },
    });

    return ok({ scheduled: true });
  } catch (err) {
    return handleApiError(err);
  }
}
