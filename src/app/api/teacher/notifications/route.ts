import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireTeacher } from "@/lib/auth";
import {
  listTeacherNotifications,
  markAllTeacherNotificationsRead,
} from "@/server/services/teacher/dashboard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireTeacher();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);
    const items = await listTeacherNotifications(auth.userId);
    return ok({ items, total: items.length, unread: items.filter((n) => !n.read).length });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireTeacher();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);

    const body = await req.json().catch(() => ({}));
    if (body.action === "mark_all_read") {
      const count = await markAllTeacherNotificationsRead(auth.userId);
      return ok({ markedCount: count, allRead: true });
    }

    return fail("BAD_REQUEST", "Invalid action", 400);
  } catch (err) {
    return handleApiError(err);
  }
}
