import { handleApiError, ok, fail } from "@/lib/api/response";
import { requireTeacher, getAuthContext } from "@/lib/auth";
import { getTeacherDashboard } from "@/server/services/teacher/dashboard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await requireTeacher();
    if (!auth.ok) return fail("UNAUTHORIZED", auth.message, auth.status);
    const ctx = await getAuthContext();
    const data = await getTeacherDashboard(auth.userId, ctx?.userId ? "" : "");
    // email fallback handled inside service via profile; keep safe
    return ok({ ...data, user: { ...data.user, id: auth.userId } });
  } catch (err) {
    return handleApiError(err);
  }
}
