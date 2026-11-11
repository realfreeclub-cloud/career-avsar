import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireTeacher } from "@/lib/auth";
import { listTeacherMessages } from "@/server/services/teacher/dashboard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireTeacher();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);
    const items = await listTeacherMessages(auth.userId);
    return ok({ items, total: items.length, unread: items.filter((m) => !m.read).length });
  } catch (err) {
    return handleApiError(err);
  }
}
