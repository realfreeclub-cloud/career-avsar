import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireTeacher } from "@/lib/auth";
import { markTeacherNotificationRead } from "@/server/services/teacher/dashboard";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const auth = await requireTeacher();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const targetRead = typeof body.read === "boolean" ? body.read : true;
    const updated = await markTeacherNotificationRead(auth.userId, id, targetRead);
    if (!updated) return fail("NOT_FOUND", "Notification not found", 404);
    return ok({ read: targetRead });
  } catch (err) {
    return handleApiError(err);
  }
}
